const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const bookManagerRoutes = require('./routes/book-mgr-routes');

const connection_string = "mongodb://localhost:27017/";

const app = express();

app.use(bodyParser.json());

app.use('/books', bookManagerRoutes);

app.get('',(req, res, next) => {
    res.send({"status" : "book mgr running !"})
})

mongoose.connect(connection_string).then(() => {
    app.listen(5000);
}).catch(err => {
    console.log('Server not started', err);
})