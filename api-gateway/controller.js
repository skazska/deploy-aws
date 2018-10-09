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
}

module.exports = Controller;