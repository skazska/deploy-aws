const Connector = require('./lambda/connector');
const Function = require('./lambda/function');

class Controller {

    constructor () {
        const connector = new Connector({
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
        this.restApi = new Function(connector);
    }

    /**
     * deploys role changes
     * @param {} properties
     * @param {Controller.deploy~options} options
     * @param {Group} informGroup
     * @return {Promise<*>}
     */
    async deploy (restApiId, properties, options, informGroup) {
        let result = null;

        //wait for all data get resolved
        const waitPropsInformer = informGroup.addInformer(null, {text: 'Waiting dependencies to complete'});
        const [api, resource, method, params] = await Promise.all([
            this.getConfig(name),
            this.preparePackage(options.wd, options.codeEntries),
            properties
        ]);
        waitPropsInformer.done();

    }
}

module.exports = Controller;