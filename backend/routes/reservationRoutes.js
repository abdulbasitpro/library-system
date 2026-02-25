const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createReservation);
router.get('/me', getMyReservations);
router.get('/', authorize('admin'), getAllReservations);
router.patch('/:id/cancel', cancelReservation);

module.exports = router;
