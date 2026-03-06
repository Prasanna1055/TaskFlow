const User = require('../models/User');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role / status
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('Admins cannot modify their own role/status here.', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, message: 'User updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('Admins cannot delete their own account here.', 400));
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));

    // Delete all user tasks
    await Task.deleteMany({ user: req.params.id });

    res.status(200).json({ success: true, message: 'User and associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, tasksByStatus, recentUsers] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalTasks, tasksByStatus },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};
