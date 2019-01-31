const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');
const RestApi = require('../rest-api');
const RestApiConnector = require('../connector');

const awsResponse = (response) => {
    return {
        promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
    };
};

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


xdescribe('Create: api->resource->method->integration', () => {
    const infoCall = sinon.fake();
    const group = createInformer(infoCall);

    const informer = new Promise(resolve => {
        const handler = sinon.spy();
        group.on('change', handler);
        group.on('end', () => {
            resolve(handler);
        });
    });

    const apiGwConnector = new RestApiConnector({default: 'value'});
    const apiController = new RestApi({}, apiGwConnector, group);
    let api;
    it('restApi.create should create api and return entity', async () => {

    });
});