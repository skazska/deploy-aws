const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');
const Lambda = require('../lambda');
const LambdaFunction = Lambda.Controller;
const Connector = require('../lambda/connector');

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


describe('LambdaController', () => {
    describe('#create', () => {
        it('should instantiate Connector ', () => {
            const lambda = new Lambda();
            expect(lambda).to.have.property('connector');
            expect(lambda.connector).to.be.instanceof(Connector);
        });
    });
    describe('#deploy(name, properties, options, informGroup)', () => {
        const lambda = new Lambda();

        const preparePackageStub = sinon.stub();
        const opts = {wd: 'wd', codeEntries: ['1'], packager: preparePackageStub};
        const infoCall = sinon.fake();

        let createStub;
        let readStub;
        let updateStub;
        let updateCodeStub;

        let props;
        let group;
        let informer;

        beforeEach(() => {
            createStub = sinon.stub(LambdaFunction.prototype, 'create');
            readStub = sinon.stub(LambdaFunction.prototype, 'read');
            updateStub = sinon.stub(LambdaFunction.prototype, 'update');
            updateCodeStub = sinon.stub(LambdaFunction.prototype, 'updateCode');

            props = new Promise(resolve => { setImmediate(resolve, {Role: 'role'}) });
            group = createInformer(infoCall);
            informer = new Promise(resolve => {
                const handler = sinon.spy();
                group.on('change', handler);
                group.on('end', () => {
                    resolve(handler);
                });
            });
        });
        it('should call LambdaFunction methods create if read returned null', async () => {
            readStub.resolves(null);
            preparePackageStub.resolves('code');
            createStub.resolves({FunctionName: 'name', Role: 'role'});
            const result = await lambda.deploy('name', props, opts, group);
            expect(result).to.eql({FunctionName: 'name', Role: 'role'});
            expect(createStub.args[0][0]).to.be.eql({
                "Role": "role",
                "Code": {
                    "ZipFile": "code"
                }
            });
        });
        it('should call LambdaFunction methods update if read returned data and it differs from properties, updateCode if CodeSha256 differs', async () => {
            preparePackageStub.resolves('code');
            readStub.resolves({FunctionName: 'name', CodeSha256: 'xxx'});
            updateStub.resolves({FunctionName: 'name', Role: 'role'});
            const result = await lambda.deploy('name', props, opts, group);
            expect(result).to.eql({FunctionName: 'name', Role: 'role'});
            expect(preparePackageStub.args[0][0]).to.be.eql('wd');
            expect(preparePackageStub.args[0][1]).to.be.eql(['1']);
            expect(updateStub.args[0][0]).to.be.eql({
                "Role": "role"
            });
            expect(updateCodeStub.args[0][0]).to.be.eql({ZipFile: 'code'});
        });
        it('should not call LambdaFunction method update if read returned data same to properties', async () => {
            preparePackageStub.resolves('code1');
            readStub.resolves({FunctionName: 'name', Role: 'role', CodeSha256: 'VpTQii5T/8rgwxA+Wtb2B2q9lg6x+KVldwQLwQKPcCs='});
            updateStub.resolves({FunctionName: 'name', Role: 'role'});
            updateCodeStub.resolves({FunctionName: 'name', CodeSha256: 'VpTQii5T/8rgwxA+Wtb2B2q9lg6x+KVldwQLwQKPcCs='});
            const result = await lambda.deploy('name', props, opts, group);
            expect(result).to.eql({FunctionName: 'name', CodeSha256: 'VpTQii5T/8rgwxA+Wtb2B2q9lg6x+KVldwQLwQKPcCs='});
            expect(preparePackageStub.args[0][0]).to.be.eql('wd');
            expect(preparePackageStub.args[0][1]).to.be.eql(['1']);
            expect(updateStub).not.to.be.called;
            expect(updateCodeStub.args[0][0]).to.be.eql({ZipFile: 'code1'});
        });
        it('should not call LambdaFunction method updateCode if read returned CodeSha265 same with code', async () => {
            preparePackageStub.resolves('code');
            readStub.resolves({FunctionName: 'name', CodeSha256: 'VpTQii5T/8rgwxA+Wtb2B2q9lg6x+KVldwQLwQKPcCs='});
            updateStub.resolves({FunctionName: 'name', Role: 'role'});
            updateCodeStub.resolves({FunctionName: 'name', Role: 'role'});
            const result = await lambda.deploy('name', props, opts, group);
            expect(result).to.eql({FunctionName: 'name', Role: 'role'});
            expect(preparePackageStub.args[0][0]).to.be.eql('wd');
            expect(preparePackageStub.args[0][1]).to.be.eql(['1']);
            expect(updateCodeStub).not.to.be.called;
            expect(updateStub.args[0][0]).to.be.eql({
                "Role": "role"
            });

        });

        afterEach(() => {
            sinon.restore();
        })
    });
});