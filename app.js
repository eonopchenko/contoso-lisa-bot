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

    if ((session.userData["username"] != null) && (session.userData["username"] != undefined) && (session.userData["username"] != "")) {
        session.send('Welcome back, ' + session.userData["username"] + '.');
    } else {
        var welcomeCard = new builder.HeroCard(session)
        .title('Welcome to Contoso Bank Chatbot')
        .images([
            new builder.CardImage(session)
            .url('https://placeholdit.imgix.net/~text?txtsize=56&txt=Contoso%20Bank&w=640&h=330')
        ]);

        session.send(new builder.Message(session).addAttachment(welcomeCard));
        session.send('Hi, my name is Lisa!');
    }
});

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

// This line will call the function in your luisDialog.js file
luis.startDialog(bot);
