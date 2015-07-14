// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// include my stuff
var db = require('./db.js');
var chat = require('./chat.js');
var async = require('async');
var moment = require('moment');
moment.locale('nwrp', {
    weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split('_')
});

{
    var BBTag = require('bbcode-parser/bbTag');
    var bbTags = new Array();
    //Simple tags
    bbTags["b"] = new BBTag("b", true, false, false);
    bbTags["i"] = new BBTag("i", true, false, false);
    bbTags["u"] = new BBTag("u", true, false, false);
    bbTags["url"] = new BBTag("url", true, false, false, function (tag, content, attr) {
        var link = content;
        if (attr["url"] != undefined) {
            link = escapeHTML(attr["url"]);
        }
        if (!startsWith(link, "http://") && !startsWith(link, "https://")) {
            link = "http://" + link;
        }
        return "<a href=\"" + link + "\" target=\"_blank\">" + content + "</a>";
    });
}
var BBCodeParser = require('bbcode-parser');
var parser = new BBCodeParser( bbTags );

server.listen(port, function () {
    //console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('init', function(data){
        // initialize the db
        db.init(function(err, connection){
            // first lets check the user credentials
            db.validateUser(connection, data.username, data.token, function( dbResp ){
                if( dbResp.validated ){
                    // add the client's username to the global list
                    usernames[data.username] = data.username;
                    ++numUsers;
                    addedUser = true;

                    socket.emit('login', {
                        numUsers: numUsers
                    });
                    // echo globally (all clients) that a person has connected
                    socket.broadcast.emit('user joined', {
                        username: data.username,
                        numUsers: numUsers
                    });
                    db.getLoggedInCharacters( connection, data.roomId, function( dbResp ){
                        if( dbResp.success ){
                            console.log('sending character_list');
                            socket.emit( 'character_list', {
                                roomId: dbResp.roomId,
                                public_characters: dbResp.public_characters // the most recent 50 posts
                            } );
                         }else{
                            console.log('ERROR!', dbResp.err);
                        }
                    });
                    db.getPublicPosts( connection, data.roomId, function( dbResp ){
                        if( dbResp.success ){
                            socket.emit( 'last_posts', {
                                roomId: dbResp.roomId,
                                last_posts: dbResp.last_posts // the most recent 50 posts
                            } );
                        }else{
                            console.log('ERROR!', dbResp.err);
                        }
                    });

                    // send room list
                    console.log('sending room list');
                    // send weather
                    console.log('sending weather for room', data.roomId);
                    // send motd
                    console.log('sending motd for room', data.roomId);
                    // send posts
                    console.log('sending posts for room', data.roomId);


                }else{
                    // todo: some kind of fail case
                    console.log('login fail');
                    socket.emit('login fail', {});
                }
            });
        });

    });

    socket.on('new post', function(data){
        var thisMoment = moment().utcOffset(-5);
        var isPrivate = data.recipient_username ? true : false;
        var isSystem = false; // todo: implement system commands
        var formattedData = {
            chat_log_id: null,
            chat_room_id: data.roomId,
            user_id: data.userId,
            handle: data.characterData.name,
            character_id: data.characterData.character_id,
            recipient_user_id: '',
            recipient_username: '',
            text: data.text,
            timestamp: thisMoment.unix(),
            chat_name_color: data.characterData.chat_name_color,
            chat_rand: tsMicro,
            chat_text_color: data.characterData.chat_text_color,
            chat_log_type_id: isPrivate ? 2 : isSystem ? 3 : 1,
            viewed: isPrivate ? 0 : 1,
            icon: data.characterData.icon,
            f_time: thisMoment.format('hh:mm:ss A'),
            f_date: thisMoment.format('ddd, MMM M'),
            clientPostGUID: data.clientPostGUID
        };
        data.fLine = chat.formatChatLine(formattedData);

        // send the result to everybody even me
        socket.emit('new post', data);

        // store it in the db
        // initialize the db
        db.init(function(err, connection){
            // first lets check the user credentials
            db.validateUser(connection, data.username, data.token, function( dbResp ){
                if( dbResp.validated ){
                    db.insertNewPost( connection, formattedData, function( dbResp ){
                        if(dbResp.success){
                            socket.emit('new post sync', {
                                postId: dbResp.postId,
                                postClientGUID: dbResp.postClientGUID,
                                fLine: dbResp.fLine // this is in the off chance the client doesn't have the post.
                            });
                        }
                    });
                }
            })
        });
    });
    socket.on('my characters', function(data){
        // initialize the db
        db.init(function(err, connection){
            db.getMyCharacters( connection, data.userId, function( dbResp ){
                if(dbResp.success){
                    socket.emit('my characters', {
                        myCharacters: dbResp.myCharacters
                    });
                }
            });
        });
    });

    /*// when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
            //timestamp
            //icon
            //colors
            //etc.
        });
    });

    // when the client emits 'user join', this listens and executes
    socket.on('user join', function (username, token) {
        console.log("db inside 'user join'",db);
        // we store the username in the socket session for this client
        socket.username = username;
        socket.token = token;
        // validate the user
        db.validateUser(username, token, function( dbResp ){
            if( dbResp.validated ){
                // add the client's username to the global list
                usernames[username] = username;
                ++numUsers;
                addedUser = true;
                socket.emit('login', {
                    numUsers: numUsers
                });
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    numUsers: numUsers
                });

            }else{
                // todo: some kind of fail case
                console.log('login fail');
                socket.emit('login fail', {});
            }
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });*/
});