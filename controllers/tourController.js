const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = 'price,ratingAverage';
  req.query.fields = 'name, price,summary';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  res.status(200).json({
    results: tours.length,
    status: 'Sucess',
    data: { tours: tours }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'Sucess',
    data: { tour }
  });
});

exports.createTour = catchAsync(async (req, res) => {
  console.log(req.body);
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updateTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updateTour) {
    next(new AppError('No tour found with that ID', 404));
    return;
  }

  res.status(200).json({
    status: 'Sucess',
    data: { tour: updateTour }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedTour = await Tour.findByIdAndDelete(id, {
    // new: true,
    runValidators: true
  });
  if (!deletedTour) {
    next(new AppError('No tour found with that ID', 404));
    return;
  }

  res.status(200).json({
    status: 'Sucess',
    data: { tour: deletedTour }
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: `$ratingsAverage` },
        avgPrice: { $avg: `$price` },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: -1 }
    },
    {
      $project: { numTours: 1, numRating: 1, _id: 0 }
    }
  ]);
  res.status(200).json({
    numResults: stats.length,
    status: 'Sucess',
    data: { tour: stats }
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
        avgRating: { $avg: '$ratingsAverage' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $sort: {
        numToursStarts: -1,
        avgRating: -1
      }
    },

    {
      $project: {
        _id: 0
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    numResults: plan.length,
    status: 'Sucess',
    plan
  });
});
