# auth-practice-serverless
PoC project for authentication and authorization on aws serverless.

## Prerequiste

NPM that's not too old

AWS CLI + SAM CLI

Docker

The backend endpoint to database only works on windows for now.
`Due to: host.docker.internal in backend/template.yaml`

## Procedures:

0. Prerequist: A relatively new version of Node and NPM

1. To install everything
```console
npm run initiate
```

2. To start
```console
npm start
```

3. Visit: http://localhost:3000

## Recommended vscode extension:

1. REST Client: Test it out in `root/backend/http_tests/health.rest` by clicking `Send Request` above line 1.
