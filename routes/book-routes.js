const { Router } = require('express');
const booksController = require('../controller/book-controller');

const routes = Router();

routes.get('/list', booksController.list);

module.exports = routes;
