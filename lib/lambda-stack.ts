import { Construct, Stack, Duration } from '@aws-cdk/core';
import { Function, Runtime, AssetCode } from '@aws-cdk/aws-lambda';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';

export class LambdaStack extends Stack {
    public readonly sendMessage: Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const sendMessage = new Function(this, 'sendMessage', {
            code: new AssetCode('src'),
            handler: 'send-message.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X
        });

        // ses permission
        sendMessage.addToRolePolicy(new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: ['*'],
            effect: Effect.ALLOW,
        }));

        // sharing between stacks
        this.sendMessage = sendMessage;
    }
}
