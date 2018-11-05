const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const LambdaConnector = require('../connector');
const LambdaFunction = require('../function');

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

const awsResponse = (response) => {
    return {
        promise: () => { return new Promise(resolve => setImmediate(resolve, response)) }
    };
};

describe('LambdaFunction', () => {
    const connector = new LambdaConnector({default: 'value'});
    let infoCall;
    let apiCall;
    let lambda;
    let group;

    describe('instance#constructor', () => {
        const informer = createInformer(sinon.fake());
        it('should have properties connector, informer, id, properties', () => {
            lambda = new LambdaFunction('name', {}, connector, informer);
            expect(lambda).to.eql({
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

            lambda = new LambdaFunction('name', {}, connector, group);
            apiCall = sinon.fake(() => { return awsResponse('response'); });
        });
        it('#create(properties) should return promise, invoke lambdaApi(createFunction), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createFunction', apiCall);

            const result = await lambda.create({prop: 'val'});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "default": "value",
                "prop": "val",
                "FunctionName": "name",
                "Publish": false
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await lambda.create({prop: 'val'}, true);
            expect(apiCall.args[1][0]).to.have.property("Publish", true);

        });
        it('#read() should return promise invoke lambdaApi(getFunctionConfiguration), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getFunctionConfiguration', apiCall);
            const result = await lambda.read();
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "FunctionName": "name",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await lambda.read('v1');
            expect(apiCall.args[1][0]).to.be.eql({
                "FunctionName": "name",
                "Qualifier": "v1"
            });
        });
        it('#update(properties) should return promise invoke lambdaApi(updateFunctionConfiguration), addInformer which fires change and complete', async () => {
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
        it('#updateCode(codeProps) should return promise invoke lambdaApi(updateFunctionCode), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'updateFunctionCode', apiCall);
            const result = await lambda.updateCode({code: 'sas'});
            expect(result).to.be.equal('response');

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "code": "sas",
                "FunctionName": "name",
                "Publish": false
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await lambda.updateCode({code: 'sas'}, true);
            expect(apiCall.args[1][0]).to.have.property("Publish", true);
        });
        it('#delete(version) should return promise invoke lambdaApi(deleteFunction), addInformer which fires change and complete', async () => {
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
            sinon.reset();
        });
    })
});