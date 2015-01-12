app.controller('channelController', function($scope, $stateParams) {
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

    $.ajax({
        url: '/api',
        data: JSON.stringify({"jsonrpc":"2.0","method":"getLastIRCLog","params":{"channel":$stateParams.name},"id":1}),
        type: 'POST',
        cache: false,
        dataType : "json",
        success: function (response) {
            $scope.chat = response.result;
            $scope.$apply();
        }
    });

    if (!window.socket) return false;

    socket.emit('jsonRPC', JSON.stringify({"jsonrpc":"2.0","method":"setIRCChannel","params":{"channel":$stateParams.name},"id":1}));


});