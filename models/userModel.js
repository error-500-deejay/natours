const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: [30, 'Name should be of max 30 characters'],
    required: [true, 'A name is required for user'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A email id is required'],
    unique: true,
    lowercase: true,

    // validate: {
    //   validator: function (val) {
    //     const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //     return re.test(String(val).toLowerCase());
    //   },
    //   message: 'Please enter a valid Email',
    // },
    validate: [validator.isEmail, 'Please enter a valid Email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password doesnot match, Please enter the same password',
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  loginAttemptAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  incorrectLoginAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//pre is beofre current document is stored, so it bribgs the previous documents in the db
//post is after saving current document, so it also bring the cjurrent document along with the existing on e in db
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//schema.methods is the
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//schema.methods is the for instance methods , instance methods are thodse whicb are used to work only on  one document
//here the this points towards the document
//scheama.statics is used as a static method , which is used for processin gon the whole document
//here "this" points towards the complete documents
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
