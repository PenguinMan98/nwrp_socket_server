// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var db = require('./db.js');
var async = require('async');

server.listen(port, function () {
    console.log('Server listening at port %d', port);
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
                                last_posts: dbResp.public_characters // the most recent 50 posts
                            } );
                         }else{
                            console.log('ERROR!', dbResp.err);
                        }
                    });
                    db.getPublicPosts( connection, data.roomId, function( dbResp ){
                        if( dbResp.success ){
                            console.log('sending last_posts');
                            socket.emit( 'last_posts', {
                                roomId: dbResp.roomId,
                                last_posts: dbResp.last_posts // the most recent 50 posts
                            } );
                        }else{
                            console.log('ERROR!', dbResp.err);
                        }
                    });

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