var app = angular.module('karabamba', ['ngCookies', 'ui.bootstrap', 'ui.router', 'jsonrpc']);

var registerGlobalWSSocketMethods = function(socket, $scope) {

    if (!socket) return false;

    socket.on('connect', function(){
        //todo: прикрутить/написать обертку клиенского вызова json rpc api
        var session = /s:(.*)\./ig.exec($scope.cookies['connect.sid'])[1];
        var query = [{"jsonrpc":"2.0","method":"setSessionToSocket","params":{"session":session},"id":1}];
        socket.emit('jsonRPC', JSON.stringify(query));
    });


    socket.on('jsonRPCResponse', function(resp){
        //console.log('jsonRPCResponse::', resp);
        //todo: прикрутить обертку отлова конктертного ответа за запрос по id
    });

    socket.on('connect_error', function(err){

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

/* Посути фронтенд апи вызываемое с бекенда */
app.controller('globalController', function($scope, $cookieStore, $modal, $cookies, $jsonrpc) {

    //console.log('$jsonrpc->',$jsonrpc);

    /* чтобы в консоле браузера можно было тестировать, например: globalControllerScope.modal("foo bar") */
    globalControllerScope = $scope;
    publicControllers['globalController'] = $scope;

    registerGlobalWSSocketMethods(socket, $scope);

    $scope.cookies = $cookies;

    /* присвоить куку */
    $scope.setCookies = function(obj) {
        $cookieStore.put(obj.name,obj.value);
    };

    /* перезагрузить страничку */
    $scope.reload = function() {
        location.reload();
    };

    /* можно выполнить произвольный код */
    $scope.eval = function(codeString) {
        eval(codeString);
    };

    /* модальное окно с произвольным содержимым */
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

    //setTimeout(function() {
    //    $scope.getSession();
    //}, 1000);


});