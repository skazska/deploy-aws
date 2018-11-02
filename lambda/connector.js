const Lambda = require('aws-sdk/clients/lambda');

const CommonAwsConnector = require('../common/connector');

class LambdaConnector extends CommonAwsConnector {
    constructor (defaults) {
        super(defaults);
        this.api = new Lambda({apiVersion: '2015-03-31'});
    }

//direct api call map

    /**
     * create invokes aws lambda creation
     * @param {string} name
     * @param {Lambda.Types.CreateFunctionRequest} properties
     * @param {boolean} [publish]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    createFunction (name, properties, publish) {
        const params = Object.assign(
            {},
            this.defaults,
            {
                // Code: { /* required */
                //     S3Bucket: 'STRING_VALUE',
                //     S3Key: 'STRING_VALUE',
                //     S3ObjectVersion: 'STRING_VALUE',
                //     ZipFile: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */
                // },
                // FunctionName: 'STRING_VALUE', /* required */
                // Handler: 'STRING_VALUE', /* required */
                // Role: 'STRING_VALUE', /* required */
                // Runtime: nodejs | nodejs4.3 | nodejs6.10 | nodejs8.10 | java8 | python2.7 | python3.6 | dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1 | nodejs4.3-edge | go1.x, /* required */
                // DeadLetterConfig: {
                //     TargetArn: 'STRING_VALUE'
                // },
                // Description: 'STRING_VALUE',
                // Environment: {
                //     Variables: {
                //         '<EnvironmentVariableName>': 'STRING_VALUE',
                //         /* '<EnvironmentVariableName>': ... */
                //     }
                // },
                // KMSKeyArn: 'STRING_VALUE',
                // MemorySize: 0,
                // Publish: true, // || false,
                // Tags: {
                //     '<TagKey>': 'STRING_VALUE',
                //     /* '<TagKey>': ... */
                // },
                // Timeout: 0,
                //     TracingConfig: {
                //     Mode: Active | PassThrough
                // },
                // VpcConfig: {
                //     SecurityGroupIds: [
                //         'STRING_VALUE',
                //         /* more items */
                //     ],
                //         SubnetIds: [
                //         'STRING_VALUE',
                //         /* more items */
                //     ]
                // }
            }
        );
        return this.api.createFunction(Object.assign(params, properties, {
            FunctionName: name,
            Publish: !!publish
        })).promise();
        /*
          data = {
           CodeSha256: "",
           CodeSize: 123,
           Description: "",
           FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:MyFunction",
           FunctionName: "MyFunction",
           Handler: "source_file.handler_name",
           LastModified: "2016-11-21T19:49:20.006+0000",
           MemorySize: 128,
           Role: "arn:aws:iam::123456789012:role/service-role/role-name",
           Runtime: "nodejs4.3",
           Timeout: 123,
           Version: "1",
           VpcConfig: {
           }
          }
        */
    }

    /**
     * deletes function configuration
     * @param {string} name lambda-function name
     * @param {string} [qualifier]
     * @return {Promise<PromiseResult<null, AWSError>>}
     */
    deleteFunction (name, qualifier) {
        var params = {
            FunctionName: name
        };
        if (qualifier) params.Qualifier = qualifier;

        return this.api.deleteFunction(params).promise().catch(err => {
            if (err.code === 'ResourceNotFoundException') return Promise.resolve(null);
            return Promise.reject(err);
        });
    }

    /**
     * gets function
     * @param name
     * @param qualifier
     */
    getFunction (name, qualifier) {
        var params = {
            FunctionName: name
        };
        if (qualifier) params.Qualifier = qualifier;

        return this.api.getFunction(params).promise().catch(err => {
            if (err.code === 'ResourceNotFoundException') return Promise.resolve(null);
            return Promise.reject(err);
        });
    }

    /**
     * gets function configuration
     * @param {string} name lambda-function name
     * @param {string} [qualifier]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError> | never>}
     */
    getFunctionConfiguration (name, qualifier) {
        var params = {
            FunctionName: name
        };
        if (qualifier) params.Qualifier = qualifier;

        return this.api.getFunctionConfiguration(params).promise().catch(err => {
            if (err.code === 'ResourceNotFoundException') return Promise.resolve(null);
            return Promise.reject(err);
        });
        // successful response
        /*
        data = {
         CodeSha256: "LQT+0DHxxxxcfwLyQjzoEFKZtdqQjHXanlSdfXBlEW0VA=",
         CodeSize: 123,
         DeadLetterConfig: {
         },
         Description: "",
         Environment: {
         },
         FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:myFunction",
         FunctionName: "myFunction",
         Handler: "index.handler",
         KMSKeyArn: "",
         LastModified: "2016-11-21T19:49:20.006+0000",
         MemorySize: 128,
         Role: "arn:aws:iam::123456789012:role/lambda_basic_execution",
         Runtime: "python2.7",
         Timeout: 123,
         Version: "1",
         VpcConfig: {
         }
        }
        */
    }

    /**
     * invokes lambda-function configuration update
     * @param {string} name
     * @param {Lambda.Types.UpdateFunctionConfigurationRequest} properties
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    updateFunctionConfiguration (name, properties) {
        const params = Object.assign(
            {},
            this.defaults,
            {
                // FunctionName: 'STRING_VALUE', /* required */
                // DeadLetterConfig: {
                //     TargetArn: 'STRING_VALUE'
                // },
                // Description: 'STRING_VALUE',
                // Environment: {
                //     Variables: {
                //         '<EnvironmentVariableName>': 'STRING_VALUE',
                //         /* '<EnvironmentVariableName>': ... */
                //     }
                // },
                // Handler: 'STRING_VALUE',
                // KMSKeyArn: 'STRING_VALUE',
                // MemorySize: 0,
                // RevisionId: 'STRING_VALUE',
                // Role: 'STRING_VALUE',
                // Runtime: 'nodejs | nodejs4.3 | nodejs6.10 | nodejs8.10 | java8 | python2.7 | python3.6 | dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1 | nodejs4.3-edge | go1.x',
                // Timeout: 0,
                // TracingConfig: {
                //     Mode: Active | PassThrough
                // },
                // VpcConfig: {
                //     SecurityGroupIds: [
                //         'STRING_VALUE',
                //         /* more items */
                //     ],
                //         SubnetIds: [
                //         'STRING_VALUE',
                //         /* more items */
                //     ]
                // }
            }
        );
        return this.api.updateFunctionConfiguration(Object.assign(params, properties, {
            FunctionName: name
        })).promise();
        /*
        data = {
         CodeSha256: "LQT+0DHxxxxcfwLyQjzoEFKZtdqQjHXanlSdfXBlEW0VA=",
         CodeSize: 123,
         Description: "",
         FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:myFunction",
         FunctionName: "myFunction",
         Handler: "index.handler",
         LastModified: "2016-11-21T19:49:20.006+0000",
         MemorySize: 128,
         Role: "arn:aws:iam::123456789012:role/lambda_basic_execution",
         Runtime: "python2.7",
         Timeout: 123,
         Version: "1",
         VpcConfig: {
         }
        }
        */
    }

    /**
     * invokes lambda-function code update
     * @param {string} name
     * @param {object} code
     * @param {boolean} [publish]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    updateFunctionCode (name, code, publish) {
        var params = Object.assign(
            {
                // FunctionName: name,
                // Publish: !!publish,
                // S3Bucket: "myBucket",
                // S3Key: "myKey",
                // S3ObjectVersion: "1",
                // ZipFile: <Binary String>
            },
            code,
            {
                FunctionName: name,
                Publish: !!publish,
            }
        );

        return this.api.updateFunctionCode(params).promise();
        /*
        data = {
         CodeSha256: "LQT+0DHxxxxcfwLyQjzoEFKZtdqQjHXanlSdfXBlEW0VA=",
         CodeSize: 123,
         Description: "",
         FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:myFunction",
         FunctionName: "myFunction",
         Handler: "index.handler",
         LastModified: "2016-11-21T19:49:20.006+0000",
         MemorySize: 128,
         Role: "arn:aws:iam::123456789012:role/lambda_basic_execution",
         Runtime: "python2.7",
         Timeout: 123,
         Version: "1",
         VpcConfig: {
         }
        }
        */
    }
}

module.exports = LambdaConnector;