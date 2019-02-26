const chai = require('chai');

const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');
const ConnectorRestApi = require('../connector');

const API_NAME = 'aws-deploy-test-api';

describe('AWS Api Gateway Connector - RestApi methods', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    let restApiId = null;
    let position = null;

    it('#createRestApi should result in new rest-api data with name aws-deploy-test-api', async () => {
        let result = null;
        try {
            result = await connector.createRestApi({name: API_NAME});
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('id').that.is.a('string');
        expect(result).to.have.property('name').that.is.equal(API_NAME);
        restApiId = result.id;
        expect(result).to.have.property('createdDate').that.is.a('date');
        expect(result).to.have.property('apiKeySource').that.is.a('string');
        expect(result).to.have.property('endpointConfiguration').that.is.an('object');
        expect(result.endpointConfiguration).to.have.property('types').that.is.an('array');
    });

    it('#listRestApis should result in position and list', async () => {
        let result = null;
        try {
            result = await connector.listRestApis(null, 1);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        // result will not have position property if there are no more items left to get next
        // expect(result).to.have.property('position').that.is.a('string');
        // position = result.position;
        expect(result).to.have.property('items').that.is.an('array').that.have.lengthOf(1);
    });

    xit('#listRestApis should result in position and list', async () => {
        let result = null;
        try {
            result = await connector.listRestApis(position, 20);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('position').that.is.a('string');
        expect(result).to.have.property('items').that.is.an('array').that.have.lengthOf(1);
    });

    it('#getRestApi should should result in rest-api data with name aws-deploy-test-api', async () => {
        let result = null;
        try {
            result = await connector.getRestApi(restApiId);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('id').that.is.a('string');
        expect(result).to.have.property('name').that.is.equal(API_NAME);
        restApiId = result.id;
        expect(result).to.have.property('createdDate').that.is.a('date');
        expect(result).to.have.property('apiKeySource').that.is.a('string');
        expect(result).to.have.property('endpointConfiguration').that.is.an('object');
        expect(result.endpointConfiguration).to.have.property('types').that.is.an('array');
    });

    xdescribe('#updateRestApi', () => {
        xit('should call AWS SDK AG method updateRestApi transforming input params to properties', async () => {
            const result = await connector.updateRestApi('id', {name: 'name'});
            const apiCall = connector.api.updateRestApi;
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });

    it('#deleteRestApi should should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteRestApi(restApiId);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal('initial');
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.nested.property('$response.requestId').that.is.a('string');
    });

    after(async () => {
        try {
            let apis = await connector.listRestApis(null, 5);
            apis.items.reduce(async (result, item) => {
                if (item.name !== API_NAME) return result;
                console.log('there is some apis named ' + API_NAME + ' wait for delete');
                console.log('result: ', JSON.stringify(result));
                await new Promise(resolve => setTimeout(resolve, 60000));
                result = await connector.deleteRestApi(item.id);
                console.log(item.id, JSON.stringify(result));
                return result;
            }, true)
        } catch (e) {
            console.error(e);
        }

    })

});