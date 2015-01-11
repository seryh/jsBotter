app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise( '/info' );

    $stateProvider
        .state('info', {
            url: "/info",
            templateUrl: "/public/angular_templates/info.html",
            controller: 'infoController'
        })
        .state('channel', {
            url: "/channel/:name",
            templateUrl: "/public/angular_templates/channel.html",
            controller: 'channelController'
        });
}]);

app.controller('navbarController', function($scope) {
    publicControllers['navbarController'] = $scope;
    $scope.onlineCount = 0;

    $scope.user = null;

    $scope.setOnlineCount = function(count) {
        $scope.onlineCount = count;
    };

    //console.log($scope.$parent.getUserInfo);

    $scope.$parent.getUserInfo(function(response){
        $scope.user = response.result.user;
        $scope.$apply();
    });
});