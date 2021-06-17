const nodemailer = require('nodemailer');

module.exports = async (options) => {
  // 1) create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //activate ingmail "less secure app" option
  //   });
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) Define email options
  const mailOptions = {
    from: 'Dhananjay Gadakh <letslogin101@gmail.com>',
    to: options.mail,
    subject: options.subject,
    text: options.message,
  };
  //3) actually send email
  await transport.sendMail(mailOptions);
};
