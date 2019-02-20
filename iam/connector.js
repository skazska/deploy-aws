const AG = require('aws-sdk/clients/iam');

const CommonAwsConnector = require('../common/connector');

class IAMConnector extends CommonAwsConnector {
    constructor (defaults) {
        super(defaults);
        this.api = new AG({apiVersion: '2010-05-08'});
    }

    //direct api call map

    /**************************************************************
     * User API
     **************************************************************/

    getUser (name) {
        const params = {};
        if (name) {
            params.UserName = name
        }
        return this.api.getUser(params).promise();
    }
}

module.exports = IAMConnector;
