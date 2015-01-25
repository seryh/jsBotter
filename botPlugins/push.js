/**
 * pushbullet plugin
 *
 * @type {exports}
 */

var PushBullet = require('pushbullet');

var pushbulletModel = require('../models/pushbullet'),
    util = require('util');

module.exports = {
    'message': function(nick, target, message, raw) {

    },
    'pm': function(nick, message, raw) {
        console.log('pm', nick, message, raw);
    }
};