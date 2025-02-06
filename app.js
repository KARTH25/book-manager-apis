const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const bookManagerRoutes = require('./routes/book-mgr-routes');

const app = express();

app.listen(5000);

app.use(bodyParser.json());

app.use('/books', bookManagerRoutes);

app.get('',(req, res, next) => {
    res.send({"status" : "book mgr running !"})
})