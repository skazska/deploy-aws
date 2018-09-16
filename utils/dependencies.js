function collect (properties) {
    if (typeof properties !== 'object') return {};
    return Object.keys(properties).reduce((dependencies, key) => {
        if (properties[key]['aws-deploy']) {
            dependencies[properties[key]['aws-deploy']] = true;
        } else {
            Object.assign(dependencies, collect(properties[key]));
        }
        return dependencies;
    }, {});
}

function bind (properties, deployment) {
    const dependencies =  collect(properties);
    const orphaned = [];
    Object.keys(dependencies).forEach(key => {
        if (!deployment[key]) {
            orphaned.push(key);
        } else {
            dependencies[key] = deployment[key];
        }
    });
    return {
        dependencies: dependencies,
        orphaned: orphaned.length ? orphaned : null
    }
}

function set (properties, deployment) {
    if (typeof properties !== 'object') return {};
    return Object.keys(properties).forEach(key => {
        if (properties[key]['aws-deploy']) {
            properties[key] = deployment[properties[key]['aws-deploy']];
        } else {
            set(properties[key], deployment);
        }
    });
}

function resolvePropertiesPromise (properties, deployment) {
    const binding = bind(properties, deployment);

    return new Promise(async (resolve, reject) => {
        if (binding.orphaned) return reject(new Error('Orphaned dependencies: ' + binding.orphaned.join(', ')));

        const keys = Object.keys(binding.dependencies);

        try {
            const results = await Promise.all(keys.map(key => binding.dependencies[key]));

            set(properties, results.reduce((results, result, i) => {
                results[keys[i]] = result;
                return results;
            }, {}));

            resolve(properties);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    resolvePropertiesPromise: resolvePropertiesPromise
};