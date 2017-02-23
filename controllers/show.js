'use strict';

angular.module('show')

    .controller('show',
    ['$scope', 'Base', '$location', '$rootScope', '$routeParams',
        function ($scope, Base, $location, $rootScope, $routeParams) {

            //// **** working code!
            $scope.entity = 'views/' + $routeParams.entity + '.html';

            $scope.id = $routeParams.id;

            // query data by id

            // set ng-include


        }])




