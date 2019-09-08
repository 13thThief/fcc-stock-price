'use strict';
require('dotenv').config();

var MongoClient = require('mongodb').MongoClient;
let request = require('request');

const CONNECTION_STRING = process.env.DB;

let getPrice = (stock) => {
    let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${process.env.API_KEY}`;
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err)
                return reject(new Error(err));
            let data = JSON.parse(body)['Global Quote'];
            if (data === undefined)
                return reject('No data received');
            let price = data['05. price'];
            resolve(price);
        })
    })
}

let getLikes = (ip, stock, likes) => {

    return new Promise((resolve, reject) => {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
            let col = db.collection('likes');
            if (likes) {
                col
                    .findOneAndUpdate({
                            stock
                        }, {
                            $addToSet: {
                                likes: ip
                            }
                        }, {
                            upsert: true,
                            returnOriginal: false
                        },
                        function(err, doc) {
                            if (err)
                                reject(err);
                            if (doc.value.likes === null || doc.value.likes === undefined)
                                resolve(0);
                            resolve(doc.value.likes.length);
                        }
                    )
            } else {
                col
                    .find({
                        stock
                    })
                    .toArray(function(err, arr) {
                        if (arr.length === 0)
                            return resolve(0)
                        resolve(arr[0].likes.length);
                    })
            }
        })
    })
}

module.exports = {
    getPrice,
    getLikes
};