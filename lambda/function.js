const { statSync, readdirSync } = require('fs');
const Entity = require('../common/entity');
const AdmZip = require('../custom_modules/adm-zip');

//const AdmZip = require('adm-zip');

class RestApi extends Entity {
    constructor (connector, informer, id, properties) {
        super(connector, informer, id, properties)
    }
    /**
     * creates entity through api
     * @param {string} id
     * @param {Object} options
     */
    create (id, properties) {

    }

    /**
     * gets entity data from api
     * @param {string} id
     */
    read (id) {
        const params = {
            restApiId: id
        };
        return this.connector.getRestApi(params);
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    list (options) {

    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (id, properties) {

    }

    /**
     * delete entity
     * @param {string} id
     */
    delete (id) {

    }

    /**
     * return zipfile Buffer promise
     * @param {string} wd lambda package directory
     * @param {string[]} codeEntries dirs and files in package directory to add to package
     * @return {Promise<Buffer>}
     */
    static preparePackage (wd, codeEntries) {
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
    }

}

module.exports = RestApi;