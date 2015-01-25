/**
 * pushbullet plugin
 *
 * @type {exports}
 */

var PushBullet = require('pushbullet');

module.exports = {
    'message': function(nick, target, message, raw) {

    },
    'pm': function(nick, message, raw) {
        console.log('pm', nick, message, raw);
    }
};