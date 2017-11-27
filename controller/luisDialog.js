var builder = require('botbuilder');
var request = require('request');
var md5 = require('MD5');

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d3b35771-e7bd-46fb-83c3-d58c28897e26?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('GetBalance', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            console.log(session.userData["username"]);
            if(!session.userData["username"]) {
                builder.Prompts.text(session, 'It looks like we are not familiar yet. My name is Lisa. What is your user name?');
            } else {
                next();
            }
        },
        function (session, results, next) {
            if (results.response) {
                session.userData["username"] = results.response;
                session.send("It's nice to meet you, " + session.userData["username"] + ".");
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
                    var username = session.userData["username"];
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
                    const choices = ['Yes', 'No'];
                    const card = new builder.ThumbnailCard(session)
                        .text('Do you want to create a new account?')
                        .title('Sorry, no account information has been found.')
                        .buttons(choices.map(choice => new builder.CardAction.imBack(session, choice, choice)));
                    const message = new builder.Message(session)
                        .addAttachment(card);
                    builder.Prompts.choice(session, message, choices);
                }
            });
        }, 
        function (session, results, next) {
            if(results.response.entity === 'Yes') {
                session.replaceDialog("CreateAccount");
            } else {
                session.endConversation("Ok, see you next time!");
            }
            
        }
    ]).triggerAction({
        matches: 'GetBalance'
    });

    bot.dialog('CreateAccount', [
        function (session, args, next) {
            if(session.userData["username"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your user name:');
            } else {
                next();
            }
        },
        function (session, results, next) {
            if(session.userData["username"] === undefined) {
                session.userData["username"] = results.response;
            }
            if(session.conversationData["firstname"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your first name:');
            } else {
                next();
            }
            
        }, 
        function (session, results, next) {
            if(session.conversationData["firstname"] === undefined) {
                session.conversationData["firstname"] = results.response;
            }
            if(session.conversationData["lastname"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your last name:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(session.conversationData["lastname"] === undefined) {
                session.conversationData["lastname"] = results.response;
            }
            if(session.conversationData["email"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your email address:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(session.conversationData["email"] === undefined) {
                session.conversationData["email"] = results.response;
            }
            if(session.conversationData["telephone"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your telephone number:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(session.conversationData["telephone"] === undefined) {
                session.conversationData["telephone"] = results.response;
            }
            if(session.conversationData["password1"] === undefined) {
                builder.Prompts.text(session, 'Please, enter your account password:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(session.conversationData["password1"] === undefined) {
                session.conversationData["password1"] = results.response;
            }
            if(session.conversationData["password2"] === undefined) {
                builder.Prompts.text(session, 'Please, confirm your account password:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            var success = true;
            if(session.conversationData["password2"] === undefined) {
                if(session.conversationData["password1"] === results.response) {
                    session.conversationData["password2"] = results.response;
                } else {
                    session.conversationData["password1"] = undefined;
                    session.send("Your confirmation must be the same as password.");
                    session.replaceDialog("CreateAccount");
                    success = false;
                }
            }
            if(success) {
                if(session.conversationData["birthdate"] === undefined) {
                    builder.Prompts.text(session, 'Please, enter your birth date:');
                } else {
                    next();
                }
            }
        }, 
        function (session, results, next) {
            if(session.conversationData["birthdate"] === undefined) {
                session.conversationData["birthdate"] = results.response;
            }

            var data = '{' + 
            '"username": "' + session.userData["username"] + '",' + 
            '"firstname": "' + session.conversationData["firstname"] + '",' + 
            '"lastname": "' + session.conversationData["lastname"] + '",' + 
            '"email": "' + session.conversationData["email"] + '",' + 
            '"tel": "' + session.conversationData["telephone"] + '",' + 
            '"password": "' + md5(session.conversationData["password1"]) + '",' + 
            '"birthdate": "' + session.conversationData["birthdate"] + '",' + 
            '"balance" : "' + '0' + '"}';

            request({
              headers: {
                'ZUMO-API-VERSION': '2.0.0',
                'Content-Type': 'application/json'
              },
              uri: 'http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable',
              body: data,
              method: 'POST'
            }, function (error, response, body) {
              if(error != null) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log('body:', body);
                session.endConversation("While creating account occurred an error!");
              } else {
                session.endConversation("Account has been successfully created!");
              }
            });
        }
    ]).triggerAction({
        matches: 'CreateAccount'
    });
}