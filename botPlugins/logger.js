/**
 * loger and ws pusher
 *
 * @type {irclog|exports}
 */

var irclog = require('../models/irclog');

var sendToSubscribers = function(target, data) {

    var wsUsers = process.wsObserver.wsUsers;

    for (var userKey in wsUsers) {
        var user = null;
        if (wsUsers.hasOwnProperty(userKey)) {
            user = wsUsers[userKey];
        }
        if (!user) return false;

        user.ircChannels.forEach(function(channelName) {

            if ('#'+channelName === target && typeof user.socket == 'object') {
                user.socket.emit('runScopeMethod', {
                    controllerName: 'channelController',
                    methodName: 'chatRoomUpdate',
                    argument: data
                });
            }
        });

    }
};

module.exports = {
    'message': function(nick, target, message) {
        //var client = this;

        var logObj = irclog.add(target, nick, message);

        sendToSubscribers(target, {
            target: target,
            date: logObj.date,
            nick: nick,
            message: message
        })

    }
};