/*============= Sending ==============*/

// Gets a character list
function getCharacterList ( username, token ) {
    var message = {
        username: username,
        token: token
    };
    // tell server to execute 'get characters' and send along one parameter
    socket.emit('get characters', message);
}

// sends a request to initialize the chat.
function initializeChat ( username, token, handle, roomId ) {
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
    // listen for chat initialization
    socket.on('chat_init', function (data) {
        //console.log('chat_init received', data);
    });

    // listen for public_characters
    socket.on('character_list', function (data) {
        console.log('character_list received', data);
        var char;
        for(var i = 0; i < data.public_characters.length; i++){
            char = data.public_characters[i];
            characterData.push(char);

            if(char.name == handle){
                myCharacterData = char;
            }
        }
    });

    // listen for posts
    socket.on('last_posts', function (data) {
        for(var i = 0; i < data.last_posts.length; i++ ){
            chatMessagesElem.append(data.last_posts[i]);
        }
    });

    socket.on('new post', function(data){
        chatMessagesElem.append( data.fLine );
    });

    socket.on('new post sync', function(data){
        var selector = 'li[data-clientpostguid="'+data.postClientGUID+'"]';
        var post = chatMessagesElem.children(selector);
        if(post.length){
            $(post[0])
                .data('id', data.postId)
                .attr('data-id', data.postId);
        }else{
            // todo: if the post does not exist, add it instead.
            chatMessagesElem.append( data.fLine );
        }

    });
}
