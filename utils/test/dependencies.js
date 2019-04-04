const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const { collect, bind, fill, resolvePropertiesPromise } = require('../dependencies');

describe('dependencies', () => {
    describe('#collect(properties)', () => {
        it('should return object with keys named after values meet in passed value in keys named "aws-deploy"', () => {
            expect(collect({'anything': {'aws-deploy': 'expecting/x'}})).eql({expecting: true});
            expect(collect({'aws-deploy': 'expecting/y'})).eql({expecting: true});
            expect(collect([{'aws-deploy': 'expecting'}])).eql({expecting: true});
            expect(collect([{'anything': {'aws-deploy': 'expecting'}}])).eql({expecting: true});
            expect(collect([
                {'anything': {'aws-deploy': 'expecting'}},
                {'else': {'aws-deploy': 'also'}},
                {'there': {'is': {'something': {'aws-deploy': 'expecting/field'}}}}
            ])).eql({expecting: true, also: true, });
        });
    });

    describe('#bind(properties, deployment)', () => {
       it('should fill values in object acquired through #collect from properties with values from deployment', () => {
           expect(bind({'anything': {'aws-deploy': 'expecting'}}, {expecting: 'result'}))
               .eql({dependencies: {expecting: 'result'}, orphaned: null});
           expect(bind({'anything': {'aws-deploy': 'expecting/x'}}, {expecting: 'result'}))
               .eql({dependencies: {expecting: 'result'}, orphaned: null});
       });
        it('should remove values in object acquired through #collect if no such in deployment, should add to orphaned instead', () => {
            expect(bind({'anything': {'aws-deploy': 'expecting'}}, {expected: 'result'}))
                .eql({dependencies: {}, orphaned: ['expecting']});
            expect(bind({'anything': {'aws-deploy': 'expecting/y'}}, {expected: 'result'}))
                .eql({dependencies: {}, orphaned: ['expecting']});
        });
    });

    describe('#fill(properties, deployment)', () => {
        it('should return object with keys named after values meet in passed value in keys named "aws-deploy"', () => {
            expect(fill({'anything': {'aws-deploy': 'expecting/y'}}, {expecting: {y:'result'}}))
                .eql({'anything': 'result'});

            expect(fill({'anything': {'aws-deploy': 'expecting'}}, {expected: 'result'}))
                .eql({});

            expect(fill({'aws-deploy': 'expecting'}, {expecting: 'result'})).eql('result');
            expect(fill([{'aws-deploy': 'expecting'}], {expecting: 'result'})).eql(['result']);
            expect(fill([{'anything': {'aws-deploy': 'expecting'}}], {expecting: 'result'}))
                .eql([{'anything': 'result'}]);
            expect(fill(
                [{'anything': {'aws-deploy': 'expecting/x'}}, {'else': {'aws-deploy': 'also'}}, {'there': {'is': {'something': {'aws-deploy': 'expecting/field'}}}}],
                {expecting: {x: 'result', field: 'strange'}, also: 'other'}
            )).eql([{'anything': 'result'}, {'else': 'other'}, {'there': {'is': {'something': 'strange'}}}]);
        });
    });

    describe('#resolvePropertiesPromise(data, deployment)', () => {
        it('should fill placeholders from data resolved by Promises', () => {
            return Promise.all([
                expect(resolvePropertiesPromise(
                    {'aws-deploy':'expecting'},
                    {expecting: new Promise(resolve => resolve('result'))})
                ).to.eventually.eql('result'),
                expect(resolvePropertiesPromise(
                    {expecting: {'aws-deploy':'expecting'}, fixed: 'value'},
                    {expecting: new Promise(resolve => resolve('result'))})
                ).to.eventually.eql({expecting: 'result', fixed: 'value'}),
                expect(resolvePropertiesPromise(
                    [{expecting: {'aws-deploy':'expecting'}, fixed: 'value'}, {'aws-deploy':'other/field'}, 'value'],
                    {expecting: new Promise(resolve => resolve('result')), other: Promise.resolve({'field': 'other'})})
                ).to.eventually.eql([{expecting: 'result', fixed: 'value'}, 'other', 'value'])
            ]);
        });
    });
});