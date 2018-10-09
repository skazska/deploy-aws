const AG = require('aws-sdk/clients/apigateway');

const CommonAwsConnector = require('../common/connector/aws');

class ApiGatewayConnector extends CommonAwsConnector {
    constructor (defaults) {
        super(defaults);
        this.ag = new AG({apiVersion: '2015-07-09'});
    }


}

module.exports = ApiGatewayConnector;