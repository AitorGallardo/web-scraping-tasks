const nodemailer = require('nodemailer');

require('dotenv').config();

function sendEmail(args) {
  return new Promise((resolve, reject) => {
    if(args.gym){
      var {title,message} = buildGymMessage(args.gym);
    }
    else if(args.game){
      var {title,message} = buildGameMessage(args.game);

    }
    else{
      return;
    }

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
          reject(error)
        } else {
          console.log('Email sent: ' + info.response);
          resolve('Email sent');
        }
      });

    } catch (err) {
      console.log('MAIL-ERROR', err)
      reject(err)
    }
  })

}

function buildGymMessage(args){
  const error = args.error || false;
  const title = error ? '⛔⛔🏋️‍♀GYM-SCRIPT-ERROR🏋️‍♀⛔⛔': args.title ? args.title : `✅✅🏋️‍♀GYM OKEY🏋️‍♀✅✅`
  const message = args.error ? `<p style="font-size:12px; font-weight: bold"> ${args.message}  </p> </br>` : 
                                    `<p style="font-size:48px; font-weight: bold"> ${args.message}  </p> </br>`;
                                      
  return {title:title, message:message}

}
function buildGameMessage(args){
  const error = args.error || false;
  const buy = args.buy || false;
  const title = error ? '⛔⛔🎮GAME-SCRIPT-ERROR🎮⛔⛔': args.title ? args.title : buy ? '✅✅🎮BUY SEKIRO🎮✅✅' : '💩💩🎮SEKIRO🎮💩💩';
  const price = args.price || '<Unknown>'
  const name = args.name || '<Unknown>'
  const link = args.link || '<Unknown>'
  const message = error ? `<p style="font-size:12px; font-weight: bold"> ${args.message}  </p> </br>` : `<p style="font-size:48px; font-weight: bold"> Price: ${price} € </p> </br>
  <p style="font-size:42px; font-style: italic;" > ${name} € </p>  </br> 
  ${link}`;

  return {title:title, message : message}
}

module.exports = sendEmail;