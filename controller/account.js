var rest = require('../api/restclient.js');
const url = 'http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable';

/**
 * Requests current balance, using REST client
 * @param[in]  username  
 * @param[in]  callback  
 */
exports.getBalance = function (username, callback) {
    rest.httpGetCustomers(url, function (error, body) {
        if (error) {
            callback(error, -1);
        } else {
            var customers = JSON.parse(body);
            var balance = -1;
            for (var index in customers) {
                if (customers[index].username == username) {
                    balance = customers[index].balance;
                    break;
                }
            }
            callback(error, balance);
        }
    });
};

exports.getPassword = function (username, callback) {
    rest.httpGetCustomers(url, function (error, body) {
        if (error) {
            callback(error, "");
        } else {
            var customers = JSON.parse(body);
            var password = "";
            for (var index in customers) {
                if (customers[index].username == username) {
                    password = customers[index].password;
                    break;
                }
            }
            callback(error, password);
        }
    });
};

exports.getId = function (username, callback) {
    rest.httpGetCustomers(url, function (error, body) {
        if (error) {
            callback(error, "");
        } else {
            var customers = JSON.parse(body);
            var id = "";
            for (var index in customers) {
                if (customers[index].username == username) {
                    id = customers[index].id;
                    break;
                }
            }
            callback(error, id);
        }
    });
};

exports.create = function (data, callback) {
    rest.httpPostCustomers(url, data, function (error) {
        callback(error);
    });
};

exports.delete = function (username, callback) {
    rest.httpGetCustomers(url, function (error, body) {
        if (error) {
            callback(error, "");
        } else {
            var customers = JSON.parse(body);
            var id = "";
            for (var index in customers) {
                if (customers[index].username == username) {
                    id = customers[index].id;
                    break;
                }
            }
            if(id == "") {
                callback(error, id);
            } else {
                rest.httpDeleteCustomers(url + '/' + id, function (error) {
                    callback(error, id);
                });
            }
        }
    });
};

exports.update = function (id, data, callback) {
    rest.httpPatchCustomers(url + '/' + id, data, function (error) {
        callback(error);
    })
};
