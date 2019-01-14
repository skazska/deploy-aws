const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const ResourceConnector = require('../connector');
const Resource = require('../resource');

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

describe('API Resource Controller', () => {
    const connector = new ResourceConnector({default: 'value'});
    let infoCall;
    let apiCall;
    let resource;
    let group;

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        it('should have properties connector, informer, id, properties', () => {
            resource = new Resource({id: 'name'}, connector, informer);
            expect(resource).to.eql({
                connector: connector,
                properties: {id: 'name'},
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

            resource = new Resource({id: 'name'}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse('response'); });
        });
        it('#create(properties) should return promise, invoke resource(createResource), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createResource', apiCall);

            const result = await resource.create({restApiId: 'restApi', parentId: 'parentId', pathPart: 'pathPart'});
            expect(result.properties).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "restApi",
                "parentId": "parentId",
                "pathPart": "pathPart"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#read() should return promise invoke resource(getResource), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getResource', apiCall);
            const result = await resource.read('restApiId', 'id');
            expect(result.properties).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "resourceId": "id",
                "restApiId": "restApiId",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#list() should return promise invoke resource(getResources), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getResources', apiCall);
            const result = await resource.list({restApiId: 'id', position: 1, limit: 2});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": 'id',
                "position": 1,
                "limit": 2
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await resource.list({restApiId: 'id'});
            expect(apiCall.args[1][0]).to.be.eql({
                "restApiId": 'id',
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
});