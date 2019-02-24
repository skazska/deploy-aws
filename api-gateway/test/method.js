const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const MethodConnector = require('../connector');
const Method = require('../method');

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

describe('API Method Controller', () => {
    const connector = new MethodConnector({default: 'value'});

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        let method;
        it('should have properties connector, informer, id, properties', () => {
            method = new Method({id: 'name'}, connector, informer);
            expect(method).to.deep.include({
                connector: connector,
                properties: {id: 'name'},
                informer: informer
            });
        })
    });

    describe('methods', () => {
        let infoCall;
        let apiCall;
        let method;
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

            method = new Method({id: 'name'}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse({prop: 'response'}); });
        });
        it('#create(properties) should return promise, invoke method(createResource), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'putMethod', apiCall);

            const result = await method.create({restApiId: 'restApi', resourceId: 'resourceId', httpMethod: 'httpMethod'});
            expect(result.properties).to.be.eql({
                "httpMethod": "httpMethod",
                "prop": "response",
                "id": "resourceId",
                "restApiId": "restApi"
            });

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "authorizationType": "NONE",
                "restApiId": "restApi",
                "resourceId": "resourceId",
                "httpMethod": "httpMethod"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#read() should return promise invoke method(getMethod), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getMethod', apiCall);
            const result = await method.read('restApiId', 'resourceId', 'httpMethod');
            expect(result.properties).to.be.eql({prop: 'response'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "restApiId",
                "resourceId": "resourceId",
                "httpMethod": "httpMethod",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('entity methods', () => {
        let infoCall;
        let apiCall;
        let method;
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

            method = new Method({id: 'name'}, connector, group);
            entity = method._createEntity({restApiId: '1', resourceId: '2', httpMethod: 'httpMethod', prop: 'val'});
            apiCall = sinon.fake(() => { return awsResponse({prop: 'response'}); });
        });
        it('#_createEntity(properties) should return an MethodEntity instance with properties', () => {
            expect(entity).to.be.instanceof(ApiEntity);
            expect(entity.id).to.eql({ restApiId: '1', resourceId: '2', httpMethod: 'httpMethod'});
            expect(entity.val('prop')).to.eql('val');
            expect(entity.informer).to.be.equal(group);
        });
        it('#update(properties) should return promise, invoke rest-api(updateRestApi), addInformer which fires change and complete', async () => {
            //TODO further way to implement update method and correct test
            //sinon.replace(connector.api, 'updateRestApi', apiCall);
            sinon.replace(entity, 'update', apiCall);

            //TODO further way to implement update method and correct test
            const result = await entity.update({prop: 'val1'}).promise();
            expect(result).to.be.eql({prop: 'response'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "prop": "val1"
            });

            //TODO further way to implement update method and correct test
            // expect(group.informers.length).to.equal(1);
            // informer = await informer;
            // expect(informer).to.be.called;
        });

        it('#addIntegration(options) should return promise, invoke method(putIntegration), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'putIntegration', apiCall);
            let result;
            try {
                result = await entity.addIntegration({type: 'AWS_PROXY', integrationHttpMethod: 'POST', uri: 'uri' });
            } catch (e) {
                throw e;
            }

            expect(result.properties).to.be.eql({
                "httpMethod": "httpMethod",
                "prop": "response",
                "resourceId": "2",
                "restApiId": "1"
            });

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "restApiId": "1",
                "resourceId": "2",
                "httpMethod": "httpMethod",
                "type": "AWS_PROXY",
                "integrationHttpMethod": "POST",
                "uri": "uri"
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });


        it('#delete() should return promise invoke rest-api(deleteRestApi), addInformer which fires change and complete', async () => {
            sinon.replace(entity.connector.api, 'deleteMethod', apiCall);
            const result = await entity.delete();
            expect(result).to.be.eql({prop: 'response'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "resourceId": "2",
                "restApiId": "1",
                "httpMethod": "httpMethod"
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

});