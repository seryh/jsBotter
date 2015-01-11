var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var irclog = {
    add: function(target, nick, message) {

        var irclogSchema = new Schema({
            nick   :  { type: String }
            , message   :  { type: String }
            , date   :  { type: Date }
        },  { collection: target });

        var irclogModel = mongoose.model(target, irclogSchema);

        var log = new irclogModel();

        log.nick = nick;
        log.message = message;
        log.date = new Date();

        log.save(function (err) {
            if (err) console.log('botPlugins->logger->message save error::', err);
        });

    }
};

module.exports = irclog;