const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

require('dotenv').config();


const url = 'https://www.g2a.com/search?query=sekiro&sort=price-lowest-first';

async function startScraping(url) {

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] }); // args needed to run properly on heroku
    const page = await browser.newPage();
    const mozzilla_windows_userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0';
    await page.setUserAgent(mozzilla_windows_userAgent);
    await page.goto(url);

    const cookieBannerMaybeLater_buttonClass = 'button.button.button--size-large.button--type-transparent';
    const cookieBannerMaybeLater_button = await page.$(cookieBannerMaybeLater_buttonClass);
    if (cookieBannerMaybeLater_button) {
      await cookieBannerMaybeLater_button.click();
    }

    const interested_articles = ['EUROPE', 'GLOBAL'];
    const card_body_nestedClass = 'ul.products-grid div.Card__body';
    const all_card_elements = await page.$$(card_body_nestedClass);

    const getElementText = async (el, element_class) => {
      const element = await el.$(element_class);
      const elementTitle = await element.getProperty('textContent');
      const elementTitleTxt = await elementTitle.jsonValue();
      return elementTitleTxt;
    }

    const getCheapestGame = async (all_card_elements) => {
      const gameTitleElementClass = 'h3.Card__title a';

      for (let card of all_card_elements) {
        const gameTitleTxt = await getElementText(card, gameTitleElementClass);
        if (interested_articles.some(e => gameTitleTxt.includes(e))) {
          return card;
        }
      }
    }

    const getGamePrice = async (e) => {
      const elementClass = 'span.Card__price-cost.price';
      const price = await getElementText(e, elementClass);
      const integerPrice = parseInt(price.split(" ")[0])
      return integerPrice;
    }

    const sendEmail = async () => {
      try {
        let transporter = nodemailer.createTransport({
          service: process.env.MAIL_SERVICE,
          auth: {
            user: process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_PASSWORD, // generated ethereal password
          },
        });

        var mailOptions = {
          from: process.env.MAIL_USER,
          to: process.env.MAIL_TO,
          subject: 'SEKIRO ESTA POR DEBAJO DE LOS 40 PAVOS',
          text: 'DALEDALEDALE'
        };

        await transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      } catch (err) {
        console.log(err)
      }
    }


    const selectedGame = await getCheapestGame(all_card_elements);
    const gamePrice = await getGamePrice(selectedGame);

    const maxPrice = 40;

    if (gamePrice < maxPrice) {
      await sendEmail()
    }else {
      console.log(`Current Price ${gamePrice}€`);
    }
    browser.close();

  } catch (err) {
    console.log('ERROR >>> ', err);
  }
}

startScraping(url);