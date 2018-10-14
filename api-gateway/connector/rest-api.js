const CommonConnectorEntity = require('../../common/connector/entity');

class RestApiEntity extends CommonConnectorEntity {
    constructor (api, informer) {
        super(api, informer);
    }

    read (id) {
        const params = {
            restApiId: id
        };
        this.ag.getRestApi(params).promise();
    }
}

module.exports = RestApiEntity;