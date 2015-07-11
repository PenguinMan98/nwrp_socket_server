var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nwrp_stripped'
});
var chat = require('./chat.js');


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
                var formatted_rows = chat.formatRows(rows);
                callback({
                    success: true,
                    roomId: roomId,
                    last_posts: formatted_rows
                })
            }
        });
    },
    getLoggedInCharacters: function( connection, roomId, callback ){
        //console.log('getting character details for room ', roomId);
        connection.query('SELECT c.character_id, c.name, c.status, c.icon, c.chat_name_color, c.chat_text_color, c.chat_status_id, c.character_race_id, c.cutie_mark, UNIX_TIMESTAMP() - c.last_activity AS \'idle_timer\', c.chat_room_id FROM `character` c JOIN `character_login_log` cll ON c.character_id=cll.character_id WHERE cll.login_active=1;', [], function(err, rows, fields) {
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

