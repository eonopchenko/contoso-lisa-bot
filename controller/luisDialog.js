var builder = require('botbuilder');
var request = require('request');
var md5 = require('MD5');
var account = require('./account.js');
var branch = require('./branch.js');
var currency = require('./currency.js');
var tts = require('./TTSService.js');  

var username = '';
var password = '';

exports.setUsername = function(data) {
    username = data;
}

exports.setPassword = function(data) {
    password = data;
}

exports.getUsername = function(data) {
    return username;
}

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

function isVoiceOn(session) {
    return (session.userData["voice"] != null) && (session.userData["voice"] != undefined) && (session.userData["voice"] != "") && (session.userData["voice"] != "off");
}

function buildNewAccountJSON(session) {
    return '{' + 
    '"username": "' + username + '",' + 
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

    bot.dialog('VoiceOn', [
        function (session, args, next) {
            session.userData["voice"] = 'on';
            var message = 'Voice synthesizer is on.';
            tts.Synthesize(message);
            session.send(message);
        }
    ]).triggerAction({
        matches: 'VoiceOn'
    });

    bot.dialog('VoiceOff', [
        function (session, args, next) {
            session.userData["voice"] = 'off';
            var message = 'Voice synthesizer is off.';
            tts.Synthesize(message);
            session.send(message);
        }
    ]).triggerAction({
        matches: 'VoiceOff'
    });

    bot.dialog('Welcome', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if(username === '') {
                var message = 'Let\'s get acquainted. Please, enter your user name:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                var message = 'Welcome back, ' + username + '.';
                if (isVoiceOn(session)) tts.Synthesize(message);
                session.send(message);
                if(password === '') {
                    next();
                } else {
                    var message = 'Great, what to do next?';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                }
            }
        },
        function (session, results, next) {
            if (results.response) {
                username = results.response;
            }

            session.sendTyping();

            account.getPassword(username, function (error, pwd) {
                if (error) {
                } else {
                    if(pwd !== '') {
                        password = pwd;
                        var message = 'Please, enter your account password:';
                        if (isVoiceOn(session)) tts.Synthesize(message);
                        builder.Prompts.text(session, message);
                    } else {
                        var message1 = 'Sorry, no account information has been found.';
                        var message2 = 'Do you want to create a new account?';
                        if (isVoiceOn(session)) tts.Synthesize(message1 + ' ' + message2);
                        choiceRequest(
                            session, 
                            ['Yes', 'No'], 
                            message1, 
                            message2);
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
                if (password === md5(results.response)) {
                    var message = 'Great, what to do next?';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                } else {
                    var message = 'Sorry, but it seems like the entered password is incorrect. Please, try once again.';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.send(message);
                    session.replaceDialog('Welcome');
                }
            }
        }
    ]).triggerAction({
        matches: 'Welcome'
    });

    bot.dialog('GetBalance', [
        function (session, args, next) {

            session.sendTyping();

            account.getBalance(username, function (error, balance) {
                if (error) {
                } else {
                    if(balance == -1) {
                        var message1 = 'Sorry, no account information has been found.';
                        var message2 = 'Do you want to create a new account?';
                        if (isVoiceOn(session)) tts.Synthesize(message1 + ' ' + message2);
                        choiceRequest(
                            session, 
                            ['Yes', 'No'], 
                            message1, 
                            message2);
                    } else {
                        var message = username + ", your balance is $" + balance + "."
                        if (isVoiceOn(session)) tts.Synthesize(message);
                        session.endConversation(message);
                    }
                }
            });
        }, 
        function (session, results, next) {
            if(results.response.entity === 'Yes') {
                session.replaceDialog("CreateAccount");
            } else {
                var message = 'Ok, see you next time!';
                if (isVoiceOn(session)) tts.Synthesize(message);
                session.endConversation(message);
            }
            
        }
    ]).triggerAction({
        matches: 'GetBalance'
    });

    bot.dialog('CreateAccount', [
        function (session, args, next) {
            if (username === '') {
                var message = 'Please, enter your user name:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        },
        function (session, results, next) {
            if(username === '') {
                username = results.response;
            }
            if(!isConversationDataSet(session, "firstname")) {
                var message = 'Please, enter your first name:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
            
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "firstname")) {
                session.conversationData["firstname"] = results.response;
            }
            if(!isConversationDataSet(session, "lastname")) {
                var message = 'Please, enter your last name:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if (!isConversationDataSet(session, "lastname")) {
                session.conversationData["lastname"] = results.response;
            }
            if (!isConversationDataSet(session, "email")) {
                var message = 'Please, enter your email address:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if (!isConversationDataSet(session, "email")) {
                session.conversationData["email"] = results.response;
            }
            if (!isConversationDataSet(session, "telephone")) {
                var message = 'Please, enter your telephone number:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "telephone")) {
                session.conversationData["telephone"] = results.response;
            }
            if(!isConversationDataSet(session, "password1")) {
                var message = 'Please, enter your account password:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "password1")) {
                session.conversationData["password1"] = results.response;
            }
            if(!isConversationDataSet(session, "password2")) {
                var message = 'Please, confirm your account password:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
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
                    var message = 'Your confirmation must be the same as password.';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.send(message);
                    session.replaceDialog("CreateAccount");
                    success = false;
                }
            }
            if(success) {
                if(!isConversationDataSet(session, "birthdate")) {
                    var message = 'Please, enter your birth date:';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    builder.Prompts.text(session, message);
                } else {
                    next();
                }
            }
        }, 
        function (session, results, next) {
            if(!isConversationDataSet(session, "birthdate")) {
                session.conversationData["birthdate"] = results.response;
            }

            session.sendTyping();

            account.create(buildNewAccountJSON(session), function (error) {
                if(error) {
                    session.endConversation("Error occurred during account creation!");
                } else {
                    password = md5(session.conversationData["password1"]);
                    var message = username + ', your account has been successfully created!';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                }
            });
        }
    ]).triggerAction({
        matches: 'CreateAccount'
    });

    bot.dialog('DeleteAccount', [
        function (session, args, next) {

            session.sendTyping();

            account.deleteAccount(username, function (error, id) {
                if(error) {
                    var message = 'Error occurred during account deletion!'
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                } else {
                    var message = username + ', your account has been successfully removed!'
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                    username = '';
                    password = '';
                }
            });
        }
    ]).triggerAction({
        matches: 'DeleteAccount'
    });

    bot.dialog('UpdateAccount', [
        function (session, args, next) {

            session.sendTyping();

            account.getId(username, function (error, id) {
                if (error) {
                } else {
                    session.conversationData["id"] = id;
                    var message1 = username + ', what field would you like to update?';
                    var message2 = 'Please, select one option.';
                    if (isVoiceOn(session)) tts.Synthesize(message1 + ' ' + message2);
                    choiceRequest(
                        session, 
                        optionsFull, 
                        message1, 
                        message2);
                }
            });
        }, 
        function (session, results, next) {
            session.conversationData["toupdate"] = optionsBrief[optionsFull.indexOf(results.response.entity)];
            var message = 'Please, enter a new value of ' + results.response.entity + ':';
            if (isVoiceOn(session)) tts.Synthesize(message);
            builder.Prompts.text(session, message);
        }, 
        function (session, results, next) {
            session.conversationData["newvalue"] = results.response;
            if(session.conversationData["toupdate"] == "password") {
                var message = 'Please, confirm your account password:';
                if (isVoiceOn(session)) tts.Synthesize(message);
                builder.Prompts.text(session, message);
            } else {
                next();
            }
        },
        function (session, results, next) {
            var toupdate = session.conversationData["toupdate"];
            var newvalue = session.conversationData["newvalue"];
            if((toupdate == "password") && (newvalue != results.response)) {
                var message = 'Your confirmation must be the same as password.';
                if (isVoiceOn(session)) tts.Synthesize(message);
                session.send(message);
                session.replaceDialog("UpdateAccount");
            } else {
                account.update(session.conversationData["id"], '{"' + toupdate + '": "' + (toupdate === "password" ? md5(newvalue) : newvalue) + '"}', function (error) {
                    if (error) {
                    } else {
                        var message = username + ', your account has been successfully updated!';
                        if (isVoiceOn(session)) tts.Synthesize(message);
                        session.endConversation(message);
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

                session.sendTyping();

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
                    var message = 'Interbank exchange rate as of ' + ratelist.date + ' is ' + ratelist.rates[tobuy] + ' ' + tobuy + ' for 1 ' + tosell + '.';
                    if (isVoiceOn(session)) tts.Synthesize(message);
                    session.endConversation(message);
                });
            } else {
                var message = 'Sorry, currency is not recognized!';
                if (isVoiceOn(session)) tts.Synthesize(message);
                session.endConversation(message);
            }
        }
    ]).triggerAction({
        matches: 'GetExchangeRate'
    });
    
    bot.dialog('GetBranches', [
        function (session, args, next) {

            session.sendTyping();

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
    
    bot.dialog('Cancel', [
        function (session, args, next) {
            var message = 'Ok, see you next time!';
            if (isVoiceOn(session)) tts.Synthesize(message);
            session.endConversation(message);
        }
    ]).triggerAction({
        matches: 'Cancel'
    });
}