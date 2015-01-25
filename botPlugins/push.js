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

    pushbulletModel.findOne({networkName: client._networkName, nick: nick },
        function (err, _model) {
            if (err) {
                client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                return false;
            }

            var model;

            if (Boolean(_model) === false) {
                model = new pushbulletModel();
            } else {
                model = _model;
            }

            model.networkName = client._networkName;
            model.nick = nick;
            model.token = token;
            model.vhost =  util.format('%s@%s', raw.user, raw.host);
            model.date = new Date();

            model.save(function (err2) {
                if (err2) {
                    client.say(nick, "Произошла ошибка "+JSON.stringify(err2));
                    return false;
                }
                client.say(nick, "API key для pushbullet успешно зарегестрирован");
            });
        });
};

var _getPushToken = function(client, nick, message, raw) {
    var re = /^(!getpush)/gi,
        commandArr = re.exec(message),
        vhost = vhost =  util.format('%s@%s', raw.user, raw.host);

    if (commandArr === null) return false;

    pushbulletModel.findOne({networkName: client._networkName, nick:nick, vhost:vhost },
        function (err, _model) {
            if (err) {
                client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                return false;
            }

            if (Boolean(_model) !== false) {
                client.say(nick, "Ваш токен - " + _model.token);
            } else {
                client.say(nick, "Токен не найден, или у вас нет доступа по vhost");
            }

        });
};

module.exports = {
    'message': function(nick, target, message, raw) {

    },
    'pm': function(nick, message, raw) {

        _regPushToken(this, nick, message, raw);
        _getPushToken(this, nick, message, raw);


    }
};