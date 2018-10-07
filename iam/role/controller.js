const AWSGlobal = require('aws-sdk/global');
const Iam = require('aws-sdk/clients/iam');

const { Transition } = require('../../utils/arraysProcessor');


let defaultConfig = {

};

class Controller {

    constructor (config, defaults) {
        this.defaults = defaults || {};

        if (typeof config === 'string') {
            AWSGlobal.config.loadFromPath(config);
        } else if (typeof config === 'object') {
            const rconf = Object.assign({}, defaultConfig, config);
            AWSGlobal.config.update(rconf);
        }
        this.iam = new Iam({apiVersion: '2010-05-08'});
    }

    /**
     * invokes aws iam createRole
     * @param {IAM.Types.CreateRoleRequest} params
     * @return {Promise<PromiseResult<IAM.CreateRoleResponse, AWSError>>}
     */
    create (params, informer) {
        var defaultParams = {
            AssumeRolePolicyDocument: {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "lambda.amazonaws.com"
                        },
                        "Action": "sts:AssumeRole"
                    }
                ]
            }, /* required */
            // RoleName: 'STRING_VALUE', /* required */
            Description: '',
            // MaxSessionDuration: 0,
            // Path: '',
            // PermissionsBoundary: ''
        };
        params = Object.assign(defaultParams, params);
        // params.AssumeRolePolicyDocument = encodeURI(JSON.stringify(params.AssumeRolePolicyDocument));
        params.AssumeRolePolicyDocument = JSON.stringify(params.AssumeRolePolicyDocument);
        return this.iam.createRole(params).promise();
    }

    /**
     * invokes aws iam getRole
     * @param {string} name
     * @return {Promise<PromiseResult<IAM.GetRoleResponse, AWSError>>}
     */
    get (name) {
        return this.iam.getRole({RoleName: name}).promise();
    //     data = {
    //         Role: {
    //             Arn: "arn:aws:iam::123456789012:role/Test-Role",
    //             AssumeRolePolicyDocument: "<URL-encoded-JSON>",
    //             CreateDate: <Date Representation>,
    //         Path: "/",
    //         RoleId: "AIDIODR4TAW7CSEXAMPLE",
    //         RoleName: "Test-Role"
    //     }
    }

    /**
     * invokes aws iam updateRole
     * @param {IAM.Types.UpdateRoleRequest} awsProperties
     * @return {Promise<PromiseResult<IAM.UpdateRoleResponse, AWSError>>}
     */
    update (awsProperties) {
        // var params = {
        //     RoleName: 'STRING_VALUE', /* required */
        //     Description: 'STRING_VALUE',
        //     MaxSessionDuration: 0
        // };
        return this.iam.updateRole(params).promise();
    }

    /**
     * invokes aws iam deleteRole
     * @param {string} awsProperties
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    delete (awsProperties) {
        // var params = {
        //     RoleName: 'STRING_VALUE' /* required */
        // };
        return this.iam.deleteRole(awsProperties).promise();
    }

    /**
     * invokes aws iam listRolePolicy
     * @param {IAM.Types.ListRolePoliciesRequest} awsProperties
     * @return {Promise<PromiseResult<IAM.ListRolePoliciesResponse, AWSError>>}
     */
    listPolicies (awsProperties) {
        // var params = {
        //     RoleName: 'STRING_VALUE', /* required */
        //     Marker: 'STRING_VALUE',
        //     MaxItems: 0
        // };
        return this.iam.listRolePolicies(awsProperties).promise();
    }

    /**
     * invokes aws iam putRolePolicy
     * @param {IAM.Types.PutRolePolicyRequest} awsProperties
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    putPolicy (awsProperties) {
        // var params = {
        //     PolicyDocument: "{\"Version\":\"2012-10-17\",\"Statement\":{\"Effect\":\"Allow\",\"Action\":\"s3:*\",\"Resource\":\"*\"}}",
        //     PolicyName: "S3AccessPolicy",
        //     RoleName: "S3Access"
        // };
        const params = Object.assign({}, awsProperties);
        params.PolicyDocument = JSON.stringify(params.PolicyDocument);
        return this.iam.putRolePolicy(params).promise();
    }

    /**
     * invokes aws iam deleteRolePolicy
     * @param {IAM.Types.DeleteRolePolicyRequest} awsProperties
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    deletePolicy (awsProperties) {
        // var params = {
        //     PolicyName: "ExamplePolicy",
        //     RoleName: "Test-Role"
        // };
        return this.iam.deleteRolePolicy(awsProperties).promise();
    }

    /**
     * invokes aws iam listAttachedRolePolicies
     * @param {IAM.Types.ListAttachedRolePoliciesRequest} awsProperties
     * @return {Promise<PromiseResult<IAM.ListAttachedRolePoliciesResponse, AWSError>>}
     */
    listAttachedPolicies (awsProperties) {
        // var params = {
        //     RoleName: 'STRING_VALUE', /* required */
        //     Marker: 'STRING_VALUE',
        //     MaxItems: 0,
        //     PathPrefix: 'STRING_VALUE'
        // };
        return this.iam.listAttachedRolePolicies(awsProperties).promise();
    }

    /**
     * invokes aws iam attachRolePolicy
     * @param {IAM.Types.AttachRolePolicyRequest} awsProperties
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    attachPolicy (awsProperties) {
        // var params = {
        //     PolicyArn: "arn:aws:iam::aws:policy/ReadOnlyAccess",
        //     RoleName: "ReadOnlyRole"
        // };
        return this.iam.attachRolePolicy(awsProperties).promise();
    }

    /**
     * invokes aws iam detachRolePolicy
     * @param {IAM.Types.DetachRolePolicyRequest} awsProperties
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    detachPolicy (awsProperties) {
        // var params = {
        //     PolicyArn: 'STRING_VALUE', /* required */
        //     RoleName: 'STRING_VALUE' /* required */
        // };
        return this.iam.detachRolePolicy(awsProperties).promise();
    }

    /**
     * @typedef {Object} Controller.deploy~options
     * @property {IAM.Types.PutRolePolicyRequest[]|IAM.Types.PutRolePolicyRequest} inlinePolicy
     * @property {string[]} policies
     */
    /**
     * deploys role changes
     * @param {IAM.Types.CreateRoleRequest} properties
     * @param {Controller.deploy~options} options
     * @param {Group} informGroup
     * @return {Promise<*>}
     */
    async deploy (properties, options, informGroup) {
        let roleName = properties.RoleName;
        let role = null;
        let policies = null;
        let attached = null;

        //try get role by name first
        try {
            role = this.get(roleName);
            informGroup.addInformer(role, {text: 'getting role ' + roleName});
            role = await role;

            //get inline policies
            policies = this.listPolicies({RoleName: roleName});
            informGroup.addInformer(policies, {text: 'getting inline policies for role ' + roleName});

            //get policies
            attached =  this.listAttachedPolicies({RoleName: roleName});
            informGroup.addInformer(attached, {text: 'getting attached policies for role ' + roleName});

            [policies, attached] = await Promise.all([policies, attached]);
        } catch (e) {
            if (role === null && e.code === 'NoSuchEntity') {

                //if no role by such name found - create
                try {
                    role = this.create(properties);
                    informGroup.addInformer(role, {text: 'creating role ' + roleName});
                    role = await role;
                } catch (e) {
                    informGroup.abort();
                    return Promise.reject(e);
                }
            } else if (e.code !== 'NoSuchEntity') {
                informGroup.abort();
                return Promise.reject(e);
            }
        }

        //role received/created
        const result = [];
        //remove/add/update inline policies
        let inlines = Array.isArray(options.inlinePolicy) ? options.inlinePolicy : [options.inlinePolicy];
        let transition = new Transition((left, right) => left === right.PolicyName)
            .setRemover(name => this.deletePolicy({RoleName: roleName, PolicyName: name}))
            .setAdjustor((name, policy) => this.putPolicy(Object.assign({RoleName: roleName}, policy)))
            .setCreator(policy => this.putPolicy(Object.assign({RoleName: roleName}, policy)))
            .perform(policies.PolicyNames, inlines);

        result.push(Promise.all(Object.values(transition).map(set => Promise.all(set))));

        //attch/detach policies
        //wait for all data get resolved
        const attachedPolicies = await Promise.all(options.policies);

        transition = new Transition((left, right) => left.PolicyArn === right)
            .setRemover(policy => this.detachPolicy({RoleName: roleName, PolicyArn: policy.PolicyArn}))
            .setCreator(arn => this.attachPolicy({RoleName: roleName, PolicyArn: arn}))
            .perform(attached.AttachedPolicies, attachedPolicies);

        result.push(Promise.all(Object.values(transition).map(set => Promise.all(set))));

        //add to final processings
        final.push(Promise.all(result));

        //returning role
        return Promise.resolve(role.Role);
    }
}

module.exports = Controller;