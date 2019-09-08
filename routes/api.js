'use strict';

require('dotenv').config();

var MongoClient = require('mongodb').MongoClient;
let request = require('request');

const CONNECTION_STRING = process.env.DB;

let controller = require('../controllers/stockHandler');

module.exports = function(app) {

    app.route('/api/stock-prices')
        .get(function(req, res) {
            let stock = req.query.stock;
            if (!stock) return res.sendStatus(400);
            let like = req.query.like || false;
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            // Single stock
            if (typeof stock === 'string') {
                stock = stock.toUpperCase();
                // Fire up the async process
                let pricePromise = controller.getPrice(stock);
                let likesPromise = controller.getLikes(ip, stock, like);
                Promise.all([pricePromise, likesPromise])
                    .then(values => {
                        res.json({
                            stockData: {
                                stock,
                                price: values[0],
                                likes: values[1]
                            }
                        })
                    })
                    .catch(e => {
                        console.error(e);
                        res.sendStatus(500);
                    })
            } else {

                stock[0] = stock[0].toUpperCase();
                stock[1] = stock[1].toUpperCase();

                let firstPrice = controller.getPrice(stock[0]);
                let firstLikes = controller.getLikes(ip, stock[0], like);
                let secondPrice = controller.getPrice(stock[1]);
                let secondLikes = controller.getLikes(ip, stock[1], like);

                Promise.all([firstPrice, firstLikes, secondPrice, secondLikes])
                    .then(values => {
                        console.log(values);
                        res.json({
                            stockData: [{
                                    stock: stock[0],
                                    price: values[0],
                                    rel_likes: values[1] - values[3]
                                },
                                {
                                    stock: stock[1],
                                    price: values[2],
                                    rel_likes: values[3] - values[1]
                                }
                            ]
                        })
                    })
                    .catch(e => {
                        console.error(e);
                        res.sendStatus(500);
                    })
            }

        });
};
