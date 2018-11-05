const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const Lambda = require('../lambda');
const LambdaFunction = require('../lambda/function');
const Connector = require('../api-gateway/connector');

describe('LambdaController', () => {
    describe('#create', () => {
        it('should instantiate Connector ', () => {
            const lambda = new Lambda();
            expect(lambda).to.have.property('connector');
            expect(lambda.connector).to.be.instanceof(Connector);
        });
    });
    describe('#deploy', () => {
        const lambda = new Lambda();
        before(() => {

        });
        it('should ', () => {

        })
    });
});