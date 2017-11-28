var rest = require('../api/restClient.js');

exports.getExchangeRate = function (sell, buy, callback) {
    rest.httpGet('https://api.fixer.io/latest?base=' + sell + '&symbols=' + buy, function (error, body) {
        callback(error, body);
    });
};
