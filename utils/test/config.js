const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const { readFromFile } = require('../config');

describe('config', () => {
    describe('#readFromFile(cfgPath)', () => {
        it('should resolve object with representing config.json', () => {
            const props = readFromFile(__dirname + '/config.json');
            return Promise.all([
                expect(props).to.eventually.eql({testKey: 1})
            ]);
        });
        it('should resolve error if config file is not valid json', () => {
            const props = readFromFile(__dirname + '/badconfig.json');
            return Promise.all([
                expect(props).to.be.rejectedWith(Error)
            ]);
        });
        it('should resolve error if config file is not exists', () => {
            const props = readFromFile(__dirname + '/not_exists.json');
            return Promise.all([
                expect(props).to.be.rejectedWith(Error)
            ]);
        });
        it('should resolve error if config file is dir', () => {
            const props = readFromFile(__dirname);
            return Promise.all([
                expect(props).to.be.rejectedWith(Error)
            ]);
        });
    });
});