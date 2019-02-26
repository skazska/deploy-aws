const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');

class UserEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: 'UserName'});
    }

    /**
     * updates entity
     * @param properties
     */
    update (properties) {

    }

    /**
     * delete entity
     */
    // async delete () {
    //     try {
    //         const resp = await this._informCall(this.connector.deleteRestApi, 'Delete rest-api ' + this.id, this.id);
    //         return resp;
    //     } catch (e) {
    //         if (e.code === 'ResourceNotFoundException') {
    //             return null;
    //         } else {
    //             throw e;
    //         }
    //     }
    // }

}

class User extends Api {
    /**
     * @param {*} properties
     * @param {IAMConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null);
    }

    _createEntity (response) {
        return super._createEntity(UserEntity, response.User);
    }

    /**
     * creates user
     * @param {Object} properties
     */
    // async create (properties) {
    //     try {
    //         const resp = await this._informCall(
    //             this.connector.createRestApi,
    //             'Create user ' + properties.name,
    //             properties);
    //
    //         return this._createEntity(resp);
    //     } catch (e) {
    //         throw e;
    //     }
    // }


    /**
     * gets entity data from api
     * @param {string} id
     */
    async read (id) {
        try {
            const resp = await this._informCall(this.connector.getUser, 'Get user ' + id, id);
            return this._createEntity(resp);
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
     * @param {Object} [options]
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    // list (options) {
    //     if (!options) options = {position: 0, limit: 25};
    //     return this._informCall(this.connector.listRestApis, 'Get rest-apis (' + options.position + ', ' + options.limit + ')',
    //         options.position, options.limit);
    // }

}

module.exports = User;