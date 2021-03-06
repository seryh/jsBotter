'use strict';

angular.module('jsonrpc', ['uuid', 'ui.bootstrap']).service('$jsonrpc', function(uuid4, $modal) {

    var jsonrpc = this;

    jsonrpc.config = {
        "API": "/api",
        "transportAPI": "POST"
    };

    var _clearParams = function(params) {
        delete params["API"];
        delete params["transportAPI"];
        return params;
    };

    var API = function () {
        var self = this;

        this.timeOutSec = 60;
        this.xhrsActive = [];
        this.cocketActive = {};
        this.isSocketAvalible = false;

        if (!socket) return false;

        socket.on('jsonRPCResponse', function(resp){

            if (Object.prototype.toString.call( resp ) === '[object Object]') {
                var index = -1;
                for (var uuid in self.cocketActive) {

                    index++;
                    var emit = null;
                    if (self.cocketActive.hasOwnProperty(uuid)) {
                        emit = self.cocketActive[uuid];
                    }
                    if (!Boolean(emit)) return false;
                    emit.status = 200;

                    if (uuid === resp.id) {
                        emit.callback(resp, emit.data, emit);
                        delete self.cocketActive[uuid];
                        break;
                    }
                }

            } else if (Object.prototype.toString.call( resp ) === '[object Array]') {
                self.showRPCErrorPlain('Массив данных на сокетах пока не поддерживается');
            }

        });

        socket.on('connect_error', function(err){
            self.isSocketAvalible = false;
        });

        socket.on('connect', function(){
            self.isSocketAvalible = true;
        });

        var _watcher = function() {
            //очищаем cocketActive по таймауту, выводим ошибку timeout в клиент
            var index = -1;
            for (var uuid in self.cocketActive) {
                index++;
                var emit = null;
                if (self.cocketActive.hasOwnProperty(uuid)) {
                    emit = self.cocketActive[uuid];
                }
                if (!Boolean(emit)) return false;
                var _now = Math.floor(new Date().getTime() / 1000);
                if ((_now - emit.date) > self.timeOutSec) {
                    self.showRPCErrorPlain('Timeout error, query - '+emit.data.method + ' uuid:'+uuid, uuid);
                    delete self.cocketActive[uuid];
                    break;
                }
            }
        };

        setInterval(_watcher,1000);
    };

    API.prototype.xhrRemove = function(xhr) {
        var self = this;
        $.each(this.xhrsActive,function(index, item){
            if (item === xhr) {
                self.xhrsActive.splice(index, 1);
            }
        });
    };

    API.prototype.isErrorRpcResponse = function(rpcResponse, cbItem) {
        cbItem = cbItem || function(){};
        var self = this, isError;
        if( Object.prototype.toString.call( rpcResponse ) === '[object Array]' ) {
            isError = true;
            $.each(rpcResponse, function(i, item) {
                isError = isError && !self.isErrorRpcResponse(item);
                cbItem(item, !isError);
                if (!isError) return true;
            });
            return !isError;
        }
        isError = Boolean(rpcResponse.error);
        cbItem(rpcResponse, isError);
        return isError;
    };

    API.prototype.dataToRPCFormat = function(data, method, id){
        if (typeof data != 'object') return '';
        var JSONRPCFormat = {"jsonrpc":"2.0","method":method,"params":{},"id":id};
        JSONRPCFormat.params = data;
        return JSONRPCFormat;
    };

    API.prototype.dateFormat = function(date) {
        if (!date) return false;
        var hh = date.getHours().toString(),
            mm = date.getMinutes().toString();
        hh = (hh.length < 2) ? "0" + hh : hh;
        mm = (mm.length < 2) ? "0" + mm : mm;
        var dateStr = $.datepicker.formatDate( "yy-mm-dd", date),
            format = dateStr+ ' ' + hh + ':' + mm;
        return {
            'apiFormat':format,
            'hh':hh,
            'mm':mm,
            'dateStr': dateStr,
            'date': date
        };
    };

    API.prototype.call = function(method, params, callback) {
        var _GLOBAL_OPTIONS = jsonrpc.config,
            uuid = uuid4.generate();
        var rpcObject = this.dataToRPCFormat(_clearParams($.extend({},_GLOBAL_OPTIONS, params)), method, uuid),
            self = this,
            data = null;
        if (_GLOBAL_OPTIONS.transportAPI == 'GET') {
            data = {rawRequest : JSON.stringify(rpcObject)};
        } else if (_GLOBAL_OPTIONS.transportAPI == 'POST') {
            data = JSON.stringify(rpcObject);
        }
        var xhr = $.ajax({
            url: _GLOBAL_OPTIONS.API,
            data: data,
            type: _GLOBAL_OPTIONS.transportAPI,
            cache: false,
            dataType : "json",
            complete: function(jqXHR, textStatus) {
                self.xhrRemove(xhr);
                if (jqXHR.status == 200) {
                    callback(jqXHR.responseJSON, rpcObject, xhr);
                } else {
                    callback({"jsonrpc": "2.0", "error": {"code": -32601, "message": textStatus}, "id": uuid}, rpcObject, xhr);
                }
            }
        });
        this.xhrsActive.push(xhr);
    };

    API.prototype.calls = function(params, callback) {
        var _GLOBAL_OPTIONS = jsonrpc.config;

        if (Object.prototype.toString.call( params ) != '[object Array]') return false;
        var self = this,
            data = null,
            req = [];
        $.each(params, function(i, item) {
            req.push( self.dataToRPCFormat(_clearParams($.extend({},_GLOBAL_OPTIONS, item.data)), item.method, i+1) );
        });
        if (_GLOBAL_OPTIONS.transportAPI == 'GET') {
            data = {rawRequest : JSON.stringify(req)};
        } else if (_GLOBAL_OPTIONS.transportAPI == 'POST') {
            data = JSON.stringify(req);
        }
        var xhr = $.ajax({
            url: _GLOBAL_OPTIONS.API,
            data: data,
            type: _GLOBAL_OPTIONS.transportAPI,
            cache: false,
            dataType : "json",
            complete: function (jqXHR, textStatus) {
                self.xhrRemove(xhr);
                if (jqXHR.status == 200) {
                    callback(jqXHR.responseJSON, req, xhr);
                } else {
                    callback({"jsonrpc": "2.0", "error": {"code": -32601, "message": textStatus}, "id": 1}, req, xhr);
                }
            }
        });
        this.xhrsActive.push(xhr);
    };

    API.prototype.showRPCErrorPlain = function(text, id) {
        id = id || 1;
        this.showRPCError({"jsonrpc": "2.0", "error": {"code": -32601, "message": text}, "id": id});
    };

    API.prototype.showRPCError = function (rpcResponse, onOk) {
        onOk = onOk || function () {};
        var self = this;
        if (Object.prototype.toString.call(rpcResponse) === '[object Array]') {
            $.each(rpcResponse, function (i, item) {
                rpcResponse = item;
                if (self.isErrorRpcResponse(item)) return false;
            });
        }

        if (rpcResponse.error.data) {
            rpcResponse.error.message = rpcResponse.error.message + '<br />' + rpcResponse.error.data;
        }
        if (Boolean(rpcResponse.error.message) == false) {
            rpcResponse.error.message = JSON.stringify(rpcResponse.error);
        }

        $modal.open({
            templateUrl: 'modal.html',
            controller: function ($scope, $modalInstance, content) {
                $scope.content = content;
                $scope.title = 'JSON RPC ERROR:';
                $scope.ok = function () {
                    onOk($scope);
                    $modalInstance.close();
                };
            },
            resolve: {
                content: function () {
                    return rpcResponse.error.message;
                }
            }
        });

    };

    API.prototype.emit = function(method, params, callback) {
        var _GLOBAL_OPTIONS = jsonrpc.config,
            uuid = uuid4.generate();
        var rpcObject = this.dataToRPCFormat(_clearParams($.extend({},_GLOBAL_OPTIONS, params)), method, uuid),
            self = this,
            data = null;
        if (_GLOBAL_OPTIONS.transportAPI == 'GET') {
            data = {rawRequest : JSON.stringify(rpcObject)};
        } else if (_GLOBAL_OPTIONS.transportAPI == 'POST') {
            data = JSON.stringify(rpcObject);
        }

        if (Boolean(window.socket) === false ) {
            this.call(method, params, callback);
            return false;
        }

        socket.emit('jsonRPC', data);

        this.cocketActive[uuid] = {
            callback: callback,
            data: rpcObject,
            type: 'socket',
            status: null,
            date: Math.floor(new Date().getTime() / 1000)
        };

    };

    jsonrpc.setConfig = function(conf) {
        return $.extend(jsonrpc.config, conf);
    };

    jsonrpc.API =  new API();


});