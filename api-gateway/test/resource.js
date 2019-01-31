const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const ResourceConnector = require('../connector');
const Resource = require('../resource');

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

describe('API Resource Controller', () => {
    const connector = new ResourceConnector({default: 'value'});

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        let resource;
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
        let infoCall;
        let apiCall;
        let resource;
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
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('entity methods', () => {
        let infoCall;
        let apiCall;
        let resource;
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

            resource = new Resource({id: 'name'}, connector, group);
            entity = resource._createEntity({name: 'name', prop: 'val', restApiId: '1', resourceId: '2'});
            apiCall = sinon.fake(() => { return awsResponse('response'); });
        });
        it('#_createEntity(properties) should return an RestApiEntity instance with properties', () => {
            expect(entity).to.be.instanceof(ApiEntity);
            expect(entity.id).to.eql({ restApiId: '1', resourceId: '2' });
            expect(entity.val('prop')).to.eql('val');
            expect(entity.informer).to.be.equal(group);
        });
        it('#update(properties) should return promise, invoke rest-api(updateRestApi), addInformer which fires change and complete', async () => {
            //TODO further way to implement update method and correct test
            //sinon.replace(connector.api, 'updateRestApi', apiCall);
            sinon.replace(entity, 'update', apiCall);

            //TODO further way to implement update method and correct test
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
        it('#delete() should return promise invoke rest-api(deleteRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'deleteResource', apiCall);
            const result = await entity.delete();
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "resourceId": "2",
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
        let resource;
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

            resource = new Resource({id: 'name'}, connector, group);
        });
        it('should resolve record with given path', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{path: 'first'}, {path: 'second'}]}); });
            sinon.replace(connector.api, 'getResources', apiCall);
            // sinon.replace(resource, 'list', apiCall);

            const result = await resource.find('restApiId', 'second');
            expect(result).to.be.eql({path: 'second'});
        });
        it('should call list with next position until path found', async () => {
            apiCall = sinon.stub();
            apiCall.onFirstCall().returns(awsResponse({position: '1', items: [{path: 'first'}, {path: 'second'}]}));
            apiCall.onSecondCall().returns(awsResponse({items: [{path: 'third'}, {path: 'forth'}]}));
            sinon.replace(connector.api, 'getResources', apiCall);

            const result = await resource.find('restApiId', 'third', 0, 2);
            expect(result).to.be.eql({path: 'third'});
            expect(apiCall.args[0][0]).to.eql({restApiId: 'restApiId', limit: 2});
            expect(apiCall.args[1][0]).to.eql({restApiId: 'restApiId', limit: 2, position: '1'});
        });
        afterEach(() => {
            sinon.restore();
        });
    });

});