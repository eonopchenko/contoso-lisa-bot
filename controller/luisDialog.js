var builder = require('botbuilder');

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6dbfd07b-5564-4db1-9508-7f04933f66c3?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('GetBalance', function (session, args) {
        session.send("Balance requested!");
    }).triggerAction({
        matches: 'GetBalance'
    });
}