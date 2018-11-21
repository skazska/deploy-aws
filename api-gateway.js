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
    async deploy (name, properties, options, informGroup) {
        let result = null;
        let api = null;
        let params = null;

        const restApi = new RestApi(id, {}, this.connector, informGroup);

        //wait for all data get resolved: properties, function read by name, code package
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});

        try {
            api = await restApi.findOrCreate(name, params);
        } catch (e) {
            return;
        }

    }
}

module.exports = Controller;