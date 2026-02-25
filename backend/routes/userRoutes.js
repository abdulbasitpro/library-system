const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleRole,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All user routes are admin-only
router.use(protect, authorize('admin'));

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-role', toggleRole);
router.delete('/:id', deleteUser);

module.exports = router;
