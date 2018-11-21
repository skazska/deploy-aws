const chai = require('chai');
const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');

const LambdaFunction = require('../../lambda/function');

const ConnectorRestApi = require('../connector');

describe('AWS Api Gateway Connector - Integration integrations', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    const lambda = new LambdaFunction('aws-deploy-test-api-function', {});

    let funcName = null;
    let funcArn = null;
    let restApiId = null;
    let resourceId = null;

    restApiId = 'z556ogpg4a';
    resourceId = 'ex7nkm1uf5';

    before(async () => {
        try {
            let result = await connector.createRestApi('aws-deploy-test-api',{});
            restApiId = result.id;
            result = await connector.getResources(restApiId, null, 1);
            resourceId = result.items[0].id;
            result = await lambda.create(
                {MemorySize: 128, Runtime: "nodejs8.10", Handler: "index.handler",
                    Role: "arn:aws:iam::266895356213:role/lambda_basic_execution"},
                {wd: __dirname + '/lambda-code', codeEntries: ['index.js']}
            );
            funcName = result.FunctionName;
            funcArn = result.FunctionArn;
            result = await connector.createMethod(restApiId, resourceId, 'ANY', {});
        } catch (e) {
            throw e;
        }
    });

    it('#createIntegration should result in new integration data ', async () => {
        let result = null;
        let uriPrefix = 'arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/';
        funcArn = 'arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-api';
        try {
            result = await connector.createIntegration(restApiId, resourceId, 'ANY', {
                type: 'AWS_PROXY', integrationHttpMethod: 'POST',
                uri: uriPrefix + funcArn + '/invocations'
            });
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('cacheNamespace').that.is.a('string');
        expect(result).to.have.property('passthroughBehavior').that.is.a('string');
    });

    it('#getIntegration should result in new integration data ', async () => {
        let result = null;
        try {
            result = await connector.getIntegration(restApiId, resourceId, 'ANY');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('cacheNamespace').that.is.a('string');
        expect(result).to.have.property('passthroughBehavior').that.is.a('string');
    });


    xdescribe('#updateIntegration', () => {
        xit('should call AWS SDK AG integration updateIntegration transforming input params to properties', async () => {
            const result = await connector.updateIntegration('id', {name: 'name'});
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });

    it('#deleteIntegration should should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteIntegration(restApiId, resourceId, 'ANY');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    after(async () => {
        try {
            await connector.deleteRestApi(restApiId);
            await lambda.delete();
        } catch (e) {
            throw e;
        }
    });

});