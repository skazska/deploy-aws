function pick(object, keys) {
    return keys.reduce((res, key) => { res[key] = object[key]; return res; }, {});
}

function hasDifferences(object1, object2) {
    const obj = pick(object2, Object.keys(object1));
    return JSON.stringify(object1) !== JSON.stringify(obj);
}

module.exports = {
    hasDifferences: hasDifferences,
    pick: pick
}