const { createHash } = require('crypto');

const { hasDifferences } = require('./utils/properties');

const Connector = require('./lambda/connector');
const Function = require('./lambda/function');

class Controller {

    constructor (informer) {
        this.connector = new Connector({
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
        this.informer = informer;
        // this.function = new Function(this.connector, informer);
    }

    /**
     * deploys lambda-function changes
     * @param {string} name function name
     * @param {Promise<Lambda.Types.CreateFunctionRequest>} properties
     * @param {object} options,
     * @param {Group} [informGroup]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>|*>}
     */
    async deploy (name, properties, options, informGroup) {
        let result = null;

        const func = new Function(this.connector, this.informer, name);

        //wait for all data get resolved
        const waitPropsInformer = informGroup.addInformer(null, {text: 'Waiting dependencies to complete'});
        const [existing, codeBuffer, params] = await Promise.all([
            this.function.getConfig(name),
            Function.preparePackage(options.wd, options.codeEntries),
            properties
        ]);
        waitPropsInformer.done();

        if (params.Role && typeof params.Role !== 'string') {
            params.Role = params.Role.Arn;
        }

        const informerOptions = {};

        if (existing) {
            //function exists
            const results = [];

            if (hasDifferences(params, existing)) {
                results.push(this.function.updateConfig(name, params));
            }

            //TODO checking hash is actually useless unless adm-zip stop use current time in entry headers
            const hash = createHash('sha256')
                .update(codeBuffer)
                .digest('base64');

            if (hash !== existing.CodeSha256) {
                results.push(this.function.updateCode(name, true, {ZipFile: codeBuffer}));
            }

            result = Promise.all(results).then(() => {
                return existing;
            });

            informerOptions.text = 'waiting lambda update';
        } else {
            params.Code = {ZipFile: codeBuffer};
            result = this.function.create(name, params);

            informerOptions.text = 'waiting lambda update';
        }

        informGroup.addInformer(result, informerOptions);

        return result;

    }
}

module.exports = Controller;