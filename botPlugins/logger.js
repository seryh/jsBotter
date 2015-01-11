/**
 * loger and ws pusher
 *
 * @type {irclog|exports}
 */

var irclog = require('../models/irclog');

module.exports = {
    'message': function(nick, target, message) {
        var client = this;

        irclog.add(target, nick, message);

        var wsUsers = process.wsObserver.wsUsers;

        for (var userKey in wsUsers) {
            var user = wsUsers[userKey];
            /*
            user.socket.emit('runScopeMethod', {
                controllerName: 'navbarController',
                methodName: 'addToChatLine',
                argument: {
                    target: target,
                    nick:nick,
                    message:message
                }
            });
            */
        }

    }
};