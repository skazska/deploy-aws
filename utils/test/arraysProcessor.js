const chai = require('chai');
// const chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
const expect = chai.expect;

const { extractIntersection, Transition } = require('../arraysProcessor');

describe('arraysProcessor', () => {
    describe('#extractIntersection(left, right)', () => {
        it('should return {left: *[], right: *[], intersection: {left: *, right: *}[]} from left and right arrays', () => {
            expect(extractIntersection([1,2,3,5], [3,4,5,6]))
                .deep.eql({left: [1,2], right: [4, 6], intersection: [{left: 3, right: 3},{left: 5, right: 5}]});
            expect(extractIntersection([{id:1}, {id:2}], [2,3], (l, r)=>l.id === r))
                .deep.eql({left: [{id:1}], right: [3], intersection: [{left: {id:2}, right: 2}]});
        });
    });

    describe('Transition', () => {
        it('should call processor functions and return results', () => {
            const removed = [];
            const adjusted = [];
            const added = [];
            const results = new Transition()
                .setRemover(val => { removed.push(val); return val-1;})
                .setAdjustor((l, r) => { adjusted.push(l+r); return l+r;})
                .setCreator(val => { added.push(val); return val+1;})
                .perform([1,2],[2,3]);
            expect(removed).eql([1]);
            expect(added).eql([3]);
            expect(adjusted).eql([4]);
            expect(results).eql({removed: [0], adjusted: [4], created: [4]});
        });
    });

});