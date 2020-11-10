// This script is thought to be executed in heroku. Dyno config is scaled to = 0 to dont execute script on build. This index.js file its just in case it has to be executed some starting script.

console.log(`Executing 'index.js'...`);
process.exit();