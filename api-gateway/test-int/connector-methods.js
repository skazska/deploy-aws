const chai = require('chai');
const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');
const ConnectorRestApi = require('../connector');

describe('AWS Api Gateway Connector - Method methods', function() {
    this.timeout(12000);
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    let restApiId = null;
    let resourceId = null;
    before(async () => {
        try {
            let result = await connector.createRestApi({name: 'aws-deploy-test-api'});
            restApiId = result.id;
            result = await connector.getResources(restApiId, null, 1);
            resourceId = result.items[0].id;
        } catch (e) {
            throw e;
        }
    });

    it('#createMethod should result in new method data ', async () => {
        let result = null;
        try {
            result = await connector.createMethod(restApiId, resourceId, 'ANY', {

            });
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('httpMethod').that.is.a('string');
    });

    it('#getMethod should result in new method data ', async () => {
        let result = null;
        try {
            result = await connector.getMethod(restApiId, resourceId, 'ANY');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('httpMethod').that.is.a('string');
    });


    xdescribe('#updateMethod', () => {
        xit('should call AWS SDK AG method updateMethod transforming input params to properties', async () => {
            const result = await connector.updateMethod('id', {name: 'name'});
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });

    it('#createMethodResponse should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.createMethodResponse(restApiId, resourceId, 'ANY', '200', {});
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    it('#getMethodResponse should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.getMethodResponse(restApiId, resourceId, 'ANY', '200');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    it('#deleteMethodResponse should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteMethodResponse(restApiId, resourceId, 'ANY', '200');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    it('#deleteMethod should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteMethod(restApiId, resourceId, 'ANY');
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