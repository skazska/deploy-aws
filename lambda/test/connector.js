const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Lambda = require('aws-sdk/clients/lambda');
const LambdaConnector = require('../connector');

const awsResponse = (response) => {
    return {
        promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
    };
};

describe('AWS Lambda Connector', () => {
    const connector = new LambdaConnector({default: 'prop'});
    describe('#constructor', () => {
        it('should have property api of type aws-sdk/clients/apigateway ', () => {
            expect(connector).to.have.property('api');
            expect(connector.api).to.be.instanceof(Lambda);
        });
    });
    describe('#createFunction', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'createFunction', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK method createFunction transforming input params to properties adding defaults', async () => {
            const result = await connector.createFunction('name', {});
            const apiCall = connector.api.createFunction;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', Publish: false, default: 'prop'});
            expect(result).to.be.equal('response');
        });
        it('should call AWS SDK method createFunction with params name and publish to properties adding defaults', async () => {
            const result = await connector.createFunction('name', {}, true);
            const apiCall = connector.api.createFunction;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', default: 'prop', Publish: true});
            expect(result).to.be.equal('response');
        });
    });
    describe('#getFunctionConfiguration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'getFunctionConfiguration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK method getFunctionConfiguration with name input params packed to properties', async () => {
            const result = await connector.getFunctionConfiguration('myFunc');
            const apiCall = connector.api.getFunctionConfiguration;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'myFunc'});
            expect(result).to.be.equal('response');
        });
        it('should call AWS SDK method getFunctionConfiguration with name, qualifier input params packed to properties', async () => {
            const result = await connector.getFunctionConfiguration('myFunc', 'v1');
            const apiCall = connector.api.getFunctionConfiguration;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'myFunc', Qualifier: 'v1'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateFunctionConfiguration', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateFunctionConfiguration', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK method updateFunctionConfiguration with props from name and options ', async () => {
            const result = await connector.updateFunctionConfiguration('name', {default: 'changed'});
            const apiCall = connector.api.updateFunctionConfiguration;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', default: 'changed'});
            expect(result).to.be.equal('response');
        });
    });
    describe('#updateFunctionCode', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'updateFunctionCode', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK method updateFunctionConfiguration with props from name and code options', async () => {
            const result = await connector.updateFunctionCode('name', {ZipFile: ''});
            const apiCall = connector.api.updateFunctionCode;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', Publish: false, ZipFile: ''});
            expect(result).to.be.equal('response');
        });
        it('should call AWS SDK method updateFunctionConfiguration with props from name, code options and publish', async () => {
            const result = await connector.updateFunctionCode('name', {ZipFile: ''}, true);
            const apiCall = connector.api.updateFunctionCode;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', ZipFile: '', Publish: true});
            expect(result).to.be.equal('response');
        });
    });
    describe('#deleteFunction', () => {
        beforeEach(() => {
            sinon.replace(connector.api, 'deleteFunction', sinon.fake(() => { return awsResponse('response'); }));
        });
        afterEach(() => {
            sinon.restore();
        });
        it('should call AWS SDK method updateFunctionConfiguration with props from name', async () => {
            const result = await connector.deleteFunction('name');
            const apiCall = connector.api.deleteFunction;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name'});
            expect(result).to.be.equal('response');
        });
        it('should call AWS SDK method updateFunctionConfiguration with props from name and qualifier', async () => {
            const result = await connector.deleteFunction('name', 'v1');
            const apiCall = connector.api.deleteFunction;
            expect(apiCall).to.be.calledOnceWith({FunctionName: 'name', Qualifier: 'v1'});
            expect(result).to.be.equal('response');
        });
    });
});