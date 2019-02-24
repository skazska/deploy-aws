const Entity = require('../common/api-entity');

class ApiGwResponseEntity extends Entity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod', 'statusCode']});
        this.entityName = 'AbstractEntity'
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
    async delete () {
        const idParam = this.id;
        try {
            const result = await this._informCall(
                this.connector['delete' + this.entityName],
                'Delete ' + this.entityName + idParam.resourceId + idParam.httpMethod + idParam.statusCode,
                idParam.restApiId,
                idParam.resourceId,
                idParam.httpMethod,
                idParam.statusCode
            );
            return result;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }
}

module.exports = ApiGwResponseEntity;
