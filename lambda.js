const { createHash } = require('crypto');

const { hasDifferences } = require('./utils/properties');

const LambdaConnector = require('./lambda/connector');
const LambdaFunction = require('./lambda/function');

class Controller {

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

    /**
     * deploys lambda-function changes
     * @param {string} name function name
     * @param {Promise<Lambda.Types.CreateFunctionRequest>} properties
     * @param {object} options,
     * @param {InformGroup} [informGroup]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>|*>}
     */
    async deploy (name, properties, options, informGroup) {
        let result = null;

        const lambda = new LambdaFunction(name, {}, this.connector, informGroup);

        //wait for all data get resolved
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});
        const [existing, codeBuffer, params] = await Promise.all([
            lambda.read(),
            LambdaFunction.preparePackage(options.wd, options.codeEntries),
            properties
        ]);

        if (params.Role && typeof params.Role !== 'string') {
            params.Role = params.Role.Arn;
        }

        if (existing) {
            //function exists
            const results = [];

            if (hasDifferences(params, existing)) {
                results.push(lambda.update(params));
            }

            //TODO checking hash is actually useless unless adm-zip stop use current time in entry headers
            const hash = createHash('sha256')
                .update(codeBuffer)
                .digest('base64');

            if (hash !== existing.CodeSha256) {
                results.push(lambda.updateCode({ZipFile: codeBuffer}));
            }

            result = Promise.all(results).then(() => {
                return existing;
            });
        } else {
            params.Code = {ZipFile: codeBuffer};
            result = this.function.create(name, params);
        }
        return result;
    }
}

module.exports = Controller;