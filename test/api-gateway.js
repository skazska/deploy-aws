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
});