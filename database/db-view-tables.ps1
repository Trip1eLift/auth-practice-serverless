aws dynamodb list-tables --endpoint-url http://localhost:8000

aws dynamodb scan  --table-name users  --endpoint-url http://localhost:8000

aws dynamodb scan  --table-name posts  --endpoint-url http://localhost:8000

aws dynamodb get-item --table-name users --key '{ \"email\": {\"S\": \"master@cptc\"} }'