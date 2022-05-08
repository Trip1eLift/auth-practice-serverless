import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS, { DynamoDB } from 'aws-sdk';
const bcrypt = require('bcrypt');

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
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Expose-Headers": "Content-Type"
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
        if (Object.keys(await getEmail("master@ctpc.com")).length == 0) {
            await insertUser("master@ctpc.com", "admin", "Joseph", "hardpassword", new Date(1999, 6-1, 9));
        }
        if (Object.keys(await getEmail("eric@ctpc.com")).length == 0) {
            await insertUser("eric@ctpc.com", "admin", "Eric", "strongpassword", new Date(1994, 8-1, 13));
        }
        if (Object.keys(await getEmail("young@ctpc.com")).length == 0) {
            await insertUser("young@ctpc.com", "write", "Young", "superpassword", new Date(1970, 5-1, 31));
        }
        const scanTable = await showUsers();
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'seed data',
                result: scanTable
            }),
            headers: headers
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
                error: err
            }),
            headers: headers
        };
    }

    return response;
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

async function insertUser(email: string, accessLevel: string, name: string ,unhashPassword: string, dateOfBirth: Date): Promise<boolean>{
    const promise = new Promise<boolean>(async (resolve, reject) => {
        if (accessLevel !== "admin" && accessLevel !== "write" && accessLevel !== "read") {
            reject("unsupported value for accessLevel");
        }
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'users',
            Item: {
                email: email,
                accessLevel: accessLevel,
                name: name,
                password: await hashPassword(unhashPassword),
                dateOfBirth: dateOfBirth.toDateString()
            }
        };
        ddb.put(params, (err, result) => {
            if (!err) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
    return promise;
}

function hashPassword(unhashPassword: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        bcrypt.hash(unhashPassword, process.env.SECRET_KEY, (err: any, hash: any) => {
            if (err)
                reject(err);
            else
                resolve(hash);
        });
    });
    return promise;
}

async function showUsers(): Promise<any> {
    const params: any = {
        TableName: 'users'
    };
    return ddb.scan(params).promise();
}