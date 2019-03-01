class ApiBase {
    /**
     * constructor
     * @param {*} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} informer
     */
    constructor (properties, connector, informer) {
        this.connector = connector;
        this.properties = properties || null;
        if (informer) {
            this.informer = informer;
        }
    }

    /**
     *
     * @param {Function} fn
     * @param {String} text
     * @param {*} args
     * @return {Promise<*>}
     * @private
     */
    _informCall (fn, text, ...args) {
        return this.informer
            ? this.informer.wrapInformer(fn.apply(this.connector, args), {text: text})
            : fn.apply(this.connector, args);
    }

}

module.exports = ApiBase;