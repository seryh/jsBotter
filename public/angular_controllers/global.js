var app = angular.module('karabamba', ['ngCookies', 'ui.bootstrap', 'ui.router', 'jsonrpc']);

var registerGlobalWSSocketMethods = function(socket, $scope, $jsonrpc) {

    if (!socket) return false;

    socket.on('connect', function(){

        var session = /s:(.*)\./ig.exec($scope.cookies['connect.sid'])[1];

        $jsonrpc.API.emit('setSessionToSocket', {"session":session}, function(response, rpcObject, emit) {
            //console.log('setSessionToSocket response::',response);
        });
    });

    socket.on('runScopeMethod', function (wsData) {
        var scope = publicControllers[wsData.controllerName];
        if (Boolean(scope) === false) return false;
        scope[wsData.methodName](wsData.argument);
        scope.$apply();
    });

};

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, content) {
    $scope.content = content;

    $scope.ok = function () {
        $modalInstance.close();
    };
});


var publicControllers = {},
    globalControllerScope = null;

app.controller('globalController', function($scope, $cookieStore, $modal, $cookies, $jsonrpc) {

    globalControllerScope = $scope;
    publicControllers['globalController'] = $scope;

    registerGlobalWSSocketMethods(socket, $scope, $jsonrpc);

    $scope.cookies = $cookies;

    /* присвоить куку */
    $scope.setCookies = function(obj) {
        $cookieStore.put(obj.name,obj.value);
    };

    $scope.reload = function() {
        location.reload();
    };

    $scope.eval = function(codeString) {
        eval(codeString);
    };

    $scope.modal = function(content) {
        $modal.open({
            templateUrl: 'modal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                content: function () {
                    return content;
                }
            }
        });
    };

    $scope.addToSession = function(data) {
        $jsonrpc.API.call('addToSession', data, function(responseJSON, rpcObject, xhr) {
            console.log('jsonRPCResponse post ajax::',response);
        });
    };

    $scope.getSession = function() {
        $jsonrpc.API.call('getSession', {}, function(responseJSON, rpcObject, xhr) {
            console.log('jsonRPCResponse post ajax::',responseJSON);
        });
    };

    $scope.getUserInfo = function(cb) {
        cb = cb || function(){};
        $jsonrpc.API.call('getUserInfo', {}, function(responseJSON, rpcObject, xhr) {
            cb(responseJSON);
        });
    };

});