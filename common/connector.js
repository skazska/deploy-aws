class CommonAwsConnector {
    constructor(defaults) {
        this.defaults = Object.assign({
            // name: 'STRING_VALUE', /* required */
            // apiKeySource: HEADER | AUTHORIZER,
            // binaryMediaTypes: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            // cloneFrom: 'STRING_VALUE',
            // description: 'STRING_VALUE',
            // endpointConfiguration: {
            //     types: [
            //         REGIONAL | EDGE | PRIVATE,
            //         /* more items */
            //     ]
            // },
            // minimumCompressionSize: 0,
            // policy: 'STRING_VALUE',
            // version: 'STRING_VALUE'
        }, defaults);
    }
}

module.exports = CommonAwsConnector;