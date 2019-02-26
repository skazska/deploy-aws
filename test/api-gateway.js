const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const ApiGw = require('../api-gateway');
const RestApi = require('../api-gateway/rest-api');
const Connector = require('../api-gateway/connector');

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
        const opts = {wd: 'wd', codeEntries: ['1'], packager: preparePackageStub};

        let infoCall;
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

        let listIntegrationsStub;
        let createIntegrationStub;
        let readIntegrationStub;
        let updateIntegrationStub;
        let deleteIntegrationStub;

        let props;
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
            restApi = new RestApi();

            listStub = sinon.stub(restApi.connector.api, 'getRestApis');
            createStub = sinon.stub(restApi.connector.api, 'createRestApi');
            readStub = sinon.stub(restApi.connector.api, 'getRestApi');
            updateStub = sinon.stub(restApi.connector.api, 'updateRestApi');
            deleteStub = sinon.stub(restApi.connector.api, 'deleteRestApi');

            listResourcesStub = sinon.stub(restApi.connector.api, 'getResources');
            readResourceStub = sinon.stub(restApi.connector.api, 'getResource');
            createResourceStub = sinon.stub(restApi.connector.api, 'createResource');
            deleteResourceStub = sinon.stub(restApi.connector.api, 'deleteResource');

            listIntegrationsStub = sinon.stub(restApi.connector.api, 'getIntegrations');
            readIntegrationStub = sinon.stub(restApi.connector.api, 'getIntegration');
            createIntegrationStub = sinon.stub(restApi.connector.api, 'createIntegration');
            deleteIntegrationStub = sinon.stub(restApi.connector.api, 'deleteIntegration');

            props = new Promise(resolve => {
                setImmediate(
                    resolve,
                    {Role: 'role', CodeSha256: 'VpTQii5T/8rgwxA+Wtb2B2q9lg6x+KVldwQLwQKPcCs='}
                )
            });

        });
        it('should', () => {

        })
    });
});