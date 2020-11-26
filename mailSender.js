const nodemailer = require('nodemailer');

require('dotenv').config();

function sendEmail (args) {
return new Promise((resolve,reject)=>{

  const title = args.title ? args.title : '🚀🚀🚀BUY SEKIRO🚀🚀🚀';
  const price = args.price ? args.price : '<Unknown>'
  const name = args.name ? args.name : '<Unknown>'
  const link = args.link ? args.link : '<Unknown>'
  const message_type = args.message_type ? args.message_type : 'game-script'
  const message_payload = args.message_payload ? args.message_payload : '<Unknown>'
  const message = args.message_type === 'game-script' ?  `<p style="font-size:48px; font-weight: bold"> Price: ${price} € </p> </br>
                                                 <p style="font-size:42px; font-style: italic;" > ${name} € </p>  </br> 
                                                 ${link}` : `<p style="font-size:48px; font-weight: bold"> ${message_payload}  </p> </br>`;

  try {
    let transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: title,
      html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject(error)
      } else {
        console.log('Email sent: ' + info.response);
        resolve('Email sent');
      }
  });
  
  } catch (err) {
    console.log(err)
    reject(err)
  }
})

  }

  module.exports = sendEmail;