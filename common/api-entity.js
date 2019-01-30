const ApiBase = require('./api-base');

class ApiEntity extends ApiBase {
    /**
     * @param {Object} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} [informer]
     * @param {Options} [options]
     * @param {String|String[]} options.idProperty
     */
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer);
        this.idProperty = (options || {})['idProperty'] || 'id';
    }

    /**
     *
     * @param {Object} properties
     * @return {*}
     * @private
     */
    _updateEntity (properties) {
        Object.assign(this.properties, properties); //TODO possibly need check for property removal
        return this;
    }

    /**
     *
     * @return {*}
     */
    get id () {
        if (typeof this.idProperty === 'string') {
            return this.properties[this.idProperty];
        } else if (Array.isArray(this.idProperty)) {
            return this.idProperty.reduce((result, propName) => {
                result[propName] = this.properties[propName];
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
     * updates entity
     * @param {Object} properties
     */
    update (properties) {
        this.properties = properties;
    }

    /**
     * delete entity
     */
    delete () {

    }
}

module.exports = ApiEntity;