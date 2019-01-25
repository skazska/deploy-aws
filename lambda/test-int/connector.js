const chai = require('chai');
const expect = chai.expect;

const path = require('path');
const cd = path.dirname(__filename);

const AWSGlobal = require('aws-sdk/global');
const Connector = require('../connector');
const preparePackage = require('../../utils/fs').preparePackage;

const FUNC_NAME = 'aws-deploy-test-api';

describe('AWS Lambda Connector ', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new Connector({MemorySize: 128, Runtime: "nodejs8.10"});
    const funcParams = {
        Handler: 'index.handler',
        Role: 'arn:aws:iam::266895356213:role/lambda_basic_execution'
    };

    let funcArn = null;

    it('#updateFunctionConfiguration should result in null if function not found', async () => {
        let result = null;
        try {
            result = await connector.updateFunctionConfiguration(FUNC_NAME, {MemorySize: connector.defaults.MemorySize + 100});
        } catch (e) {
            result = e;
        }
        expect(e).to.have.property('code').that.is.equal('ResourceNotFoundException');
    });

    it('#createFunction should result in new function data with name aws-deploy-test-api', async () => {
        let result = null;
        try {
            const codeBuffer = await preparePackage(path.resolve(cd, './lambda-code'), ['index.js']);
            funcParams.Code = {ZipFile: codeBuffer};
            result = await connector.createFunction(FUNC_NAME, funcParams);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('FunctionArn').that.is.a('string');
        funcArn = result.FunctionArn;
        expect(result).to.have.property('FunctionName').that.is.equal(FUNC_NAME);
        expect(result).to.have.property('Handler').that.is.equal(funcParams.Handler);
        expect(result).to.have.property('MemorySize').that.is.equal(connector.defaults.MemorySize);
    });

    xit('#getRestApis should result in position and list', async () => {
        let result = null;
        try {
            result = await connector.getRestApis(null, 1);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('CodeSha256').that.is.a('string');
        expect(result).to.have.property('FunctionArn').that.is.a('string');
        funcArn = result.FunctionArn;
        expect(result).to.have.property('FunctionName').that.is.equal(FUNC_NAME);
        expect(result).to.have.property('Handler').that.is.equal(funcParams.Handler);
        expect(result).to.have.property('MemorySize').that.is.equal(connector.defaults.MemorySize);
    });

    it('#getFunctionConfiguration should result in function aws-deploy-test-api config data', async () => {
        let result = null;
        try {
            result = await connector.getFunctionConfiguration(FUNC_NAME);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('CodeSha256').that.is.a('string');
        expect(result).to.have.property('FunctionArn').that.is.a('string');
        funcArn = result.FunctionArn;
        expect(result).to.have.property('FunctionName').that.is.equal(FUNC_NAME);
        expect(result).to.have.property('Handler').that.is.equal(funcParams.Handler);
        expect(result).to.have.property('MemorySize').that.is.equal(connector.defaults.MemorySize);
    });

    it('#updateFunctionConfiguration should result in function aws-deploy-test-api new config data', async () => {
        let result = null;
        try {
            result = await connector.updateFunctionConfiguration(FUNC_NAME, {MemorySize: connector.defaults.MemorySize + 100});
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('CodeSha256').that.is.a('string');
        expect(result).to.have.property('FunctionArn').that.is.a('string');
        funcArn = result.FunctionArn;
        expect(result).to.have.property('FunctionName').that.is.equal(FUNC_NAME);
        expect(result).to.have.property('Handler').that.is.equal(funcParams.Handler);
        expect(result).to.have.property('MemorySize').that.is.equal(connector.defaults.MemorySize + 100);
    });

    it('#updateFunctionCode should result in function aws-deploy-test-api new config data', async () => {
        let result = null;
        try {
            const codeBuffer = await preparePackage(path.resolve(cd, './lambda-code'), ['index.js']);
            funcParams.Code = {ZipFile: codeBuffer};
            result = await connector.updateFunctionCode(FUNC_NAME, {ZipFile: codeBuffer}, true);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('CodeSha256').that.is.a('string');
        expect(result).to.have.property('FunctionArn').that.is.a('string');
        funcArn = result.FunctionArn;
        expect(result).to.have.property('FunctionName').that.is.equal(FUNC_NAME);
        expect(result).to.have.property('Handler').that.is.equal(funcParams.Handler);
        expect(result).to.have.property('MemorySize').that.is.equal(connector.defaults.MemorySize + 100);
    });

    it('#deleteFunction should should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteFunction(FUNC_NAME);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    after(async () => {
        try {
            let result = await connector.deleteFunction(FUNC_NAME);
            expect(result).to.be.a('null');
        } catch (e) {
            console.error(e);
        }
    })

});