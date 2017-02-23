'use strict';

var u12 = {

    message: function (text) {

        // var snackbarContainer = document.querySelector('#d3-toast-container');
        // var data = { message: text };
        // snackbarContainer.MaterialSnackbar.showSnackbar(data);

        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar({ message: 'Image Uploaded' });

    },

    money: function (variable) {
        // return parseFloat(Math.round(Number(variable) * 100) / 100).toFixed(2);
        return parseFloat(Math.round(Number(variable) * 100) / 100);

    },

    clearData: function (obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property) && typeof obj[property] != "function") {
                delete obj[property];
            }
        }
    },

    objInfo: function (obj, typeOfInfo) {
        if (typeOfInfo == 'address') {
            var info = obj["КонтактнаяИнформация"].filter(function (e) { return e["Тип"] == "Адрес" });
            return (info.length > 0) ? info[0]["Представление"] : "";
        }
    },

    likePattern: function (searchString) {
        return searchString.replace(/~+$/, '').replace(/ /g, '%') + '%';
    },

    alertWrap: function (msg, msgType) {
        // alertify.closeLogOnClick(true);
        if (msg === undefined || msg.toString() === '') {
            return;
        } else if (typeof msg === 'string') {
            if (msgType === 'log') {
                alertify.delay(msg.length * 50);
                alertify.log(msg);
            } else if (msgType === 'err') {
                alertify.delay(0);
                alertify.error(msg);
            } else if (msgType === 'suc') {
                alertify.delay(msg.length * 50);
                alertify.success(msg);
            }
        } else if (typeof msg === 'object') {
            msg.forEach(function (m) { u12.alertWrap(m, msgType) });
        };
    },

    alertLog: function (msg) {
        this.alertWrap(msg, 'log');
    },

    alertErr: function (msg) {
        this.alertWrap(msg, 'err');
    },

    alertSuc: function (msg) {
        this.alertWrap(msg, 'suc');
    },

    guid: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

};


angular.module('Authentication', []);
angular.module('Home', []);
angular.module('Order', []);
angular.module('Payment', []);
angular.module('show', []);



angular.module('d3', [
    'Authentication'
    , 'Home'
    , 'Order'
    , 'Payment'
    , 'show'
    , 'ngRoute'
    , 'ngCookies'
    // ,'ngAlertify'
])


    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider

            .when('/payment/:attr/:form', {
                controller: 'PaymentController',
                templateUrl: 'views/payment.html'
            })

            // .when('/order/:part/:line/:attr/:form', {
            .when('/order/:link*', {
                controller: 'OrderController',
                templateUrl: 'views/order.html'
            })


            // .when('/order/:attr/:form', {
            //     controller: 'OrderController',
            //     templateUrl: function (urlattr) {
            //         return 'views/' + urlattr.form + '.html';
            //     }
            // })


            .when('/login', {
                controller: 'AuthController',
                templateUrl: 'views/login.html'
            })

            .when('/', {
                controller: 'HomeController',
                templateUrl: 'views/home.html'
            })

            .otherwise({ redirectTo: '/' });
    }])

    // .controller("myController", function ($scope, alertify) {
    //     alertify.success("Welcome to alertify!");
    // })

    .run(['$rootScope', '$location', '$cookies', '$http', '$timeout',
        function ($rootScope, $location, $cookies, $http, $timeout) {

            $rootScope.$on('$viewContentLoaded', function (event) {
                $timeout(function () {
                    componentHandler.upgradeAllRegistered();
                }, 0);
            });

            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('auth'); // jshint ignore:line
            //$rootScope.User = JSON.parse(localStorage.getItem('user'));

            $rootScope.$on('$locationChangeStart', function (event, next, current) {

                if ($location.path() !== '/login' && !$cookies.get('auth')) {
                    $location.path('/login');
                }
            });

            $rootScope.$on('$locationChangeSuccess', function() {
                    $rootScope.actualLocation = $location.path();
                });        

            $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
                    if($rootScope.actualLocation === newLocation) {
                        if ($rootScope.deliberateBack) {
                            $rootScope.deliberateBack = false;
                            // console.log('deliberateBack');
                        } else {
                            // console.log('history back');
                            // if (newLocation = '/order/spec' && !Order.currSpecLine.product && Order.autoSpecNewLine) { 
                            //     Order.autoSpecNewLine = false;
                            //     window.history.back();
                            // };
                        };
                        
                    }
                });

            // $rootScope.$back = function () {
            //     window.history.back();
            // };

            //alertify.reset().maxLogItems(3).closeLogOnClick(true).delay(3000);
            alertify.maxLogItems(3).closeLogOnClick(true);

            $rootScope.consoleLog = function (a, stringify) {
                console.log((stringify) ? JSON.stringify(a) : a)
                //componentHandler.upgradeDom()
            };

            $location.path('/');

        }])

    // .directive('focusMe', function ($timeout) {
    //     return {
    //         link: function (scope, element, attrs) {
    //             scope.$watch(attrs.focusMe, function (val) {
    //                 if (angular.isDefined(val) && val) {
    //                     $timeout(function () { element[0].focus(); });
    //                 }
    //             }, true);

    //             element.bind('blur', function () {
    //                 if (angular.isDefined(attrs.ngFocusLost)) {
    //                     scope.$apply(attrs.ngFocusLost);

    //                 }
    //             });
    //         }
    //     };
    // })

