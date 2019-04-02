/**
 * @module ApiEntity
 */

const ApiBase = require('./api-base');
const { Transition } = require('../utils/arraysProcessor');


/**
 * Represents entity API
 */
class ApiEntity extends ApiBase {
    /**
     * @constructor
     * @param {Object} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} [informer]
     * @param {Options} [options]
     * @param {String|String[]} options.idProperty
     */
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, (options || {})['defaults']);
        this.idProperty = (options || {})['idProperty'] || 'id';
    }

    /**
     *
     * @param {Object} properties
     * @return {*}
     * @protected
     */
    _updateEntity (properties) {
        const updateObj = (obj, newObj) => {
            const set = (key, val) => {
                if (val && typeof val === 'object') {
                    if (!obj[key]) {
                        if (Array.isArray(val)) {
                            obj[key] = [];
                        } else {
                            obj[key] = {};
                        }
                    }
                    updateObj(obj[key], val);
                } else {
                    obj[key] = newObj[key];
                }
            };

            new Transition((oldKey, newKey) => oldKey === newKey)
                .setRemover(oldKey => { delete obj[oldKey]; })
                .setAdjustor((oldKey, newKey) => { set(oldKey, newObj[newKey]); })
                .setCreator(newKey => { set(newKey, newObj[newKey]); })
                .perform(Object.keys(obj), Object.keys(newObj));
        };
        updateObj(this.properties, properties);
        return this;
    }

    /**
     *
     * @return {*}
     */
    get id () {
        if (typeof this.idProperty === 'string') {
            return this.properties[this.idProperty] || this.defaults[this.idProperty];
        } else if (Array.isArray(this.idProperty)) {
            return this.idProperty.reduce((result, propName) => {
                result[propName] = this.properties[propName] || this.defaults[propName];
                return result;
            }, {});
        }
    }

    /**
     * returns property value
     * @param {String} propName
     * @return {*}
     */
    val (propName) {
        return this.properties[propName];
    }


    /**
     * returns _ops for update
     * @param props
     * @return {Array}
     */
    _ops (props) {
        const genOps = (pathPrefix, props, origin) => {
            let ops = [];
            Object.keys(props).forEach(propName => {
                const val = props[propName];
                const path = (pathPrefix ? pathPrefix : '') + '/' + propName.replace('/', '~1');
                if (val === null || typeof val === 'undefined' && origin.hasOwnProperty(propName)) {
                    ops.push({op: 'remove', path: path})
                } else {
                    const originVal = origin[propName];

                    if (typeof val === 'object') {
                        ops = ops.concat(genOps(path, val, originVal || {}))
                    } else if (origin.hasOwnProperty(propName)) {
                        if (originVal !== val) {
                            ops.push({op: 'replace', path: path, value: val});
                        }
                    } else {
                        ops.push({op: 'add', path: path, value: val});
                    }
                }
            });
            return ops;
        };
        return genOps('', props, this.properties);
    }

    /**
     * updates entity
     * @param {Object} properties
     */
    update (properties) {
        const ops = this._ops(properties);
    }

    /**
     * delete entity
     */
    delete () {

    }

    /**
     *
     * @param {Object} properties
     * @param {CommonApi} instance - creator instance
     * @param {typeof ApiEntity} constructor - Entity class constructor
     * @param {Object} [defaults] - additional properties to set to new entity's properties
     * @return {*}
     */
    static createEntity (properties, instance, constructor, defaults) {
        if (!(properties && typeof properties === 'object')) return properties;
        const addProperties = Object.assign({}, instance.defaults, defaults || {});
        const entity = new constructor(properties, instance.connector, instance.informer, {defaults: addProperties});
        // entity.defaults = instance.defaults;
        //if (addProps) Object.assign(entity.properties, addProps);
        return entity;
    }

}

module.exports = ApiEntity;