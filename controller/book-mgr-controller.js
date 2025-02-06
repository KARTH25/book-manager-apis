const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;

const connection_string = "mongodb://localhost:27017/";

let bookDb = {};

// Controller to get list of books 
const getBooksList = async(req, res, next) => {
    const client = new MongoClient(connection_string);
    try{
        await client.connect();
        const db = client.db('book-db');
        const collection = db.collection('books').find();
        const data = await collection.toArray();
        res.send(data);
    }
    catch (err) {
        res.send({ "status" : "failure", "description" : err });
    }
    finally {
        client.close();
    }
}

// Controller to add new book
const addNewBook = async(req, res, next) => {
    // Getting request body
    let requestBody = {...getRequestBody(req)}; 
    const client = new MongoClient(connection_string);
    /*
    // Check if already book name exists
    let checkIfBookExists = Object.values(bookDb).filter(book => book.name.toLowerCase() == requestBody.name.toLowerCase());
    // If Book exists returning 404 with error message
    if(checkIfBookExists.length > 0){
        res.status(400);
        res.json({ status : "Failed", description : "Book Already exists" });
    }
    // If book not exists generating new Id and adding to request
    let uuid = getId();

    requestBody['id'] = uuid;
    // Adding to bookdb
    bookDb[uuid] = requestBody;
    // returning response with newly generated book id
    res.json({ status : "Success", description : `Book Added Successfully with id : ${uuid} !` });
    */

    try{
        await client.connect();
        
        const db = client.db('book-db');

        const collection = db.collection('books').find({ name : requestBody.name });

        const checkIfBookExists = await collection.toArray();

        if(checkIfBookExists.length > 0){
            res.status(400);
            res.send({ "status" : "failed", "description" : "Book Already Exists" });
        }

        const uuid = getId();

        requestBody['id'] = uuid;

        db.collection('books').insertOne(requestBody).then(result => {
            res.send({ "status" : "success", "description" : `book created successfully with id : ${uuid}` });
            client.close();
        });
    }
    catch (error) {
        res.send({ "status" : "failed", "description" : error });
        client.close();
    }
    
} 

// Controller to get book info by Id
const getBookInfoById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;
    // Check if id exists in bookdb
    if(bookDb[id] != undefined){
        res.json(bookDb[id]);
    }
    // If book not available sending 404 statusCode with error
    res.status(404);
    res.send({"status" : "Failed", "description" : "Book Not Available"});
}

// Controller to update book info by id
const updateBookById = (req, res, next) => {
    // Get id from param
    let id = req.query.id;
    let requestBody = getRequestBody(req);

    if(requestBody['id'] != undefined){
        res.send({ "status" : "failed", "description" : "Id cannot be updated" })
    }

    // Check if id exists in bookdb
    if(bookDb[id] != undefined){
        bookDb[id] = {...bookDb[id], ...requestBody};
        res.send({ "status" : "success", "description" : "book updated successfully !" });
    }

    res.status(404);
    res.send({ "status" : "failed", "description" : `Book not found with id : ${id}` });
}

// Controller to delete book by Id
const deleteBookById = (req, res, next) => {
    // Get id from param
    let id = req.query.id;
    // Getting list of Ids
    let bookIds = bookDb.map(book => book.id);
    // If ids present
    if(bookIds.includes(id)){
        // Getting the index of id and deleting from bookDb
        let index = bookDb.indexOf(id);
        bookDb.splice(index,1);
        res.send({ "status" : "success", "description" : "Book deleted successfuly" });
    }
    // If book does not exists sending error message
    res.status(404);
    res.send({ "status" : "failed", "description" : "Book does not exists" });
}

// Method to get unique id for books
const getId = () => {
    return uuidv4();
}

// Method to get request body
const getRequestBody = (req) => {
    return req.body;
}

exports.getBooksList = getBooksList;
exports.getBookInfoById = getBookInfoById;
exports.addNewBook = addNewBook;
exports.updateBookById = updateBookById;
exports.deleteBookById = deleteBookById;