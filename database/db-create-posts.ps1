aws dynamodb create-table `
    --table-name posts `
    --key-schema `
        AttributeName=post_id,KeyType=HASH `
        AttributeName=dateFirstPost,KeyType=RANGE `
    --global-secondary-indexes `
        '[
            {
                \"IndexName\": \"pageSectionIndex\",
                \"KeySchema\": [{\"AttributeName\":\"pageSection\",\"KeyType\":\"HASH\"}],
                \"Projection\":{
                    \"ProjectionType\":\"INCLUDE\",
                    \"NonKeyAttributes\":[\"post_id\"]
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 10,
                    \"WriteCapacityUnits\": 5
                }
            }
        ]' `
    --attribute-definitions `
        AttributeName=post_id,AttributeType=S `
        AttributeName=dateFirstPost,AttributeType=S `
        AttributeName=pageSection,AttributeType=S `
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 `
    --endpoint-url http://localhost:8000