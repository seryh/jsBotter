var fs = require('fs'),
    path_module = require('path');

function loadPlugins(path, cb) {
    cb = cb || function(){};
    fs.lstat(path, function(err, stat) {
        if (stat.isDirectory()) {
            fs.readdir(path, function(err, files) {
                var f, l = files.length;
                for (var i = 0; i < l; i++) {
                    f = path_module.join(path, files[i]);
                    loadPlugins(f, cb);
                }
            });
        } else {
            cb( require(path) );
        }
    });
}

var _help = function(client, nick, message, raw) {
    var re = /^(!help)/gi,
        commandArr = re.exec(message);

    if (commandArr === null) return false;

    client.say( nick, "читай тут http://hipgip.me:8001");
};

var irc = function(config) {
    var irc = require('irc')
        ,extend = require('extend')
        ,util = require('util');

    var _self = this;

    _self.clients = [];

    var opt = {
        userName: 'jsBotter',
        realName: 'jsBotter',
        port: 6667,
        debug: false,
        showErrors: false,
        autoRejoin: true,
        autoConnect: false,
        channels: [],
        secure: false,
        selfSigned: false,
        certExpired: false,
        stripColors: false,
        messageSplit: 512
    };

    var onConnect = function(connectInfo, channels, client) {
            console.log('jsBotter connected to %s', connectInfo.server);

            client.send('/set charset utf8');
            client.send('/charset utf8');
            client.send('/quote codepage utf8');

            channels.forEach(function (channel) {
                client.join(channel, function() {
                    //client.say(channel, "Всем тунца");
                });
            });
        },
        onJoin = function(channel, who) { /* кто-то входит на канал*/
            //console.log('%s has joined %s', who, channel);
        },
        onMessage = function(nick, target, message) { /*все сообщения*/
            var client = this;


        },
        onPrivate = function(nick, message, raw) { /*приватные сообщения*/

            _help(this, nick, message, raw);
            //client.say(nick, "тунца");
        },
        onError = function(message) {
            console.log('error: ', message);
        };

    config.join.forEach(function (item) {
        var mergeOpt =  extend({}, opt, {port:item.port});

        var client = new irc.Client(item.server, 'jsBotter', mergeOpt);
        client['_networkName'] = item.networkName;

        client.connect(3, function(connectInfo) {
            onConnect(connectInfo, item.channels, this);
        });

        client.addListener('message', onMessage);
        client.addListener('join', onJoin);
        client.addListener('pm', onPrivate);
        client.addListener('error', onError);

        loadPlugins(path_module.join(__dirname, '../botPlugins'), function(plugin) {
            for (var plTrigger in plugin) {
                var plFunction = plugin[plTrigger];
                if (typeof plFunction === 'function')
                    client.addListener(plTrigger, plFunction);
            }
        });

        _self.clients.push(client);
    });

    return _self.clients;
};



module.exports = irc;