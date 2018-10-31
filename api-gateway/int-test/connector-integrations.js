const chai = require('chai');
const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');
const ConnectorRestApi = require('../connector');

describe('AWS Api Gateway Connector - Integration integrations', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    let restApiId = null;
    let resourceId = null;
    before(async () => {
        try {
            let result = await connector.createRestApi('aws-deploy-test-api',{});
            restApiId = result.id;
            result = await connector.getResources(restApiId, null, 1);
            resourceId = result.items[0].id;
        } catch (e) {
            throw e;
        }
    });

    it('#createIntegration should result in new integration data ', async () => {
        let result = null;
        try {
            result = await connector.createIntegration(restApiId, resourceId, 'ANY', {

            });
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('httpIntegration').that.is.a('string');
    });

    it('#getIntegration should result in new integration data ', async () => {
        let result = null;
        try {
            result = await connector.getIntegration(restApiId, resourceId, 'ANY');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('httpIntegration').that.is.a('string');
    });


    xdescribe('#updateIntegration', () => {
        xit('should call AWS SDK AG integration updateIntegration transforming input params to properties', async () => {
            const result = await connector.updateIntegration('id', {name: 'name'});
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });

    it('#deleteIntegration should should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteIntegration(restApiId, resourceId, 'ANY');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    after(async () => {
        try {
            await connector.deleteRestApi(restApiId);
        } catch (e) {
            throw e;
        }
    });

});