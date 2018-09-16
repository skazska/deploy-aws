const AWSGlobal = require('aws-sdk/global');
const Iam = require('aws-sdk/clients/iam');

let defaultConfig = {

};

class LambdaController {

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
     *
     * @param params
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
     *
     * @param name
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

    update (params) {
        var params = {
            RoleName: 'STRING_VALUE', /* required */
            Description: 'STRING_VALUE',
            MaxSessionDuration: 0
        };
        iam.updateRole(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    delete () {
        var params = {
            RoleName: 'STRING_VALUE' /* required */
        };
        iam.deleteRole(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    putPolicy (params) {
        var params = {
            PolicyDocument: "{\"Version\":\"2012-10-17\",\"Statement\":{\"Effect\":\"Allow\",\"Action\":\"s3:*\",\"Resource\":\"*\"}}",
            PolicyName: "S3AccessPolicy",
            RoleName: "S3Access"
        };
        iam.putRolePolicy(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    deletePolicy (params) {
        var params = {
            PolicyName: "ExamplePolicy",
            RoleName: "Test-Role"
        };
        iam.deleteRolePolicy(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    attachPolicy (params) {
        var params = {
            PolicyArn: "arn:aws:iam::aws:policy/ReadOnlyAccess",
            RoleName: "ReadOnlyRole"
        };
        iam.attachRolePolicy(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    detachPolicy (params) {
        var params = {
            PolicyArn: 'STRING_VALUE', /* required */
            RoleName: 'STRING_VALUE' /* required */
        };
        iam.detachRolePolicy(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    }

    async deploy (properties, options) {
        let roleName = properties.RoleName;
        let role = {};
        try {
            role = await this.get(roleName);
        } catch (e) {
            if (e.code !== 'NoSuchEntity') {
                console.error(e);
                return Promise.reject(e);
            } else {
                try {
                    role = await this.create(properties);
                } catch (e) {
                    console.error(e);
                    return Promise.reject(e);
                }
            }
        }
        return Promise.resolve(role.Role);
    }
}

module.exports = LambdaController;