.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          });
        }
      });
    }
  };
})





// .directive('myRepeat', function () {
//     return {
//         replace : true,
//         link: function ($scope, $elem, attrs) {

//             $scope.$watch('collectionObject', function (oldValue, newValue) {
//                 var tableRow = "";
//                 angular.forEach($scope.collectionObject, function (item) {
//                     tableRow = tableRow + '<li class="mdl-menu__item" ng-click="consoleLog(' + "'" + item.id + "'" + ')">' + item.description + '</li>';
//                 });

 
                
//                 //If IE is your primary browser, 
//                 //innerHTML is recommended to increase the performance
//                 //$elem.context.innerHTML = tableRow;
//                 //If IE is not your primary browser, 
//                 //just appending the content to the element is enough .
//                 $elem.append(tableRow);
//             });
//         }
//     }
// })



    .directive('selectOnFocus', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var focusedElement = null;

                element.on('focus', function () {
                    var self = this;
                    if (focusedElement != self) {
                        focusedElement = self;
                        $timeout(function () {
                            self.select();
                        }, 10);
                    }
                });

                element.on('blur', function () {
                    focusedElement = null;
                });
            }

        }

    })

    .factory('Base',
    ['$http', '$cookies', '$rootScope',
        function ($http, $cookies, $rootScope) {

            return {

                query: function (cfg) {

                    $rootScope.dataLoading = true

                    // if (cfg.url[0] !== '/') { cfg.url = '/Trade/hs/b12v1/' + cfg.url };
                    //if (cfg.url[0] !== '/') { cfg.url = '/mexico/hs/b12v1/' + cfg.url };
                    if (cfg.url[0] !== '/') { cfg.url = '/UT/hs/mv1/' + cfg.url };

                    if (!cfg.method) { cfg.method = 'GET' };

                    // return $http(cfg)
                    //     .then(cfg.succ)
                    //     .catch(cfg.fail)
                    //     .finally(function () { $rootScope.dataLoading = false })

                    return $http(cfg).finally(function () { $rootScope.dataLoading = false })

                },


                // getUser: function (succ) {
                //     return this.query({ url: 'User', succ: succ });
                // },

                // getClients: function (params, succ) {
                //     return this.query({
                //         url: 'Client',
                //         params: params,
                //         succ: succ
                //     });
                // },

                getUser: function () {
                    return this.query({ url: 'User' });
                },

                getClients: function (params) {
                    return this.query({
                        url: 'Client',
                        params: params,
                    });
                },




                getProducts: function (params, succ) {
                    return this.query({
                        url: 'Product',
                        params: params,
                        succ: succ
                    });
                },

                getDebts: function (params, succ) {
                    return this.query({ url: 'Payment', params: params, succ: succ });
                },

                postPayment: function (data, succ, fail) {
                    return this.query({ method: 'POST', url: 'Payment', data: data, succ: succ, fail: fail });
                },

                postOrder: function (data, succ, fail) {
                    return this.query({ method: 'POST', url: 'Order', data: data, succ: succ, fail: fail });
                }

            }

        }])


    ;

