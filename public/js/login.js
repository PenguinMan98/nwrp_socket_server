
var Login = {
    doLogin: function(username, password, callback){
        $.ajax({
            url: "my-tiki-login.php",
            data: {user: username, pass:password },
            dataType: "JSON"
        })
            .done(function(response) {
                if(response.success){
                    $('#login_fields').hide();
                }
                if(response.success && response.characterList.length > 0){ // if this succeeds, we found a reserved character name
                    $('#login_form_error').hide();
                    $('#character_selection').show();
                    var select = $('#chat_character');
                    for(var i = 0; i < response.characterList.length; i++){
                        if(i == 0){ // for the first character, set the default 'handle'
                            $('#handle').val(response.characterList[i].name);
                        }
                        select.append('<option value="'+response.characterList[i].character_id+'">'+response.characterList[i].name+'</option>');
                    }
                    $('#character_selection').append('<label></label><a href="<?php echo SITE_ROOT?>/chat/character/create.php">Create a new character!</a>');

                    loggedIn = true;
                }else if(response.success){ // no characters!
                    $('#login_form_error').hide();
                    $('#character_selection').html('<label>Character: </label><a href="<?php echo SITE_ROOT?>/chat/character/create.php">Make a character!</a>');
                    $('#character_selection').show();

                    loggedIn = true;
                }else{ // there was an error
                    $('#login_form_error').show();
                    $('#login_form_error').html('**' + response.error + '<br>');
                }
            });

    },
    initSockets: function(socket){
        socket.emit
        // listen for public_characters
        socket.on('my characters', function (data) {
            console.log('my character list received', data);

            var charListHTML = "";
            for(var i = 0; i < data.myCharacters.length; i++ ){
                charListHTML += "<option>" + data.myCharacters[i].name + "</option>";
            }
            charListHTML += "";
            characterSelectElem.html(charListHTML);
        });
    },// Gets a character list
    getMyCharacters: function( socket, username, userId, token ) {
        console.log('calling for my characters', username, userId, token);
        // tell server to get 'my characters'
        socket.emit('my characters', {
            username: username,
            userId: userId,
            token: token
        });
    }

};
