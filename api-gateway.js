const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');

class Controller {

    constructor () {
        const connector = new Connector();
        this.restApi = new RestApi(connector);
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
