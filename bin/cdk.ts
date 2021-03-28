#!/usr/bin/env node

import * as cdk from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const modelName = 'personal-portfolio';

const lambdaStack = new LambdaStack(app, `${modelName}-lambda-stack`);

new ApiStack(app, `${modelName}-api-stack`, { sendMessage: lambdaStack.sendMessage, modelName });
