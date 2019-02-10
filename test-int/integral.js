const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');

const Inform = require('@skazska/inform');
const RestApi = require('../api-gateway/rest-api');
const RestApiConnector = require('../api-gateway/connector');

const LambdaFunction = require('../lambda/function');


const API_NAME = 'aws-deploy-test-api';
const FUNC_NAME = 'aws-deploy-test-api';

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


describe('Integral scenarios', () => {
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

    it('Create: function', async () => {
        lambdaFunction = await lambdaApiController.create(FUNC_NAME,
            {MemorySize: 128, Runtime: "nodejs8.10", Handler: "index.handler",
                Role: "arn:aws:iam::266895356213:role/lambda_basic_execution"},
            {wd: __dirname + '/lambda-code', codeEntries: ['index.js']}
        );
        funcName = lambdaFunction.properties.FunctionName;
        funcArn = lambdaFunction.properties.FunctionArn;

    });

    it('Create: api->resource->method->integration', async () => {
        try {
            const api = await restApiController.create({name: API_NAME});
            const resource = api.addResource('test');
            const resource1 = resource.addResource('res');
            const meth = resource1.addMethod('ANY');

        } catch (e) {
            throw e;
        }


        expect(result.properties).to.be.eql({prop: 'response', "id": 'id'});

        expect(apiCall).to.be.calledOnce;
        expect(apiCall.args[0][0]).to.be.eql({
            "prop": "val"
        });

        expect(group.informers.length).to.equal(1);
        informer = await informer;
        expect(informer).to.be.called;

    });

    after(async () => {
        await lambdaFunction.delete();
        try {
            let apis = await RestApiConnector.getRestApis(null, 5);
            apis.items.reduce(async (result, item) => {
                if (item.name !== API_NAME) return result;
                console.log('there is some apis named ' + API_NAME + ' wait for delete');
                console.log('result: ', JSON.stringify(result));
                await new Promise(resolve => setTimeout(resolve, 60000));
                result = await RestApiConnector.deleteRestApi(item.id);
                console.log(item.id, JSON.stringify(result));
                return result;
            }, true)
        } catch (e) {
            console.error(e);
        }

    })

});