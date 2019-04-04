const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const ApiGw = require('../api-gateway');
const RestApi = require('../api-gateway/rest-api');
const Connector = require('../api-gateway/connector');

const Inform = require('@skazska/inform');
const groupOptions = {
    failText: 'damn',
    pendingText: 'waiting',
    inProcessText: 'doing',
    doneText: 'did',
    text: 'it'
};
function createInformer(renderer) {
    return new Inform('Deploy service', renderer).addGroup(null, groupOptions);
}
const connectorResponse = (response) => {
    return new Promise(resolve => setImmediate(resolve, response));
};


describe('ApiGatewayController', () => {
    describe('#create', () => {
        it('should instantiate Connector ', () => {
            const apiGw = new ApiGw('eu-west-1');
            expect(apiGw).to.have.property('connector');
            expect(apiGw.connector).to.be.instanceof(Connector);
            // expect(apiGw).to.have.property('restApi');
            // expect(apiGw.restApi).to.be.instanceof(RestApi);
            // expect(apiGw.restApi).to.have.property('connector');
            // expect(apiGw.restApi.connector).to.be.instanceof(Connector);
        });
    });
    describe('#deploy', () => {
        const preparePackageStub = sinon.stub();
        
        let infoCall;
        let apiGw;
        let restApi;


        let listStub;
        let createStub;
        let readStub;
        let updateStub;
        let deleteStub;

        let listResourcesStub;
        let createResourceStub;
        let readResourceStub;
        let updateResourceStub;
        let deleteResourceStub;

        let createMethodStub;
        let readMethodStub;
        let updateMethodStub;
        let deleteMethodStub;

        let createMethodResponseStub;
        let readMethodResponseStub;
        let updateMethodResponseStub;
        let deleteMethodResponseStub;

        let createIntegrationStub;
        let readIntegrationStub;
        let updateIntegrationStub;
        let deleteIntegrationStub;

        let createIntegrationResponseStub;
        let readIntegrationResponseStub;
        let updateIntegrationResponseStub;
        let deleteIntegrationResponseStub;

        let props;
        let opts;

        let group;
        let informer;

        let restApiEntity;


        before(() => {
            infoCall = sinon.fake();
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });
            apiGw = new ApiGw('eu-west-1');

            listStub = sinon.stub(apiGw.connector, 'listRestApis');
            createStub = sinon.stub(apiGw.connector, 'createRestApi');
            readStub = sinon.stub(apiGw.connector, 'readRestApi');
            updateStub = sinon.stub(apiGw.connector, 'updateRestApi');
            deleteStub = sinon.stub(apiGw.connector, 'deleteRestApi');

            //FIXME опять не катит, надо у ResourceEntity перехватывать create и прописывать туда коннектор с фейками...
            listResourcesStub = sinon.stub(apiGw.connector, 'listResources');
            readResourceStub = sinon.stub(apiGw.connector, 'readResource');
            createResourceStub = sinon.stub(apiGw.connector, 'createResource');
            deleteResourceStub = sinon.stub(apiGw.connector, 'deleteResource');

            readMethodStub = sinon.stub(apiGw.connector, 'readMethod');
            createMethodStub = sinon.stub(apiGw.connector, 'createMethod');
            deleteMethodStub = sinon.stub(apiGw.connector, 'deleteMethod');
            updateMethodStub = sinon.stub(apiGw.connector, 'updateMethod');

            readMethodResponseStub = sinon.stub(apiGw.connector, 'readMethodResponse');
            createMethodResponseStub = sinon.stub(apiGw.connector, 'createMethodResponse');
            deleteMethodResponseStub = sinon.stub(apiGw.connector, 'deleteMethodResponse');
            updateMethodResponseStub = sinon.stub(apiGw.connector, 'updateMethodResponse');

            readIntegrationStub = sinon.stub(apiGw.connector, 'readIntegration');
            createIntegrationStub = sinon.stub(apiGw.connector, 'createIntegration');
            deleteIntegrationStub = sinon.stub(apiGw.connector, 'deleteIntegration');
            updateIntegrationStub = sinon.stub(apiGw.connector, 'updateIntegration');

            readIntegrationResponseStub = sinon.stub(apiGw.connector, 'readIntegrationResponse');
            createIntegrationResponseStub = sinon.stub(apiGw.connector, 'createIntegrationResponse');
            deleteIntegrationResponseStub = sinon.stub(apiGw.connector, 'deleteIntegrationResponse');
            updateIntegrationResponseStub = sinon.stub(apiGw.connector, 'updateIntegrationResponse');

            props = new Promise(resolve => {
                setImmediate(
                    resolve,
                    {description: 'STRING_VALUE'}
                )
            });
            opts = {
                resources: new Promise(resolve => {
                    setImmediate(
                        resolve,
                        {
                            "new": {},
                            "clients": {
                                "ANY": {
                                    "awsProperties": {
                                        "authorizationType": "HEADER"
                                    },
                                    "integration": {
                                        "type": "AWS_PROXY",
                                        "lambda": "FunctionArn",
                                        "awsProperties": {
                                            "passthroughBehavior": "NEVER"
                                        },
                                        "responses": {
                                            "200": {
                                            },
                                            "412": {
                                                "contentHandling": "CONVERT_TO_BINARY",
                                                "responseParameters": {"par1":  "val1"},
                                                "responseTemplates": {"tpl1":  "tpl"},
                                                "selectionPattern": "sp"
                                            }
                                        }
                                    },
                                    "responses": {
                                        "200": {
                                            "responseParameters": {
                                                "method.response.header.MY_HEADER": false
                                            },
                                            "responseModels": {
                                                "application/json": "Empty"
                                            }
                                        },
                                        "319": {
                                            "responseParameters": {
                                                "method.response.header.MY_HEADER": false
                                            },
                                            "responseModels": {
                                                "application/json": "Empty"
                                            }
                                        }
                                    }
                                },
                                "resources" : {
                                    "test": {
                                        "ANY": {
                                            "awsProperties": {
                                                "description": "STRING_VALUE"
                                            },
                                            "integration": {
                                                "type": "AWS_PROXY",
                                                "lambda": "FunctionArn",
                                                "awsProperties": {
                                                    "description": "STRING_VALUE"
                                                }
                                            },
                                            "responses": {
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    )
                })
            };
        });

        after(() => {
            sinon.restore();
        });

        it('should call RestApi method create if list result contain no item with restApi name', async () => {
            const opts = {};

            // listStub.restore();
            // listStub = sinon.stub(apiGw.connector, 'listRestApis');
            listStub.returns(connectorResponse({
                items: [
                    {id: 'id1', name: 'name1'},
                    {id: 'id2', name: 'name2'}
                ]
            }));

            // createStub.restore();
            // createStub = sinon.stub(apiGw.connector, 'createRestApi');
            createStub.returns(connectorResponse({id: 'id', name: 'name', description: 'STRING_VALUE'}));

            restApiEntity = await apiGw.deploy('name', props, opts, group);

            expect(restApiEntity).to.eql({id: 'id', name: 'name', description: 'STRING_VALUE'});

            expect(createStub.args[0][0]).to.deep.include({
                name: 'name', description: 'STRING_VALUE'
            });

            // sinon.restore();

        });
        it('should call RestApi method update if list result contain item with restApi name', async () => {
            const props = new Promise(resolve => {
                setImmediate(
                    resolve,
                    {
                        apiKeySource: 'HEADER',
                        binaryMediaTypes: ['VALUE'],
                        cloneFrom: null,
                        description: 'STRING_VALUE',
                        endpointConfiguration: {types: ['REGIONAL']},
                        minimumCompressionSize: 0
                        // policy: 'STRING_VALUE',
                        // version: 'STRING_VALUE'
                    }
                )
            });

            const opts = {
                resources: new Promise(resolve => {
                    setImmediate(
                        resolve,
                        {}
                    );
                })
            };

            // listStub.restore();
            // listStub = sinon.stub(apiGw.connector, 'listRestApis');
            listStub.returns(connectorResponse({items: [
                {
                    id: 'id', name: 'name',
                    apiKeySource: 'HEADER',
                    binaryMediaTypes: ['STRING_VALUE'],
                    cloneFrom: 'STRING_VALUE',
                    // endpointConfiguration: {types: ['REGIONAL']},
                    minimumCompressionSize: 0,
                    policy: 'STRING_VALUE',
                    version: 'STRING_VALUE'
                },
                {id: 'id2', name: 'name2'}
            ]}));

            // listResourcesStub.restore();
            // listResourcesStub = sinon.stub(apiGw.connector, 'listResources');
            listResourcesStub.returns(connectorResponse({items: []}));

            // updateStub.restore();
            // updateStub = sinon.stub(apiGw.connector, 'updateRestApi');
            updateStub.returns(connectorResponse({
                id: 'id', name: 'name',
                apiKeySource: 'HEADER',
                binaryMediaTypes: ['VALUE'],
                description: 'STRING_VALUE',
                endpointConfiguration: {types: ['REGIONAL']},
                minimumCompressionSize: 0,
                policy: 'STRING_VALUE',
                version: 'STRING_VALUE'
            }));

            restApiEntity = await apiGw.deploy('name', props, opts, group);

            expect(restApiEntity).to.eql({
                id: 'id', name: 'name',
                apiKeySource: 'HEADER',
                binaryMediaTypes: ['VALUE'],
                description: 'STRING_VALUE',
                endpointConfiguration: {types: ['REGIONAL']},
                minimumCompressionSize: 0,
                policy: 'STRING_VALUE',
                version: 'STRING_VALUE'
            });

            expect(updateStub.args[0][0]).to.equal('id');
            expect(updateStub.args[0][1]).to.eql([
                {
                    "op": "replace",
                    "path": "/binaryMediaTypes/0",
                    "value": "VALUE"
                },
                {
                    "op": "remove",
                    "path": "/cloneFrom"
                },
                {
                    "op": "add",
                    "path": "/description",
                    "value": "STRING_VALUE"
                },
                {
                    "op": "add",
                    "path": "/endpointConfiguration/types/0",
                    "value": "REGIONAL"
                }
            ]);

            // sinon.restore();

        });
        it('should process complex configuration causing create/update/delete resources, methods, integrations ', async () => {
            listStub.restore();
            listStub = sinon.stub(apiGw.connector, 'listRestApis');
            listStub.returns(connectorResponse({items: [
                {id: 'id', name: 'name'},
                {id: 'id2', name: 'name2'}
            ]}));

            updateStub.restore();
            updateStub = sinon.stub(apiGw.connector, 'updateRestApi');
            updateStub.returns(connectorResponse({id: 'id', name: 'name', description: 'STRING_VALUE'}));

            listResourcesStub.restore();
            listResourcesStub = sinon.stub(apiGw.connector, 'listResources');
            listResourcesStub.returns(connectorResponse({items: [
                {id: 'resId', pathPart: '/', path: '/'},
                {id: 'clientsId', pathPart: 'clients', path: '/clients', parentId: 'resId', resourceMethods: {"ANY": {
                    "httpMethod": "ANY", "authorizationType": "NONE", "apiKeyRequired": false,
                    methodResponses: { "200": { "statusCode": "200", "responseModels": {"application/json": "Error"}},
                        "300": { "statusCode": "300" }},
                    methodIntegration: {
                        "type": "AWS_PROXY", "httpMethod": "POST",
                        "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-function-integral/invocations",
                        "passthroughBehavior": "WHEN_NO_MATCH",  "timeoutInMillis": 29000,
                        "cacheNamespace": "ak8465",
                        "cacheKeyParameters": [],
                        integrationResponses: { "200": { "statusCode": "200" },  "300": { "statusCode": "300" } }
                    }
                }, GET: { "httpMethod": "GET" }}},
                {id: 'testResId', pathPart: 'orphan', path: '/orphan', parentId: 'resId'}
            ]}));

            createResourceStub
                .withArgs('id', 'resId', 'new')
                    .returns(connectorResponse({id: 'newResId1', pathPart: 'new', path: '/new'}))
                .withArgs('id', 'clientsId', 'test')
                    .returns(connectorResponse({id: 'resId2', pathPart: 'test', path: '/clients/test'}));

            //no update updateResourceStub.returns({id: 'clientsId', pathPart: 'clients', path: '/clients',
            // });
            deleteResourceStub.returns(connectorResponse({request: 'done'}));

            createMethodStub.returns(connectorResponse({httpMethod: 'ANY', authorizationType: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));

            updateMethodStub
                .returns(connectorResponse({
                    "httpMethod": "ANY", "authorizationType": "HEADER", "apiKeyRequired": false,
                    methodResponses: {"200": {"statusCode": "200", "responseModels": {"application/json": "Error"}},
                        "300": {"statusCode": "300"}},
                    methodIntegration: {
                        "type": "AWS_PROXY", "httpMethod": "POST",
                        "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-function-integral/invocations",
                        "passthroughBehavior": "WHEN_NO_MATCH", "timeoutInMillis": 29000,
                        "cacheNamespace": "ak8465",
                        "cacheKeyParameters": [],
                        integrationResponses: {"200": {"statusCode": "200"}, "300": {"statusCode": "300"}}
                    }
                }));

            deleteMethodStub.returns(connectorResponse({request: 'done'}));


            createMethodResponseStub.returns(connectorResponse({statusCode: '200', smth: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            updateMethodResponseStub.returns(connectorResponse({
                "statusCode": "200",
                "responseParameters": {
                    "method.response.header.MY_HEADER": false
                },
                "responseModels": {
                    "application/json": "Empty"
                }
            }));

            deleteMethodResponseStub.returns(connectorResponse({request: 'done'}));

            createIntegrationStub.returns(connectorResponse({httpMethod: 'ANY', authorizationType: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));

            updateIntegrationStub
                .returns(connectorResponse({
                    "type": "AWS_PROXY", "httpMethod": "POST",
                    "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-function-integral/invocations",
                    "passthroughBehavior": "NEVER", "timeoutInMillis": 29000,
                    "cacheNamespace": "ak8465",
                    "cacheKeyParameters": [],
                    integrationResponses: {"200": {"statusCode": "200"},
                        "300": {"statusCode": "300"}}
                }));

            deleteIntegrationStub.returns(connectorResponse({request: 'done'}));


            createIntegrationResponseStub.returns(connectorResponse({statusCode: '200', smth: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            updateIntegrationResponseStub.returns(connectorResponse({
                "statusCode": "200",
                "responseParameters": {
                    "method.response.header.MY_HEADER": false
                },
                "responseModels": {
                    "application/json": "Empty"
                }
            }));

            deleteIntegrationResponseStub.returns(connectorResponse({request: 'done'}));

            //deploy
            const result = await apiGw.deploy('name', props, opts, group);

            expect(result).not.empty;
        });
        it('should call RestApi method update', async () => {
            expect(updateStub.args[0][0]).to.equal('id');
            expect(updateStub.args[0][1]).to.deep.include({
                "op": "add",
                "path": "/description",
                "value": "STRING_VALUE"
            });
        });
        it('should call Resource methods', async () => {
            // /clients/test - created
            expect(createResourceStub.args[0]).eql(['id', 'clientsId', 'test']);
            // /new - created
            expect(createResourceStub.args[1]).eql(['id', 'resId', 'new']);
            // /orphan - deleted
            expect(deleteResourceStub.args[0]).eql(['id', 'testResId']);
        });
        it('should call Method methods', async () => {
            // /clients/ANY - updated
            expect(updateMethodStub.args[0][0]).to.equal('id');
            expect(updateMethodStub.args[0][1]).to.equal('clientsId');
            expect(updateMethodStub.args[0][2]).to.equal('ANY');
            expect(updateMethodStub.args[0][3]).to.eql([
                {
                    "op": "replace",
                    "path": "/authorizationType",
                    "value": "HEADER"
                }
            ]);

            // /clients/GET - deleted
            expect(deleteMethodStub.args[0]).eql(['id', 'clientsId', 'GET']);
            // /clients/test/ANY - created
            expect(createMethodStub.args[0]).eql(['id', 'resId2', 'ANY', {"description": "STRING_VALUE"}]);
        });
        it('should call MethodResponse methods', async () => {
            // /clients/ANY - updated
            expect(updateMethodResponseStub.args[0][0]).to.equal('id');
            expect(updateMethodResponseStub.args[0][1]).to.equal('clientsId');
            expect(updateMethodResponseStub.args[0][2]).to.equal('ANY');
            expect(updateMethodResponseStub.args[0][3]).to.equal('200');
            expect(updateMethodResponseStub.args[0][4]).to.eql([
                {
                    "op": "add",
                    "path": "/responseParameters/method.response.header.MY_HEADER",
                    "value": false
                },
                {
                    "op": "replace",
                    "path": "/responseModels/application~1json",
                    "value": "Empty"
                }
            ]);

            // /clients/ANY response 319 - created
            expect(createMethodResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '319', {
                "responseParameters": {
                    "method.response.header.MY_HEADER": false
                },
                "responseModels": {
                    "application/json": "Empty"
                },
                "statusCode": '319'
            }]);
            // /clients/ANY response 300 - deleted
            expect(deleteMethodResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '300']);

        });

        it('should call Integrations methods', async () => {
            // /clients/test/ANY integration - created
            expect(createIntegrationStub.args[0]).eql(['id', 'resId2', 'ANY', {
                "type": "AWS_PROXY",
                "description": "STRING_VALUE",
                "integrationHttpMethod": "POST",
                "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/FunctionArn/invocations"
            }]);

            expect(deleteIntegrationStub.args.length).equal(0);
            // expect(deleteIntegrationStub.args[0]).eql(['id', 'clientsId', 'GET']);

            // /clients/ANY integration - updated
            expect(updateIntegrationStub.args[0][0]).to.equal('id');
            expect(updateIntegrationStub.args[0][1]).to.equal('clientsId');
            expect(updateIntegrationStub.args[0][2]).to.equal('ANY');
            expect(updateIntegrationStub.args[0][3]).to.eql([
                {
                    "op": "replace",
                    "path": "/passthroughBehavior",
                    "value": "NEVER"
                },
                {
                    "op": "replace",
                    "path": "/uri",
                    "value": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/FunctionArn/invocations"
                }
            ]);
        });

        it('should call IntegrationResponse methods', async () => {

            expect(createIntegrationResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '412', {
                "contentHandling": "CONVERT_TO_BINARY",
                "responseParameters": {"par1":  "val1"},
                "responseTemplates": {"tpl1":  "tpl"},
                "selectionPattern": "sp",
                "statusCode": '412'
            }]);
            expect(deleteIntegrationResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '300']);
            expect(updateIntegrationResponseStub.args.length).equal(0);


        });
    });
});