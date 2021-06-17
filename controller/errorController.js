const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = () => {
  const message = `Duplicate field value. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid Input Data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) => {
  if (err === 'TokenExpiredError') {
    return new AppError('Your token has expired. Please login again', 404);
    // eslint-disable-next-line no-else-return
  } else if (err === 'JsonWebTokenError') {
    return new AppError('Invalid Token. Please login again', 404);
  } else {
    return new AppError('Something went wrong', 500);
  }
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    console.error('Error ', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('Error ', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  console.error('Error ', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Something went wrong. Please try again',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.static || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log('>>>', error);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error.name);
    if (error.name === 'TokenExpiredError') error = handleJWTError(error.name);
    sendErrorProd(error, req, res);
  }
};
