const expect = require('chai').expect;
const { collect, bind, fill, resolvePropertiesPromise } = require('../dependencies');

describe('dependencies', () => {
    describe('#collect(properties)', () => {
        it('should return object with keys named after values meet in passed value in keys named "aws-deploy"', () => {
            expect(collect({'anything': {'aws-deploy': 'expecting'}})).eql({expecting: true});
            expect(collect({'aws-deploy': 'expecting'})).eql({expecting: true});
            expect(collect([{'aws-deploy': 'expecting'}])).eql({expecting: true});
            expect(collect([{'anything': {'aws-deploy': 'expecting'}}])).eql({expecting: true});
            expect(collect([{'anything': {'aws-deploy': 'expecting'}}, {'else': {'aws-deploy': 'also'}}])).eql({expecting: true, also: true});
        });
    });

    describe('#bind(properties, deployment)', () => {
       it('should fill values in object acquired through #collect from properties with values from deployment', () => {
           expect(bind({'anything': {'aws-deploy': 'expecting'}}, {expecting: 'result'}))
               .eql({dependencies: {expecting: 'result'}, orphaned: null});
       });
        it('should remove values in object acquired through #collect if no such in deployment, should add to orphaned instead', () => {
            expect(bind({'anything': {'aws-deploy': 'expecting'}}, {expected: 'result'}))
                .eql({dependencies: {}, orphaned: ['expecting']});
        });
    });

    describe('#fill(properties, deployment)', () => {
        it('should return object with keys named after values meet in passed value in keys named "aws-deploy"', () => {
            expect(fill({'anything': {'aws-deploy': 'expecting'}}, {expecting: 'result'}))
                .eql({'anything': 'result'});

            expect(fill({'anything': {'aws-deploy': 'expecting'}}, {expected: 'result'}))
                .eql({});

            expect(fill({'aws-deploy': 'expecting'}, {expecting: 'result'})).eql('result');
            expect(fill([{'aws-deploy': 'expecting'}], {expecting: 'result'})).eql(['result']);
            expect(fill([{'anything': {'aws-deploy': 'expecting'}}], {expecting: 'result'}))
                .eql([{'anything': 'result'}]);
            expect(fill([{'anything': {'aws-deploy': 'expecting'}}, {'else': {'aws-deploy': 'also'}}], {expecting: 'result', also: 'other'}))
                .eql([{'anything': 'result'}, {'else': 'other'}]);
        });
    });

    describe('#resolvePropertiesPromise()', () => {
        it('should return Promise', () => {
            expect(resolvePropertiesPromise({}, {})).an.instanceof(Promise);
        });
        it('should fill placeholders from resolved data', () => {
            //TODO
        });
    });
});