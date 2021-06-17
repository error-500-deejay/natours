const router = require('express').Router({ mergeParams: true });
// eslint-disable-next-line import/no-unresolved
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user'), reviewController.deleteReview)
  .patch(authController.restrictTo('user'), reviewController.updateReview);
module.exports = router;
