/**
 * pushbullet plugin
 *
 * @type {exports}
 */

var PushBullet = require('pushbullet');

var pushbulletModel = require('../models/pushbullet'),
    util = require('util');

var _regPushToken = function(client, nick, message, raw) {
    var re = /^(!regpush) (\S+)/gi,
        commandArr = re.exec(message),
        token;

    if (commandArr === null) return false;
        token = commandArr[2] || null;

    var model = new pushbulletModel();

    model.networkName = client._networkName;
    model.nick = nick;
    model.token = token;
    model.vhost =  util.format('%s@%s', raw.user, raw.host) ;
    model.date = new Date();


    //todo поиск по хосту/нику чтобы 1 токен на одного юзера
    model.save(function (err) {
        if (err) {

            return false;
        }
        client.say(nick, "API key для pushbullet зарегестрирован");
    });

};

module.exports = {
    'message': function(nick, target, message, raw) {

    },
    'pm': function(nick, message, raw) {

        _regPushToken(this, nick, message, raw);


    }
};