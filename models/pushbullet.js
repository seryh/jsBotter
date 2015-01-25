var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var irclogSchema = new Schema({
    channel      :  { type: String }
    , networkName  :  { type: String }
    , nick         :  { type: String }
    , tocken      :  { type: String }
    , vhost        :  { type: String }
    , date         :  { type: Date }
},  { collection: 'pushbullet' });

var pushbullet = mongoose.model('pushbullet', irclogSchema);

module.exports = pushbullet;