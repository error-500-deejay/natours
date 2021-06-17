class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //directly set the message in error parent class to error

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
