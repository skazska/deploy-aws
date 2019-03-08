const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');

const Inform = require('@skazska/inform');
const RestApi = require('../api-gateway/rest-api');
const RestApiConnector = require('../api-gateway/connector');
const {apiGwLambdaIntegrationUri: lambdaUri} = require('../utils');

const LambdaFunction = require('../lambda/function');


const API_NAME = 'aws-deploy-test-api-integral';
const FUNC_NAME = 'aws-deploy-test-function-integral';

// const awsResponse = (response) => {
//     return {
//         promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
//     };
// };

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


describe('Integral scenarios', function() {
    this.timeout(12000);
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');

    const infoCall = sinon.fake();
    const group = createInformer(infoCall);

    const informer = new Promise(resolve => {
        const handler = sinon.spy();
        group.on('change', handler);
        group.on('end', () => {
            resolve(handler);
        });
    });

    const apiGwConnector = new RestApiConnector();
    const restApiController = new RestApi({}, apiGwConnector, group);

    const lambdaApiController = new LambdaFunction({});

    let lambdaFunction = null;
    let funcName = null;
    let funcArn = null;

    let api = null;
    let root = null;

    let resource = null;
    let resource1 = null;

    let meth = null;
    let methResponse = null;

    let integration = null;
    let intResponse = null;

    let resources = null;

    it('Create: function', async () => {
        lambdaFunction = await lambdaApiController.create(FUNC_NAME,
            {MemorySize: 128, Runtime: "nodejs8.10", Handler: "index.handler",
                Role: "arn:aws:iam::266895356213:role/lambda_basic_execution"},
            {wd: __dirname + '/lambda-code', codeEntries: ['index.js']}
        );
        funcName = lambdaFunction.properties.FunctionName;
        funcArn = lambdaFunction.properties.FunctionArn;

    });

    it('Create: api and read root resource', async () => {
        try {
            api = await restApiController.create(API_NAME, {});
            root = await api.readRoot();
            expect(root).not.to.be.empty;
        } catch (e) {
            throw e;
        }
    });


    it('Create: resources', async () => {
        try {
            resource = await root.addResource('test');
            expect(resource).not.to.be.empty;
            resource1 = await resource.addResource('res');
            expect(resource1).not.to.be.empty;
        } catch (e) {
            throw e;
        }
    });

    it('Create: method and response', async () => {
        try {
            meth = await resource1.addMethod('ANY');
            expect(meth).not.to.be.empty;
            methResponse = await meth.addResponse('200', {});
            expect(methResponse).not.to.be.empty;

        } catch (e) {
            throw e;
        }
    });

    it('Create: integration and response', async () => {
        try {
            integration = await meth.addIntegration({
                type: 'AWS_PROXY',
                integrationHttpMethod: 'POST',
                uri: lambdaUri(funcArn)
            });
            expect(integration).not.to.be.empty;
            intResponse = await integration.addResponse('200', {});
            expect(intResponse).not.to.be.empty;
        } catch (e) {
            throw e;
        }
    });

    it('List resources', async () => {
        try {
            const resources = await api.listResources({embed: ['methods']});
            expect(resources).not.to.be.empty;

            // {
            //     "ANY": {
            //         "httpMethod": "ANY",
            //         "authorizationType": "NONE",
            //         "apiKeyRequired": false,
            //         "methodResponses": {
            //             "200": {
            //                 "statusCode": "200"
            //             }
            //         },
            //         "methodIntegration": {
            //             "type": "AWS_PROXY",
            //             "httpMethod": "POST",
            //             "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:266895356213:function:aws-deploy-test-function-integral/invocations",
            //             "passthroughBehavior": "WHEN_NO_MATCH",
            //             "timeoutInMillis": 29000,
            //             "cacheNamespace": "ak8465",
            //             "cacheKeyParameters": [],
            //             "integrationResponses": {
            //                 "200": {
            //                     "statusCode": "200"
            //                 }
            //             }
            //         }
            //     }
            // }

        } catch (e) {
            throw e;
        }
    });


    after(async () => {
        await lambdaFunction.delete();
        try {
            const connector = new RestApiConnector();
            let apis = await connector.listRestApis(null, 5);
            apis.items.reduce(async (result, item) => {
                if (item.name !== API_NAME) return result;
                console.log('there is some apis named ' + API_NAME + ' wait for delete');
                console.log('waiting 1 minute threshold: ', JSON.stringify(result));
                await new Promise(resolve => setTimeout(resolve, 60000));
                result = await connector.deleteRestApi(item.id);
                console.log(item.id, JSON.stringify(result));
                return result;
            }, true)
        } catch (e) {
            console.error(e);
        }

    })

});