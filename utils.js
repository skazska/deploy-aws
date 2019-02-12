/**
 * composes lambda invocation uri for api gateway integration
 * @param {string} arn lambda function ARN
 * @param {string} [region] aws region eu-west-1 is default
 * @return {string}
 */
function apiGwLambdaIntegrationUri (arn, region) {
    return 'arn:aws:apigateway:' + (region || 'eu-west-1') + ':lambda:path/2015-03-31/functions/' + arn + '/invocations';
}

module.exports = {
    apiGwLambdaIntegrationUri: apiGwLambdaIntegrationUri
};