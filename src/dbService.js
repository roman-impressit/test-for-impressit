const uuid = require('uuid').v1;
const config = require('../const');
const AWS = require('aws-sdk');

const TABLE_NAME = config.DB.TABLE_NAME;

const awsConfigs = {
    region: config.AWS.REGION,
    endpoint: config.DB.ENDPOINT
};
AWS.config.update(awsConfigs);
const docClient = new AWS.DynamoDB.DocumentClient();

/* CREATE UPDATE AND DELETE ITEMS IN DB */
async function createBook(data) {
    try {
        data.bookUUID = uuid();
        data.releaseDate = new Date(data.releaseDate).getTime();

        const params = {
            TableName: TABLE_NAME,
            Item: data
        };
        await docClient.put(params).promise();

        return {
            message: "Item successfully created",
            bookUUID: data.bookUUID
        }
    } catch (err) {
        throw err;
    }
}

async function updateBook(bookUUID, data) {
    try {
        let updateExpression = 'set';
        const expressionAttributeValues = {};
        for (const [key, value] of Object.entries(data)) {
            if (updateExpression !== 'set') {
                updateExpression += ',';
            }

            updateExpression += ` ${key} = :${key}Prop`;
            expressionAttributeValues[`:${key}Prop`] = value;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: {
                bookUUID
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues:"UPDATED_NEW"
        };
        await docClient.update(params).promise();

        return {
            message: "Item successfully updated",
            bookUUID
        }
    } catch (err) {
        throw err;
    }
}

async function deleteBook(bookUUID) {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                bookUUID
            },
            ConditionExpression: "bookUUID = :uuid",
            ExpressionAttributeValues: {
                ":uuid": bookUUID
            }
        };

        await docClient.delete(params).promise();

        return {
            message: "Item successfully deleted",
            bookUUID
        }
    } catch (err) {
        throw err;
    }
}

/* GET ITEMS FROM DB */
async function getAllBooks() {
    try {
        const params = {
            TableName: TABLE_NAME
        };

        return docClient.scan(params).promise();
    } catch (err) {
        throw err;
    }
}

async function getOneBook(bookUUID) {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                bookUUID
            }
        };
        const result = await docClient.get(params).promise();

        return result.Item;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getOneBook,
    getAllBooks,
    updateBook,
    deleteBook,
    createBook
};
