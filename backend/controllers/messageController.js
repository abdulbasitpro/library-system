const Message = require('../models/Message');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, body } = req.body;
    if (!recipientId || !body) {
      return next(new AppError('recipientId and body are required', 400));
    }

    // Prevent messaging yourself
    if (recipientId === req.user._id.toString()) {
      return next(new AppError('You cannot message yourself', 400));
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return next(new AppError('Recipient not found', 404));

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      body,
    });

    const populated = await message.populate([
      { path: 'sender', select: 'name avatar role' },
      { path: 'recipient', select: 'name avatar role' },
    ]);

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inbox (received messages)
// @route   GET /api/messages/inbox
// @access  Private
exports.getInbox = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Message.countDocuments({ recipient: req.user._id });
    const messages = await Message.find({ recipient: req.user._id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const unreadCount = await Message.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.status(200).json({ success: true, total, unreadCount, messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
exports.getSent = async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate('recipient', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get conversation thread between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherId },
        { sender: otherId, recipient: myId },
      ],
    })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all admin users (for members to message admin)
// @route   GET /api/messages/admins
// @access  Private
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email avatar');
    res.status(200).json({ success: true, admins });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all member users (for admins to reply)
// @route   GET /api/messages/members
// @access  Private (Admin)
exports.getMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: 'member' }).select('name email avatar');
    res.status(200).json({ success: true, members });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private (Recipient)
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return next(new AppError('Message not found', 404));

    if (message.recipient.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    message.read = true;
    await message.save();
    res.status(200).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all inbox messages as read
// @route   PATCH /api/messages/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Message.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'All messages marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a single message (sender or recipient)
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return next(new AppError('Message not found', 404));

    const uid = req.user._id.toString();
    if (message.sender.toString() !== uid && message.recipient.toString() !== uid) {
      return next(new AppError('Not authorized to delete this message', 403));
    }

    await message.deleteOne();
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear all messages in inbox OR sent (for current user)
// @route   DELETE /api/messages/clear?type=inbox|sent
// @access  Private
exports.clearMessages = async (req, res, next) => {
  try {
    const { type = 'inbox' } = req.query;
    const filter = type === 'sent'
      ? { sender: req.user._id }
      : { recipient: req.user._id };

    const result = await Message.deleteMany(filter);
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
};
