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

describe('AWS Api Gateway Connector - Methods methods', () => {
    const connector = new ConnectorResource();
    describe('#constructor', () => {
        it('should have property api of type aws-sdk/clients/apigateway ', () => {
            expect(connector).to.have.property('api');
            expect(connector.api).to.be.instanceof(AG);
        });
    });
    describe('#readMethod', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getMethod', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method getMethod transforming input params to properties', async () => {
            const result = await connector.readMethod('restApi', 123, 'ANY');
            const apiCall = connector.api.getMethod;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY'});
            expect(result).to.be.equal('response');
        });

    });
    describe('#createMethod', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'putMethod', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method putMethod transforming input params to properties', async () => {
            const result = await connector.createMethod('restApi', 123, 'ANY');
            const apiCall = connector.api.putMethod;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY',
                authorizationType: 'NONE'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateMethod', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateMethod', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method updateMethod transforming input params to properties', async () => {
            const result = await connector.updateMethod('restApi', 123, 'ANY', {name: 'name'});
            const apiCall = connector.api.updateMethod;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY',
                patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });

    describe('#createMethodResponse', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'putMethodResponse', sinon.fake(() => {
                return awsResponse('response');
            }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('#createMethodResponse should result in some data', async () => {
            const result = await connector.createMethodResponse('restApi', 123, 'ANY', '200', {});
            const apiCall = connector.api.putMethodResponse;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY',
                statusCode: '200'});
            expect(result).to.be.equal('response');
        });
    });

    describe('#readMethodResponse', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getMethodResponse', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('#readMethodResponse should result in some data', async () => {
            const result  = await connector.readMethodResponse('restApi', 123, 'ANY', '200');
            const apiCall = connector.api.getMethodResponse;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY', statusCode: '200'});
            expect(result).to.be.equal('response');
        });
    });

    describe('#deleteMethodResponse', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteMethodResponse', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('#deleteMethodResponse should result in some data', async () => {
            const result  = await connector.deleteMethodResponse('restApi', 123, 'ANY', '200');
            const apiCall = connector.api.deleteMethodResponse;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY', statusCode: '200'});
            expect(result).to.be.equal('response');
        });
    });

    describe('#deleteMethod', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteMethod', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK AG method deleteMethod transforming input params to properties', async () => {
            const result = await connector.deleteMethod('restApi', 123, 'ANY');
            const apiCall = connector.api.deleteMethod;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'restApi', resourceId: 123, httpMethod: 'ANY'});
            expect(result).to.be.equal('response');
        });
    });
});