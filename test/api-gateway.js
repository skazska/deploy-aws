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
    return new Inform(renderer, 'Deploy service').addGroup(null, groupOptions);
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

            readMethodResponseStub = sinon.stub(apiGw.connector, 'readMethodResponse');
            createMethodResponseStub = sinon.stub(apiGw.connector, 'createMethodResponse');
            deleteMethodResponseStub = sinon.stub(apiGw.connector, 'deleteMethodResponse');

            readIntegrationStub = sinon.stub(apiGw.connector, 'readIntegration');
            createIntegrationStub = sinon.stub(apiGw.connector, 'createIntegration');
            deleteIntegrationStub = sinon.stub(apiGw.connector, 'deleteIntegration');

            readIntegrationResponseStub = sinon.stub(apiGw.connector, 'readIntegrationResponse');
            createIntegrationResponseStub = sinon.stub(apiGw.connector, 'createIntegrationResponse');
            deleteIntegrationResponseStub = sinon.stub(apiGw.connector, 'deleteIntegrationResponse');

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
                                        "description": "STRING_VALUE"
                                    },
                                    "integration": {
                                        "type": "AWS_PROXY",
                                        "lambda": "FunctionArn",
                                        "awsProperties": {
                                            "description": "STRING_VALUE"
                                        },
                                        "responses": {
                                            "200": {
                                                "contentHandling": "CONVERT_TO_TEXT",
                                                "responseParameters": {"p1":  "v1"},
                                                "responseTemplates": {"t1":  "t"},
                                                "selectionPattern": "s"
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
                                            "Models": {"model1":  "model"},
                                            "Parameters": {"par1": true, "par2":  false}
                                        },
                                        "319": {
                                            "Models": {"model1":  "model"},
                                            "Parameters": {"par1": true, "par2":  false}
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
        it('should call RestApi method create if list result did not contain item with restApi name', async () => {
            listStub.returns(connectorResponse({items: [
                {id: 'id1', name: 'name1'},
                {id: 'id2', name: 'name2'}
            ]}));
            createStub.returns(connectorResponse({id: 'id', name: 'name', description: 'STRING_VALUE'}));

            listResourcesStub.returns(connectorResponse({items: [
                {id: 'resId', pathPart: '/', path: '/'},
                {id: 'clientsId', pathPart: 'clients', path: '/clients', parentId: 'resId', resourceMethods: {"ANY": {
                    "httpMethod": "ANY", "authorizationType": "NONE", "apiKeyRequired": false,
                    methodResponses: { "200": { "statusCode": "200" },  "300": { "statusCode": "300" }},
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

            // updateResourceStub.returns({id: 'clientsId', pathPart: 'clients', path: '/clients',
            // });
            deleteResourceStub.returns(connectorResponse({request: 'done'}));

            createMethodStub.returns(connectorResponse({httpMethod: 'ANY', authorizationType: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            // updateMethodStub.returns({ "statusCode": "200" });

            deleteMethodStub.returns(connectorResponse({request: 'done'}));


            createMethodResponseStub.returns(connectorResponse({statusCode: '200', smth: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            // updateMethodResponseStub.returns({ "statusCode": "200" });

            deleteMethodResponseStub.returns(connectorResponse({request: 'done'}));

            createIntegrationStub.returns(connectorResponse({httpMethod: 'ANY', authorizationType: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            // updateMethodStub.returns({ "statusCode": "200" });

            deleteIntegrationStub.returns(connectorResponse({request: 'done'}));


            createIntegrationResponseStub.returns(connectorResponse({statusCode: '200', smth: 'NONE',
                // requestParameters: {},
                // requestModels: {},
                // methodResponses: {}
            }));
            // updateMethodResponseStub.returns({ "statusCode": "200" });

            deleteIntegrationResponseStub.returns(connectorResponse({request: 'done'}));


            const entity = await apiGw.deploy('name', props, opts, group);
            expect(entity.properties).to.eql({id: 'id', name: 'name', description: 'STRING_VALUE'});
            expect(createStub.args[0][0]).to.deep.include({
                name: 'name', description: 'STRING_VALUE'
            });
            expect(createResourceStub.args[0]).eql(['id', 'clientsId', 'test']);
            expect(createResourceStub.args[1]).eql(['id', 'resId', 'new']);
            expect(deleteResourceStub.args[0]).eql(['id', 'testResId']);

            expect(createMethodStub.args[0]).eql(['id', 'resId2', 'ANY', {"description": "STRING_VALUE"}]);
            expect(deleteMethodStub.args[0]).eql(['id', 'clientsId', 'GET']);

            expect(createMethodResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '319', {
                "Models": {"model1":  "model"},
                "Parameters": {"par1": true, "par2":  false},
                "statusCode": '319'
            }]);
            expect(deleteMethodResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '300']);

            expect(createIntegrationStub.args[0]).eql(['id', 'resId2', 'ANY', {
                "type": "AWS_PROXY",
                "description": "STRING_VALUE",
                "integrationHttpMethod": "POST",
                "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/FunctionArn/invocations"
            }]);

            expect(deleteIntegrationStub.args.length).equal(0);
            // expect(deleteIntegrationStub.args[0]).eql(['id', 'clientsId', 'GET']);

            expect(createIntegrationResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '412', {
                "contentHandling": "CONVERT_TO_BINARY",
                "responseParameters": {"par1":  "val1"},
                "responseTemplates": {"tpl1":  "tpl"},
                "selectionPattern": "sp",
                "statusCode": '412'
            }]);
            expect(deleteIntegrationResponseStub.args[0]).eql(['id', 'clientsId', 'ANY', '300']);


        });
    });
});