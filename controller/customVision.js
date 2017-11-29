var rest = require('../api/restClient.js');

exports.recognizeBanknote = function (url, callback) {
    rest.httpPost('https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/6e668d98-02c5-4250-8383-9e41b70b89ea/url?iterationId=c750597e-265f-459d-8c91-809932a3d195', 
    {
        'Content-Type': 'application/json',
        'Prediction-Key': '97989a77a61f41909808f50b9ab66ba9'
    }, 
    { "Url": url },
    function (error, body) {
        callback(error, body);
    });
}