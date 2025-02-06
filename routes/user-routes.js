const { Router } = require('express');
const userController = require('../controller/user-controller');

const routes = Router();

routes.post('/create',userController.createUser);

routes.post('/checkUserName', userController.checkIfUserNameExists);

module.exports = routes;