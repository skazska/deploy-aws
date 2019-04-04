function pick(object, keys) {
    return keys.reduce((res, key) => { res[key] = object[key]; return res; }, {});
}

/**
 *
 * @param {Object} object1
 * @param {Object} object2
 * @param {String[]} except keys to ignore
 * @return {boolean}
 */
function hasDifferences(object1, object2, except) {
    const keys = Object.keys(object1).filter(key => {
        return !((except||[]).indexOf(key) + 1);
    });
    const obj2 = pick(object2, keys);
    const obj1 = pick(object1, keys);
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

module.exports = {
    hasDifferences: hasDifferences,
    pick: pick
};