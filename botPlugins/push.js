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
            if (item.type === 'ios' || item.type === 'android') { // only mobile platform
                pusher.note(item.iden, 'jsBotter', text, function(error, response) {
                    cb(error, response);
                });
            }

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

    pushbulletModel.findOne({networkName: client._networkName, nick: new RegExp('^'+nick+'$', "i"), vhost:vhost },
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

var _getList = function(client, nick, message, raw) {
    var re = /^(!getlist)/gi,
        commandArr = re.exec(message);

    if (commandArr === null) return false;

    pushbulletModel.find({networkName: client._networkName},
        function (err, _models) {
            if (err) {
                client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                return false;
            }

            var list = '';
            _models.forEach(function(item, index){
                list = list + item.nick + ', ';
            });

            if (Boolean(list) === false) {
                client.say(nick, "Нет push пользователей :(");
            } else {
                client.say(nick, "user list: " + list);
            }

        });
};

var _ACTIVE_LIST = {};

var _clearing_active_list_loop = function() {
    for (var userMask in _ACTIVE_LIST) {
        if( !_ACTIVE_LIST.hasOwnProperty(userMask) ) continue;

        var items = _ACTIVE_LIST[userMask];
        if (items.length === 0) {
            delete _ACTIVE_LIST[userMask];
            continue;
        }

        items.forEach(function (item, index) {
            var now = Math.floor(new Date().getTime() / 1000),
                left = now - item.time;
            if (left >= (60*5)) { //5 minutes
                items.splice(index, 1);
            }

        });

    }
};

setInterval(_clearing_active_list_loop, 1000); //1 second

//!push Elected привет
var _push = function(client, nick, target, message, raw) {
    var re = /^(!push) (\S+) (.+)/gi,
        commandArr = re.exec(message),
        userMask = util.format('%s@%s@%s', raw.user, raw.host, client._networkName);

    if (commandArr === null) return false;
    var nickToSend = commandArr[2],
        text;

    if (target === null) {
        text = util.format('%s: %s', target, nick, commandArr[3]);
    } else {
        text = util.format('(%s) %s: %s', target, nick, commandArr[3]);
    }

    pushbulletModel.findOne({networkName: client._networkName, nick: new RegExp('^'+nickToSend+'$', "i") },
        function (err, _model) {
            if (err) {
                client.say(nick, "Произошла ошибка "+JSON.stringify(err));
                return false;
            }

            if (Boolean(_model) !== false) {

                if ( Boolean(_ACTIVE_LIST[userMask]) === true && _ACTIVE_LIST[userMask].length >= 3) {
                    if (target === null) {
                        client.say(nick, "полегче друже, не более 3 сообщений за 5 минут");
                    } else {
                        client.say(target, nick+ ", полегче друже, не более 3 сообщений за 5 минут");
                    }
                    return false;
                }

                if ( Boolean(_ACTIVE_LIST[userMask]) === true ) {
                    _ACTIVE_LIST[userMask].push({
                        'time' : Math.floor(new Date().getTime() / 1000),
                        'nick' : nick
                    })
                } else {
                    _ACTIVE_LIST[userMask] = [{
                        'time' : Math.floor(new Date().getTime() / 1000),
                        'nick' : nick
                    }];
                }

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
        _getList(this, nick, message, raw);

    }
};