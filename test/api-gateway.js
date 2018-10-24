const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const ApiGw = require('../api-gateway');
const RestApi = require('../api-gateway/rest-api');
const Connector = require('../api-gateway/connector');

describe('ApiGatewayController', () => {
    describe('#create', () => {
        it('should instantiate Connector ', () => {
            const apiGw = new ApiGw();
            expect(apiGw).to.have.property('restApi');
            expect(apiGw.restApi).to.be.instanceof(RestApi);
            expect(apiGw.restApi).to.have.property('connector');
            expect(apiGw.restApi.connector).to.be.instanceof(Connector);
        });
    });
    describe('#deploy', () => {
        const apiGw = new ApiGw();
        before(() => {

        });
        it('should', () => {

        })
    });
});