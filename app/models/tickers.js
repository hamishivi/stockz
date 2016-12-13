'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ticker = new Schema({
    ticker: String
});

module.exports = mongoose.model('Ticker', Ticker);