// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
//const APIFeatures = require('../utils/apiFeatures');
// eslint-disable-next-line import/no-unresolved
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const factory = require('./handleFactory');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {
//   const query1 = Tour.find();
//   console.log('>>>>>', req.session);
//   // //1. Filtering basic query params
//   // // eslint-disable-next-line node/no-unsupported-features/es-syntax
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => {
//   //   delete queryObj[el];
//   // });
//   // // const toursData = await Tour.find()
//   // //   .where('duration')
//   // //   .equals(5)
//   // //   .where('difficulty')
//   // //   .equals(10);

//   // //  const query = Tour.find(queryStr);

//   // //2.Filtering advance query params likre gte to $gte etc
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // queryStr = JSON.parse(queryStr);
//   // console.log(req.query, queryStr);
//   // //{ difficuly: "easy", duration : { $gte: 1}}
//   // //{ difficulty: { gt: 'easy' }, page: '1' }

//   // //3. Implementing Sorting of data
//   // let query = Tour.find(queryStr);

//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   //sort('price ratingsAverage')- for tie in the first sort tthen  use seocnd criteria
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   // //4. Implementing limiting the field to display
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   //query.select('name duration quantity')
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // //5. Pagination
//   // //page=3&limit=10
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // query = query.skip((page - 1) * limit).limit(limit);
//   // if (req.query.page) {
//   //   const numTour = await Tour.countDocuments();
//   //   if ((page - 1) * limit >= numTour) {
//   //     throw new Error('This page doesnot exist');
//   //   }
//   // }
//   //query.sort().select().skip().limit()
//   //Execute Query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .fields()
//     .page();
//   const toursData = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: toursData.length,
//     data: {
//       toursData,
//     },
//   });
//   // }
//   // catch (error) {
//   //   console.log(error);
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: error,
//   //   });
//   // }
//   // res.status(200).json({
//   //   status: 'success',
//   //   results: tours.length,
//   //   data: {
//   //     tours,
//   //   },
//   // });
// });

//exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tourData = await Tour.findById(req.params.id).populate('reviews');
//   if (!tourData) {
//     return next(new AppError('No tour found with that ID'), 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tourData,
//     },
//   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     msg: error,
//   //   });
//   // }
//   // const tourid = parseInt(req.params.id, 10);
//   // const tourData = tours.find((el) => el.id === tourid);
//   // if (!tourData || tourid > tours.length) {
//   //   res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   // } else {
//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tours: tourData,
//   //     },
//   //   });
//   // }
// });

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => next(err));
//   };
// };

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => next(err));
//   };
// };

//exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   // /console.log(req.body);

//   // try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).send({
//     status: 'success',
//     data: {
//       tours: newTour,
//     },
//   });
//   // } catch (error) {
//   //   console.log(error);
//   //   res.status(400).send({
//   //     status: 'fail',
//   //     message: error,
//   //   });
//   // }

//   // const newId = tours[tours.length - 1].id + 1;
//   // // eslint-disable-next-line prefer-object-spread
//   // const newTour = Object.assign({ id: newId }, req.body);
//   // tours.push(newTour);
//   // //console.log(tours[tours.length - 1]);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   () => {
//   //     res.status(201).send({
//   //       status: 'success',
//   //       data: {
//   //         tours: newTour,
//   //       },
//   //     });
//   //   }
//   // );
// });

//exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tourData = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tourData) {
//     return next(new AppError('No tour found with that ID'), 404);
//   }
//   res.status(201).send({
//     status: 'success',
//     data: {
//       tours: tourData,
//     },
//   });
//   // } catch (error) {
//   //   res.status(400).send({
//   //     status: 'fail',
//   //     data: error,
//   //   });
//   // }
//   // /console.log(req.body);
//   // const tourid = parseInt(req.params.id, 10);
//   // const updatingData = req.body;
//   // const tourData = tours.find((el) => el.id === tourid);

//   // if (!tourData || tourid > tours.length) {
//   //   res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   // } else {
//   //   console.log(tourData, req.body);
//   //   Object.keys(updatingData).forEach((ele) => {
//   //     tourData[ele] = updatingData[ele];
//   //   });

//   //   tours.forEach((ele, index) => {
//   //     if (ele.id === tourid) {
//   //       tours[index] = tourData;
//   //     }
//   //   });
//   //   fs.writeFile(
//   //     `${__dirname}/dev-data/data/tours-simple.json`,
//   //     JSON.stringify(tours),
//   //     () => {
//   //       res.status(201).send({
//   //         status: 'success',
//   //         data: {
//   //           tours: tourData,
//   //         },
//   //       });
//   //     }
//   //   );
//   // }
// });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(204).send({
//     status: 'success',
//     data: {
//       tours: null,
//     },
//   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: error,
//   //   });
//   // }
//   // const tourid = parseInt(req.params.id, 10);
//   // const tourData = tours.find((el) => el.id === tourid);
//   // if (!tourData || tourid > tours.length) {
//   //   res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   // } else {
//   //   tours.forEach((el, index) => {
//   //     if (el.id === tourid) {
//   //       tours.splice(index, 1);
//   //     }
//   //   });
//   //   console.log(tours);
//   //   fs.writeFile(
//   //     `${__dirname}/dev-data/data/tours-simple.json`,
//   //     JSON.stringify(tours),
//   //     () => {
//   //       res.status(204).send({
//   //         status: 'success',
//   //         data: {
//   //           tours: null,
//   //         },
//   //       });
//   //     }
//   //   );
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  let stats = Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: null,
        _id: { $toUpper: '$difficulty' },
        //_id: '$ratingsAverage',
        numOfTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  stats = await stats;
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // } catch (error) {
  //   console.log(error);
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;

  let plan = Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
        month: { $push: '$startDates' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  plan = await plan;
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // } catch (error) {
  //   console.log(error);
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

//tours-within/:distance/center/:latlng/unit/:unit',
//tours-within/:distance/center/:19.074635,73.000714/unit/:unit',
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('Please provide the latitude and langitude', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//tours-within/:distance/center/:latlng/unit/:unit',
//tours-within/:distance/center/:19.074635,73.000714/unit/:unit',
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
