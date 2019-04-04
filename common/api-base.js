/**
 * @module ApiBase
 */

class ApiBase {
    /**
     * @constructor
     * @param {*} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} informer
     */
    constructor (properties, connector, informer, defaults) {
        this.connector = connector;
        this.properties = properties || null;
        if (informer) {
            this.informer = informer;
        }
        this.defaults = defaults || {};
    }

    /**
     *
     * @param {Function} fn
     * @param {String} text
     * @param {*} args
     * @return {Promise<*>}
     * @protected
     */
    _informCall (fn, text, ...args) {
        return this.informer
            ? this.informer.wrapInformer(fn.apply(this.connector, args), {text: text})
            : fn.apply(this.connector, args);
    }

}

module.exports = ApiBase;