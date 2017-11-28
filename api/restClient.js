var request = require('request');

exports.httpGetCustomers = function (url, callback) {
    request({
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type': 'application/json'
        },
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error, body);
    });
};

exports.httpPostCustomers = function (url, data, callback) {
    request({
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type': 'application/json'
        },
        url: url,
        body: data,
        method: 'POST'
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error);
    });
};

exports.httpDeleteCustomers = function (url, callback) {
    request(
        {
            headers: {
                'ZUMO-API-VERSION': '2.0.0',
                'Content-Type':'application/json'
            },
            url: url,
            method: 'DELETE'
        }, function (error, response, body) {
            if (error) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log('body:', body);
            }

            callback(error);
        });
};

exports.httpPatchCustomers = function (url, data, callback) {
    request(
    {
        url: url,
        body: data,
        method: 'PATCH',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        }
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error);
    });
};