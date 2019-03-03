const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const Connector = require('../connector');
const UserApi = require('../user');

// const ApiEntity = require('../../common/api-entity');

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

describe('IAM User API Controller', () => {
    const connector = new Connector({default: 'value'});

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        it('should have properties connector, informer, id, properties', () => {
            const iamApi = new UserApi({}, connector, informer);
            expect(iamApi).to.have.property('connector').eql(connector);
            expect(iamApi).to.have.property('properties').eql({});
            expect(iamApi).to.have.property('informer').eql(informer);
            expect(iamApi).to.have.property('entityConstructor');
        })
    });

    describe('methods', () => {
        let infoCall;
        let apiCall;
        let userApi;
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

            userApi = new UserApi({}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse({User: {UserName: 'name', UserId: 'id'}}); });
        });

        it('#read() should return promise invoke user(getUser), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getUser', apiCall);
            const result = await userApi.read('id');
            expect(result.properties).to.be.eql({UserName: 'name', "UserId": 'id'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "UserName": "id",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;
        });
        afterEach(() => {
            sinon.restore();
        });
    });
});