const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const RestApiConnector = require('../connector');
const RestApi = require('../rest-api');

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

describe('Controller', () => {
    const connector = new RestApiConnector({default: 'value'});
    let infoCall;
    let apiCall;
    let restApi;
    let group;

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        it('should have properties connector, informer, id, properties', () => {
            restApi = new RestApi('name', {}, connector, informer);
            expect(restApi).to.eql({
                connector: connector,
                id: 'name',
                properties: {},
                informer: informer
            });
        })
    });

    describe('methods', () => {
        let informer;
        beforeEach(() => {
            infoCall = sinon.fake();
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });

            restApi = new RestApi('name', {}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse('response'); });
        });
        it('#create(properties) should return promise, invoke rest-api(createRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createRestApi', apiCall);

            const result = await restApi.create({prop: 'val'});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "prop": "val",
                "name": "name"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#read() should return promise invoke rest-api(getRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getRestApi', apiCall);
            const result = await restApi.read('id');
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "id",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#list() should return promise invoke rest-api(getRestApis), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getRestApis', apiCall);
            const result = await restApi.list({position: 1, limit: 2});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "position": 1,
                "limit": 2
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await restApi.list();
            expect(apiCall.args[1][0]).to.be.eql({
                "position": 0,
                "limit": 25
            });

        });
        xit('#update(properties) should return promise invoke lambdaApi(updateFunctionConfiguration), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'updateFunctionConfiguration', apiCall);
            const result = await lambda.update({prop: 'val'});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "default": "value",
                "prop": "val",
                "FunctionName": "name"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        xit('#delete(version) should return promise invoke lambdaApi(deleteFunction), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'deleteFunction', apiCall);
            const result = await lambda.delete();
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "FunctionName": "name",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await lambda.delete('v1');
            expect(apiCall.args[1][0]).to.be.eql({
                "FunctionName": "name",
                "Qualifier": "v1"
            });

        });
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('#find(name, position, limit)', () => {
        let informer;
        beforeEach(() => {
            infoCall = sinon.fake();
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });

            restApi = new RestApi('name', {}, connector, group);
        });
        it('should resolve record with given name', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{name: 'first'}, {name: 'second'}]}); });
            sinon.replace(connector.api, 'getRestApis', apiCall);
            // sinon.replace(restApi, 'list', apiCall);

            const result = await restApi.find('second');
            expect(result).to.be.eql({name: 'second'});
        });
        it('should call list with next position until name found', async () => {
            apiCall = sinon.stub();
            apiCall.onFirstCall().returns(awsResponse({position: '1', items: [{name: 'first'}, {name: 'second'}]}));
            apiCall.onSecondCall().returns(awsResponse({items: [{name: 'third'}, {name: 'forth'}]}));
            sinon.replace(connector.api, 'getRestApis', apiCall);

            const result = await restApi.find('third', 0, 2);
            expect(result).to.be.eql({name: 'third'});
            expect(apiCall.args[0][0]).to.eql({limit: 2});
            expect(apiCall.args[1][0]).to.eql({limit: 2, position: '1'});
        });
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('#findOrCreate(name, props)', () => {
        let informer;
        beforeEach(() => {
            infoCall = sinon.fake();
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });

            restApi = new RestApi('name', {}, connector, group);
        });
        it('should resolve record with given name from list', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{name: 'first'}, {name: 'second'}]}); });
            sinon.replace(connector.api, 'getRestApis', apiCall);
            // sinon.replace(restApi, 'list', apiCall);

            const result = await restApi.findOrCreate('second', {});
            expect(result).to.be.eql({name: 'second'});
        });
        it('should call list with next position until name found', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{name: 'first'}, {name: 'second'}]}); });
            sinon.replace(connector.api, 'getRestApis', apiCall);
            const apiCallCreate = sinon.fake(() => { return awsResponse({name: 'third'}); });
            sinon.replace(connector.api, 'createRestApi', apiCallCreate);

            const result = await restApi.findOrCreate('third', {});
            expect(result).to.be.eql({name: 'third'});
            expect(apiCall.callCount).to.equal(1);
            expect(apiCall.args[0][0]).to.eql({limit: 25});
            expect(apiCallCreate).to.be.called;
        });
        afterEach(() => {
            sinon.restore();
        });
    });
});