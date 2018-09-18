const AWSGlobal = require('aws-sdk/global');
const Iam = require('aws-sdk/clients/iam');

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
    create (params) {
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
        var params = {
            RoleName: 'STRING_VALUE', /* required */
            Description: 'STRING_VALUE',
            MaxSessionDuration: 0
        };
        return this.iam.updateRole(params).promise();
    }

    /**
     * invokes aws iam deleteRole
     * @param {string} name
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    delete (name) {
        var params = {
            RoleName: 'STRING_VALUE' /* required */
        };
        return this.iam.deleteRole(params).promise();
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
     * invokes aws iam  deleteRolePolicy
     * @param {IAM.Types.DeleteRolePolicyRequest} params
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    deletePolicy (params) {
        var params = {
            PolicyName: "ExamplePolicy",
            RoleName: "Test-Role"
        };
        return this.iam.deleteRolePolicy(params).promise();
    }

    /**
     * invokes aws iam attachRolePolicy
     * @param {IAM.Types.AttachRolePolicyRequest} params
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    attachPolicy (params) {
        var params = {
            PolicyArn: "arn:aws:iam::aws:policy/ReadOnlyAccess",
            RoleName: "ReadOnlyRole"
        };
        return this.iam.attachRolePolicy(params).promise();
    }

    /**
     * invokes aws iam detachRolePolicy
     * @param {IAM.Types.DetachRolePolicyRequest} params
     * @return {Promise<PromiseResult<{}, AWSError>>}
     */
    detachPolicy (params) {
        var params = {
            PolicyArn: 'STRING_VALUE', /* required */
            RoleName: 'STRING_VALUE' /* required */
        };
        return this.iam.detachRolePolicy(params).promise();
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
     * @param {Promise<*>[]} final
     * @return {Promise<*>}
     */
    async deploy (properties, options, final) {
        let roleName = properties.RoleName;
        let role = {};
        //try get role by name first
        try {
            role = await this.get(roleName);
            //get inline policies
            //TODO
            //get policies
            //TODO
        } catch (e) {
            if (e.code !== 'NoSuchEntity') {
                console.error(e);
                return Promise.reject(e);
            } else {
                //if no role by such name found - create
                try {
                    role = await this.create(properties);
                } catch (e) {
                    console.error(e);
                    return Promise.reject(e);
                }


            }
        }

        //role received/created
        const result = [];
        //remove inline policies gone
        //TODO

        //put inline policy
        let inlines = Array.isArray(options.inlinePolicy) ? options.inlinePolicy : [options.inlinePolicy];
        inlines = inlines.map(inline => {
            return this.putPolicy(Object.assign({RoleName: roleName}, inline));
        });
        result.push(Promise.all(inlines));

        //detach policies gone
        //TODO

        //attach new policies
        //TODO

        //add to final processings
        final.push(Promise.all(result));

        //returning role
        return Promise.resolve(role.Role);
    }
}

module.exports = Controller;