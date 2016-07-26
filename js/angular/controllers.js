var app = angular.module("birlWeb", ['ui.ace']);


//CONTROLLERS

app.controller("birlCtrl", function($scope, birlService) {
    $scope.stdin = "";
    $scope.stdout = "";
    $scope.code = "HORA DO SHOW\n    CE QUER VER ESSA PORRA? (\"Hello, World! Porra!\\n\");\nBIRL";
    $scope.temErro = false;

    $scope.sendBirl = function(){
        $scope.temErro = false;
        $scope.stdout = "";
        birlService.runBirl($scope.code, $scope.stdin).then(function(data){
            $scope.stdout = data;
        }, function(error){
            if(error == "server-error") {
                $scope.stdout = "NÃO VAI DAR NÃO, SERVIDOR CAIU";
            } else {
                $scope.stdout = "ERRO DE COMPILAÇÃO CUMPADE";
            }
            $scope.temErro = true;
        });
    }

});

//SERVICES

app.service("birlService", function($http, $q) {
    this.runBirl = function(code, stdin){
        var deferred = $q.defer();
        $http.post("https://latexxbot.noip.me:13666/compile", {code: code, stdin: stdin }).then(function(data){
            if(data.error != "") {
                deferred.reject("compile-error");
            } else {
                deferred.resolve(data.stdout);
            }
        },function(error){
            deferred.reject("server-error");
        });
        return deferred.promise;
    }
});