var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

let likes;

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {

        test('1 stock', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({
                    stock: 'goog'
                })
                .end(function(err, res) {
                    likes = res.body.stockData.likes || 0;
                    assert.equal(res.status, 200);
                    assert.isString(res.body.stockData.stock);
                    assert.isString(res.body.stockData.price);
                    assert.isNumber(res.body.stockData.likes);
                    done();
                });
        });

        test('1 stock with like', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({
                    stock: 'goog',
                    likes: true
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.likes, likes);
                    done();
                });
        });

        test('1 stock with like again (ensure likes arent double counted)', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({
                    stock: 'goog',
                    like: true
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.likes, likes);
                    done();
                });
        });

        test('2 stocks', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({
                    stock: ['amzn', 'tsla']
                })
                .end(function(err, res) {
                    const data = res.body;
                    assert.equal(res.status, 200);
                    assert.isArray(data.stockData);
                    assert.equal(data.stockData[0].stock, 'AMZN');
                    assert.equal(data.stockData[1].stock, 'TSLA');
                    assert.isString(data.stockData[0].price);
                    assert.isString(data.stockData[1].price);
                    assert.equal(data.stockData[0].rel_likes, 0);
                    assert.equal(data.stockData[1].rel_likes, 0);
                    done();
                });
        });

        test('2 stocks with like', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({
                    stock: ['amzn', 'tsla'],
                    like: true
                })
                .end(function(err, res) {
                    const data = res.body;
                    assert.equal(res.status, 200);
                    assert.isArray(data.stockData);
                    assert.equal(data.stockData[0].stock, 'AMZN');
                    assert.equal(data.stockData[1].stock, 'TSLA');
                    assert.isString(data.stockData[0].price);
                    assert.isString(data.stockData[1].price);
                    assert.equal(data.stockData[0].rel_likes, 0);
                    assert.equal(data.stockData[1].rel_likes, 0);
                    done();
                });
        });

    });

});
