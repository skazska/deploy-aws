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

describe('AWS Api Gateway Connector - Resource methods', () => {
    const connector = new ConnectorResource();
    describe('#constructor', () => {
        it('should have property api of type aws-sdk/clients/apigateway ', () => {
            expect(connector).to.have.property('api');
            expect(connector.api).to.be.instanceof(AG);
        });
    });
    describe('#getResources', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getResources', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getResources transforming input params to properties', async () => {
            const result = await connector.getResources('restApi');
            const apiCall = connector.api.getResources;
            expect(apiCall).to.be.calledOnce;
            expect(result).to.be.equal('response');
        });
        it('should compose position and limit params into options for AWS SDK AG mathod getResources', async () => {
            const result = await connector.getResources('restApi', 'a', 25);
            const apiCall = connector.api.getResources;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({restApiId: 'restApi', position: 'a', limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should set limit option to 25 if limit param is not provided', async () => {
            const result = await connector.getResources('restApi', 'a');
            const apiCall = connector.api.getResources;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({restApiId: 'restApi', position: 'a', limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should not add position option if position param is not provided', async () => {
            const result = await connector.getResources('restApi');
            const apiCall = connector.api.getResources;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({restApiId: 'restApi', limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should not add position option if position param is null', async () => {
            const result = await connector.getResources('restApi', null, 15);
            const apiCall = connector.api.getResources;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({restApiId: 'restApi', limit: 15});
            expect(result).to.be.equal('response');
        });
    });
    describe('#getResource', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getResource', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getResource transforming input params to properties', async () => {
            const result = await connector.getResource('restApi', 123);
            const apiCall = connector.api.getResource;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123});
            expect(result).to.be.equal('response');
        });

    });
    describe('#createResource', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'createResource', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method createResource transforming input params to properties', async () => {
            const result = await connector.createResource('restApi', 'parent', 'path');
            const apiCall = connector.api.createResource;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', parentId: 'parent', pathPart: 'path'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateResource', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateResource', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method updateResource transforming input params to properties', async () => {
            const result = await connector.updateResource('restApi', 'id', {name: 'name'});
            const apiCall = connector.api.updateResource;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });
    describe('#deleteResource', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteResource', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method deleteResource transforming input params to properties', async () => {
            const result = await connector.deleteResource('restApi', 123);
            const apiCall = connector.api.deleteResource;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123});
            expect(result).to.be.equal('response');
        });
    });
});