const router = require('express').Router();
// eslint-disable-next-line import/no-unresolved
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
//const reviewController = require('../controller/reviewController');
const reviewRouter = require('./reviewRouter');

//mounting a nested review router
//This is because the review functions are in the reviewRouter
//but tthere route is like /api/v1/tours/<tourid>/reviews..So it coes within the tour route,so we need to
//mount the functionality from the review Router
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guides', 'guides'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guides'),
    tourController.createTour
  );

router.param('id', (req, res, next, id) => {
  next();
});

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.updateTour,
    authController.protect,
    authController.restrictTo('admin', 'lead-guides')
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guides'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   )
//   .get(reviewController.getAllReview);

module.exports = router;
