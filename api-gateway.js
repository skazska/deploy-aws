const { Transition } = require('@skazska/tools-data-transform');
const { hasDifferences } = require('./utils/properties');
const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');
const ApiGwResourceEntity = require('./api-gateway/resource-entity');
const ApiGwMethodEntity = require('./api-gateway/method-entity');
const { ApiGwMethodResponseEntity, ApiGwIntegrationResponseEntity } = require('./api-gateway/response');
const ApiGwIntegrationEntity = require('./api-gateway/integration-entity');

const RESOURCE_LIST_LIMIT = 200;
const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];

class ApiGateway {

    constructor (region, accountId) {
        this.connector = new Connector();
        this.region = region;
        this.accountId = accountId;
    }

    /**
     * @typedef {Object} ApiGateway~DeployOptions
     * @property {RestApi~DeployOptions[]} resources rest-api resource descriptions
     * @property {RestApiController} [restApiController] instance of aws rest-api controller
     */

    /**
     * deploys rest-api changes
     * @param {String} name
     * @param {Promise<RestApi.Types.CreateFunctionRequest>} properties of rest api
     * @param {ApiGateway~DeployOptions} options
     * @param {Group} [informGroup]
     * @return {Promise<*>}
     */
    async deploy (name, properties, options, informGroup) {
        const restApi = options.apiController || new RestApi({}, this.connector, informGroup);

        //wait for all data get resolved: properties, function read by name, code package
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});

        try {
            let results = [];
            let [rest, params, resources] = await Promise.all([
                restApi.find(name),
                properties || {},
                options.resources || {}
            ]);
            let currentResourcesDef, rootDef;


            if (rest) {
                if (hasDifferences(params, rest.properties, ['id'])) {
                    results.push(rest.update(params));
                } else {
                    results.push(null);
                }
                currentResourcesDef = rest.listResources({limit: options.resourceListLimit || RESOURCE_LIST_LIMIT});
            } else {
                rest = await restApi.create(name, params);
                results.push(null);
                currentResourcesDef = {items: []};
            }
            rootDef = rest.readRoot();

            const [currentResources, root] = await Promise.all([currentResourcesDef, rootDef]);

            results.push(this.deployResources(root, resources, currentResources.items));

            results = await Promise.all(results);


            return rest;
        } catch (e) {
            throw e;
        }
    }

    async deployIntegrationResponse(entity, response, current) {
        let resp = null;

        try {
            if (current) {
                resp = ApiGwIntegrationResponseEntity.createEntity(current, entity, ApiGwIntegrationResponseEntity);
                await resp.update(response)
            } else {
                resp = await entity.addResponse(response.statusCode, response);
            }
            return resp;
        } catch (e) {
            throw e;
        }
    }

    async deployMethodResponse(entity, response, current) {
        let resp = null;

        try {
            if (current) {
                resp = ApiGwMethodResponseEntity.createEntity(current, entity.responseApi, ApiGwMethodResponseEntity);
                await resp.update(response)
            } else {
                resp = await entity.addResponse(response.statusCode, response);
            }
            return resp;
        } catch (e) {
            throw e;
        }
    }

    async deployIntegration(method, integration, current, res) {
        let intgr = null;

        const compileIntegration = integration => {
            const props = Object.assign({type: integration.type}, integration.awsProperties);
            if (props.type === 'AWS_PROXY') {
                props.integrationHttpMethod = 'POST';
                if (integration.lambda) {
                    // let lambda = typeof integration.lambda === 'string' ? integration.lambda : integration.lambda.properties.FunctionArn;
                    props.uri = 'arn:aws:apigateway:' + this.region + ':lambda:path/2015-03-31/functions/' +
                        integration.lambda.val('FunctionArn') + '/invocations';
                }
            }
            return props
        };

        try {
            if (current) {
                intgr = ApiGwIntegrationEntity.createEntity(current, method.integrationApi, ApiGwIntegrationEntity);
                await intgr.update(compileIntegration(integration))
            } else {
                intgr = await method.addIntegration(compileIntegration(integration));
            }

            //TODO this is a temporary solutions, plans to move whole integrations creating to special DPKO
            // "integrations"
            if (integration.type === 'AWS_PROXY') {
                let sourceArn = 'arn:aws:execute-api:'+this.region+':'+this.accountId+':'+intgr.id.restApiId+'/*/*' + res.val('path');

                await integration.lambda.removePermission(null, 'test');
                await integration.lambda.addPermission(null, 'test', {SourceArn: sourceArn});
            }

            //method response
            let curResponses = intgr.val('integrationResponses') || {};
            curResponses = Object.keys(curResponses || {}).map(code => {
                return Object.assign({statusCode: code}, curResponses[code]);
            });
            let responses = Object.keys(integration.responses || {}).map(code => {
                return Object.assign({statusCode: code}, integration.responses[code]);
            });




            const responseTransition = new Transition((oldItem, newItem) => oldItem.statusCode === newItem.statusCode)
                .setRemover(oldItem => intgr.deleteResponse(oldItem.statusCode))
                .setAdjustor((oldItem, newItem) => this.deployIntegrationResponse(intgr, newItem, oldItem))
                .setCreator(newItem => this.deployIntegrationResponse(intgr, newItem))
                .perform(curResponses, responses);


            //thin: transition is a set of callbacks and we wait for it here even after had waited for deployResources
            return await responseTransition
                ? Promise.all(Object.values(responseTransition).map(set => Promise.all(set)))
                : true;
        } catch (e) {
            throw e;
        }
    }

    async deployMethod(res, method, current) {
        let meth = null;

        try {
            if (current) {
                meth = ApiGwMethodEntity.createEntity(current, res.methodApi, ApiGwMethodEntity);
                await meth.update(method.awsProperties)
            } else {
                meth = await res.addMethod(method.httpMethod, method.awsProperties);
            }

            //method response
            let curResponses = meth.val('methodResponses') || {};
            curResponses = Object.keys(curResponses || {}).map(code => {
                return Object.assign({statusCode: code}, curResponses[code]);
            });
            let responses = Object.keys(method.responses || {}).map(code => {
                return Object.assign({statusCode: code}, method.responses[code]);
            });

            const responseTransition = new Transition((oldItem, newItem) => oldItem.statusCode === newItem.statusCode)
                .setRemover(oldItem => meth.deleteResponse(oldItem.statusCode))
                .setAdjustor((oldItem, newItem) => this.deployMethodResponse(meth, newItem, oldItem))
                .setCreator(newItem => this.deployMethodResponse(meth, newItem))
                .perform(curResponses, responses);

            await this.deployIntegration(meth, method.integration || {}, meth.val('methodIntegration'), res);

            //thin: transition is a set of callbacks and we wait for it here even after had waited for deployResources
            return await responseTransition
                ? Promise.all(Object.values(responseTransition).map(set => Promise.all(set)))
                : true;
        } catch (e) {
            throw e;
        }
    }

    async deployResource(entity, resource, currentResource, allResources) {
        let res = null;

        try {
            if (currentResource) {
                res = ApiGwResourceEntity.createEntity(currentResource, entity, ApiGwResourceEntity);

                // await res.update(resource.awsProperties) - no updates for resource

            } else {
                //add resource
                res = await entity.addResource(resource.pathPart, resource.awsProperties);
            }

            //deploy methods

            let curMethods = res.val('resourceMethods') || {};
            curMethods = Object.keys(curMethods).map(name => {
                return Object.assign({httpMethod: name}, curMethods[name]);
            });
            let methods = Object.keys(resource).filter(name => HTTP_METHODS.some(m => m === name))
                .map(name => { return Object.assign({httpMethod: name}, resource[name]); });

            const transition = new Transition((oldItem, newItem) => oldItem.pathPart === newItem.pathPart)
                .setRemover(oldItem => res.deleteMethod(oldItem.httpMethod))
                .setAdjustor((oldItem, newItem) => {
                    return this.deployMethod(res, newItem, oldItem)
                })
                .setCreator(newItem => this.deployMethod(res, newItem))
                .perform(curMethods, methods);

            //deploy subresources
            if (resource.resources) {
                let resources = await this.deployResources(res, resource.resources, allResources);
            }

            //thin: transition is a set of callbacks and we wait for it here even after had waited for deployResources
            await Promise.all(Object.values(transition).map(set => Promise.all(set)));

            /** TODO check for fresh methods and resources are presented in return value and accessible in deployment**/

            return res;
        } catch (e) {
            throw e;
        }
    }


    /**
     *
     * @param {ApiGwResourceEntity} parent
     * @param {[]} resources
     * @param currentResources
     * @return {Promise<[*]>}
     */
    async deployResources(parent, resources, currentResources) {
        const newRes = Object.keys(resources).map(key => {
            resources[key].pathPart = key; return resources[key];
        });
        const oldRes = currentResources.filter(res => res.parentId === parent.id.id);

        const transition = new Transition((oldItem, newItem) => oldItem.pathPart === newItem.pathPart)
            .setRemover(oldItem => {return parent.deleteResource(oldItem.id);})
            .setAdjustor((oldItem, newItem) => {
                return this.deployResource(parent, newItem, oldItem, currentResources)
            })
            .setCreator(newItem => this.deployResource(parent, newItem, null, currentResources))
            .perform(oldRes, newRes);

        await Promise.all(Object.values(transition).map(set => {
            return Promise.all(set)
        }));

        return transition;
    }
}

module.exports = ApiGateway;