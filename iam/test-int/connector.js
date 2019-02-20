const chai = require('chai');
const expect = chai.expect;

const AWSGlobal = require('aws-sdk/global');
const Connector = require('../connector');

describe('AWS IAM Connector ', () => {
    AWSGlobal.config.loadFromPath('./.aws-cfg.json');
    const connector = new Connector({});

    it('#getUser should result in current user data', async () => {
        let result = null;
        try {
            result = await connector.getUser();
        } catch (e) {
            result = e;
        }
        expect(result).not.to.be.equal(null);
        expect(result).not.to.be.instanceof(Error);
        expect(result).to.have.property('UserName').that.is.a('string');
        expect(result).to.have.property('UserId').that.is.a('string');
    });

    // after(async () => {
    //     try {
    //         let result = await connector.deleteFunction(FUNC_NAME);
    //         expect(result).to.be.a('null');
    //     } catch (e) {
    //         if (e.code !== "ResourceNotFoundException") {
    //             console.error(e);
    //         }
    //     }
    // })

});