/**
 * pushbullet plugin
 *
 * @type {exports}
 */

var PushBullet = require('pushbullet');

var pushbulletModel = require('../models/pushbullet'),
    util = require('util');

var _bulletPush = function(token, text, cb) {
    cb = cb || function() {};
    var pusher = new PushBullet(token);

    pusher.devices(function(error, response) {
        if (Boolean(error)) {
            cb(error, null);
            return false;
        }

        response.devices.forEach(function(item, index){
            pusher.note(item.iden, 'jsBotter', text, function(error, response) {
                cb(error, response);
            });
        });

    });
};

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
        vhost = util.format('%s@%s', raw.user, raw.host);

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


//!push Elected привет
var _push = function(client, nick, target, message, raw) {
    var re = /^(!push) (\S+) (.+)/gi,
        commandArr = re.exec(message);

    if (commandArr === null) return false;
    var nickToSend = commandArr[2],
        text;

    if (target === null) {
        text = util.format('%s: %s', target, nick, commandArr[3]);
    } else {
        text = util.format('(%s) %s: %s', target, nick, commandArr[3]);
    }

    pushbulletModel.findOne({networkName: client._networkName, nick:nickToSend },
        function (err, _model) {
            if (err) {
                client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                return false;
            }

            if (Boolean(_model) !== false) {
                _bulletPush(_model.token,text, function(err) {
                    if (Boolean(err)) {
                        client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                        return false;
                    }
                    client.say(nick, "Сообщение успешно отправлено юзеру - " + nickToSend);
                });
            } else {
                client.say(nick, util.format('Пользователь %s еще не обзавелся pushbullet', nickToSend) );
            }

        });

};

module.exports = {
    'message': function(nick, target, message, raw) {
        _push(this, nick, target, message, raw);
    },
    'pm': function(nick, message, raw) {

        _regPushToken(this, nick, message, raw);
        _getPushToken(this, nick, message, raw);

    }
};