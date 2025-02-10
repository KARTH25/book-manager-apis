const { Router } = require('express');
const bookController = require('../controller/book-mgr-controller');

const routes = Router();

routes.get('/list', bookController.getBooksList);
routes.post('/add', bookController.addNewBook);
routes.get('/info', bookController.getBookInfoById);
routes.put('/update', bookController.updateBookById);
routes.delete('/delete', bookController.deleteBookById);
module.exports = routes;