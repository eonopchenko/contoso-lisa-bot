var builder = require('botbuilder');
var request = require('request');

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d3b35771-e7bd-46fb-83c3-d58c28897e26?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('GetBalance', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(!session.conversationData["username"]) {
                builder.Prompts.text(session, 'It looks like we are not familiar yet. My name is Lisa. What is your name?');
            } else {
                next();
            }
        },
        function (session, results, next) {
            if (results.response) {
                session.conversationData["username"] = results.response;
                session.send("It's nice to meet you, " + session.conversationData["username"] + ".");
            }

            session.send("Balance request in progress...");

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
                    var username = session.conversationData["username"];
                    var customers = JSON.parse(body);
                    for(var index in customers) {
                        if(customers[index].username == username) {
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
        }
    ]).triggerAction({
        matches: 'GetBalance'
    });
}