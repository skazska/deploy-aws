const chai = require('chai');
const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');

const LambdaFunction = require('../../lambda/function');

const ConnectorRestApi = require('../connector');

const accountId = '266895356213';
const region = 'eu-west-1';
const invokeRole = "arn:aws:iam::266895356213:role/lambda_basic_execution";
const uriPrefix = 'arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/';


describe('AWS Api Gateway Connector - Integration methods', function () {
    this.timeout(6000);
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    const lambdaApi = new LambdaFunction({});

    let lambdaFunction = null;
    let method = null;
    let integration = null;
    let funcName = null;
    let funcArn = null;
    let restApiId = null;
    let resourceId = null;

    before(async () => {
        try {
            let result = await connector.createRestApi({name: 'aws-deploy-test-api'});
            restApiId = result.id;
            result = await connector.getResources(restApiId, null, 1);
            resourceId = result.items[0].id;
            lambdaFunction = await lambdaApi.create('aws-deploy-test-api',
                {MemorySize: 128, Runtime: "nodejs8.10", Handler: "index.handler", Role: invokeRole},
                {wd: __dirname + '/lambda-code', codeEntries: ['index.js']}
            );
            funcName = lambdaFunction.properties.FunctionName;
            funcArn = lambdaFunction.properties.FunctionArn;
            method = await connector.createMethod(restApiId, resourceId, 'ANY', {});
        } catch (e) {
            throw e;
        }
    });

    it('#createIntegration should result in new integration data ', async () => {
//        funcArn = 'arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-api';
        try {
            integration = await connector.createIntegration(restApiId, resourceId, 'ANY', {
                type: 'AWS_PROXY', integrationHttpMethod: 'POST',
                uri: uriPrefix + funcArn + '/invocations'
            });
        } catch (e) {
            integration = e;
        }
        expect(integration).not.to.be.equal(null);
        expect(integration).not.to.be.instanceof(Error);
        expect(integration).to.have.property('cacheNamespace').that.is.a('string');
        expect(integration).to.have.property('passthroughBehavior').that.is.a('string');
    });

    //TODO PUTINTEGRATIONRESPONSE ! matters!

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


    // xdescribe('#updateIntegration', () => {
    //     xit('should call AWS SDK AG integration updateIntegration transforming input params to properties', async () => {
    //         const result = await connector.updateIntegration('id', {name: 'name'});
    //         expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
    //         expect(result).to.be.equal('response');
    //     });
    //     xit('should treat params right', async () => {
    //     });
    // });

    it('#testMethod should call AWS SDK AG method testInvokeMethod', async () => {
        // restApiId = 'mrrjkkmso8';
        // resourceId = 'dc9swervsg';

        console.dir(method);
        console.dir(integration);
        const sourceArn = 'arn:aws:execute-api:'+region+':'+accountId+':'+restApiId+'/*/*/';

        let result = null;
        try {
            await lambdaFunction.addPermission(null, 'test', {SourceArn: sourceArn});
            result = await connector.testMethod(restApiId, resourceId, 'GET', {});
        } catch (e) {
            result = e;
        }

        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        console.log(result);
        expect(result).to.have.property('body').eql({a: "b"});
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
            await lambdaFunction.delete();
        } catch (e) {
            throw e;
        }
    });

});