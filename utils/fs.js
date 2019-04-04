const { statSync, readdirSync } = require('fs');
const AdmZip = require('../custom_modules/adm-zip');
//const AdmZip = require('adm-zip');

/**
 * return zipfile Buffer promise
 * @param {string} wd lambda package directory
 * @param {string[]} codeEntries dirs and files in package directory to add to package
 * @return {Promise<Buffer>}
 */
const preparePackage = (wd, codeEntries) => {
    return new Promise((resolve, reject) => {
        const zip = new AdmZip();
        (codeEntries || readdirSync(wd)).forEach(path => {
            if (!codeEntries && ( path[0] === '.' || path[0] === '_')) return;
            let fullPath = wd + '/' + path;
            const p = statSync(fullPath);
            if (p.isFile()) {
                zip.addLocalFile(fullPath);
            } else if (p.isDirectory()) {
                zip.addLocalFolder(fullPath, path);
            }
        });
        // zip.writeZip('zipFile.zip');
        zip.toBuffer(resolve, reject);
    });
};

module.exports = {
    preparePackage: preparePackage
};