const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');

const LambdaConnector = require('../connector');
const LambdaFunction = require('../function');

const ApiEntity = require('../../common/api-entity');

const groupOptions = {
    failText: 'damn',
    pendingText: 'waiting',
    inProcessText: 'doing',
    doneText: 'did',
    text: 'it'
};

function createInformer(renderer) {
    return new Inform('Deploy service', renderer).addGroup(null, groupOptions);
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
            lambda = new LambdaFunction({some: 'prop'}, connector, informer);
            expect(lambda).to.have.property('connector').eql(connector);
            expect(lambda).to.have.property('properties').eql({});
            expect(lambda).to.have.property('defaults').eql({"some": "prop"});
            expect(lambda).to.have.property('informer').eql(informer);
            expect(lambda).to.have.property('entityConstructor');
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

            lambda = new LambdaFunction({}, connector, group);
            apiCall = sinon.fake(() => {
                return awsResponse({FunctionName: 'name', result: 'result'});
            });
        });
        it('#create(name, properties) should return promise, invoke lambdaApi(createFunction), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'createFunction', apiCall);

            const result = await lambda.create('name', {prop: 'val'});
            expect(result.properties).to.be.eql({FunctionName: 'name', result: 'result'});

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

            await lambda.create('name', {prop: 'val'}, {publish: true});
            expect(apiCall.args[1][0]).to.have.property("Publish", true);

            await lambda.create('name', {prop: 'val'}, {wd: 'wd', codeEntries: [], packager: sinon.fake.resolves('code')});
            expect(apiCall.args[2][0]).to.have.property('Code').which.is.eql({ZipFile: 'code'});


        });
        it('#read(name) should return promise invoke lambdaApi(getFunctionConfiguration), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'getFunctionConfiguration', apiCall);
            const result = await lambda.read('name');
            expect(result.properties).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "FunctionName": "name",
            });

            expect(group.informers.length).to.equal(1);
            informer = await informer;
            expect(informer).to.be.called;

            await lambda.read('name', 'v1');
            expect(apiCall.args[1][0]).to.be.eql({
                "FunctionName": "name",
                "Qualifier": "v1"
            });
        });
        afterEach(() => {
            sinon.restore();
        });
    });

    describe('entity methods', () => {
        let informer;
        let lambdaFunction;
        beforeEach(async () => {
            infoCall = sinon.fake();
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });

            lambda = new LambdaFunction({some: 'prop'}, connector, group);
            sinon.replace(connector.api, 'createFunction', sinon.fake(() => {
                return awsResponse({FunctionName: 'name'});
            }));

            lambdaFunction = await lambda.create('name', {prop: 'val'});
            apiCall = sinon.fake(() => {
                return awsResponse({FunctionName: 'name', result: 'result'});
            });
        });

        it('#_createEntity(properties) should return an RestApiEntity instance with properties', () => {
            let entity = lambda._createEntity({FunctionName: '1', prop: 'val'});
            expect(entity).to.be.instanceof(ApiEntity);
            expect(entity.id).to.eql('1');
            expect(entity.val('prop')).to.eql('val');
            expect(entity.informer).to.be.equal(group);
        });

        it('#update(properties) should return promise invoke lambdaApi(updateFunctionConfiguration), addInformer which fires change and complete', async () => {
            apiCall = sinon.fake(() => {
                return awsResponse({FunctionName: 'name', result: 'result'});
            });
            sinon.replace(connector.api, 'updateFunctionConfiguration', apiCall);
            const result = await lambdaFunction.update({prop: 'val'});
            expect(result.properties).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "default": "value",
                "prop": "val",
                "FunctionName": "name"
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;
        });
        it('#updateCode(codeProps) should return promise invoke lambdaApi(updateFunctionCode), addInformer which fires change and complete', async () => {
            apiCall = sinon.fake(() => {
                return awsResponse({FunctionName: 'name', result: 'result'});
            });
            sinon.replace(connector.api, 'updateFunctionCode', apiCall);
            const result = await lambdaFunction.updateCode({code: 'sas'});
            expect(result.properties).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "code": "sas",
                "FunctionName": "name",
                "Publish": false
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;

            await lambdaFunction.updateCode({code: 'sas'}, true);
            expect(apiCall.args[1][0]).to.have.property("Publish", true);
        });

        it('#addPermission() should invoke lambdaApi(addFunctionPermission), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'addPermission', apiCall);
            const result = await lambdaFunction.addPermission(null, 'test', {SourceArn: 'sourceArn'});
            expect(result).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                Action: 'lambda:InvokeFunction',
                FunctionName: 'name',
                Principal: 'apigateway.amazonaws.com',
                StatementId: 'test',
                SourceArn: 'sourceArn'
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;
        });

        it('#removePermission() should invoke lambdaApi(addFunctionPermission), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'removePermission', apiCall);
            const result = await lambdaFunction.removePermission(null, 'test');
            expect(result).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                FunctionName: 'name',
                StatementId: 'test'
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;

        });

        it('#delete(version) should return promise invoke lambdaApi(deleteFunction), addInformer which fires change and complete', async () => {
            sinon.replace(connector.api, 'deleteFunction', apiCall);
            const result = await lambdaFunction.delete();
            expect(result).to.be.eql({FunctionName: 'name', result: 'result'});

            expect(apiCall).to.be.calledOnce;
            expect(apiCall.args[0][0]).to.be.eql({
                "FunctionName": "name",
            });

            expect(group.informers.length).to.equal(2);
            informer = await informer;
            expect(informer).to.be.called;

            await lambdaFunction.delete('v1');
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