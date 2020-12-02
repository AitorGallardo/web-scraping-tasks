const nodemailer = require('nodemailer');

require('dotenv').config();

function sendEmail (args) {
return new Promise((resolve,reject)=>{


  const gymDefaultTitle = '🏋️‍♀🏋️‍♀️🏋️‍♀💀 GYM ALERT 💀🏋️‍♀🏋️‍♀️🏋️‍♀' 
  const gameScriptDefaultTitle = '🚀🚀🚀BUY SEKIRO🚀🚀🚀'
  
  const message_type = args.message_type ? args.message_type : 'game-script'
  const title = args.title ? args.title : message_type === 'gym' ? gymDefaultTitle : gameScriptDefaultTitle;
  const price = args.price ? args.price : '<Unknown>'
  const name = args.name ? args.name : '<Unknown>'
  const link = args.link ? args.link : '<Unknown>'
  const message_payload = args.message_payload ? args.message_payload : '<Unknown>'
  const gym_message = error ? `<p style="font-size:12px; font-weight: bold"> ${message_payload}  </p> </br>` : `<p style="font-size:48px; font-weight: bold"> ${message_payload}  </p> </br>`;
  const game_message = `<p style="font-size:48px; font-weight: bold"> Price: ${price} € </p> </br>
  <p style="font-size:42px; font-style: italic;" > ${name} € </p>  </br> 
  ${link}`;
  const message = message_type === 'game-script' ?  game_message : gym_message;

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