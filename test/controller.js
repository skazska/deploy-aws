const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Inform = require('@skazska/inform');
const Controller = require('../controller');
const { readFromFile } = require('../utils/config');
// const awsCfg = __dirname + '/.aws-cfg.json';
const awsCfg = {};

const cfgPath = __dirname + '/config.json';

const controllers = {
    lambda: require('../lambda/controller'),
    role: require('../iam/role/controller'),
    restapi: require('../api-gateway')
};

describe('Controller', () => {
    const controller = new Controller(awsCfg);
    it('should have DPKO property containing names of deployables', () => {
        expect(Controller.DPKO).to.be.eql([ 'role', 'lambda' ]);
    });

    Controller.DPKO.forEach(entry => {
        it('instance should have instance of corresponding controller for DPKO entry ' + entry + 'Controller', () => {
            expect(controller[entry + 'Controller']).to.be.instanceof(controllers[entry]);
        });
    });

    it('instance should have deployMethodName method converting DPKO entry to method name', () => {
        expect(Controller.deployMethodName('keyEntry')).to.be.equal('deployKeyEntry');
    });
    Controller.DPKO.forEach(entry => {
        const method = Controller.deployMethodName(entry);
        it('should have method ' + method, () => {
            expect(controller[method]).to.be.a('function');
        });
    });

    describe('#deploy(task, options)', () => {
        let inform;
        afterEach(() => {
            sinon.restore();
        });
        beforeEach(() => {
            inform = new Inform(sinon.fake(), 'Deploy service');
            sinon.spy(inform, 'addGroup');
            Controller.DPKO.forEach(entry => {
                sinon.replace(controller, Controller.deployMethodName(entry), sinon.fake(
                    (params, options, deployment, informGroup) => {
                        setImmediate(informGroup.done, 'groupDone');
                        return Promise.resolve('done');
                    }
                ))
            });

        });
        it('should call deployEntryString methods for every EntryString in Controller.DPKO', async () => {
            try {
                const deployParams = await readFromFile(cfgPath);
                await controller.deploy(deployParams, {wd: 'workdir'}, inform);
                Controller.DPKO
                    .map(entry => controller[Controller.deployMethodName(entry)])
                    .forEach(meth => {
                        expect(meth).to.be.calledOnce;
                    });
            } catch (e) {
                throw e;
            }
        });
        it('should add groups in inform', async () => {
            try {
                const deployParams = await readFromFile(cfgPath);
                await controller.deploy(deployParams, {wd: 'workdir'}, inform);
                await inform.promise;
                expect(inform.addGroup.callCount).to.be.equal(2);
                expect(inform.renderer).to.be.called;
            } catch (e) {
                throw e;
            }
        });

    });
    describe('#deployRoles(params, options, deployment, informGroup)', () => {
        after(() => {
            sinon.restore();
        });
        it('should invoke deploy method of "iam/role/controller" instance (roleController property)', async () => {
            sinon.replace(controller.roleController, 'deploy', sinon.fake());
            await controller.deployRole(
                {key: 'key', inlinePolicy: 'inlinePolicy', policies: 'policies', awsProperties: 'awsProps'},
                null,
                null,
                'informGroup'
            );
            const deploy = controller.roleController.deploy;
            expect(deploy).to.be.calledOnce;
            expect(deploy).to.be.calledOn(controller.roleController);
            expect(deploy).to.be.calledWith('key', 'awsProps', {inlinePolicy: 'inlinePolicy', policies: 'policies'}, 'informGroup');
        });
    });
    describe('#deployLambda(params, options, deployment, informGroup)', () => {
        after(() => {
            sinon.restore();
        });
        it('should invoke deploy method of "lambda/controller" instance (lambdaController property)', async () => {
            sinon.replace(controller.lambdaController, 'deploy', sinon.fake());
            await controller.deployLambda(
                {key: 'key', codeEntries: 'codeEntries', awsProperties: {'aws-deploy': 'awsProps'}},
                {wd: 'wd'},
                {awsProps: Promise.resolve('props')},
                'informGroup'
            );
            const deploy = controller.lambdaController.deploy;
            expect(deploy).to.be.calledOnce;
            expect(deploy).to.be.calledOn(controller.lambdaController);
            expect(deploy.args[0][0]).to.be.equal('key');
            expect(deploy.args[0][2]).to.be.eql({wd: 'wd', codeEntries: 'codeEntries'});
            expect(deploy.args[0][3]).to.be.equal('informGroup');
            const props = await deploy.args[0][1];
            expect(props).to.be.equal('props');
        });
    });
    describe('#deployRestApi(params, options, deployment, informGroup)', () => {
        after(() => {
            sinon.restore();
        });
        it('should invoke deploy method of "api-gateway/controller" instance (restApiController property)', async () => {
            sinon.replace(controller.restApiController, 'deploy', sinon.fake());
            await controller.deployRestApi(
                {key: 'key', resources: 'resources', awsProperties: 'awsProps'},
                null,
                null,
                'informGroup'
            );
            const deploy = controller.restApiController.deploy;
            expect(deploy).to.be.calledOnce;
            expect(deploy).to.be.calledOn(controller.restApiController);
            expect(deploy.args[0][0]).to.be.equal('key');
            expect(deploy.args[0][1]).to.be.equal('awsProps');
            expect(deploy.args[0][2]).to.be.eql({resources: 'resources'});
            expect(deploy.args[0][3]).to.be.equal('informGroup');
        });
    });
});