import { LambdaIntegration, RestApi, Cors, AuthorizationType } from '@aws-cdk/aws-apigateway';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';
import { Secret } from '@aws-cdk/aws-secretsmanager';

interface Props extends StackProps {
    modelName: string;
    sendMessage: Function;
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        // creating api
        const api = new RestApi(this, `${props.modelName}-api`, {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials']
            },
            restApiName: `${props.modelName}-service`
        });

        // creating secret to store API info for UI
        const secret = new Secret(this, `${props.modelName}-secret`, {
            secretName: "personal-portfolio-ui-env-vars",
            generateSecretString: {
                generateStringKey: 'REACT_APP_API_KEY',
                secretStringTemplate: JSON.stringify({ REACT_APP_API_ENDPOINT: api.url }),
                excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
            },
        });

        const key = api.addApiKey(`${props.modelName}-api-key`, {
            apiKeyName: `api_key`,
            value: secret.secretValueFromJson('REACT_APP_API_KEY').toString(),
        });

        // adding lambda integration to root post method
        const setCreateIntegration = new LambdaIntegration(props.sendMessage);
        const rootMethod = api.root.addMethod('POST', setCreateIntegration, { apiKeyRequired: true });

        // adding usage plan to api key
        const plan = api.addUsagePlan('UsagePlan', {
            name: 'Easy',
            apiKey: key,
            throttle: {
                rateLimit: 4,
                burstLimit: 2
            }
        });

        plan.addApiStage({
            stage: api.deploymentStage,
            throttle: [
                {
                    method: rootMethod,
                    throttle: {
                        rateLimit: 4,
                        burstLimit: 2
                    }
                }
            ]
        });
    }
}
