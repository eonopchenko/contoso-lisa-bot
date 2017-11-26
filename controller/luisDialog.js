var builder = require('botbuilder');
var request = require('request');

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6dbfd07b-5564-4db1-9508-7f04933f66c3?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('GetBalance', function (session, args) {

        request({
            headers: {
              'ZUMO-API-VERSION': '2.0.0',
              'Content-Type': 'application/json'
            },
            uri: 'http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable',
            method: 'GET'
          }, function (error, response, body) {
            var success = false;
            if(error != null) {
              console.log('error:', error);
              console.log('statusCode:', response && response.statusCode);
              console.log('body:', body);
            } else {
              var customers = JSON.parse(body);
              for(var index in customers) {
                if(customers[index].username == "eugene") {
                  success = true;
                  session.send("Your balance is $" + customers[index].balance + ".");
                  break;
                }
              }
            }

            if(!success) {
                session.send("Sorry, no data found about your account. Do you want to open a new one?");
            }
          });
    }).triggerAction({
        matches: 'GetBalance'
    });
}