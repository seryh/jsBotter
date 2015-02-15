
app.controller('channelController', function($scope, $stateParams, $jsonrpc) {
    publicControllers['channelController'] = $scope;

    var _MAX_COUNT_LIST = 50;

    $scope.chat = [];

    $scope.channelName = $stateParams.name;

    $scope.chatBoxScrollToBottom = function () {
        var chatBox = $('#chat-box');
        chatBox.scrollTop(chatBox[0].scrollHeight);
    };

    $scope.chatRoomUpdate = function (data) {
        data.newMsg = true;
        $scope.chat.push(data);

        if ($scope.chat.length > _MAX_COUNT_LIST) {
            $scope.chat = $scope.chat.slice(1, $scope.chat.length);
        }

        $scope.$apply();
        $scope.chatBoxScrollToBottom();

        $('.newmsg td').animate({ backgroundColor: '#ffffff' }, 5000, function() {
            $(this).closest('.newmsg').removeClass('newmsg');
        });

    };

    $jsonrpc.API.call('getLastIRCLog', {"channel":$stateParams.name, "limit":_MAX_COUNT_LIST}, function(response, rpcObject, xhr) {
        if ($jsonrpc.API.isErrorRpcResponse(response)) {
            $jsonrpc.API.showRPCError(response);
            return false;
        }

        $scope.chat = response.result;
        $scope.$apply();
        $scope.chatBoxScrollToBottom();
    });

    $jsonrpc.API.emit('setIRCChannel', {"channel":$stateParams.name}, function(response, rpcObject, emit) {
        if ($jsonrpc.API.isErrorRpcResponse(response)) {
            $jsonrpc.API.showRPCError(response);
            return false;
        }
        //console.log('setIRCChannel response::',response, emit);
    });

/*
    setInterval(function(){
        $scope.chatRoomUpdate({
            date: new Date(),
            nick: 'Test',
            message: 'Test message trolo lo lo l olr er lol ore ler oerl ooer er er'
        });
    }, 2000);*/

});

