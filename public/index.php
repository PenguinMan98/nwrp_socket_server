<?php
    // First things first, bootstrap me.
    require('../new_chat/init.php');

    // check for tiki session login
    $loggedIn = !empty($_SESSION['u_info']['login']);

    // post processing
    $username = null;
    $userId = null;
    $handle = null;
    $token = null;
    $roomId = 1;

    // were details submitted?
    if($_POST['handle']){
        $handle = preg_replace('/[\W]/i','',preg_replace('/[\s]/i','_',$_POST['handle']));

        // log the character in
        var_dump($_SESSION);

    }
?><!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Socket.IO Chat Example</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="js/jQueryUI/jquery-ui.min.css">
</head>
<body>
<ul class="pages">
    <li class="chat page">
        <div class="top nav">This is where the menu goes</div>
        <div class="top announcements">This will hold site announcements.</div>
        <div class="chatArea">
            <div class="right column">
                <div id="room">
                    Room Sign
                </div>
                <div id="weather">
                    Weather Widget
                </div>
                <div id="accordion">
                    <!--<h3>Player List</h3>
                    <div id="playerList" class="characterList">
                        <ul>
                            <li>Player1</li>
                            <li>Player2</li>
                            <li>Player3</li>
                            <li>Player4</li>
                        </ul>
                    </div>-->
                    <h3>Characters in Room</h3>
                    <div id="roomCharacters" class="characterList">
                        <ul>
                            <li>Loading</li>
                        </ul>
                    </div>
                    <h3>Characters Elsewhere</h3>
                    <div id="otherRoomCharacters" class="characterList">
                        <ul>
                            <li>Loading</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div style="width: 100%; clear: both;"></div>
            <ul class="messages"></ul>
        </div>
        <input class="inputMessage" placeholder="Type here..."/>
    </li>
    <li class="login page">
        <div class="loginForm">
            <h3 class="title">Username: </h3>
            <input class="usernameInput" type="text" name="username"/>
            <h3 class="title">Password: </h3>
            <input class="usernameInput" type="password" name="password" /><br>
            <input type="button" id="player_login" value="Log In">
        </div>
    </li>
    <li class="characterChoice page">
        <div class="characterForm">
            <form id="chooseCharacterForm" method="post">
                <input type="hidden" name="userId" value="<?php echo $userId; ?>">
                <input type="hidden" name="username" value="<?php echo $username; ?>">
                <input type="hidden" name="token" value="<?php echo $token; ?>">
                <h3 class="title">Choose your Character:</h3>
                <select class="handleInput" name="handle">
                    <option value="">LOADING</option>
                </select><br>
                <input type="submit" value="Enter Chat">
            </form><br>
            Or
            <h3>Use a Guest Character:</h3>
            <input type="text" value="" placeholder="Guest Handle" maxlength="25" /><br>
            <input type="submit" value="Unavailable at Present">
        </div>
    </li>
</ul>

<script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="http://nwrp-sockets.local:3000/socket.io/socket.io.js"></script>
<script src="js/jQueryUI/jquery-ui.min.js"></script>
<script src="js/config.js"></script>
<script src="js/login.js"></script>
<script src="js/chat.js"></script>
<script src="js/sockets.js"></script>
<script>
    var socket = io('http://localhost:3000');
    var connected = false;
    var characterChoiceElem = null;
    var loginElem = null;
    var chatElem = null;
    var chatMessagesElem = null;
    var chatMessageInput = null;
    var characterData = [];
    var myCharacterData = null;
    var roomCharactersElem;
    var otherRoomCharactersElem;
    var characterSelectElem;

    var loggedIn = <?=$loggedIn?'true':'false'?>;
    var username = "<?=$username?>";
    var userId = "<?=$userId?>";
    var handle = "<?=$handle?>";
    var token = "<?=$token?>";
    var roomId = "<?=$roomId?>";

    $(function(){
        // on page load
        characterChoiceElem = $('.characterChoice.page');
        loginElem = $('.login.page');
        chatElem = $('.chat.page');
        chatMessagesElem = $('.chat.page .messages');
        chatMessageInput = $('.inputMessage');
        roomCharactersElem = $('#roomCharacters');
        otherRoomCharactersElem = $('#otherRoomCharacters');
        characterSelectElem = $('#chooseCharacterForm select');

        var shiftDown = false;

        // primary setup
        if( loggedIn ){
            if( !handle ){
                characterChoiceElem.show();
                // send a request to the server for the character list
                Login.initSockets( socket );
                Login.getMyCharacters( socket, username, userId );
            }else{
                // all is well. Start chatting!
                connected = true;
                initSocketListeners( socket );
                initializeChat( username, token, handle, roomId );
                chatElem.show();

                /*socket.emit('new post', {
                    text: "This is a test <b>This should NOT be bolded</b> [b]This SHOULD be bolded[/b]."
                });*/
                // set up the listeners

                chatMessageInput.on('keydown', function( e ){
                    if(e.which == 16){
                        shiftDown = true;
                    }
                });
                chatMessageInput.on('keyup', function( e ){
                    if(!shiftDown && e.which == 13){ // just a regular enter key
                        socket.emit('new post', {
                            username: username, // The name of the user account
                            userId: userId, // The name of the user account
                            characterData: myCharacterData, // the currently active character
                            token: token, // The validation token
                            roomId: roomId, // the id of the room they are in (or 0 if PM)
                            clientPostGUID: handle + Date.now(), // a unique identifier for this post specific to this client instance. handle+timestamp
                            text: chatMessageInput.val()
                        });
                        chatMessageInput.val('');
                    }else if(e.which == 13){
                        console.log('Shift+Enter detected');
                        // todo: change the input from a text input to textarea
                    }
                    if(e.which == 16){
                        shiftDown = false;
                    }
                });
            }
            $("#accordion").accordion({
                collapsible: true,
                heightStyle: "fill"
            });
        }else{
            loginElem.show();

            $('#player_login').on('click', function(){
                console.log('trying to log in', $('.loginForm input[name="username"]').val(), $('.loginForm input[name="password"]').val());
                Login.doLogin( $('.loginForm input[name="username"]').val(), $('.loginForm input[name="password"]').val(), function( loginResp ){
                    console.log('login completed', loginResp)
                });
            });
        }

    });
</script>
</body>
</html>