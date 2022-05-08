import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS, { DynamoDB } from 'aws-sdk';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

AWS.config.update({
    region: process.env.REGION
});

const ddb = new DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: process.env.DYNAMODB_ENDPOINT
});

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Access-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Expose-Headers": "Content-Type,X-Access-Token"
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod == "OPTIONS") {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'preflight'
            }),
            headers: headers
        } as APIGatewayProxyResult;
    }
    
    try {
        const failToLogin = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'email or password do not match any account',
                login: false
            }),
            headers: headers
        } as APIGatewayProxyResult;

        if (event.body == undefined)
            return failToLogin;
        const payload = JSON.parse(event.body!);
        const email = payload.email;
        const password = payload.password;
        if (email == undefined || password == undefined)
            return failToLogin;
        const result = await getEmail(email);
        if (result.Item == undefined)
            return failToLogin;
        const hashedPassword = result.Item.password;
        
        if (bcrypt.compareSync(password + process.env.SECRET_KEY, hashedPassword)) {
            const token = jwt.sign({email: result.Item.email, accessLevel: result.Item.accessLevel, name: result.Item.name}, process.env.SECRET_KEY, { algorithm: 'HS256', expiresIn: 30 });
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'login',
                    login: true,
                    email: result.Item.email,
                    name: result.Item.name,
                    accessLevel: result.Item.accessLevel,
                    dateOfBirth: result.Item.dateOfBirth
                }),
                headers: { ...headers, 'X-Access-Token': token }
            } as APIGatewayProxyResult;
        } else {
            return failToLogin;
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
                login: false,
                error: err
            }),
            headers: headers
        } as APIGatewayProxyResult;
    }
};

async function getEmail(email: string): Promise<DynamoDB.DocumentClient.GetItemOutput> {
    const promise = new Promise<DynamoDB.DocumentClient.GetItemOutput>((resolve, reject) => {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: 'users',
            Key: {
                email: email
            }
        };
        ddb.get(params, (err, result) => {
            if (!err) {
                resolve(result);
            } else {
                reject(err);
            }
        })
    });
    return promise;
}