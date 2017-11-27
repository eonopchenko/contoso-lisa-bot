var builder = require('botbuilder');
var request = require('request');
var md5 = require('MD5');

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d3b35771-e7bd-46fb-83c3-d58c28897e26?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);
    
    bot.dialog('Welcome', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(!session.userData["username"]) {
                builder.Prompts.text(session, 'Please, enter your user name:');
            } else {
                session.send('Welcome back, ' + session.userData["username"]);
                next();
            }
        },
        function (session, results, next) {
            if (results.response) {
                session.userData["username"] = results.response;
            }
            
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
                            session.conversationData["password"] = customers[index].password;
                            success = true;
                            break;
                        }
                    }
                }
                if(success) {
                    builder.Prompts.text(session, 'Please, enter your account password:');
                } else {
                    const choices = ['Yes', 'No'];
                    const card = new builder.ThumbnailCard(session)
                        .text('Do you want to create a new account?')
                        .title('It looks like you are not registered yet.')
                        .buttons(choices.map(choice => new builder.CardAction.imBack(session, choice, choice)));
                    const message = new builder.Message(session)
                        .addAttachment(card);
                    builder.Prompts.choice(session, message, choices);
                }
            });
        },
        function (session, results, next) {
            if(results.response.entity) {
                if(results.response.entity === 'Yes') {
                    session.replaceDialog("CreateAccount");
                }
            } else {
                if (session.conversationData["password"] == md5(results.response)) {
                    session.send('Great, what to do next?');
                } else {
                    session.send('Sorry, but it seems like the entered password is incorrect. Please, try once again.');
                    session.replaceDialog("Welcome");
                }
            }
        }
    ]).triggerAction({
        matches: 'Welcome'
    });

    bot.dialog('GetBalance', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(!session.userData["username"]) {
                builder.Prompts.text(session, 'It looks like we are not familiar yet. My name is Lisa. What is your user name?');
            } else {
                next();
            }
        },
        function (session, results, next) {
            if (results.response) {
                session.userData["username"] = results.response;
                session.send("Hi, " + session.userData["username"] + "!");
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

    bot.dialog('DeleteAccount', [
        function (session, args, next) {
            request({
                headers: {
                  'ZUMO-API-VERSION': '2.0.0',
                  'Content-Type': 'application/json'
                },
                uri: 'http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable',
                method: 'GET'
            }, function (error, response, body) {
                if(error != null) {
                    console.log('error:', error);
                    console.log('statusCode:', response && response.statusCode);
                    console.log('body:', body);
                } else {
                    var username = session.userData["username"];
                    var id = "";
                    var customers = JSON.parse(body);
                    for(var index in customers) {
                        if(customers[index].username == username) {
                            id = customers[index].id;
                            break;
                        }
                    }
                    if(id != "") {
                        request(
                        {
                            url: "http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable/" + id,
                            method: 'DELETE',
                            headers: {
                                'ZUMO-API-VERSION': '2.0.0',
                                'Content-Type':'application/json'
                            }
                        }, function (error, response, body) {
                            session.userData["username"] = undefined;
                            session.endConversation("Account has been successfully removed!");
                        });
                    }
                }
            });
        }
    ]).triggerAction({
        matches: 'DeleteAccount'
    });

    bot.dialog('UpdateAccount', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(!session.userData["username"]) {
                builder.Prompts.text(session, 'It looks like we are not familiar yet. My name is Lisa. What is your user name?');
            } else {
                next();
            }
        },
        function (session, results, next) {
            request({
                headers: {
                  'ZUMO-API-VERSION': '2.0.0',
                  'Content-Type': 'application/json'
                },
                uri: 'http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable',
                method: 'GET'
            }, function (error, response, body) {
                if(error != null) {
                    console.log('error:', error);
                    console.log('statusCode:', response && response.statusCode);
                    console.log('body:', body);
                } else {
                    session.conversationData["id"] = "";
                    var username = session.userData["username"];
                    var customers = JSON.parse(body);
                    for(var index in customers) {
                        if(customers[index].username == username) {
                            session.conversationData["id"] = customers[index].id;
                            break;
                        }
                    }
                    if(session.conversationData["id"] === "") {

                    } else {
                        const choices = ['First Name', 'Last Name', 'Email', 'Telephone', 'Password', 'Birth Date'];
                        const card = new builder.ThumbnailCard(session)
                            .text('Please, select and option.')
                            .title(session.userData["username"] + ', what field would you like to update?')
                            .buttons(choices.map(choice => new builder.CardAction.imBack(session, choice, choice)));
                        const message = new builder.Message(session)
                            .addAttachment(card);
                        builder.Prompts.choice(session, message, choices);
                    }
                }
            });
        }, 
        function (session, results, next) {
            const choices1 = ['First Name', 'Last Name', 'Email', 'Telephone', 'Password', 'Birth Date'];
            const choices2 = ['firstname', 'lastname', 'email', 'tel', 'password', 'birthdate'];
            session.conversationData["toupdate"] = choices2[choices1.indexOf(results.response.entity)];
            builder.Prompts.text(session, 'Please, enter a new value of ' + results.response.entity + ":");
        }, 
        function (session, results, next) {
            session.conversationData["newvalue"] = results.response;
            if(session.conversationData["toupdate"] === "password") {
                builder.Prompts.text(session, 'Please, confirm your account password:');
            } else {
                next();
            }
        },
        function (session, results, next) {
            var toupdate = session.conversationData["toupdate"];
            var newvalue = session.conversationData["newvalue"];
            if((toupdate === "password") && (newvalue != results.response)) {
                session.send("Your confirmation must be the same as password.");
                session.replaceDialog("UpdateAccount");
            } else {
                var data = '{"' + toupdate + '": "' + (toupdate === "password" ? md5(newvalue) : newvalue) + '"}';

                request(
                {
                    url: "http://contoso-lisa-mobile.azurewebsites.net/tables/CustomerTable/" + session.conversationData["id"],
                    body: data,
                    method: 'PATCH',
                    headers: {
                        'ZUMO-API-VERSION': '2.0.0',
                        'Content-Type':'application/json'
                    }
                }, function (error, response, body) {
                    if(error != null) {
                        console.log('error:', error);
                        console.log('statusCode:', response && response.statusCode);
                        console.log('body:', body);
                    } else {
                        session.endConversation("Account has been successfully updated!");
                    }
                });
            }
        }
    ]).triggerAction({
        matches: 'UpdateAccount'
    });

    bot.dialog('GetExchangeRate', [
        function (session, args, next) {
            var sellcurrency = builder.EntityRecognizer.findEntity(args.intent.entities, 'sellcurrency');
            var buycurrency = builder.EntityRecognizer.findEntity(args.intent.entities, 'buycurrency');
            if(sellcurrency && buycurrency) {
                var tosell = sellcurrency.entity.toUpperCase();
                var tobuy = buycurrency.entity.toUpperCase();
                request({
                    uri: 'https://api.fixer.io/latest?base=' + tosell + '&symbols=' + tobuy,
                    method: 'GET'
                }, function (error, response, body) {
                    if(error != null) {
                        console.log('error:', error);
                        console.log('statusCode:', response && response.statusCode);
                        console.log('body:', body);
                    } else {
                        var ratelist = JSON.parse(body);
                        var attachment = [];
                        attachment.push(
                            new builder.ThumbnailCard(session)
                            .title(tosell)
                            .text("1 " + tosell + " = " + ratelist.rates[tobuy] + " " + tobuy)
                            .images([builder.CardImage.create(session, "http://fxtop.com/ico/" + sellcurrency.entity.toLowerCase() + ".gif")])
                        );
                        attachment.push(
                            new builder.ThumbnailCard(session)
                            .text("1 " + tobuy + " = " + (1 / ratelist.rates[tobuy]).toFixed(4) + " " + tosell)
                            .images([builder.CardImage.create(session, "http://fxtop.com/ico/" + buycurrency.entity.toLowerCase() + ".gif")])
                        );
                        var message = new builder.Message(session)
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(attachment);
                        session.send(message);
                        session.endConversation("Interbank exchange rate as of " + ratelist.date + " is " + ratelist.rates[tobuy] + " " + tobuy + " for 1 " + tosell + ".");
                    }
                });
            }
        }
    ]).triggerAction({
        matches: 'GetExchangeRate'
    });
    
    bot.dialog('GetBranches', [
        function (session, args, next) {
            request({
                headers: {
                    'ZUMO-API-VERSION': '2.0.0',
                    'Content-Type': 'application/json'
                },
                uri: 'http://contoso-lisa-mobile.azurewebsites.net/tables/BranchTable',
                method: 'GET'
            }, function (error, response, body) {
                if(error != null) {
                    console.log('error:', error);
                    console.log('statusCode:', response && response.statusCode);
                    console.log('body:', body);
                } else {
                    var attachment = [];
                    var branches = JSON.parse(body);
                    for(var index in branches) {
                        var lat = parseFloat(branches[index].lat);
                        var lng = parseFloat(branches[index].lng);
                        var leftlat = lat - 0.0011241;
                        var rightlat = lat + 0.0011242;
                        var leftlng = lng - 0.0016354;
                        var rightlng = lng + 0.0016355;
                        attachment.push(
                            new builder.HeroCard(session)
                            .title(branches[index].name)
                            .subtitle(branches[index].tel)
                            .text(branches[index].address)
                            .images([builder.CardImage.create(session, 
                                "https://dev.virtualearth.net/REST/V1/Imagery/Map/Road?mapArea=" + 
                                leftlat + "," + leftlng + "," + rightlat + "," + rightlng + 
                                "&mapSize=500,280&pp=" + 
                                lat + "," + lng + 
                                ";1;&dpi=1&logo=always&form=BTCTRL&key=Ag42Z8GVwTQmXxTMCJiuvJyBmTZWSE46waBG1rdXHpclnbPtMBpYGdAdN4CXTtlH")])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://www.google.com/maps/place/" + branches[index].address, 'Open Google Map')])
                        );
                    }
                    var message = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(attachment);
                    session.send(message);
                }
            });
        }
    ]).triggerAction({
        matches: 'GetBranches'
    });
}