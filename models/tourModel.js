const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, ' A name is required'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must haave less than or equal to 40 characters',
      ],
      minlength: [
        10,
        'A tour name must haave more than or equal to 10 characters',
      ],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, ' A duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ' A group size is required'],
    },
    difficulty: {
      type: String,
      required: [true, ' A difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, ' A price is required'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on New Document creatior
          return val < this.price;
        },
        message: 'Discount price {{VALUE}}should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, ' A Summary is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      require: [true, 'A image is required'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // reviews: [ //we dont want to add the reviews (chid referencing here),
    //because the reviews can grow in number to millions and can cause an issue to the document
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //in the reviews Model we have a field named tour which stores the tour id
  localField: '_id', //this reviewModel tour is same as the current tours _id value
});

//Document middleware: runs between .save() and .create() but not on insertMAny(), beacause it doesnot invoke the .save() middleware
tourSchema.pre('save', function (next) {
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

//embed the the guides all data for the the tour
//we should not embed the guide data because if the gude updates his dat in the user
//model thenwe need to find it in each tour where guide is and update data there also

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post('save', function (doc, next) {
  //console.log(this, doc);
  next();
});

//QUERY MIDDLEWARE:

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetExpires',
  });
  next();
});

tourSchema.post(/^find/, (docs, next) => {
  //console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (next) {
  console.log('>>>', this.pipeline());
  if (!JSON.stringify(this.pipeline()).includes('geoNear')) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
