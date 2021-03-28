import { LambdaIntegration, RestApi, Cors, } from '@aws-cdk/aws-apigateway';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';

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
            restApiName: `${props.modelName}-service`,
        });

        const setCreateIntegration = new LambdaIntegration(props.sendMessage);
        api.root.addMethod('POST', setCreateIntegration)
    }
}
