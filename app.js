const express = require('express');
const morgan = require('morgan');
const path = require('path');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// const session = require('express-session');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRoutes = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const errorController = require('./controller/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(`${__dirname}/public`));

//Global Middleware

//set seciurity http headers
//app.use(helmet({ contentSecurityPolicy: false }));

//development logging
if (process.env.NODE_ENV === 'development') {
  console.log('In Development Phase');
  app.use(morgan('dev'));
}
//limit request fro api
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  Message: 'Too many request please try again after one hour',
});

app.use('/api', limiter);
//console.log(process.env, process.env.NODE_ENV == 'development');
//for post request data the exprees doesnot provide te data direct so use mdiddle ware
//express.json which adds thed data in the request paramter req in req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitisation agains NOSal query injection
app.use(mongoSanitize());

//data sanitisation against xss
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());
//serving static file
//middleware
// app.use((req, res, next) => {
//   console.log('Waiting in Middleware..');
//   next();
// });
app.use((req, res, next) => {
  req.reqtime = new Date().toString();
  // console.log(req.cookies);
  next();
});

//app.use('/', routeindex);

app.post('/', (req, res) => {
  res.status(200).json({ Message: 'Please provide a API route' });
});

//5. Storing the routes in files
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRoutes);

app.use('/', viewRoutes);

// /**Authentication login using express-session */
// app.use(
//   session({
//     secret: 'Dj',
//     name: 'mySessionId',
//     saveUninitialized: false,
//     resave: false,
//   })
// );
// /**Authentication login using express-session */
// app.get('/login/dashboard', (req, res) => {
//   console.log(req.session, req.session.isLoggedin);
//   if (req.session.isLoggedin) {
//     res.status(200).send('<h1>Dashboard</h1>');
//   } else {
//     res.status(200).send(`<body><h1>Login</h1>
//     <button onclick="loguserin()">Login</button>
//     <script>
//     function loguserin(){
//       var xhttp = new XMLHttpRequest();
//       xhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200) {
//          alert('Loggedin')
//         }
//       };
//       xhttp.open("POST", "/authenticate", true);
//       xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//       xhttp.send("user=admin&pass=123456aA#");
//     }
//     </script>`);
//   }
// });
// app.post(
//   '/authenticate',
//   express.urlencoded({ extended: false }),
//   (req, res, next) => {
//     if (req.body.user == 'admin' && req.body.pass == '123456aA#') {
//       res.locals.user = req.body.user;
//       next();
//     } else {
//       res.status(404).end();
//     }
//   },
//   (req, res) => {
//     req.session.isLoggedin = true;
//     req.session.username = res.locals.username;
//     console.log(res.session);
//     res.redirect('login/dashboard');
//   }
// );

//route not found  error handling middleware
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//error controller
app.use(errorController);
// app.use((err, req, res, next) => {
//   err.statusCode = err.static || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
module.exports = app;
//4. Creating and mounting Multiple Routers

// const tourRouter = express.Router();
// app.use('/api/v1/tours', tourRouter);

// tourRouter.route('/').get(getTours).post(addTour);

// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

//3. More restructiing by uding the route name only one using .route()

// app.route('/api/v1/tours').get(getTours).post(addTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

//2. Restructing by writing cde in function
//route handler
// app.get('/api/v1/tours', getTours);

// //route handler for a specific tour details
// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', addTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

//1. Conventional methiod of writing routes
// app.get('/api/v1/tours', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// //route handler for a specific tour details
// app.get('/api/v1/tours/:id', (req, res) => {
//   console.log(req.params);
//   let tourid = parseInt(req.params.id);
//   let tourData = tours.find((el) => el.id === tourid);

//   if (!tourData || tourid > tours.length) {
//     res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   } else {
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tours: tourData,
//       },
//     });
//   }
// });

// app.post('/api/v1/tours', (req, res) => {
//   // /console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   //console.log(tours[tours.length - 1]);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).send({
//         status: 'success',
//         data: {
//           tours: newTour,
//         },
//       });
//     }
//   );
// });

// app.patch('/api/v1/tours/:id', (req, res) => {
//   // /console.log(req.body);
//   let tourid = parseInt(req.params.id);
//   let updatingData = req.body;
//   let tourData = tours.find((el) => el.id === tourid);

//   if (!tourData || tourid > tours.length) {
//     res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   } else {
//     console.log(tourData, req.body);
//     Object.keys(updatingData).forEach((ele) => {
//       tourData[ele] = updatingData[ele];
//     });

//     tours.forEach((ele, index) => {
//       if (ele.id === tourid) {
//         tours[index] = tourData;
//         return;
//       }
//     });
//     fs.writeFile(
//       `${__dirname}/dev-data/data/tours-simple.json`,
//       JSON.stringify(tours),
//       (err) => {
//         res.status(201).send({
//           status: 'success',
//           data: {
//             tours: tourData,
//           },
//         });
//       }
//     );
//   }
// });

// app.delete('/api/v1/tours/:id', (req, res) => {
//   let tourid = parseInt(req.params.id);
//   let tourData = tours.find((el) => el.id === tourid);

//   if (!tourData || tourid > tours.length) {
//     res.status(404).json({ status: 'fail', message: 'Tour doesnot exist' });
//   } else {
//     tours.forEach((el, index) => {
//       if (el.id === tourid) {
//         tours.splice(index, 1);
//         return;
//       }
//     });
//     console.log(tours);
//     fs.writeFile(
//       `${__dirname}/dev-data/data/tours-simple.json`,
//       JSON.stringify(tours),
//       (err) => {
//         res.status(204).send({
//           status: 'success',
//           data: {
//             tours: null,
//           },
//         });
//       }
//     );
//   }
// });

// const port = 3000;
// app.listen(port, () => {
//   console.log('Listening....');
// });
