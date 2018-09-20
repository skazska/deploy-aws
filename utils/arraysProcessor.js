function extractIntersection(left, right, compare) {
    if (typeof compare !== 'function') compare = (left, right) => { return left == right };
    const intersection = [];
    let l = 0;
    while (l < left.length) {
        let r = right.findIndex((rItem) => {
            return compare(left[l], rItem);
        });
        if (r >= 0) {
            intersection.push({left: left.splice(l, 1), right: right.splice(r, 1)});
        } else {
            l += 1;
        }
    }
    return {left: left, right: right, intersection: intersection};
}

class Transition {
    constructor (comparator) {
        this.comparator = comparator || ((left, right) => { return left == right });
    }

    setRemover (processor) {
        this.remover = processor;
        return this;
    }

    setCreator (processor) {
        this.creator = processor;
        return this;
    }

    setAdjustor (processor) {
        this.adjustor = processor;
        return this;
    }

    perform (from, to) {
        const left = Object.keys(from).map(i => parseInt(i, 10));
        const right = Object.keys(to).map(i => parseInt(i, 10));
        const compare = (l, r) => {
            return this.comparator(from[l], to[r]);
        };

        const {left: toRemove, right: toCreate, intersection: toAdjust} = extractIntersection(left, right, compare);

        const result = {};
        if (this.remover) result.removed = toRemove.map(i => this.remover(from[i]));
        if (this.adjustor) result.adjusted = toAdjust.map(({l, r}) => this.adjustor(from[l], to[r]));
        if (this.creator) result.created = toCreate.map(i => this.creator(to[i]));

        return result;
    }
};

module.exports = {
    Transition: Transition
};