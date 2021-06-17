const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: `${__dirname}/config.env` });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION...Shutting Down');
  console.log(err.name, err.message, err.stack);
  // server.close(() => {
  process.exit(1);
  // });
});
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Succesful');
  });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening....${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION...Shutting Down');
  server.close(() => {
    process.exit(1);
  });
});
