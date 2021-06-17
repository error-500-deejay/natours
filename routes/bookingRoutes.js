const router = require('express').Router();
// eslint-disable-next-line import/no-unresolved
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

router.use(authController.protect);
router
  .route('/checkout-session/:tourId')
  .get(bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
