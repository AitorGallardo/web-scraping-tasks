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

async function main(){
    
    try{
        const start = new Date();
        const instantGamingGamePromise =  scrapeInstantGaming()
        const cdkeybayGamePromise =  scrapeCDKEYBAY()
        const [instantGamingGame,cdkeybayGame] = await Promise.all([ instantGamingGamePromise,cdkeybayGamePromise])
        const end = new Date() - start
        const cheapestGame  =  instantGamingGame.price < cdkeybayGame.price ? instantGamingGame :cdkeybayGame
        console.log(' --- CHEAPEST_GAME ---','\n',cheapestGame, '\n', ' ---------------------', '\n');
        console.log('---------> Sending email...');

        const mailTitle = cheapestGame.price <= desiredGamePrice ? '🚀🚀🚀BUY SEKIRO🚀🚀🚀' : '💩SEKIRO💩'
        await sendEmail({ title: mailTitle,...cheapestGame})
        console.log('TOTAL_TIME: ',end, '\n');

    }catch(err){
        console.log('MAIN ERROR > ', err);
    }
}

async function scrapeInstantGaming(){
    try{
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
        console.log('InstantGamingEnds....   Time: ',end, '\n');
        return cheapestGame;
    }catch(err){
        console.log('INSTANT-GAMING-SCRAPE-ERROR',err, '\n');
    }
    
}
async function scrapeCDKEYBAY(){
    try{
        const start = new Date();
        console.log('CDKEYBAYStarts....\n');
        const url = 'https://www.cdkeybay.com/search/sekiro-shadows-die-twice'
        const html = await webRequest(url);
        const $ = cheerio.load(html);
        const rawDAta = getInstantCDKEYBAYTree($);
        const allGames = cleanWebData(rawDAta);
        const desiredGames = filterDesiredGames(allGames)
        const cheapestGame = getCheapestGame(desiredGames)

        console.log('CKEYBAY-PRICE', cheapestGame, '\n');

        // CDKEYBAY links are actually links to their api that has their scraping info, thats way we have to fetch it already to get the real url to the seller webpage
        const {link} = JSON.parse((await webRequest(cheapestGame.link)));
        console.log('LILNK', link);
        cheapestGame.link = link;

        const end = new Date() - start
        console.log('CDKEYBAYEnds....   Time: ',end, '\n');
        return cheapestGame;
        
    }catch(err){
        console.log('CKEYBAY-ERROR',err);
    }
    
}

async function webRequest(url) {
    try {
        const res = await fetch(url)
        const html = await res.text()
        return html
    } catch (err) {
        console.log('WEBERR',err);
    }
}

function getInstantCDKEYBAYTree($){
    return $('main[id="m"]').children().first().html();
}
function getInstantGamingDomTree($){
    return $('div[class="search"]').children();
}

function getInstantGamingElementsData($, div_search_children){
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

function cleanWebData(rawDAta){
    const stringArray = rawDAta.split(' = ')[1]
    const array = []
    JSON.parse(stringArray).map(res=>{
        const obj = {price:res.price_eur,
            region:res.zone,
            platform:res.platform,
            link:res.link,
            name:res.name
        }
        array.push(new Game(obj))
    })
    return array;
}
function getCheapestGame(filteredGame){
    return filteredGame.sort((a,b)=>a-b)[0];
}
function filterDesiredGames(allGames){
    const checkPlatformAndZone = (args)=> {

        const platform = args.platform;
        const region = args.region;

        const platformValidation = platform.toLowerCase().includes('steam');
        const zoneValidation = region.toLowerCase().includes('europe') || region.toLowerCase().includes('global')|| region.toLowerCase().includes('worlwide');

        return platformValidation&&zoneValidation;
    }
    return allGames.filter(checkPlatformAndZone);
}

main()

