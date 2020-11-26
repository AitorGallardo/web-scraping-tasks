const argv = require('yargs/yargs')(process.argv.slice(2))
    .default({
        nextDay: true,
        mail: true,
        firstHour: 10,
        secondHour: 11
    }).alias({
        n: 'nextDay',
        m: 'mail',
        f: 'firstHour',
        s: 'secondHour'
    }).argv


const isValidArg = function (arg) {
    switch (arg) {
        case ('n' || 'nextDay'):
            if (typeof argv.nextDay === 'boolean') return argv.nextDay;
            if (typeof argv.nextDay === 'string' && (argv.nextDay === 'true' || argv.nextDay === 'false')) return JSON.parse(argv.nextDay);
            else throw Error('Invalid --nextDay argument');
        case ('m' || 'mail'):
            if (typeof argv.mail === 'boolean') return argv.mail;
            if (typeof argv.mail === 'string' && (argv.mail === 'true' || argv.mail === 'false')) return JSON.parse(argv.mail);
            else throw Error('Invalid --mail argument');
        case ('f' || 'firstHour'):
            if (typeof argv.firstHour === 'number' && (argv.firstHour >= 7 && argv.firstHour <= 20)) return argv.firstHour;
            else throw Error('Invalid --firstHour argument');
        case ('s' || 'secondHour'):
            if (typeof argv.secondHour === 'number' && (argv.secondHour >= 7 && argv.secondHour <= 20)) return argv.secondHour;
            else throw Error('Invalid --secondHour argument');
        default:
            return argv[arg];
    }
}

const checkArgs = function () {
    for (const argument in argv) {
        argv[argument] = isValidArg(argument);
    }
}

argv.isValidArg = isValidArg, argv.checkArgs = checkArgs;

module.exports = argv;