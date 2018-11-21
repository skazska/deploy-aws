const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AG = require('aws-sdk/clients/apigateway');
const ConnectorResource = require('../connector');

const awsResponse = (response) => {
    return {
        promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
    };
};

describe('AWS Api Gateway Connector - Integrations methods', () => {
    const connector = new ConnectorResource();
    describe('#constructor', () => {
        it('should have property api of type aws-sdk/clients/apigateway ', () => {
            expect(connector).to.have.property('api');
            expect(connector.api).to.be.instanceof(AG);
        });
    });
    describe('#getIntegration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getIntegration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getIntegration transforming input params to properties', async () => {
            const result = await connector.getIntegration('restApi', 123, 'ANY');
            const apiCall = connector.api.getIntegration;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY'});
            expect(result).to.be.equal('response');
        });

    });
    describe('#createIntegration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'putIntegration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method putIntegration transforming input params to properties', async () => {
            const result = await connector.createIntegration('restApi', 123, 'ANY');
            const apiCall = connector.api.putIntegration;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY',
                type: 'AWS_PROXY'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateIntegration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateIntegration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method updateIntegration transforming input params to properties', async () => {
            const result = await connector.updateIntegration('restApi', 123, 'ANY', {name: 'name'});
            const apiCall = connector.api.updateIntegration;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY',
                patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });
    describe('#deleteIntegration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteIntegration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method deleteIntegration transforming input params to properties', async () => {
            const result = await connector.deleteIntegration('restApi', 123, 'ANY');
            const apiCall = connector.api.deleteIntegration;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY'});
            expect(result).to.be.equal('response');
        });
    });
});