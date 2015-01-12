var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var irclogSchema = new Schema({
      channel      :  { type: String }
    , networkName  :  { type: String }
    , nick         :  { type: String }
    , message      :  { type: String }
    , date         :  { type: Date }
},  { collection: 'irclog' });

var irclog = mongoose.model('irclog', irclogSchema);

module.exports = irclog;