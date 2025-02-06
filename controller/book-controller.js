const express = require('express');

const list = async(req, res, next) => {
    const books = [
        {
            id : 1,
            name : "book1",
            author : "Author"
        },
        {
            id : 2,
            name : "book2",
            author : "Author"
        }
    ]
    res.send(books);
}

exports.list = list;