const cheerio = require('cheerio')
const fetch = require('node-fetch')


const sendEmail = require('./mailSender.js')

var desiredGamePrice = 25;

function Game(args) {
    this.region = args.region
    this.price = parseFloat(args.price);
    this.platform = args.platform
    this.link = args.link
    this.name = args.name
}

async function main() {

    try {
        const start = new Date();
        const instantGamingGamePromise = scrapeInstantGaming()
        const cdkeybayGamePromise = scrapeCDKEYBAY()
        const [instantGamingGame, cdkeybayGame] = await Promise.all([instantGamingGamePromise, cdkeybayGamePromise])
        const end = new Date() - start
        const cheapestGame = instantGamingGame.price < cdkeybayGame.price ? instantGamingGame : cdkeybayGame
        console.log(' --- CHEAPEST_GAME ---', '\n', cheapestGame, '\n', ' ---------------------', '\n');
        console.log('---------> Sending email...');

        const buy = cheapestGame.price <= desiredGamePrice;
        const config = { buy : buy, ...cheapestGame }
        await sendEmail({ game: config })
        console.log('TOTAL_TIME: ', end, '\n');

    } catch (err) {
        console.log('MAIN ERROR > ', err);
        await sendEmail({ game: { error: true, message: err } })
    }
}

async function scrapeInstantGaming() {
    const max_tries = 5;
    for (let i = 0; i < max_tries; i++) {
        try {
            const start = new Date();
            console.log('InstantGamingStarts....\n');
            const url = 'https://www.instant-gaming.com/en/search/?query=sekiro'
            const html = await webRequest(url);
            const $ = cheerio.load(html);
            const div_search_children = getInstantGamingDomTree($);
            const allGames = getInstantGamingElementsData($, div_search_children);
            const desiredGames = filterDesiredGames(allGames)
            const cheapestGame = getCheapestGame(desiredGames)
            console.log('INSTANT-PRICE', cheapestGame, '\n');
            const end = new Date() - start
            console.log('InstantGamingEnds....   Time: ', end, '\n');
            return cheapestGame;
        } catch (err) {
            let message;
            if (i === max_tries - 1) {
                message =`INSTANT-GAMING-SCRAPE-ERROR.....MAX_TRIES_REACHED..... Skiping function >> ${err}`;
                console.log(message, '\n');
                throw new Error(err)
            }
            message = `INSTANT-GAMING-SCRAPE-ERROR.....trying again..... try n: ${i} >> ${err}`;
            console.log(message, '\n');
        }
    }

}
async function scrapeCDKEYBAY() {
    const max_tries = 5;

    for (let i = 0; i < max_tries; i++) {
        try {
            const start = new Date();
            console.log('CDKEYBAYStarts....\n');
            const url = 'https://www.cdkeybay.com/search/sekiro-shadows-die-twice'
            const html = await webRequest(url);
            const $ = cheerio.load(html);
            const rawDAta = getInstantCDKEYBAYTree($);
            const allGames = cleanWebData(rawDAta);
            const desiredGames = filterDesiredGames(allGames)
            const cheapestGame = getCheapestGame(1)

            console.log('CKEYBAY-PRICE', cheapestGame, '\n');

            // CDKEYBAY links are actually links to their api that has their scraping info, thats way we have to fetch it already to get the real url to the seller webpage
            const { link } = JSON.parse((await webRequest(cheapestGame.link)));
            console.log('LILNK', link);
            cheapestGame.link = link;

            const end = new Date() - start
            console.log('CDKEYBAYEnds....   Time: ', end, '\n');
            return cheapestGame;

        } catch (err) {
            let message;
            if (i === max_tries - 1) {
                message = `CKEYBAY-ERROR.....MAX_TRIES_REACHED..... Skiping function >> ${err}`;
                console.log(message, '\n');
                throw new Error(err)
            }
            message = `CKEYBAY-ERROR.....trying again..... try n: ${i} >> ${err}`
            console.log(message, '\n');
        }
    }

}

async function webRequest(url) {
    try {
        const res = await fetch(url)
        const html = await res.text()
        return html
    } catch (err) {
        console.log('WEBERR', err);
    }
}

function getInstantCDKEYBAYTree($) {
    return $('main[id="m"]').children().first().html();
}
function getInstantGamingDomTree($) {
    return $('div[class="search"]').children();
}

function getInstantGamingElementsData($, div_search_children) {
    const elementsData = [];
    div_search_children.map((i, el) => {
        const obj = {
            region: $(el).attr('data-region'),
            price: $(el).attr('data-price'),
        }
        $(el).children().map((index, element) => {
            const element_class = $(element).attr('class');
            if (element_class.includes('badge')) {
                const platform = element_class.split(' ')[1];
                obj['platform'] = platform;
            }
            if (element_class.includes('cover')) {
                const link = $(element).attr('href');
                obj['link'] = link;
            }
            if (element_class.includes('name')) {
                const name = $(element).html()
                obj['name'] = name;
            }
        })
        elementsData.push(new Game(obj))
    })
    return elementsData;
}

function cleanWebData(rawDAta) {
    const stringArray = rawDAta.split(' = ')[1]
    const array = []
    JSON.parse(stringArray).map(res => {
        const obj = {
            price: res.price_eur,
            region: res.zone,
            platform: res.platform,
            link: res.link,
            name: res.name
        }
        array.push(new Game(obj))
    })
    return array;
}
function getCheapestGame(filteredGame) {
    return filteredGame.sort((a, b) => a - b)[0];
}
function filterDesiredGames(allGames) {
    const checkPlatformAndZone = (args) => {

        const platform = args.platform;
        const region = args.region;

        const platformValidation = platform.toLowerCase().includes('steam');
        const zoneValidation = region.toLowerCase().includes('europe') || region.toLowerCase().includes('global') || region.toLowerCase().includes('worlwide');

        return platformValidation && zoneValidation;
    }
    return allGames.filter(checkPlatformAndZone);
}

main()

