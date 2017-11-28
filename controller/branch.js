var rest = require('../api/restClient.js');
const url = 'http://contoso-lisa-mobile.azurewebsites.net/tables/BranchTable';

exports.getList = function (callback) {
    rest.httpGetAzure(url, function (error, body) {
        callback(error, body);
    });
};
