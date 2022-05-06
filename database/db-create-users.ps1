aws dynamodb create-table `
    --table-name users `
    --key-schema `
        AttributeName=email,KeyType=HASH `
    --global-secondary-indexes `
        '[
            {
                \"IndexName\": \"accessLevelIndex\",
                \"KeySchema\": [{\"AttributeName\":\"accessLevel\",\"KeyType\":\"HASH\"}],
                \"Projection\":{
                    \"ProjectionType\":\"INCLUDE\",
                    \"NonKeyAttributes\":[\"email\"]
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 10,
                    \"WriteCapacityUnits\": 5
                }
            }
        ]' `
    --attribute-definitions `
        AttributeName=email,AttributeType=S `
        AttributeName=accessLevel,AttributeType=S `
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 `
    --endpoint-url http://localhost:8000