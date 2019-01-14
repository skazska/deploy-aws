const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AG = require('aws-sdk/clients/apigateway');
const ConnectorRestApi = require('../connector');

const awsResponse = (response) => {
    return {
        promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
    };
};

describe('AWS Api Gateway Connector - RestApi methods', () => {
    const connector = new ConnectorRestApi();
    describe('#constructor', () => {
        it('should have property api of type aws-sdk/clients/apigateway ', () => {
            expect(connector).to.have.property('api');
            expect(connector.api).to.be.instanceof(AG);
        });
    });
    describe('#getRestApis', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getRestApis', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getRestApis transforming input params to properties', async () => {
            const result = await connector.getRestApis();
            const apiCall = connector.api.getRestApis;
            expect(apiCall).to.be.calledOnce;
            expect(result).to.be.equal('response');
        });
        it('should compose position and limit params into options for AWS SDK AG mathod getRestApis', async () => {
            const result = await connector.getRestApis('a', 25);
            const apiCall = connector.api.getRestApis;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({position: 'a', limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should set limit option to 25 if limit param is not provided', async () => {
            const result = await connector.getRestApis('a');
            const apiCall = connector.api.getRestApis;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({position: 'a', limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should not add position option if position param is not provided', async () => {
            const result = await connector.getRestApis();
            const apiCall = connector.api.getRestApis;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({limit: 25});
            expect(result).to.be.equal('response');
        });
        it('should not add position option if position param is null', async () => {
            const result = await connector.getRestApis(null);
            const apiCall = connector.api.getRestApis;
            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({limit: 25});
            expect(result).to.be.equal('response');
        });
    });
    describe('#getRestApi', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getRestApi', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getRestApi transforming input params to properties', async () => {
            const result = await connector.getRestApi(123);
            const apiCall = connector.api.getRestApi;
            expect(apiCall).to.be.calledOnceWith({restApiId: 123});
            expect(result).to.be.equal('response');
        });

    });
    describe('#createRestApi', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'createRestApi', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method createRestApi transforming input params to properties', async () => {
            const result = await connector.createRestApi({name: 'name'});
            const apiCall = connector.api.createRestApi;
            expect(apiCall).to.be.calledOnceWith({name: 'name'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateRestApi', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateRestApi', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method updateRestApi transforming input params to properties', async () => {
            const result = await connector.updateRestApi('id', {name: 'name'});
            const apiCall = connector.api.updateRestApi;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });
    describe('#deleteRestApi', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteRestApi', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method deleteRestApi transforming input params to properties', async () => {
            const result = await connector.deleteRestApi(123);
            const apiCall = connector.api.deleteRestApi;
            expect(apiCall).to.be.calledOnceWith({restApiId: 123});
            expect(result).to.be.equal('response');
        });
    });
});