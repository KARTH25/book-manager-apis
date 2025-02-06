const express = require('express');
const { logger } = require('../utils/logger');
const { MongoClient } = require('mongodb'); 

const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.10"

const createUser = async (req, res, next) => {
    let request = req.body;
    logger("info",`Request for create new user recieved with email : ${request.email}`);
    const client = new MongoClient(url);
    try{
        await client.connect();
        let db = client.db('spotify_db');
        let collections = db.collection('user').insertOne(request);
        res.send({"message" : "user created successfully!"})
    }
    catch{
        res.status(403);
        res.send({"message" : "Error creating user"});
    }finally{
        setTimeout(() => client.close(), 1000);
    }
    
}

const checkIfUserNameExists = async (req, res, next) => {
    let request = req.body;

    logger("Info",`Request received for checking userName : ${request.userName} already exists`);

    const client = new MongoClient(url);

    try{
        await client.connect();
        let db = client.db('spotify_db');
        let collections = db.collection('user').find({ userName : { $regex : request.userName }  });
        let result = await collections.toArray();
        if(result.length > 0){
            logger("Info",`Username ${request.userName} already exists`);
            res.status(409);
            res.send({ "message" : `Username ${request.userName} already exists` });
        }   
        else{
            logger("Info",`Username ${request.userName} available`);
            res.send({ "message" : `Username : ${request.userName} available` });
        }
    }
    catch{
        res.send({ "message" : `Error trying to check ${request.userName} username already exists` });
    }
    finally{
        setTimeout(() => client.close(), 1000);
    }
}

exports.createUser = createUser;

exports.checkIfUserNameExists = checkIfUserNameExists;