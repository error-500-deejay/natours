const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signtoken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const cookieOption = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  secure: false,
  httpOnly: true,
};
if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

const createSendToken = (user, statusCode, res, data) => {
  const token = signtoken(user._id); //create a webjson token
  res.cookie('jwt', token, cookieOption);

  user.password = undefined;
  user.active = undefined;
  user.passwordChangedAt = undefined;
  user.loginAttemptAt = undefined;
  user.incorrectLoginAttempts = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //so the user can easily set the admin roles etc form the api itself which is wrong
  //so allow to store only the primitive data
  //const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  newUser.password = undefined; //hide the password from the user response
  // const token = signtoken(newUser._id); //create a webjson token

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: { user: newUser },
  // });
  createSendToken(newUser, 201, res, { user: newUser });
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email: email }).select(
    '+password +loginAttemptAt +incorrectLoginAttempts'
  );
  //if user ,check loginattempts
  //if > 10 check if an hour has pass from 10th wrong attempt
  //if no then send a message "Wrong password limit exceed"
  //if yes then set incorrect attemot = 0 and let him login
  if (user) {
    if (user.incorrectLoginAttempts >= 10) {
      if ((Date.now() - user.loginAttemptAt) / (1000 * 3600) < 1) {
        return next(
          new AppError(
            `You have crossed incorrect attempts limit, please try after ${(
              60 -
              (Date.now() - user.loginAttemptAt) / (1000 * 60)
            ).toFixed(0)} minutes`,
            401
          )
        );
      }
      user.incorrectLoginAttempts = 0;
    }
  }
  if (!user || !(await user.correctPassword(password, user.password))) {
    //if incorrect password then add incorrect attempt and time
    if (user) {
      user.loginAttemptAt = Date.now();
      user.incorrectLoginAttempts += 1;
      await user.save({ validateBeforeSave: false });
    }
    return next(new AppError('Incorrect email or password', 401));
  }

  user.loginAttemptAt = Date.now();
  user.incorrectLoginAttempts = 0;

  await user.save({ validateBeforeSave: false });
  // const token = signtoken(user._id);

  // res
  //   //.cookie('token', token, { maxAge: 900000, httpOnly: true })
  //   .status(200)
  //   .json({
  //     status: 'success',
  //     token,
  //   });
  createSendToken(user, 200, res, undefined);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'Logging Out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).send({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1.check if the req.token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logeddin! Please log in to acess the code', 401)
    );
  }
  //2.check if the tokein is valid or not
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. check if the useer still exist
  const currentUser = await User.findById(decoded.id);
  //4. check is user change apssword after the tokein is issued
  if (!currentUser) {
    return next(new AppError('The user with the token doesnot exist', 404));
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 404)
    );
  }
  res.locals.user = currentUser;
  req.user = currentUser;
  //grant acces
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //1.check if the req.token exist
  try {
    let token;

    if (req.cookies.jwt) {
      //2.check if the tokein is valid or not
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //3. check if the useer still exist
      const currentUser = await User.findById(decoded.id);
      //4. check is user change apssword after the tokein is issued
      if (!currentUser) {
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      //grant acces
      return next();
    }
    next();
  } catch (error) {
    next();
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError('You dont have the permission to perform this action', 403)
    );
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on the provide email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with the the provided email address', 404)
    );
  }

  //genetrate a random reset key
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  //send it to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and 
  passwordConfirm to : ${resetUrl}`;

  try {
    // await sendEmail({
    //   mail: user.email,
    //   subject: 'Your password request token',
    //   message,
    // });
    res.status(200).json({
      status: 'success',
      messsage: 'Token sent to email',
      token: resetToken,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    // console.log(error);
    next(
      new AppError('There was an error sending email. Try again later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if not expired and user set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  //chnaged passwordat propert for the user

  //log the user in send jwt
  // const token = signtoken(user._id); //create a webjson token

  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 201, res, undefined);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user form collection
  const user = await User.findById(req.user.id).select('+password');
  //2) check opassword is correct
  if (!req.body.passwordCurrent) {
    return next(new AppError('Please provide the current password', 500));
  }

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Please enter correct current password', 500));
  }

  if (!req.body.passwordConfirm || !req.body.password) {
    return next(
      new AppError('Please provide new password and password confirm', 500)
    );
  }
  //3) if so update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save(); //dont use update the passsword using update()

  //4) login user in

  // const token = signtoken(user._id); //create a webjson token

  // console.log(user);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 201, res, undefined);
});
