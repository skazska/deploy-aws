const AG = require('aws-sdk/clients/apigateway');

const CommonAwsConnector = require('../common/connector');

class ApiGatewayConnector extends CommonAwsConnector {
    constructor (defaults) {
        super(defaults);
        this.api = new AG({apiVersion: '2015-07-09'});
    }

    //direct api call map

    createRestApi (properties) {
        return this.ag.createRestApi(Object.assign({}, this.defaults, properties)).promise();
    }

    getRestApi (properties) {
        // const params = {
        //     restApiId: properties.restApiId
        // };
        this.ag.getRestApi(properties).promise();
    }

    getResources (id) {
        // var params = {
        //     restApiId: 'STRING_VALUE', /* required */
        //     embed: [
        //         'STRING_VALUE',
        //         /* more items */
        //     ],
        //     limit: 0,
        //     position: 'STRING_VALUE'
        // };
        // apigateway.getResources(params, function(err, data) {
        //     if (err) console.log(err, err.stack); // an error occurred
        //     else     console.log(data);           // successful response
        // });
        const params = {
            restApiId: id
        };
        this.ag.getResources(params).promise();
    }

    getRestApi (restApiId) {

    }




}

module.exports = ApiGatewayConnector;