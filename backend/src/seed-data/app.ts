import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS, { DynamoDB } from 'aws-sdk';
import crypto from 'crypto';

AWS.config.update({
    region: process.env.REGION
});

const ddb = new DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: process.env.DYNAMODB_ENDPOINT
});

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    console.log(process.env.SECRET_KEY);
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
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
                error: err
            }),
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
                console.log(result);
                resolve(result);
            } else {
                reject(err);
            }
        })
    });
    return promise;
}

async function insertUser(email: string, accessLevel: string, name: string ,unHashPassword: string, dateOfBirth: Date): Promise<boolean>{
    const promise = new Promise<boolean>((resolve, reject) => {
        if (accessLevel !== "admin" && accessLevel !== "write" && accessLevel !== "read") {
            reject("unsupported value for accessLevel");
        }
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: 'users',
            Item: {
                email: email,
                accessLevel: accessLevel,
                name: name,
                password: hashPassword(unHashPassword),
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

function hashPassword(unHashPassword: string): string {
    return crypto.scryptSync(unHashPassword, process.env.SECRET_KEY || "super_salt", 64).toString('hex');
}

function compareHash(unHashPassword: string, hashPassword: string): boolean{
    return hashPassword == (crypto.scryptSync(unHashPassword, process.env.SECRET_KEY || "super_salt", 64).toString('hex'));
}

async function showUsers(): Promise<any> {
    const params: any = {
        TableName: 'users'
    };
    return ddb.scan(params).promise();
}