const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');
const preparePackage = require('./utils/fs').preparePackage;

class Controller {

    constructor () {
        this.connector = new Connector();
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

        this.restApi = new RestApi(id, {}, this.connector, informGroup);

        //wait for all data get resolved
        const waitPropsInformer = informGroup.addInformer(null, {text: 'Waiting dependencies to complete'});
        const [api, resource, method, params] = await Promise.all([
            this.getConfig(name),
            preparePackage(options.wd, options.codeEntries),
            properties
        ]);
        waitPropsInformer.done();

    }
}

module.exports = Controller;