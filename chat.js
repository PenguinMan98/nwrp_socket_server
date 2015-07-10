var _ = require('lodash');
var BBCodeParser = require('bbcode-parser');
var parser = new BBCodeParser(BBCodeParser.joesTags());

module.exports = {
    /**
     * Assumes the username has already been validated.
     * @param username
     */
    processLogin: function( username ){
        console.log('processing Login');
    },

    formatRows: function(rows){
        var formattedRows = [];
        for(var i=0; i<rows.length; i++){
            formattedRows.push(this.formatChatLine(rows[i]));
        }
        return formattedRows;
    },

    formatChatLine: function(post){
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

}