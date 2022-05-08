import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
const jwt = require('jsonwebtoken');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

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
        const failToVerify = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'not login',
                login: false
            }),
            headers: headers
        } as APIGatewayProxyResult;

        const preToken = event.headers['X-Access-Token'];
        if (preToken == undefined)
            return failToVerify;
        
        const decoded = await verifyToken(preToken);
        if (decoded == undefined)
            return failToVerify;

        const newToken = jwt.sign({email: decoded.email}, process.env.SECRET_KEY, { algorithm: 'HS256', expiresIn: 30 });
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'refresh token',
                login: true
            }),
            headers: { ...headers, 'X-Access-Token': newToken }
        } as APIGatewayProxyResult;
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

async function verifyToken(token: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                console.log(err);
                resolve(undefined);
            } else if (typeof(decoded) != 'string' && decoded != undefined)
                resolve(decoded);
            else
                reject("unexpected decoded type");
        });
    });
    return promise;
}