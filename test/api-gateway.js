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
const awsResponse = (response) => {
    return {
        promise: () => {
            return new Promise(resolve => setImmediate(resolve, response))
        }
    };
};


describe('ApiGatewayController', () => {
    describe('#create', () => {
        it('should instantiate Connector ', () => {
            const apiGw = new ApiGw();
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

        let createIntegrationStub;
        let readIntegrationStub;
        let updateIntegrationStub;
        let deleteIntegrationStub;

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
            apiGw = new ApiGw();

            listStub = sinon.stub(apiGw.connector.api, 'getRestApis');
            createStub = sinon.stub(apiGw.connector.api, 'createRestApi');
            readStub = sinon.stub(apiGw.connector.api, 'getRestApi');
            updateStub = sinon.stub(apiGw.connector.api, 'updateRestApi');
            deleteStub = sinon.stub(apiGw.connector.api, 'deleteRestApi');

            listResourcesStub = sinon.stub(apiGw.connector.api, 'getResources');
            readResourceStub = sinon.stub(apiGw.connector.api, 'getResource');
            createResourceStub = sinon.stub(apiGw.connector.api, 'createResource');
            deleteResourceStub = sinon.stub(apiGw.connector.api, 'deleteResource');

            readMethodStub = sinon.stub(apiGw.connector.api, 'getMethod');
            createMethodStub = sinon.stub(apiGw.connector.api, 'putMethod');
            deleteMethodStub = sinon.stub(apiGw.connector.api, 'deleteMethod');

            readIntegrationStub = sinon.stub(apiGw.connector.api, 'getIntegration');
            createIntegrationStub = sinon.stub(apiGw.connector.api, 'putIntegration');
            deleteIntegrationStub = sinon.stub(apiGw.connector.api, 'deleteIntegration');

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
                            "clients": {
                                "ANY": {
                                    "type": "AWS_PROXY",
                                    "awsProperties": {
                                        "description": "STRING_VALUE"
                                    },
                                    "integration": {
                                        "lambda": "FunctionArn",
                                        "awsProperties": {
                                            "description": "STRING_VALUE"
                                        }
                                    }
                                },
                                "resources" : {
                                    ":id": {

                                    }
                                }
                            }
                        }
                    )
                })
            };

        });
        it('should call RestApi method create if list result did not contain item with restApi name', async () => {
            listStub.returns(awsResponse({items: [
                {id: 'id', name: 'name1'},
                {id: 'id', name: 'name1'}
            ]}));
            createStub.returns(awsResponse({id: 'id', name: 'name', description: 'STRING_VALUE'}));

            const entity = await apiGw.deploy('name', props, opts, group);
            expect(entity.properties).to.eql({id: 'id', name: 'name', description: 'STRING_VALUE'});
            expect(createStub.args[0][0]).to.deep.include({
                id: 'id', name: 'name', description: 'STRING_VALUE'
            });
        });
    });
});