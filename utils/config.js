const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);

async function readFromFile (cfgPath) {
    return readFile(cfgPath).then(deployParams => {
        try {
            deployParams = JSON.parse(deployParams);
            return deployParams;
        } catch (e) {
            throw e || new Error('can\'t parse ' + cfgPath);
        }
    });
}

module.exports = {
    readFromFile: readFromFile
};