const pointer = require('json-pointer');

/**
 * splits dependency access key to dependency id and pointer
 * @param {string} key in form of dep.id/json/pointer
 * @return Object
 */
function depKeys (key) {
    let pos = key.indexOf('/');
    if (pos > 0) {
        return {
            dep: key.substr(0, pos),
            pointer: key.substring(pos)
        }
    } else {
        return {
            dep: key
        }
    }
}

/**
 * return object with keys equal to values of 'aws-deploy' keys of value in @param properties those keys should have a
 * true values
 * @param {*} properties
 * @return {*}
 */
function collect (properties) {
    if (Array.isArray(properties)) {
        return properties.reduce((dependencies, properties) => {
            return Object.assign(dependencies, collect(properties));
        }, {});
    }
    if (typeof properties !== 'object') return {};
    return Object.keys(properties).reduce((dependencies, key) => {
        if (key === 'aws-deploy') {
            dependencies[depKeys(properties[key]).dep] = true;
        }
        if (properties[key]['aws-deploy']) {
            dependencies[depKeys(properties[key]['aws-deploy']).dep] = true;
        } else {
            dependencies = Object.assign(dependencies, collect(properties[key]));
        }
        return dependencies;
    }, {});
}

/**
 * #collect dependencies from @param properties, and fills it's keys with values from @param deployment, keys not found
 * in deployment are added to orphaned
 * @param {*} properties
 * @param {object} deployment
 * @return {{dependencies: {}, orphaned: []|null}}
 */
function bind (properties, deployment) {
    const dependencies =  collect(properties);
    const orphaned = [];
    Object.keys(dependencies).forEach(key => {
        let dep = depKeys(key).dep;
        if (!deployment[dep]) {
            orphaned.push(dep);
            delete dependencies[dep];
        } else {
            dependencies[dep] = deployment[dep];
        }
    });
    return {
        dependencies: dependencies,
        orphaned: orphaned.length ? orphaned : null
    }
}

/**
 * return version of @properties value where objects having 'aws-deploy' key replaced with value from @deployment by key
 * named after value kept in 'aws-deploy' in property
 * @param properties
 * @param deployment
 * @return {*}
 */
function fill (properties, deployment) {
    const getDepVal = (property) => {
        let dep = depKeys(property);
        let data = deployment[dep.dep];
        return dep.pointer
            ? pointer.get(data.plain || data, dep.pointer)
            : data;
    };

    if (Array.isArray(properties)) {
        return properties.map(properties => {
            return fill(properties, deployment);
        });
    }
    if (typeof properties !== 'object') return properties;
    return Object.keys(properties).reduce((result, key) => {
        if (key === 'aws-deploy') {
            return getDepVal(properties[key]);
            // let dep = depKeys(properties[key]);
            // let data = deployment[dep.dep];
            // return dep.pointer
            //     ? pointer.get(data.plain || data, dep.pointer)
            //     : data;
        }
        if (properties[key]['aws-deploy']) {
            let val = getDepVal(properties[key]['aws-deploy']);
            // let dep = depKeys(properties[key]['aws-deploy']);
            // let val = dep.pointer ? pointer.get(deployment[dep.dep], dep.pointer) : deployment[dep.dep];
            if (typeof val !== 'undefined') result[key] = val;
        } else {
            result[key] = fill(properties[key], deployment);
        }
        return result;
    }, {});
}

function resolvePropertiesPromise (properties, deployment) {
    const binding = bind(properties, deployment);

    return new Promise(async (resolve, reject) => {
        if (binding.orphaned) return reject(new Error('Orphaned dependencies: ' + binding.orphaned.join(', ')));

        const keys = Object.keys(binding.dependencies);

        try {
            const results = await Promise.all(keys.map(key => binding.dependencies[key]));

            properties = fill(properties, results.reduce((results, result, i) => {
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
    collect: collect,
    bind: bind,
    fill: fill,
    resolvePropertiesPromise: resolvePropertiesPromise
};