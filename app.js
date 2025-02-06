const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user-routes');

const app = express();

app.listen(5000);

app.use(bodyParser.json());

app.use('/api/users', userRoutes);

app.get('/',(req, res, next) => {
    res.send({"message" : "APP is running"});
});