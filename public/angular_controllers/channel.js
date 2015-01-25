app.controller('channelController', function($scope, $stateParams, $jsonrpc) {
    //console.log('channelController::', $stateParams);

    publicControllers['channelController'] = $scope;

    var _MAX_COUNT_LIST = 15;

    $scope.chat = [];

    $scope.channelName = $stateParams.name;

    $scope.chatRoomUpdate = function (data) {

        $scope.chat.push(data);

        if ($scope.chat.length > _MAX_COUNT_LIST) {
            $scope.chat = $scope.chat.slice(1, $scope.chat.length);
        }

        $scope.$apply();
    };

    $jsonrpc.API.call('getLastIRCLog', {"channel":$stateParams.name}, function(response, rpcObject, xhr) {
        if ($jsonrpc.API.isErrorRpcResponse(response)) {
            $jsonrpc.API.showRPCError(response);
            return false;
        }
        $scope.chat = response.result;
        $scope.$apply();
    });

    if (!window.socket) return false;

    $jsonrpc.API.emit('setIRCChannel', {"channel":$stateParams.name}, function(response, rpcObject, emit) {
        console.log('setIRCChannel response::',response);
    });

});