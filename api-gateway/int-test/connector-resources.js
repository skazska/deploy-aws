const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');
const ConnectorRestApi = require('../connector');

describe('AWS Api Gateway Connector - Resource methods', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new ConnectorRestApi();
    let restApiId = null;
    let rootResourceId = null;
    let resourceId = null;
    before(async () => {
        try {
            let result = await connector.createRestApi({name: 'aws-deploy-test-api'});
            restApiId = result.id;
        } catch (e) {
            throw e;
        }
    });

    it('#getResources should result in position and list', async () => {
        let result = null;
        try {
            result = await connector.getResources(restApiId, null, 2);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        // expect(result).to.have.property('position').that.is.a('string'); //have no 'position' ? why?
        expect(result).to.have.property('items').that.is.an('array').that.have.lengthOf(1);
        expect(result.items[0].path).to.be.equal('/');
        rootResourceId = result.items[0].id;
    });

    it('#createResource should result in new resource data ', async () => {
        let result = null;
        try {
            result = await connector.createResource(restApiId, rootResourceId, 'test');
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('id').that.is.a('string');
        resourceId = result.id;
        expect(result).to.have.property('parentId').that.is.equal(rootResourceId);
        expect(result).to.have.property('path').that.is.equal('/test');
        expect(result).to.have.property('pathPart').that.is.equal('test');
    });

    it('#getResource should result in new resource data ', async () => {
        let result = null;
        try {
            result = await connector.getResource(restApiId, resourceId);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('id').that.is.equal(resourceId);
        expect(result).to.have.property('parentId').that.is.equal(rootResourceId);
        expect(result).to.have.property('path').that.is.equal('/test');
        expect(result).to.have.property('pathPart').that.is.equal('test');
    });


    xdescribe('#updateResource', () => {
        xit('should call AWS SDK AG method updateResource transforming input params to properties', async () => {
            const result = await connector.updateResource('id', {name: 'name'});
            expect(apiCall).to.be.calledOnceWith({restApiId: 'id', patchOperations: {name: 'name'}});
            expect(result).to.be.equal('response');
        });
        xit('should treat params right', async () => {
        });
    });


    it('#getResources should result in position and list 2', async () => {
        let result = null;
        try {
            result = await connector.getResources(restApiId, null, 1);
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('position').that.is.a('string');
    });


    it('#deleteResource should should result in some data', async () => {
        let result = 'initial';
        try {
            result = await connector.deleteResource(restApiId, resourceId);
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