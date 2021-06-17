const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

// exports.getAllReview = catchAsync(async (req, res, next) => {
//   console.log(req.params);
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   res.status(200).send({
//     status: 'success',
//     reviews: reviews.length,
//     data: { reviews },
//   });
// });
// exports.getAllReview = factory.getAll(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   const requestparams = { ...req.body };
//   //Allow nesterd routes
//   if (!req.body.tour) requestparams.tour = req.params.tourId;
//   if (!req.body.user) requestparams.user = req.user._id;

//   const reviews = await Review.create(requestparams);
//   res.status(200).send({
//     status: 'success',
//     data: { reviews },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  const requestparams = { ...req.body };
  //Allow nesterd routes
  if (!req.body.tour) requestparams.tour = req.params.tourId;
  if (!req.body.user) requestparams.user = req.user._id;
  req.body = requestparams;
  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
