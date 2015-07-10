var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mlpnwrp'
});
var _ = require('lodash');
var BBCodeParser = require('bbcode-parser');
var parser = new BBCodeParser(BBCodeParser.joesTags());

module.exports = {
    init: function( callback ){
        pool.getConnection(function(err, connection){
            callback( err, connection );
            connection.release();
        });
    },
    validateUser: function( connection, username, token, callback ){
        connection.query('SELECT count(*) as validated FROM users_users u JOIN character_login_log cll ON u.userId = cll.user_id WHERE u.login=? AND cll.login_token=? AND cll.login_active=1', [username, token], function(err, rows, fields) {
            if (err){
                callback({
                    success: false,
                    err: err
                });
            };
            if( rows.length > 0 && rows[0].validated){
                console.log('user validated');
                callback({username: username, validated: true});
            }else{
                console.log('user not validated');
                callback({username: username, validated: false});
            }
        });
    },
    getPublicPosts: function( connection, roomId, callback ){
        console.log('getting posts for room ', roomId);
        connection.query('SELECT temp.*, c.icon, c.chat_name_color, c.chat_text_color, FROM_UNIXTIME(temp.timestamp,"%h:%i:%s %p") as f_time, FROM_UNIXTIME(temp.timestamp,"%a, %M %e") as f_date FROM (SELECT * FROM chat_log WHERE chat_room_id = 1 AND chat_log_type_id=? ORDER BY chat_log_id DESC LIMIT 50) AS temp JOIN `character` c ON temp.character_id=c.character_id ORDER BY chat_log_id ASC;', [roomId], function(err, rows, fields) {
            if (err){
                callback({
                    success: false,
                    err: err
                });
            }else if( rows.length == 50){
                var formatted_rows = formatRows(rows);
                callback({
                    success: true,
                    roomId: roomId,
                    last_posts: formatted_rows
                })
            }
        });
    },
    getLoggedInCharacters: function( connection, roomId, callback ){
        console.log('getting character details for room ', roomId);
        connection.query('SELECT c.character_id, c.name, c.status, c.icon, c.chat_name_color, c.chat_text_color, c.chat_status_id, c.character_race_id, c.cutie_mark, UNIX_TIMESTAMP() - c.last_activity AS \'idle_timer\', c.chat_room_id FROM `character` c WHERE c.logged_in=1;', [], function(err, rows, fields) {
            if (err){
                callback({
                    success: false,
                    err: err
                });
            }else if( rows.length > 0){

                callback({
                    success: true,
                    roomId: roomId,
                    public_characters: rows
                })
            }
        });
    }
};

function formatRows(rows){
    var formattedRows = [];
    for(var i=0; i<rows.length; i++){
        formattedRows.push(formatChatLine(rows[i]));
    }
    return formattedRows;
}

function formatChatLine(post){
    if(typeof post == 'undefined'){ return false; }

    var date = new Date(post.timestamp*1000);
    var liStyle = "color: #ddd;";
    var charNameStyle = 'color: '+post.chat_name_color+';';
    var charTextStyle = 'color: '+post.chat_text_color+';';
    var html;
    // parser parses bbcode, lodash unescape converts html entities to html
    var formattedText = _.unescape(parser.parseString(post.text));

    //console.log('post', post, formattedText);

    html = '<li data-id="'+post.chat_log_id+'" class="chat line" style="'+liStyle+'">' +
    '<span title="'+post.f_date+'" class="chat date" style="">'+post.f_time+'</span>';

    if(formattedText.indexOf("/me") === 0){
        html += '' +
        ': <span class="chat name" style="'+charNameStyle+'">'+post.handle+' ' +
        ''+formattedText.substr(3)+'</span>';
    }else if(formattedText.indexOf("//") === 0){
        html += '' +
        ' <span class="chat name" style="'+charNameStyle+'">'+post.handle+'</span>: ' +
        '(( <span class="chat text" style="'+charTextStyle+'">'+formattedText.substr(2)+'</span> ))';
    }else{
        html += '' +
        ' <span class="chat name" style="'+charNameStyle+'">'+post.handle+'</span>: ' +
        '<span class="chat text" style="'+charTextStyle+'">'+formattedText+'</span>';
    }
    html += '</li>';

    return _.unescape(html);
}
