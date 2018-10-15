const { statSync, readdirSync } = require('fs');
const { createHash } = require('crypto');

const Lambda = require('aws-sdk/clients/lambda');
const { hasDifferences } = require('../utils/properties');

const AdmZip = require('../custom_modules/adm-zip');
//const AdmZip = require('adm-zip');


class Controller {

    constructor (defaults) {
        //defaults for aws lambda configuration
        this.defaults = Object.assign({
            Description: "",
            // FunctionName: "MyFunction",
            // Handler: "souce_file.handler_name", // is of the form of the name of your source file and then name of your function handler
            MemorySize: 128,
            //Publish: true,
            // Role: "arn:aws:iam::123456789012:role/service-role/role-name", // replace with the actual arn of the execution role you created
            Runtime: "nodejs8.10",
            Timeout: 15,
            //VpcConfig: {}
        }, defaults);
        this.lambda = new Lambda({apiVersion: '2015-03-31'});
    }

    /**
     * create invokes aws lambda creation
     * @param {Lambda.Types.CreateFunctionRequest} properties
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    create (properties) {
        // var params = {
        //     Code: { /* required */
        //         S3Bucket: 'STRING_VALUE',
        //         S3Key: 'STRING_VALUE',
        //         S3ObjectVersion: 'STRING_VALUE',
        //         ZipFile: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */
        //     },
        //     FunctionName: 'STRING_VALUE', /* required */
        //     Handler: 'STRING_VALUE', /* required */
        //     Role: 'STRING_VALUE', /* required */
        //     Runtime: 'nodejs | nodejs4.3 | nodejs6.10 | nodejs8.10 | java8 | python2.7 | python3.6 | dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1 | nodejs4.3-edge | go1.x', /* required */
        //     DeadLetterConfig: {
        //         TargetArn: 'STRING_VALUE'
        //     },
        //     Description: 'STRING_VALUE',
        //         Environment: {
        //         Variables: {
        //             '<EnvironmentVariableName>': 'STRING_VALUE',
        //             /* '<EnvironmentVariableName>': ... */
        //         }
        //     },
        //     KMSKeyArn: 'STRING_VALUE',
        //         MemorySize: 0,
        //         Publish: true || false,
        //         Tags: {
        //         '<TagKey>': 'STRING_VALUE',
        //         /* '<TagKey>': ... */
        //     },
        //     Timeout: 0,
        //         TracingConfig: {
        //         Mode: Active | PassThrough
        //     },
        //     VpcConfig: {
        //         SecurityGroupIds: [
        //             'STRING_VALUE',
        //             /* more items */
        //         ],
        //             SubnetIds: [
        //             'STRING_VALUE',
        //             /* more items */
        //         ]
        //     }
        // };
        return this.lambda.createFunction(Object.assign({Publish: true}, this.defaults, properties)).promise();
    }

    /**
     * gets function configuration
     * @param {string} name lambda-function name
     * @param {string} [qualifier]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError> | never>}
     */
    getConfig (name, qualifier) {
        var params = {
            FunctionName: name
        };
        if (qualifier) params.Qualifier = qualifier;

        return this.lambda.getFunctionConfiguration(params).promise().catch(err => {
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
     * @param {Lambda.Types.UpdateFunctionConfigurationRequest} properties
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    updateConfig (properties) {
        // var params = {
        //     FunctionName: 'STRING_VALUE', /* required */
        //     DeadLetterConfig: {
        //         TargetArn: 'STRING_VALUE'
        //     },
        //     Description: 'STRING_VALUE',
        //     Environment: {
        //         Variables: {
        //             '<EnvironmentVariableName>': 'STRING_VALUE',
        //             /* '<EnvironmentVariableName>': ... */
        //         }
        //     },
        //     Handler: 'STRING_VALUE',
        //     KMSKeyArn: 'STRING_VALUE',
        //     MemorySize: 0,
        //     RevisionId: 'STRING_VALUE',
        //     Role: 'STRING_VALUE',
        //     Runtime: 'nodejs | nodejs4.3 | nodejs6.10 | nodejs8.10 | java8 | python2.7 | python3.6 | dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1 | nodejs4.3-edge | go1.x',
        //     Timeout: 0,
        //     TracingConfig: {
        //         Mode: Active | PassThrough
        //     },
        //     VpcConfig: {
        //         SecurityGroupIds: [
        //             'STRING_VALUE',
        //             /* more items */
        //         ],
        //             SubnetIds: [
        //             'STRING_VALUE',
        //             /* more items */
        //         ]
        //     }
        // };
        return this.lambda.updateFunctionConfiguration(Object.assign({}, this.defaults, properties)).promise();
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
     * @param {boolean} publish
     * @param {object} code
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>>}
     */
    updateCode (name, publish, code) {
        var params = {
            FunctionName: name,
            Publish: !!publish,
            // S3Bucket: "myBucket",
            // S3Key: "myKey",
            // S3ObjectVersion: "1",
            // ZipFile: <Binary String>
        };

        params = Object.assign(params, code);

        return this.lambda.updateFunctionCode(params).promise();
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
     * return zipfile Buffer promise
     * @param {string} wd lambda package directory
     * @param {string[]} codeEntries dirs and files in package directory to add to package
     * @return {Promise<Buffer>}
     */
    preparePackage (wd, codeEntries) {
        return new Promise((resolve, reject) => {
            const zip = new AdmZip();
            (codeEntries || readdirSync(wd)).forEach(path => {
                if (!codeEntries && ( path[0] === '.' || path[0] === '_')) return;
                let fullPath = wd + '/' + path;
                const p = statSync(fullPath);
                if (p.isFile()) {
                    zip.addLocalFile(fullPath);
                } else if (p.isDirectory()) {
                    zip.addLocalFolder(fullPath, path);
                }
            });
            // zip.writeZip('zipFile.zip');
            zip.toBuffer(resolve, reject);
        });
    }


    /**
     * deploys lambda-function changes
     * @param {string} name function name
     * @param {Promise<Lambda.Types.CreateFunctionRequest>} properties
     * @param {object} options,
     * @param {Group} [informGroup]
     * @return {Promise<PromiseResult<Lambda.FunctionConfiguration, AWSError>|*>}
     */
    async deploy (name, properties, options, informGroup) {
        let result = null;

        //wait for all data get resolved
        const waitPropsInformer = informGroup.addInformer(null, {text: 'Waiting dependencies to complete'});
        const [existing, codeBuffer, params] = await Promise.all([
            this.getConfig(name),
            this.preparePackage(options.wd, options.codeEntries),
            properties
        ]);
        waitPropsInformer.done();

        if (params.Role && typeof params.Role !== 'string') {
            params.Role = params.Role.Arn;
        }

        const informerOptions = {};
        if (existing) {
            //function exists
            const results = [];

            if (hasDifferences(params, existing)) {
                results.push(this.updateConfig(params));
            }

            //TODO checking hash is actually useless unless adm-zip stop use current time in entry headers
            const hash = createHash('sha256')
                .update(codeBuffer)
                .digest('base64');

            if (hash !== existing.CodeSha256) {
                results.push(this.updateCode(params.FunctionName, true, {ZipFile: codeBuffer}));
            }

            result = Promise.all(results).then(() => {
                return existing;
            });

            informerOptions.text = 'waiting lambda update';
        } else {
            params.Code = {ZipFile: codeBuffer};
            result = this.create(params);

            informerOptions.text = 'waiting lambda update';
        }

        informGroup.addInformer(result, informerOptions);

        return result;
    }
}

module.exports = Controller;