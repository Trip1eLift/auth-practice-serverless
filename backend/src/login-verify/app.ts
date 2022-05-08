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
    "Access-Control-Allow-Headers": "Content-Type,x-access-token",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Expose-Headers": "Content-Type,x-access-token"
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    if (event.httpMethod == "OPTIONS") {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'preflight'
            }),
            headers: headers
        };
        return response;
    }
    
    try {
        const token = event.headers['x-access-token']!;
        const decoded = await verifyToken(token);

        if (decoded) {
            const token = jwt.sign({email: decoded.email!}, process.env.SECRET_KEY!, { algorithm: 'HS256', expiresIn: 30 });
            response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'refresh token',
                    login: true
                }),
                headers: { ...headers, 'x-access-token': token }
            };
        } else {
            response = {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'not login',
                    login: false
                }),
                headers: headers
            };
        }
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
                login: false,
                error: err
            }),
            headers: headers
        };
    }
    return response;
};

async function verifyToken(token: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
            if (!err && typeof(decoded) != 'string')
                resolve(decoded!)
            else
                reject(false);
        });
    });
    return promise;
}