app.controller('channelController', function($scope, $stateParams) {
    console.log('channelController::', $stateParams);

    publicControllers['channelController'] = $scope;

    var query = [{"jsonrpc":"2.0","method":"setIRCChannel","params":{"channel":$stateParams.name},"id":1}];

    var _MAX_COUNT_LIST = 15;

    $scope.chat = [];

    $scope.chatRoomUpdate = function (data) {
        console.log('chatRoomUpdate::', data);
        $scope.chat.push(data);

        if ($scope.chat.length > _MAX_COUNT_LIST) {
            $scope.chat = $scope.chat.slice(1, $scope.chat.length);
        }

        $scope.$apply();
    };

    if (!window.socket) return false;

    socket.emit('jsonRPC', JSON.stringify(query));


});