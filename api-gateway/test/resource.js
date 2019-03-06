const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const ResourceConnector = require('../connector');
const Resource = require('../resource');
const ResourceEntity = require('../resource-entity');

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
            resource = new Resource({restApiId: 'name'}, connector, informer);
            expect(resource).to.eql({
                connector: connector,
                properties: {},
                defaults: {restApiId: 'name'},
                informer: informer,
                entityConstructor: ResourceEntity
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

            resource = new Resource({restApiId: 'restApi'}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse({id: 'resourceId', pathPart: 'pathPart', parentId: 'parentId'}); });
        });
        it('#create(properties) should return promise, invoke resource(createResource), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createResource', apiCall);

            const result = await resource.create({parentId: 'parentId', pathPart: 'pathPart'});
            expect(result.properties).to.be.eql({
                parentId: 'parentId', pathPart: 'pathPart', id: 'resourceId'
            });
            expect(result.defaults).to.be.eql({
                restApiId: 'restApi'
            });

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
            const result = await resource.read('id');
            expect(result.properties).to.be.eql({
                parentId: 'parentId', pathPart: 'pathPart', id: 'resourceId'
            });
            expect(result.defaults).to.be.eql({
                restApiId: 'restApi'
            });

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "resourceId": "id",
                "restApiId": "restApi",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#list() should return promise invoke resource(getResources), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getResources', apiCall);
            const result = await resource.list({restApiId: 'id', position: 1, limit: 2});

            //check if response delivered as is
            expect(result).to.be.eql({id: 'resourceId', pathPart: 'pathPart', parentId: 'parentId'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": 'restApi',
                "position": 1,
                "limit": 2
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await resource.list({});
            expect(apiCall.args[1][0]).to.be.eql({
                "restApiId": 'restApi',
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

            resource = new Resource({restApiId: '1'}, connector, group);
            entity = resource._createEntity({name: 'name', prop: 'val', id: '2'}, {restApiId: '1'});
            apiCall = sinon.fake(() => { return awsResponse({id: 'resourceId', pathPart: 'pathPart', parentId: 'parentId'}); });
        });
        it('#_createEntity(properties) should return an RestApiEntity instance with properties', () => {
            expect(entity).to.be.instanceof(ApiEntity);
            expect(entity.id).to.eql({ restApiId: '1', id: '2' });
            expect(entity.val('prop')).to.eql('val');
            expect(entity.informer).to.be.equal(group);
            expect(entity).to.have.property('methodApi').to.have.property('defaults').eql({restApiId: '1', resourceId: '2'});
        });
        it('#update(properties) should return promise, invoke rest-api(updateRestApi), addInformer which fires change and complete', async () => {
            //TODO further way to implement update method and correct test
            //sinon.replace(connector.api, 'updateRestApi', apiCall);
            sinon.replace(entity, 'update', apiCall);

            //TODO further way to implement update method and correct test
            const result = await entity.update({prop: 'val1'}).promise();
            expect(result).to.be.eql({id: 'resourceId', pathPart: 'pathPart', parentId: 'parentId'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "prop": "val1"
            });

            //TODO further way to implement update method and correct test
            // expect(group.informers.length).to.equal(1);
            // informer = await informer;
            // expect(informer).to.be.called;
        });

        it('#addResource(pathPart) should return promise, invoke resource(createResource), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'createResource', apiCall);
            let result;
            try {
                result = await entity.addResource('res');
            } catch (e) {
                throw e;
            }

            expect(result.id).to.be.eql({restApiId: '1', id: 'resourceId'});
            expect(result.properties).to.be.eql({parentId: 'parentId', pathPart: 'pathPart', id: 'resourceId'});
            expect(result.defaults).to.be.eql({restApiId: '1'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "1",
                "parentId": "2",
                "pathPart": "res"
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;
        });

        it('#addMethod(httpName) should return promise, invoke method(createMethod), addInformer which fires change and complete', async () => {
            const call = sinon.fake(() => {
                return awsResponse({httpMethod: "ANY"});
            });
            sinon.replace(entity.methodApi.connector.api, 'putMethod', call);
            let result;
            try {
                result = await entity.addMethod('ANY');
            } catch (e) {
                throw e;
            }

            expect(result.id).to.be.eql({
                "resourceId": "2",
                "restApiId": "1",
                "httpMethod": "ANY"
            });

            expect(result.properties).to.be.eql({
                "httpMethod": "ANY"
            });
            expect(result.defaults).to.be.eql({
                "resourceId": "2",
                "restApiId": "1"
            });

            expect(call).to.be.calledOnce;
            expect(call.args[0][0]).to.be.eql({
                "restApiId": "1",
                "resourceId": "2",
                "authorizationType": "NONE",
                "httpMethod": "ANY"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });

        it('#delete() should return promise invoke rest-api(deleteRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'deleteResource', apiCall);
            const result = await entity.delete();

            //response as is
            expect(result).to.be.eql({id: 'resourceId', pathPart: 'pathPart', parentId: 'parentId'});

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

            resource = new Resource({restApiId: 'restApiId'}, connector, group);
        });
        it('should resolve record with given path', async () => {
            apiCall = sinon.fake(() => { return awsResponse({items: [{path: 'first'}, {path: 'second'}]}); });
            sinon.replace(connector.api, 'getResources', apiCall);
            // sinon.replace(resource, 'list', apiCall);

            const result = await resource.find('second');
            expect(result.properties).to.be.eql({path: 'second'});
            expect(result.defaults).to.be.eql({restApiId: 'restApiId'});
        });
        it('should call list with next position until path found', async () => {
            apiCall = sinon.stub();
            apiCall.onFirstCall().returns(awsResponse({position: '1', items: [{path: 'first'}, {path: 'second'}]}));
            apiCall.onSecondCall().returns(awsResponse({items: [{path: 'third'}, {path: 'forth'}]}));
            sinon.replace(connector.api, 'getResources', apiCall);

            const result = await resource.find('third', 0, 2);
            expect(result.properties).to.be.eql({path: 'third'});
            expect(result.defaults).to.be.eql({restApiId: 'restApiId'});
            expect(apiCall.args[0][0]).to.eql({restApiId: 'restApiId', limit: 2});
            expect(apiCall.args[1][0]).to.eql({restApiId: 'restApiId', limit: 2, position: '1'});
        });
        afterEach(() => {
            sinon.restore();
        });
    });

});