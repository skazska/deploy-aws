const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AG = require('aws-sdk/clients/apigateway');
const Connector = require('../connector');

describe('AWS Api Gateway Connector', () => {
    const connector = new Connector();
    describe('#getRestApis', () => {
        it('should call AWS SDK AG mathod getRestApis transforming input params to properties', async () => {
            const result = await connector.getRestApis(null);

            var params = {
                limit: limit || 25,
                position: position
            };

        });
    })
});