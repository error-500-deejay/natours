//review / ratinr /createdAt /ref to tou /ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxlength: [1000, 'Please enter text within 1000 characters'],
      required: [true, 'Review cant be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings between 1 to 5'],
      max: [5, 'Ratings between 1 to 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tours'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

//schema.methods is the for instance methods , instance methods are thodse whicb are used to work only on  one document
//here the this points towards the document
//scheama.statics is used as a static method , which is used for processin gon the whole document
//here "this" points towards the complete documents
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

//1.
//use post because then the current review which user has created will also be in the aggregata pipeline
//ie. if we use pre, it excute beforoe current review is saved to the db, so the aggregate pipiline calculates avg for the prebious stored revies only
//the save middleware works with only save and not update or delete
reviewSchema.post('save', function () {
  //this points to current review
  //Review.calcAverageRatings(this.tour);
  //but wa cant use the Review model before it is declared. so use its constructor this.constructor
  this.constructor.calcAverageRatings(this.tour);
});

//2.
//so for updating and deleteing we need to use query middleware
//findbyidAndUpdate and findByIdandDelet
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   console.log('>>>>>', this);
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   // await this.findOne(); does NOT work here, query has already executed
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });

reviewSchema.post(/^findOneAnd/, async (doc, next) => {
  //console.log(doc);
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
