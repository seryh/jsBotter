var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var irclogSchema = new Schema({
      networkName  :  { type: String }
    , nick         :  { type: String }
    , token      :  { type: String }
    , vhost        :  { type: String }
    , date         :  { type: Date }
},  { collection: 'pushbullet' });

var pushbullet = mongoose.model('pushbullet', irclogSchema);

module.exports = pushbullet;