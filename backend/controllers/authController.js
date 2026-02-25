const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const sendEmail = require('../config/sendEmail');

// Helper: create JWT and set HttpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      borrowedBooks: user.borrowedBooks,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    // Role is ALWAYS 'member' on self-registration — admins are promoted via Manage Users
    const user = await User.create({ name, email, password, role: 'member' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user – clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('borrowedBooks', 'title author coverImageURL');
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile (name, avatar)
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = { name: req.body.name, avatar: req.body.avatar };
    const user = await User.findByIdAndUpdate(req.user.id, allowed, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password – generate token & send email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Vague message for security (don't reveal if email exists)
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    // Generate plain token (returned to user via email) + store hashed in DB
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:12px;line-height:48px;font-size:24px">📚</div>
          <h2 style="color:#1e293b;margin:12px 0 4px">LibraryOS</h2>
          <p style="color:#64748b;margin:0;font-size:14px">Password Reset Request</p>
        </div>
        <p style="color:#334155;font-size:15px">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#334155;font-size:15px">We received a request to reset your password. Click the button below — this link is valid for <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetURL}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px">Reset My Password</a>
        </div>
        <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
        <p style="color:#94a3b8;font-size:12px;text-align:center">© 2024 LibraryOS · This is an automated email, please do not reply.</p>
      </div>
    `;

    // Check if email is properly configured
    const emailConfigured = process.env.EMAIL_PASS &&
      !process.env.EMAIL_PASS.includes('your_') &&
      !process.env.EMAIL_PASS.includes('app_password');

    if (!emailConfigured) {
      // No real email config — log link to console so dev can still test
      console.log('\n========================================');
      console.log('🔑  PASSWORD RESET LINK (email not configured)');
      console.log('----------------------------------------');
      console.log(`User : ${user.email}`);
      console.log(`Link : ${resetURL}`);
      console.log('  → Set EMAIL_PASS in .env to send real emails');
      console.log('========================================\n');
      return res.status(200).json({
        success: true,
        message: 'Dev mode: reset link printed to server terminal.',
        devResetURL: resetURL,
      });
    }

    // Real email configured — send it
    try {
      await sendEmail({ to: user.email, subject: 'LibraryOS — Password Reset Link', html });
      res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (emailErr) {
      // Rollback token if email fails
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpire  = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Email could not be sent. Check your email config in .env', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using token from email link
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash the plain token from URL to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // not expired
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return next(new AppError('Reset token is invalid or has expired (15 min limit)', 400));
    }

    if (!req.body.password || req.body.password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Update password + clear reset token fields
    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
