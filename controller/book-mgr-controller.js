const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const log = require('../utils/logger').logger;
const Book  = require('../models/books');

// Controller to get list of books 
const getBooksList = async(req, res, next) => {
    // Get transactionId
    const transactionId = getId();

    log(transactionId, "info", "Request recieved to get all books");

    // Fetching books collection
    try{
        log(transactionId, "info", "Getting books list");
        const collection = await Book.find().exec();
        response(res, transactionId, 200, "success", collection);
    }
    catch (err) {
        log(transactionId, "error", "Error in retriving books");
        response(res, transactionId, 400, "failed", err);
    }
}

// Controller to add new book
const addNewBook = async(req, res, next) => {
    const transactionId = getId();
    // Getting request body
    let requestBody = {...getRequestBody(req)}; 

    log(transactionId, "info", `request recieved to add new book with request body ${JSON.stringify(requestBody)}`);
    
    try{
        log(transactionId, "info", "checking if book already exists");
        // Checking if book already exists in collection
        const collection = await Book.find({ name : requestBody.name }).exec();

        // If book exists in collection sending error response
        if(collection.length > 0){
            log(transactionId, "info", "book already exists");
            response(res, transactionId, 400, "failed", "Book already exists");
            return;
        }
        
        try{
            requestBody['id'] = transactionId;
            const newBook = new Book(requestBody);
            await newBook.save();
            response(res, transactionId, 200, "Success", "Book Added successfully !");
            return;
        }
        catch (err) {
            response(res, transactionId, 400, "Failed", `Error while creating book ${err}`);
            return;
        }
        
    }
    catch (error) {
        log(transactionId, "error", `error adding book ${error}`);
        response(res, transactionId, 400, "failed", error);
        return;
    }
    
} 

// Controller to get book info by Id
const getBookInfoById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    log(transactionId, "info", `Request received to get book info with id : ${id} and checking for book exists`);
    
    const collection = await Book.find({ id }).exec();

    // Check if id exists in bookdb
    if(collection.length > 0){
        log(transactionId, "info", `book with id : ${id} available`);
        response(res, transactionId, 200, "success", collection);
        return;
    }

    log(transactionId, "info", `book with id : ${id} not available`);
    // If book not available sending 404 statusCode with error
    response(res, transactionId, 404, "Failed", "Book not available");
}

// Controller to update book info by id
const updateBookById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    let requestBody = getRequestBody(req);

    log(transactionId, "info", `Request received to update book with id : ${id} and request : ${JSON.stringify(requestBody)} and checking if book exists`);

    try{
        let collection = await Book.findOne({ id }).exec();
        // Check if id exists in bookdb
        if(collection != undefined){
            log(transactionId, "info", `Book with id : ${id} exists updating info`);
            if(requestBody[id] != undefined){
                response(res, transactionId, 400, "failed", "Id cannot be updated");
            }

            collection['name'] = requestBody.name;
            collection.save();
            response(res, transactionId, 200, "failed", `Book updated successfully with id : ${id} !`);
        }
        else{
            response(res, transactionId, 400, "failed", `Book does not exists with id : ${id} !`);
            return;
        }
    }
    catch(err){
        response(res, transactionId, 400, "Failed", `Error checking book ${JSON.stringify(err)}`);
    }
}

// Controller to delete book by Id
const deleteBookById = async(req, res, next) => {
    // Get id from param
    let id = req.query.id;

    const transactionId = getId();

    log(transactionId, 'Info', `Request received to delete book with id : ${id}`);
    
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