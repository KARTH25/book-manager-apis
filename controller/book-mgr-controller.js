const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const log = require('../utils/logger').logger;

// Controller to get list of books 
const getBooksList = async(req, res, next) => {
    
    const transactionId = getId();

    log(transactionId, "info", "Request recieved to get all books");

    // Initializing client and db
    const { client, db } = await initializeClient(transactionId, 'book-db');

    // Fetching books collection
    try{
        log(transactionId, "info", "Getting books list");
        const collection = await db.collection('books').find().toArray();
        response(res, transactionId, 200, "success", collection);
    }
    catch (err) {
        log(transactionId, "error", "error in retriving books");
        response(res, transactionId, 400, "failed", err);
    }
    finally {
       log(transactionId, "info", "closing connection");
       setTimeout(() => { client.close() }, 1000);
    }
}

// Controller to add new book
const addNewBook = async(req, res, next) => {
    const transactionId = getId();
    // Getting request body
    let requestBody = {...getRequestBody(req)}; 

    log(transactionId, "info", `request recieved to add new book with request body ${JSON.stringify(requestBody)}`);

    // Initializing client
    const { client, db } = await initializeClient(transactionId, 'book-db')
    
    try{
        log(transactionId, "info", "checking if book already exists");
        // Checking if book already exists in collection
        const collection = await db.collection('books').find({ name : requestBody.name }).toArray();

        // If book exists in collection sending error response
        if(collection.length > 0){
            log(transactionId, "info", "book already exists");
            response(res, transactionId, 400, "failed", "Book already exists");
            return;
        }

        // If book not exists in collection generating uuid
        const uuid = getId();
        // Adding uuid to request body
        requestBody['id'] = uuid;
        // 
        db.collection('books').insertOne(requestBody).then(result => {
            log(transactionId, "info", `book added successfully with id : ${uuid}`);
            response(res, transactionId, 200, "success", "book created successfully");
            client.close();
        });
    }
    catch (error) {
        log(transactionId, "error", `error adding book ${error}`);
        response(res, transactionId, 400, "failed", error);
        client.close();
    }
    
} 

// Controller to get book info by Id
const getBookInfoById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    log(transactionId, "info", `Request received to get book info with id : ${id}`);

    const { client, db } = await initializeClient(transactionId, 'book-db');

    log(transactionId, "info", `Checking for book with id : ${id} exists`);
    
    const collection = await db.collection('books').find({ id : id }).toArray();

    // Check if id exists in bookdb
    if(collection.length > 0){
        log(transactionId, "info", `book with id : ${id} available`);
        response(res, transactionId, 200, "success", collection);
        client.close();
        return;
    }

    log(transactionId, "info", `book with id : ${id} not available`);
    // If book not available sending 404 statusCode with error
    response(res, transactionId, 404, "Failed", "Book not available");
    client.close();
}

// Controller to update book info by id
const updateBookById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    let requestBody = getRequestBody(req);

    log(transactionId, "info", `Request received to update book with id : ${id} and request : ${JSON.stringify(requestBody)}`);

    const { client, db } = await initializeClient(transactionId, 'book-db');

    if(requestBody['id'] != undefined){
        response(res, transactionId, 400, "failed", "id cannot be updated")
    }

    log(transactionId, "info", `Checking for book with id : ${id} exists`);

    const collection = await db.collection('books').find({ id }).toArray();

    // Check if id exists in bookdb
    if(collection.length > 0){
        log(transactionId, "info", `Book with id : ${id} exists updating info`);;
        let info = {...collection[0], ...requestBody};
        await db.collection('books').updateOne({ id },{ $set : info });
        response(res, transactionId, 200, "success", "book updated successfully !");
        return;
    }

    response(res, transactionId, 400, "failed", `Book not found with id : ${id}`)
}

// Controller to delete book by Id
const deleteBookById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    log(transactionId, 'Info', `Request received to delete book with id : ${id}`);
    
    const { client, db } = await initializeClient(transactionId, 'book-db');

    try{
        log(transactionId, 'Info', `Checking if book with id : ${id} exists`);

        const collection = await db.collection('books').find({ id }).toArray();

        if(collection.length > 0){
            db.collection('books').deleteOne({ id });
            response(res, transactionId, 200, 'success', 'Book deleted successfully');
            return;
        }

        response(res, transactionId, 400, 'failed', 'Book not available');
        client.close();
    }
    catch (error) {
        response(res, transactionId, 400, 'failed', error);
        client.close();
    }
}

// Method to get unique id for books
const getId = () => {
    return uuidv4();
}

// Method to get request body
const getRequestBody = (req) => {
    return req.body;
}

// Method to initialize MongoClient
const initializeClient = async(transactionId, dbName) => {
    log(transactionId, "info", "initializing client");
    const connection_string = "mongodb://localhost:27017/";
    const client = new MongoClient(connection_string);
    await client.connect();
    return  ({ client, db : client.db(dbName) });
}

const response = (res, transactionId, statusCode, status, description) => {
    log(transactionId, "info", `sending response with statusCode ${statusCode} with description ${JSON.stringify(description)}`)
    res.status(statusCode);
    res.send({ status, description })
}

exports.getBooksList = getBooksList;
exports.getBookInfoById = getBookInfoById;
exports.addNewBook = addNewBook;
exports.updateBookById = updateBookById;
exports.deleteBookById = deleteBookById;