# Tables

## user

Partition key: email (unique)
GSI: accessLevel ["admin", "write", "read"]
Attributes: password (HS256), name, dateOfBirth

## posts

Partition key: post_id (unique)
Sorting key: dateFirstPost
GSI: pageSection (under which page)
Attributes: author, lastModified,  priority (default to 0, if set to higher number, prioritize it while sorting), content (include $tag of pictures that routes to a s3 bucket)