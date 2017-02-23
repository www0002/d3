'use strict';

angular.module('Authentication')

    .controller('AuthController',
    ['$scope', '$rootScope', '$location', '$http', '$cookies', '$timeout', 'Base',
        function ($scope, $rootScope, $location, $http, $cookies, $timeout, Base) {

            $scope.cred = {};

            $rootScope.User = {};
            $cookies.remove('auth');
            
            $http.defaults.headers.common.Authorization = 'Basic ';
            //localStorage.setItem('user', JSON.stringify($rootScope.User));

            

            $scope.setCredentials = function (response) {
                $rootScope.User = angular.copy(response.data);
                //localStorage.setItem('user', JSON.stringify($rootScope.User));
            };

            $scope.login = function () {

                var authdata = btoa(unescape(encodeURIComponent($scope.cred.username + ':' + $scope.cred.password)))
                $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                $cookies.put('auth', authdata);

                Base.getUser()
                    .then(function (response) {
                        $scope.setCredentials(response);
                        $location.path('/');
                })

            };
        }]);

    