const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');
const preparePackage = require('../utils/fs').preparePackage;

class FunctionEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: 'FunctionName'});
    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (properties) {
        return this._informCall(
            this.connector.updateFunctionConfiguration,
            'Update config for function ' + this.id,
            this.id,
            properties
        );
    }

    /**
     * updates entity
     * @param code
     * @param {Boolean} publish
     */
    updateCode (code, publish) {
        return this._informCall(
            this.connector.updateFunctionCode,
            'Update code for function ' + this.id,
            this.id,
            code,
            publish
        );
    }

    /**
     * delete entity
     */
    delete (version) {
        return this._informCall(
            this.connector.deleteFunction,
            'Delete function ' + this.id,
            this.id,
            version
        );
    }
}

/**
 * @property {LambdaConnector} connector
 */
class LambdaFunction extends Api {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {LambdaConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null);
    }

    _createEntity (properties) {
        return super._createEntity(FunctionEntity, properties);
    }

    /**
     * creates lambda function through api
     * @param {String} name
     * @param {Object} properties
     * @param {Object} [options]
     * @param {boolean} [options.publish]
     * @param {string} [options.wd]
     * @param {string[]} [options.codeEntries]
     * @param {Function} [options.packager]
     */
    async create (name, properties, options) {
        if (!options) options = {};
        try {
            if (options.wd) {
                let code = await (options.packager || preparePackage)(options.wd, options.codeEntries);
                properties.Code = {ZipFile: code};
            }
            const result = await this._informCall(this.connector.createFunction, 'Create function ' + name, name,
                Object.assign(this.properties, properties), options.publish);
            return this._createEntity(result);
        } catch (e) {
            throw e;
        }
    }

    /**
     * gets entity data from api
     * @param {String} name
     * @param {String} [version]
     */
    async read (name, version) {
        try {
            const result = await this._informCall(this.connector.getFunctionConfiguration, 'Get config for function ' + name,
                name, version);
            return result ? this._createEntity(result) : null;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    // list (options) {
    //     super.list(options);
    // }

}

module.exports = LambdaFunction;