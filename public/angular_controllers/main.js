app.filter('sortByName', function() {
    return function(array, name) {
        var sortArray = _.sortBy(array, function(item){
            return item[name];
        });
        if (JSON.stringify(sortArray) == JSON.stringify(array)) {
            sortArray.reverse();
        }
        return sortArray;
    };
});

app.filter('sortByNum', function() {
    return function(array, num) {
        var sortArray = _.sortBy(array, function(item){
            return item[num];
        });
        if (JSON.stringify(sortArray) == JSON.stringify(array)) {
            sortArray.reverse();
        }
        return sortArray;
    };
});

app.controller('mainController', function($scope, $filter, $cookies) {

    //console.log( $cookies['SESSION-GUID'] );

    $scope.link = function(link) {
        window.location.assign(link);
    };

    $scope.sortByName = function(name) {
        $scope.spendingDatepickerList = $filter('sortByName')($scope.spendingDatepickerList, name);
    };

    $scope.sortByNum = function(num) {
        $scope.spendingDatepickerList = $filter('sortByNum')($scope.spendingDatepickerList, num);
    };


});



