const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //create error for password change
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cant modify the password update in this route, use update password route',
        401
      )
    );
  }
  const filterBody = filterObj(req.body, 'name', 'email');
  //uppdate user document
  const newUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    newUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success' });
});

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const user = await User.find();
//   res.status(200).json({
//     status: 'success',
//     data: { user },
//   });
// });
exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'This route is not defineed please use the signup route instead',
  });
};

// exports.getUser = factory.getOne(User);

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     error: 'Not create',
//   });
// };
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     error: 'Not create',
//   });
// };

// exports.updateUser = factory.updateOne(User);

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     error: 'Not create',
//   });
// };

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
