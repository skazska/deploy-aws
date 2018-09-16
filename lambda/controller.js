const statSync = require('fs').statSync;
const readdirSync = require('fs').readdirSync;

const Lambda = require('aws-sdk/clients/lambda');

const AdmZip = require('../custom_modules/adm-zip');

class Controller {

    constructor (defaults) {
        this.defaults = defaults || {};
        this.lambda = new Lambda({apiVersion: '2015-03-31'});
    }

    /**
     *
     * @param {Object} params
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    create (params) {
        const defaultParams = Object.assign({
            // Code: {},
            Description: "",
            // FunctionName: "MyFunction",
            // Handler: "souce_file.handler_name", // is of the form of the name of your source file and then name of your function handler
            MemorySize: 128,
            Publish: true,
            // Role: "arn:aws:iam::123456789012:role/service-role/role-name", // replace with the actual arn of the execution role you created
            Runtime: "nodejs8.10",
            Timeout: 15,
            //VpcConfig: {}
        }, this.defaults);

        return this.lambda.createFunction(Object.assign(defaultParams, params)).promise();
    }

    /**
     * return zipfile Buffer promise
     * @param {string} wd lambda package directory
     * @param {string[]} codeEntries dirs and files in package directory to add to package
     * @return {Promise<any>}
     */
    preparePackage (wd, codeEntries) {
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
            zip.writeZip('zipFile.zip');
            zip.toBuffer(resolve, reject);
        });
    }



    async deploy (properties, options) {

        const [codeBuffer, params] = await Promise.all([
            this.preparePackage(options.wd, options.codeEntries), properties]);
        params.Role = params.Role.Arn;
        params.Code = {ZipFile: codeBuffer};
        return this.create(params);
    }
}

module.exports = Controller;