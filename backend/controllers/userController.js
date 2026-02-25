const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('borrowedBooks', 'title author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('borrowedBooks', 'title author coverImageURL');
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user (role, name)
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    const allowed = { name: req.body.name, role: req.body.role };
    const user = await User.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // Block deletion if user has active issues
    const activeIssue = await Transaction.findOne({ user: req.params.id, status: 'issued' });
    if (activeIssue) {
      return next(new AppError('Cannot delete user with active book issues', 400));
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user role between member <-> admin
// @route   PATCH /api/users/:id/toggle-role
// @access  Admin
exports.toggleRole = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('You cannot change your own role', 400));
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new AppError('User not found', 404));

    user.role = user.role === 'admin' ? 'member' : 'admin';
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user stats (admin dashboard)
// @route   GET /api/users/stats
// @access  Admin
exports.getUserStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments();
    const members = await User.countDocuments({ role: 'member' });
    const admins = await User.countDocuments({ role: 'admin' });
    res.status(200).json({ success: true, stats: { total, members, admins } });
  } catch (err) {
    next(err);
  }
};
