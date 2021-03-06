/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/luisDialog');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "a0392848-aeed-498c-9a5b-00061fef7fa7",
    appPassword: "mktzCDB6234gjkRRJY7@}}]",
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session) {
    var reply = new builder.Message().address(session.message.address);
    var text = session.message.text;
    if (text !== '') {
        try {
            var credentials = JSON.parse(text);
            luis.setUsername(credentials.username);
            luis.setPassword(credentials.password);
        } catch(e) {
            
        }
    }
    
    session.send(reply);
});

bot.set('persistUserData', true);

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (activity) {
    if (activity.membersAdded) {
        activity.membersAdded.forEach(function (identity) {
            if (identity.id === activity.address.bot.id) {
                var username = luis.getUsername();
                var reply = new builder.Message()
                    .address(activity.address)
                    .text((username === '') ? ('Hi, my name is Lisa!') : ('Welcome back, ' + username + ', nice to see you again!'));
                bot.send(reply);
            }
        });
    }
});

// This line will call the function in your luisDialog.js file
luis.startDialog(bot);
