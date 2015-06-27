<?php
    // First things first, bootstrap me.
    require('../new_chat/init.php');

    // now, are we logged in?
    // todo: Check if we are logged in or not
    $loggedIn = true;
    $username = "Tek Croon";
    $handle = "Tek_Croon";
    $token = "pengy98";
    $roomId = 1;
?><!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Socket.IO Chat Example</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
<ul class="pages">
    <li class="chat page">
        <div class="chatArea">
            <ul class="messages"></ul>
        </div>
        <input class="inputMessage" placeholder="Type here..."/>
    </li>
    <li class="login page">
        <div class="loginForm">
            <h3 class="title">Username: </h3>
            <input class="usernameInput" type="text" />
            <h3 class="title">Password: </h3>
            <input class="passwordInput" type="password" />
        </div>
    </li>
    <li class="characterChoice page">
        <div class="characterForm">
            <h3 class="title">Choose your Character:</h3>
            <select class="handleInput">
                <option value="char1">char1</option>
                <option value="char2">char2</option>
                <option value="char3">char3</option>
                <option value="char4">char4</option>
            </select><br>
            Or
            <h3>Use a Guest Character:</h3>
            <input type="text" value="" placeholder="Guest Handle" maxlength="25" />
        </div>
    </li>
</ul>

<script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="http://nwrp-sockets.local:3000/socket.io/socket.io.js"></script>
<script src="js/login.js"></script>
<script src="js/mediator.js"></script>
<script src="js/sockets.js"></script>
<script>
    var socket = io('http://localhost:3000');
    var connected = false;
    var characterChoiceElem = null;
    var loginElem = null;
    var chatElem = null;
    var chatMessagesElem = null;

    var loggedIn = <?=$loggedIn?'true':'false'?>;
    var username = "<?=$username?>";
    var handle = "<?=$handle?>";
    var token = "<?=$token?>";
    var roomId = "<?=$roomId?>";

    $(function(){
        // on page load
        characterChoiceElem = $('.characterChoice.page');
        loginElem = $('.login.page');
        chatElem = $('.chat.page');
        chatMessagesElem = $('.chat.page .messages');

        // primary setup
        if( loggedIn ){
            if( !handle ){
                // send a request to the server for the character list
                characterChoiceElem.show();
            }else{
                // all is well. Start chatting!
                connected = true;
                initSocketListeners( socket );
                initializeChat( username, token, handle, roomId );
                chatElem.show();
            }
        }else{
            loginElem.show();
        }

    });
</script>
</body>
</html>