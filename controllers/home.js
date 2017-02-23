'use strict';


angular.module('Home')
// angular.module('Home', ["ngAlertify"])


    .controller('HomeController',
    ['$scope', '$rootScope', '$location', 'Order', 'Payment', 'Base', '$cookies',
        function ($scope, $rootScope, $location, Order, Payment, Base, $cookies) {

            Order.clear();

            Base.getUser().then(function (response) {
                $rootScope.User = angular.copy(response.data);

                // prolong cookie
                // if ($rootScope.User.name) {
                //     var authdata = $cookies.get('auth');
                //     var expireDate = new Date();
                //     expireDate.setDate(expireDate.getDate()+14);
                //     $cookies.put('auth', authdata, {'expires': expireDate});
                // };

            });

            $scope.startOrder = function (action) {
                Order.init();
                $location.path('/order/document')
            };

            $scope.startPayment = function (action) {
                Payment.init();
                $location.path('/payment/client/filter')
            };



        }])