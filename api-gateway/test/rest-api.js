const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const RestApiConnector = require('../connector');
const RestApi = require('../rest-api');

const ApiEntity = require('../../common/api-entity');

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

describe('REST API Controller', () => {
    const connector = new RestApiConnector({default: 'value'});

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        it('should have properties connector, informer, id, properties', () => {
            const restApi = new RestApi({}, connector, informer);
            expect(restApi).to.have.property('connector').eql(connector);
            expect(restApi).to.have.property('properties').eql({});
            expect(restApi).to.have.property('informer').eql(informer);
            expect(restApi).to.have.property('entityConstructor');

        })
    });

    describe('methods', () => {
        let infoCall;
        let apiCall;
        let restApi;
        let group;
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

            restApi = new RestApi({}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse({id: 'id', prop: 'response'}); });
        });
        it('#create(properties) should return promise, invoke rest-api(createRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createRestApi', apiCall);

            const result = await restApi.create({prop: 'val'});
            expect(result.properties).to.be.eql({prop: 'response', "id": 'id'});
            expect(result.resourceApi).to.have.property('defaults').eql({restApiId: 'id'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "prop": "val"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#read() should return promise invoke rest-api(getRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getRestApi', apiCall);
            const result = await restApi.read('id');
            expect(result.properties).to.be.eql({prop: 'response', "id": 'id'});

            expect(result.resourceApi).to.have.property('defaults').eql({restApiId: 'id'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "id",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#list() should return promise invoke rest-api(listRestApis), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getRestApis', apiCall);
            const result = await restApi.list({position: 1, limit: 2});
            expect(result).to.be.eql({prop: 'response', "id": 'id'});

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
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('entity methods', () => {
        let infoCall;
        let apiCall;
        let restApi;
        let group;
        let informer;
        let entity;

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

            restApi = new RestApi({}, connector, group);
            entity = restApi._createEntity({name: 'name', prop: 'val', id: '1'});
            apiCall = sinon.fake(() => { return awsResponse('response'); });
        });
        it('#_createEntity(properties) should return an RestApiEntity instance with properties', () => {
            expect(entity).to.be.instanceof(ApiEntity);
            expect(entity.id).to.eql('1');
            expect(entity.resourceApi).to.have.property('defaults').eql({restApiId: '1'});
            expect(entity.val('prop')).to.eql('val');
            expect(entity.informer).to.be.equal(group);
        });
        it('#update(properties) should return promise, invoke rest-api(updateRestApi), addInformer which fires change and complete', async () => {
            //TODO further way to implement update method and correct test
            //sinon.replace(connector.api, 'updateRestApi', apiCall);
            sinon.replace(entity, 'update', apiCall);

            //TODO further way to implement update method and correct test (.promice() wrong here)
            const result = await entity.update({prop: 'val1'}).promise();
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "prop": "val1"
            });

            //TODO further way to implement update method and correct test
            // expect(group.informers.length).to.equal(1);
            // informer = await informer;
            // expect(informer).to.be.called;
        });

        it('#readRoot() should return promise, invoke resource(getResource), addInformer which fires change and complete', async () => {
            // sinon.replace(entity.resourceApi.connector.api, 'getResource', apiCall);
            const listApiCall = sinon.fake(() => { return awsResponse({items: [{path: 'first'}, {path: 'second'}, {path: '/', id: 'parentId'}]}); });
            sinon.replace(entity.resourceApi.connector.api, 'getResources', listApiCall);
            let result;
            try {
                result = await entity.readRoot();
            } catch (e) {
                throw e;
            }

            expect(result.properties).to.eql({path: '/', id: 'parentId'});
            expect(result.defaults).to.eql({restApiId: "1"});
            expect(result.id).to.eql({restApiId: "1", id: 'parentId'});

            // FIXME ResourceApi find does not log
            // expect(apiCall).to.be.calledOnce;
            // expect(apiCall.args[0][0]).to.be.eql({
            //     "restApiId": "1",
            //     "parentId": "parentId",
            //     "pathPart": "res"
            // });
            // expect(group.informers.length).to.equal(3); ?2

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });

        it('#delete() should return promise invoke rest-api(deleteRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'deleteRestApi', apiCall);
            const result = await entity.delete();
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "1"
            });

            expect(entity.informer).to.be.equal(group);

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('#find(name, position, limit)', () => {
        let infoCall;
        let apiCall;
        let restApi;
        let group;
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

            restApi = new RestApi({}, connector, group);
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
        let infoCall;
        let apiCall;
        let restApi;
        let group;
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

            restApi = new RestApi({}, connector, group);
        });
        it('should resolve record with given name from list', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{name: 'first', id: '1'}, {name: 'second', id: '2'}]}); });
            sinon.replace(connector.api, 'getRestApis', apiCall);
            // sinon.replace(restApi, 'list', apiCall);

            const result = await restApi.findOrCreate('second', {name: 'new'});
            expect(result.properties).to.be.eql({name: 'second', id: '2'});
        });
        it('should call list with next position until name found', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{name: 'first'}, {name: 'second'}]}); });
            sinon.replace(connector.api, 'getRestApis', apiCall);
            const apiCallCreate = sinon.fake(() => { return awsResponse({name: 'third', id: 'id'}); });
            sinon.replace(connector.api, 'createRestApi', apiCallCreate);

            const result = await restApi.findOrCreate('third', {});
            expect(result.properties).to.be.eql({name: 'third', id: 'id'});
            expect(apiCall.callCount).to.equal(1);
            expect(apiCall.args[0][0]).to.eql({limit: 25});
            expect(apiCallCreate).to.be.called;
        });
        afterEach(() => {
            sinon.restore();
        });
    });
});