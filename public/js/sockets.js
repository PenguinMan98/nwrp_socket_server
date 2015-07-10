
/*============= Sending ==============*/

// Gets a character list
function getCharacterList ( username, token ) {
    console.log('Asking for character list');

    var message = {
        username: username,
        token: token
    };
    // tell server to execute 'get characters' and send along one parameter
    socket.emit('get characters', message);
}

// sends a request to initialize the chat.
function initializeChat ( username, token, handle, roomId ) {
    console.log('initializing the chat');

    var message = {
        username: username,
        handle: handle,
        token: token,
        roomId: roomId
    };
    // tell server to execute 'get characters' and send along one parameter
    socket.emit('init', message);

    // local setup.
    $('.inputMessage')
}

/*============= Receiving ==============*/
function initSocketListeners( socket ){
    console.log('listening for socket traffic', socket);
    // listen for chat initialization
    socket.on('chat_init', function (data) {
        console.log('chat_init received', data);
    });

    // listen for public_characters
    socket.on('character_list', function (data) {
        console.log('character_list received', data);
    });

    // listen for posts
    socket.on('last_posts', function (data) {
        console.log('last_posts received', data, chatMessagesElem);
        for(var i = 0; i < data.last_posts.length; i++ ){
            chatMessagesElem.append(data.last_posts[i]);
        }
    });

    /*socket.on('new post', function(data){
        chatMessageElem.append(data.newPost);
    });*/
}
