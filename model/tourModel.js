const mongoose = require('mongoose');
// const slugify = require('slugify');
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [
        10,
        'A tour name must have grater than equal to 10 characters'
      ],
      maxLength: [40, 'A tour name must have less than equal to 40 characters']
      // validate: [validator.isAlpha, 'Tour name must contain only character']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsQuantity: {
      type: Number,
      default: 45
    },

    ratingsAverage: {
      type: Number,
      default: 1,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'The discount price({VALUE}) must be less than the price'
      }
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover']
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.virtual('durationWeeks').get(function() {
//   return this.duration / 7;
// });

// // Document MIDDLEwARE : runs before .save() and insertMany()
// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// // tourSchema.post('save', function(doc, next) {
// //   next();
// // });
// // tourSchema.pre('save', function(next) {
// //   next();
// // });

// // QUERY MIDDLEWARE
// // tourSchema.pre('find', function(next) {

// tourSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });
// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });
// // AGGERGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   // console.log(this.pipeline());
//   this.pipeline().unshift({
//     $match: {
//       secretTour: { $ne: true }
//     }
//   });

//   next();
// });
// tourSchema.post('aggregate', function(docs, next) {
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
