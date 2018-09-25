const AG = require('aws-sdk/clients/apigateway');

class Controller {

    constructor(defaults) {
        //defaults for aws lambda configuration
        this.defaults = Object.assign({
            // name: 'STRING_VALUE', /* required */
            // apiKeySource: HEADER | AUTHORIZER,
            // binaryMediaTypes: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            // cloneFrom: 'STRING_VALUE',
            // description: 'STRING_VALUE',
            // endpointConfiguration: {
            //     types: [
            //         REGIONAL | EDGE | PRIVATE,
            //         /* more items */
            //     ]
            // },
            // minimumCompressionSize: 0,
            // policy: 'STRING_VALUE',
            // version: 'STRING_VALUE'
        }, defaults);
        this.ag = new AG({apiVersion: '2015-07-09'});
    }

    create (properties) {
        return this.ag.createRestApi(Object.assign({}, this.defaults, properties)).promise();
    }

    get (id) {
        const params = {
            restApiId: id
        };
        this.ag.getRestApi(params).promise();
    }

    getResources ()
}

module.exports = Controller;