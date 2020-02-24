const dbService = require('./dbService');

module.exports.handler = async(event, context) => {
    const {body, path, method} = event;

    try {
        if (method === 'GET') {
            if (_isEmpty(path)) {
                return dbService.getAllBooks();
            } else {
                return dbService.getOneBook(path.bookUUID);
            }
        }

        if (method === 'POST') {
            const {bookUUID, operationType} = path;
            if (_isEmpty(body) && operationType === 'update') {
                return context.fail(new Error('Body should be provided'));
            }

            if (operationType) {
                const method = operationType === 'update' ? 'updateBook' : 'deleteBook';
                return dbService[method](bookUUID, body);
            } else {
                return dbService.createBook(body);
            }
        }
    } catch (error) {
        return context.fail(error);
    }
};

/* Helpers */
const _isEmpty = (item) => !Object.keys(item).length;
