const express = require('express');
const bookRoutes = require('./routes/book-routes');

const app = express();

app.listen(5000);

app.use('/books', bookRoutes);

app.get('',(req, res, next) => {
    res.json({"status" : "server running !"});
})