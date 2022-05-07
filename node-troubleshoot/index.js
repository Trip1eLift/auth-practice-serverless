import AWS from 'aws-sdk';
import express from 'express';

AWS.config.update({
    region: 'us-east-1'
});

const DynamoDB = AWS.DynamoDB;

const ddb = new DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: 'http://localhost:8000'
});

async function showUsers() {
    const params = {
        TableName: 'users'
    };
    return ddb.scan(params).promise();
}

console.log(await showUsers());

const app = express();
const port = 8081;

app.get("/health", (req, res) => {
    console.log("Hit");
    res.send({message: "Healthy"});
});

const server = app.listen(port, () => {
    console.log("Listening on port:", port);
});