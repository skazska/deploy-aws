const { statSync, readdirSync } = require('fs');
const Entity = require('../common/entity');
const AdmZip = require('../custom_modules/adm-zip');
//const AdmZip = require('adm-zip');

/**
 * @property {LambdaConnector} connector
 */
class LambdaFunction extends Entity {
    /**
     * @param {LambdaConnector} connector
     * @param {informGroup} informer
     * @param {string} id
     * @param {*} properties
     */
    constructor (id, properties, connector, informer) {
        super(id, properties, connector, informer);
    }

    /**
     * creates entity through api
     * @param {Object} options
     * @param {Boolean} publish
     */
    create (properties, publish) {
        return this.informCall(this.connector.createFunction, 'Create function ' + this.id, this.id,
            properties, publish);
    }

    /**
     * gets entity data from api
     * @param {string} [version]
     */
    read (version) {
        return this.informCall(this.connector.getFunctionConfiguration, 'Get config for function ' + this.id,
            this.id, version);
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    // list (options) {
    //     super.list(options);
    // }

    /**
     * updates entity
     * @param properties
     */
    update (properties) {
        return this.informCall(this.connector.updateFunctionConfiguration, 'Update config for function ' + this.id,
            this.id, properties);
    }

    /**
     * updates entity
     * @param code
     * @param {Boolean} publish
     */
    updateCode (code, publish) {
        return this.informCall(this.connector.updateFunctionCode, 'Update code for function ' + this.id, this.id,
            code, publish);
    }

    /**
     * delete entity
     * @param {string} [version]
     */
    delete (version) {
        return this.informCall(this.connector.deleteFunction, 'Delete function ' + this.id, this.id, version);
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

module.exports = LambdaFunction;