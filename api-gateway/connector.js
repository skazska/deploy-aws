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
        const params = {
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

    /**
     *
     * @param properties
     * @return {Promise<PromiseResult<APIGateway.RestApi, AWSError>>}
     */
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

    createMethodResponse (restApiId, resourceId, httpMethod, statusCode, properties) {
        const defaults = {
            // httpMethod: 'STRING_VALUE', /* required */
            // resourceId: 'STRING_VALUE', /* required */
            // restApiId: 'STRING_VALUE', /* required */
            // statusCode: 'STRING_VALUE', /* required */
            // responseModels: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // responseParameters: {
            //     '<String>': true || false,
            //     /* '<String>': ... */
            // }
        };
        return this.api.putMethodResponse(Object.assign(
            defaults,
            properties,
            {
                restApiId: restApiId,
                resourceId: resourceId,
                httpMethod: httpMethod,
                statusCode: statusCode
            })
        ).promise();
    }

    deleteMethodResponse (restApiId, resourceId, httpMethod, statusCode) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod,  /* required */
            statusCode: statusCode  /* required */
        };
        return this.api.deleteMethodResponse(params).promise();
    }


    testMethod  (restApiId, resourceId, httpMethod, properties) {
        const defaults = {
            // httpMethod: 'STRING_VALUE', /* required */
            // resourceId: 'STRING_VALUE', /* required */
            // restApiId: 'STRING_VALUE', /* required */
            // body: 'STRING_VALUE',
            // clientCertificateId: 'STRING_VALUE',
            // headers: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // multiValueHeaders: {
            //     '<String>': [
            //         'STRING_VALUE',
            //         /* more items */
            //     ],
            //     /* '<String>': ... */
            // },
            // pathWithQueryString: 'STRING_VALUE',
            // stageVariables: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // }
        };
        return this.api.testInvokeMethod(Object.assign(
            defaults,
            properties,
            {
                restApiId: restApiId,
                resourceId: resourceId,
                httpMethod: httpMethod
            })
        ).promise();
    }

    /**************************************************************
     * INTEGRATIONS
     **************************************************************/

    getIntegration (restApiId, resourceId, httpMethod) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod  /* required */
        };
        return this.api.getIntegration(params).promise();
    }

    createIntegration (restApiId, resourceId, httpMethod, properties) {
        const defaults = {
            type: 'AWS_PROXY', //HTTP | AWS | MOCK | HTTP_PROXY | AWS_PROXY, /* required */
            // cacheKeyParameters: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            // cacheNamespace: 'STRING_VALUE',
            // connectionId: 'STRING_VALUE',
            // connectionType: INTERNET | VPC_LINK,
            // contentHandling: CONVERT_TO_BINARY | CONVERT_TO_TEXT,
            // credentials: 'STRING_VALUE',
            // integrationHttpMethod: 'STRING_VALUE',
            // passthroughBehavior: 'STRING_VALUE',
            // requestParameters: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // requestTemplates: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // timeoutInMillis: 0,
            // uri: 'STRING_VALUE'
        };
        return this.api.putIntegration(Object.assign(
            defaults,
            properties,
            {
                restApiId: restApiId,
                resourceId: resourceId,
                httpMethod: httpMethod
            })
        ).promise();
    }

    deleteIntegration (restApiId, resourceId, httpMethod) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod  /* required */
        };
        return this.api.deleteIntegration(params).promise();
    }

    updateIntegration (restApiId, resourceId, httpMethod, changes) {
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
        return this.api.updateIntegration(params).promise();
    }

    createIntegrationResponse (restApiId, resourceId, httpMethod, statusCode, properties) {
        const defaults = {
            // httpMethod: 'STRING_VALUE', /* required */
            // resourceId: 'STRING_VALUE', /* required */
            // restApiId: 'STRING_VALUE', /* required */
            // statusCode: 'STRING_VALUE', /* required */
            // contentHandling: CONVERT_TO_BINARY | CONVERT_TO_TEXT,
            // responseParameters: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // responseTemplates: {
            //     '<String>': 'STRING_VALUE',
            //     /* '<String>': ... */
            // },
            // selectionPattern: 'STRING_VALUE'
        };
        return this.api.putIntegrationResponse(Object.assign(
            defaults,
            properties,
            {
                restApiId: restApiId,
                resourceId: resourceId,
                httpMethod: httpMethod,
                statusCode: statusCode
            })
        ).promise();
    }

    deleteIntegrationResponse (restApiId, resourceId, httpMethod, statusCode) {
        const params = {
            resourceId: resourceId, /* required */
            restApiId: restApiId, /* required */
            httpMethod: httpMethod,  /* required */
            statusCode: statusCode  /* required */
        };
        return this.api.deleteIntegrationResponse(params).promise();
    }


}

module.exports = ApiGatewayConnector;