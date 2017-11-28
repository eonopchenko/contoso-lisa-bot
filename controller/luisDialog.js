var builder = require('botbuilder');
var request = require('request');
var md5 = require('MD5');
var account = require('./account.js');
var branch = require('./branch.js');
var currency = require('./currency.js');

const optionsFull = ['First Name', 'Last Name', 'Email', 'Telephone', 'Password', 'Birth Date'];
const optionsBrief = ['firstname', 'lastname', 'email', 'tel', 'password', 'birthdate'];

function choiceRequest(session, options, title, text) {
    const choices = options;
    const card = new builder.ThumbnailCard(session)
    .text(text)
    .title(title)
    .buttons(choices.map(choice => new builder.CardAction.imBack(session, choice, choice)));
    const message = new builder.Message(session)
    .addAttachment(card);
    builder.Prompts.choice(session, message, choices);
}

function isUserDataSet(session, id) {
    return (session.userData[id] != null) && (session.userData[id] != undefined) && (session.userData[id] != "");
}

function isConversationDataSet(session, id) {
    return (session.conversationData[id] != null) && (session.conversationData[id] != undefined) && (session.conversationData[id] != "");
}

function buildNewAccountJSON(session) {
    return '{' + 
    '"username": "' + session.userData["username"] + '",' + 
    '"firstname": "' + session.conversationData["firstname"] + '",' + 
    '"lastname": "' + session.conversationData["lastname"] + '",' + 
    '"email": "' + session.conversationData["email"] + '",' + 
    '"tel": "' + session.conversationData["telephone"] + '",' + 
    '"password": "' + md5(session.conversationData["password1"]) + '",' + 
    '"birthdate": "' + session.conversationData["birthdate"] + '",' + 
    '"balance" : "' + '0' + '"}';
}

exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d3b35771-e7bd-46fb-83c3-d58c28897e26?subscription-key=81c2b5daa58b4f9fa8a5e7ff4d5591a7&timezoneOffset=0&q=');

    bot.recognizer(recognizer);
    
    bot.dialog('Welcome', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(!isUserDataSet(session, "username")) {
                builder.Prompts.text(session, 'Please, enter your user name:');
            } else {
                session.send('Welcome back, ' + session.userData["username"] + '.');
                next();
            }
        },
        function (session, results, next) {
            if (results.response) {
                session.userData["username"] = results.response;
            }

            session.send("Account data request in progress...");

            account.getPassword(session.userData["username"], function (error, password) {
                if (error) {
                } else {
                    if(password != "") {
                        session.userData["password"] = password;
                        builder.Prompts.text(session, 'Please, enter your account password:');
                    } else {
                        choiceRequest(
                            session, 
                            ['Yes', 'No'], 
                            'Sorry, no account information has been found.', 
                            'Do you want to create a new account?');
                    }
                }
            });
        },
        function (session, results, next) {
            if(results.response.entity) {
                if(results.response.entity === 'Yes') {
                    session.replaceDialog('CreateAccount');
                }
            } else {
                if (session.userData["password"] === md5(results.response)) {
                    session.send('Great, what to do next?');
                } else {
                    session.send('Sorry, but it seems like the entered password is incorrect. Please, try once again.');
                    session.replaceDialog('Welcome');
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
                builder.Prompts.text(session, 'Please, enter your user name:');
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

            account.getBalance(session.userData["username"], function (error, balance) {
                if (error) {
                } else {
                    if(balance == -1) {
                        choiceRequest(
                            session, 
                            ['Yes', 'No'], 
                            'Sorry, no account information has been found.', 
                            'Do you want to create a new account?');
                    } else {
                        session.endConversation(session.userData["username"] + ", your balance is $" + balance + ".");
                    }
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
            if (!isUserDataSet(session, "username")) {
                builder.Prompts.text(session, 'Please, enter your user name:');
            } else {
                next();
            }
        },
        function (session, results, next) {
            if(!isUserDataSet(session, "username")) {
                session.userData["username"] = results.response;
            }
            if(!isConversationDataSet(session, "firstname")) {
                builder.Prompts.text(session, 'Please, enter your first name:');
            } else {
                next();
            }
            
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "firstname")) {
                session.conversationData["firstname"] = results.response;
            }
            if(!isConversationDataSet(session, "lastname")) {
                builder.Prompts.text(session, 'Please, enter your last name:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if (!isConversationDataSet(session, "lastname")) {
                session.conversationData["lastname"] = results.response;
            }
            if (!isConversationDataSet(session, "email")) {
                builder.Prompts.text(session, 'Please, enter your email address:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if (!isConversationDataSet(session, "email")) {
                session.conversationData["email"] = results.response;
            }
            if (!isConversationDataSet(session, "telephone")) {
                builder.Prompts.text(session, 'Please, enter your telephone number:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "telephone")) {
                session.conversationData["telephone"] = results.response;
            }
            if(!isConversationDataSet(session, "password1")) {
                builder.Prompts.text(session, 'Please, enter your account password:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "password1")) {
                session.conversationData["password1"] = results.response;
            }
            if(!isConversationDataSet(session, "password2")) {
                builder.Prompts.text(session, 'Please, confirm your account password:');
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            var success = true;
            if(!isConversationDataSet(session, "password2")) {
                if(session.conversationData["password1"] === results.response) {
                    session.conversationData["password2"] = results.response;
                } else {
                    session.conversationData["password1"] = "";
                    session.send("Your confirmation must be the same as password.");
                    session.replaceDialog("CreateAccount");
                    success = false;
                }
            }
            if(success) {
                if(!isConversationDataSet(session, "birthdate")) {
                    builder.Prompts.text(session, 'Please, enter your birth date:');
                } else {
                    next();
                }
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "birthdate")) {
                session.conversationData["birthdate"] = results.response;
            }

            account.create(buildNewAccountJSON(session), function (error) {
                if(error) {
                    session.endConversation("Error occurred during account creation!");
                } else {
                    session.userData["password"] = md5(session.conversationData["password1"]);
                    session.endConversation(session.userData["username"] + ", your account has been successfully created!");
                }
            });
        }
    ]).triggerAction({
        matches: 'CreateAccount'
    });

    bot.dialog('DeleteAccount', [
        function (session, args, next) {
            account.deleteAccount(session.userData["username"], function (error, id) {
                if(error) {
                    session.endConversation("Error occurred during account deletion!");
                } else {
                    session.userData["username"] = "";
                    session.userData["password"] = "";
                    session.endConversation(session.userData["username"] + ", your account has been successfully removed!");
                }
            });
        }
    ]).triggerAction({
        matches: 'DeleteAccount'
    });

    bot.dialog('UpdateAccount', [
        function (session, args, next) {
            account.getId(session.userData["username"], function (error, id) {
                if (error) {
                } else {
                    session.conversationData["id"] = id;
                    choiceRequest(
                        session, 
                        optionsFull, 
                        session.userData["username"] + ', what field would you like to update?', 
                        'Do you want to create a new account?');
                }
            });
        }, 
        function (session, results, next) {
            session.conversationData["toupdate"] = optionsBrief[optionsFull.indexOf(results.response.entity)];
            builder.Prompts.text(session, 'Please, enter a new value of ' + results.response.entity + ":");
        }, 
        function (session, results, next) {
            session.conversationData["newvalue"] = results.response;
            if(session.conversationData["toupdate"] == "password") {
                builder.Prompts.text(session, 'Please, confirm your account password:');
            } else {
                next();
            }
        },
        function (session, results, next) {
            var toupdate = session.conversationData["toupdate"];
            var newvalue = session.conversationData["newvalue"];
            if((toupdate == "password") && (newvalue != results.response)) {
                session.send("Your confirmation must be the same as password.");
                session.replaceDialog("UpdateAccount");
            } else {
                account.update(session.conversationData["id"], '{"' + toupdate + '": "' + (toupdate === "password" ? md5(newvalue) : newvalue) + '"}', function (error) {
                    if (error) {
                    } else {
                        session.endConversation(session.userData["username"] + ", your account has been successfully updated!");
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
                currency.getExchangeRate(tosell, tobuy, function (error, data) {
                    var ratelist = JSON.parse(data);
                    var attachment = [];
                    attachment.push(
                        new builder.ThumbnailCard(session)
                        .title(tosell)
                        .text("1 " + tosell + " = " + ratelist.rates[tobuy] + " " + tobuy)
                        .images([builder.CardImage.create(session, "http://fxtop.com/ico/" + sellcurrency.entity.toLowerCase() + ".gif")])
                    );
                    attachment.push(
                        new builder.ThumbnailCard(session)
                        .title(tobuy)
                        .text("1 " + tobuy + " = " + (1 / ratelist.rates[tobuy]).toFixed(4) + " " + tosell)
                        .images([builder.CardImage.create(session, "http://fxtop.com/ico/" + buycurrency.entity.toLowerCase() + ".gif")])
                    );
                    var message = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(attachment);
                    session.send(message);
                    session.endConversation("Interbank exchange rate as of " + ratelist.date + " is " + ratelist.rates[tobuy] + " " + tobuy + " for 1 " + tosell + ".");
                });
            } else {
                session.endConversation("Sorry, currency not recognized!");
            }
        }
    ]).triggerAction({
        matches: 'GetExchangeRate'
    });
    
    bot.dialog('GetBranches', [
        function (session, args, next) {
            branch.getList(function (error, data) {
                if (error) {
                } else {
                    var attachment = [];
                    var branches = JSON.parse(data);
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