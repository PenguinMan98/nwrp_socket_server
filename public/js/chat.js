/**
 * Created by Owner on 6/26/2015.
 */

var Chat = {
    buildPlayerList: function(){
        console.log('buildPlayerList', characterData);

        //var playerList;
        var roomList = [];
        var otherRoomList = [];
        var char;

        for(var i=0; i<characterData.length; i++){
            char = characterData[i];
            console.log( char );
            if(roomId == char.chat_room_id){
                roomList.push(char);
            }else{
                if(!Array.isArray(otherRoomList[chat.chat_room_id])){
                    otherRoomList[chat.chat_room_id] = [];
                }
                otherRoomList[chat.chat_room_id].push(char);
            }
        }
        console.log('character lists created', roomList, otherRoomList);
        var roomListHTML = "<ul>";
        for(i = 0; i < roomList.length; i++){
            roomListHTML += "<li>" + roomList[i].name + "</li>";
        }
        roomListHTML += "</ul>";
        roomCharactersElem.html(roomListHTML);

        var otherRoomListHTML = "<ul>";
        for(i = 0; i < otherRoomList.length; i++){
            otherRoomListHTML += "<li>" + otherRoomList[i].name + "</li>";
        }
        otherRoomListHTML += "</ul>";
        otherRoomCharactersElem.html(otherRoomListHTML);
    }
};