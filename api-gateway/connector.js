const AG = require('aws-sdk/clients/apigateway');

const CommonAwsConnector = require('../common/connector');

class ApiGatewayConnector extends CommonAwsConnector {
    constructor (defaults) {
        super(defaults);
        this.api = new AG({apiVersion: '2015-07-09'});
    }

    //direct api call map

    /**************************************************************
     * REST API
     **************************************************************/

    getRestApis (position, limit) {
        var params = {
            limit: limit || 25
        };
        if (typeof position !== 'undefined' && position !== null) {
            params.position = position;
        }
        return this.api.getRestApis(params).promise();
    }

    getRestApi (id) {
        const params = {
            restApiId: id
        };
        return this.api.getRestApi(params).promise();
    }

    createRestApi (properties) {
        const defaults = {
        //     name: 'STRING_VALUE', /* required */
        //     apiKeySource: HEADER | AUTHORIZER,
        //     binaryMediaTypes: [
        //         'STRING_VALUE',
        //         /* more items */
        //     ],
        //     cloneFrom: 'STRING_VALUE',
        //     description: 'STRING_VALUE',
        //     endpointConfiguration: {
        //         types: [
        //             REGIONAL | EDGE | PRIVATE,
        //             /* more items */
        //         ]
        //     },
        //     minimumCompressionSize: 0,
        //     policy: 'STRING_VALUE',
        //     version: 'STRING_VALUE'
        };
        return this.api.createRestApi(Object.assign(
            defaults,
            properties)
        ).promise();
    }

    updateRestApi (id, changes) {
        const params = {
            restApiId: id /* required */
            // patchOperations: [
            //     {
            //         from: 'STRING_VALUE',
            //         op: add | remove | replace | move | copy | test,
            //         path: 'STRING_VALUE',
            //         value: 'STRING_VALUE'
            //     },
            //     /* more items */
            // ]
        };

        if (changes) {
            params.patchOperations = changes;
        }
        return this.api.updateRestApi(params).promise();
    }

    deleteRestApi (id) {
        const params = {
            restApiId: id /* required */
        };
        return this.api.deleteRestApi(params).promise();
    }

    /**************************************************************
     * RESOURCES
     **************************************************************/

    getResources (restApiId, position, limit) {
        var params = {
            restApiId: restApiId, /* required */
            limit: limit || 25
            // position: position
            // embed: [
            //     'STRING_VALUE',
            //     /* more items */
            // ]
        };
        if (typeof position !== 'undefined' && position !== null) {
            params.position = position;
        }
        return this.api.getResources(params).promise();
    }

    getResource (restApiId, id) {
        const params = {
            resourceId: id, /* required */
            restApiId: restApiId /* required */
            // embed: [
            //     'STRING_VALUE',
            //     /* more items */
            // ]
        };
        return this.api.getResource(params).promise();
    }

    createResource (restApiId, parentId, pathPart) {
        const params = {
            parentId: parentId, /* required */
            pathPart: pathPart, /* required */
            restApiId: restApiId /* required */
        };
        return this.api.createResource(params).promise();
    }

    updateResource (restApiId, id, changes) {
        const params = {
            resourceId: id, /* required */
            restApiId: restApiId /* required */
            // patchOperations: [
            //     {
            //         from: 'STRING_VALUE',
            //         op: add | remove | replace | move | copy | test,
            //         path: 'STRING_VALUE',
            //         value: 'STRING_VALUE'
            //     },
            //     /* more items */
            // ]
        };
        if (changes) {
            params.patchOperations = changes;
        }
        return this.api.updateResource(params).promise();
    }

    deleteResource(restApiId, id) {
        const params = {
            resourceId: id, /* required */
            restApiId: restApiId /* required */
        };
        return this.api.deleteResource(params).promise();
    }

    /**************************************************************
     * METHODS
     **************************************************************/

    getMethod (restApiId, resourceId, httpMethod) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod  /* required */
        };
        return this.api.getMethod(params).promise();
    }

    createMethod (restApiId, resourceId, httpMethod, properties) {
        const defaults = {
            authorizationType: 'NONE', /* required */ // AWS_IAM, CUSTOM, COGNITO_USER_POOLS
        //     httpMethod: 'STRING_VALUE', /* required */
        //     resourceId: 'STRING_VALUE', /* required */
        //     restApiId: 'STRING_VALUE', /* required */
        //     apiKeyRequired: true || false,
        //     authorizationScopes: [
        //         'STRING_VALUE',
        //         /* more items */
        //     ],
        //     authorizerId: 'STRING_VALUE',
        //     operationName: 'STRING_VALUE',
        //     requestModels: {
        //         '<String>': 'STRING_VALUE',
        //         /* '<String>': ... */
        //     },
        //     requestParameters: {
        //         '<String>': true || false,
        //         /* '<String>': ... */
        //     },
        //     requestValidatorId: 'STRING_VALUE'
        };
        return this.api.putMethod(Object.assign(
            defaults,
            properties,
            {
                restApiId: restApiId,
                resourceId: resourceId,
                httpMethod: httpMethod
            })
        ).promise();
    }

    deleteMethod (restApiId, resourceId, httpMethod) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod  /* required */
        };
        return this.api.deleteMethod(params).promise();
    }

    updateMethod (restApiId, resourceId, httpMethod, changes) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod  /* required */
            // patchOperations: [
            //     {
            //         from: 'STRING_VALUE',
            //         op: add | remove | replace | move | copy | test,
            //         path: 'STRING_VALUE',
            //         value: 'STRING_VALUE'
            //     },
            //     /* more items */
            // ]
        };
        if (changes) {
            params.patchOperations = changes;
        }
        return this.api.updateMethod(params).promise();
    }

}

module.exports = ApiGatewayConnector;