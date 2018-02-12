var startServerService = angular.module('startServerService', []);

uploadService.factory('StartServerService', function($http) {
    return {
        getCredentials: function(cb) {
            $http.get("data/credentials.json",  {
                headers: {
                    'Content-type': 'application/json'
                }
            })
            .success(function(res) {
                cb(res);
            })
            .error(function(data, status) {
                cb(false);
            })
        }
    }
});