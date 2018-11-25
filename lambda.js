const { createHash } = require('crypto');

const { hasDifferences } = require('./utils/properties');

const LambdaConnector = require('./lambda/connector');
const LambdaFunction = require('./lambda/function');
const preparePackage = require('./utils/fs').preparePackage;

class LambdaController {

    constructor () {
        this.connector = new LambdaConnector({
            Description: "",
            // FunctionName: "MyFunction",
            // Handler: "souce_file.handler_name", // is of the form of the name of your source file and then name of your function handler
            MemorySize: 128,
            //Publish: true,
            // Role: "arn:aws:iam::123456789012:role/service-role/role-name", // replace with the actual arn of the execution role you created
            Runtime: "nodejs8.10",
            Timeout: 15,
            //VpcConfig: {}
        });
        // this.function = new Function(this.connector, informer);
    }

    static get Controller() {
        return LambdaFunction;
    }

    /**
     * @typedef {Object} LambdaFunction~DeployOptions
     * @property {string} wd deployment workdir - a lambda function directory
     * @property {string[]} codeEntries array of file paths (relative to wd) to package
     * @property {Function} [packager] a function returning promise with code package buffer
     * @property {LambdaController} [lambdaController] instance of aws lambda controller
     */

    /**
     * deploys lambda-function changes
     * @param {string} name function name
     * @param {Promise<Lambda.Types.CreateFunctionRequest>} properties of lambda function
     * @param {LambdaFunction~DeployOptions} options,
     * @param {InformGroup} [informGroup]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>|*>}
     */
    async deploy (name, properties, options, informGroup) {
        let result = null;

        const lambda = options.lambdaController || new LambdaFunction(name, {}, this.connector, informGroup);

        //wait for all data get resolved: properties, function read by name, code package
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});
        const [existing, codeBuffer, params] = await Promise.all([
            lambda.read(),
            (options.packager || preparePackage)(options.wd, options.codeEntries),
            properties
        ]);

        if (params.hasOwnProperty('FunctionName') && params['FunctionName'] !== name) {
            throw new Error("lambda function properties contain FunctionName ant it's value isn't same to" + name);
        }
        // params["FunctionName"] = name;

        if (params.Role && typeof params.Role !== 'string') {
            params.Role = params.Role.Arn;
        }

        if (existing) {
            //function exists
            const results = [];

            if (hasDifferences(params, existing)) {
                results.push(lambda.update(params));
            } else {
                results.push(null);
            }

            //TODO checking hash is actually useless unless adm-zip stop use current time in entry headers
            const hash = createHash('sha256')
                .update(codeBuffer)
                .digest('base64');

            if (hash !== existing.CodeSha256) {
                results.push(lambda.updateCode({ZipFile: codeBuffer}));
            } else {
                results.push(null)
            }

            result = Promise.all(results).then((results) => {
                const result = {};
                if (results[0]) {
                    Object.assign(result, results[0]);
                }
                if (results[1]) {
                    Object.assign(result, results[1]);
                }
                return result;
            });
        } else {
            params.Code = {ZipFile: codeBuffer};
            result = lambda.create(params);
        }
        return result;
    }
}

module.exports = LambdaController;