var request = require('request');

exports.httpGetAzure = function (url, callback) {
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

exports.httpPostAzure = function (url, data, callback) {
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

exports.httpDeleteAzure = function (url, callback) {
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

exports.httpPatchAzure = function (url, data, callback) {
    request(
    {
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        },
        url: url,
        body: data,
        method: 'PATCH'
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error);
    });
};

exports.httpGet = function (url, callback) {
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error, body);
    })
};

exports.httpPost = function (url, headers, body, callback) {
    request({
        uri: url,
        json: true,
        headers: headers,
        body: body,
        method: 'POST'
    }, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }

        callback(error, body);
    })
};