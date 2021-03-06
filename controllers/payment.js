'use strict';

angular

    .module('Payment')

    .controller('PaymentController',
    ['$scope', 'Base', '$location', 'Payment', '$rootScope', '$routeParams', '$timeout', '$anchorScroll',
        function ($scope, Base, $location, Payment, $rootScope, $routeParams, $timeout, $anchorScroll) {

            if (!Payment.state) { $location.path('/') };

            $scope.Payment = Payment;

            $scope.activeView = $routeParams.link;

            $scope.defaultFocus = true;

            if ($rootScope.clientList === undefined) {
                $scope.clientView = "filter";
            } else {
                $scope.clientView = "select";
                if ($rootScope.clientListLastSelected) {
                    $timeout(function () { $anchorScroll($rootScope.clientListLastSelected); });
                };
            };

            if ($scope.activeView === 'document' && Payment.autoClientChoice && !Payment.client) {
                $scope.chooseClient();
                Payment.autoClientChoice = false;
            };

            $scope.switchToClientFilter = function () {
                $scope.clientView = "filter";
                // $scope.defaultFocus = true;

            };

            $scope.chooseClient = function () {
                $location.path('/payment/client/filter');
            };

            $scope.onSelectClient = function (idx) {
                var client = $rootScope.clientList[idx];
                $rootScope.clientListLastSelected = 'cli-' + idx;
                Payment.client = client;
                // Payment.setClient(client);
                // $rootScope.deliberateBack = true;

                Payment.debts = [];
                Base.getDebts( { id: Payment.client.ref_key } )
                    .then ( function (response) {
                        Payment.debts = response.data;
                        Payment.recalcSum();
                        $timeout(function () {
                            componentHandler.upgradeDom();
                        });
                    });


                window.history.back();
            };

            $scope.findClient = function () {
                // $timeout(Payment.getClients);

                Base.getClients({ descr: encodeURIComponent(Payment.clientDescr || ' ') })
                    .then(function (response) {

                        // Payment.clientList = response.data.value;
                        $rootScope.clientList = response.data.value;

                        $scope.clientView = "select";
                    });

            };

            // $scope.Payment.activeForm = $routeParams.attr + "/" + $routeParams.form;

            // $scope.findClient = function () {
            //     $location.path('/payment/client/select');
            //     $rootScope.$broadcast('updatePaymentClientList');
            // };

            // $scope.$on('updatePaymentClientList', function (e) {
            //     Base.getClients({ descr: encodeURIComponent(Payment.clientDescr||' ') })
            //         .then( function (response) {
            //             Payment.clientList = response.data.value;
            //         });
            // });

            // $scope.onSelectClient = function (client) {
            //     Payment.client = client;
            //     $location.path('/payment/debts/specify');
            //     $rootScope.$broadcast('updatePaymentDebts');
            // };

            // $scope.$on('updatePaymentDebts', function (e) {
            //     Payment.debts = [];
            //     Base.getDebts( { id: Payment.client.ref_key } )
            //         .then ( function (response) {
            //             Payment.debts = response.data;
            //             Payment.recalcSum();
            //             $timeout(function () {
            //                 componentHandler.upgradeDom();
            //             });
            //         });
            // });





            $scope.exit = function () {
                Payment.clear();
                $location.path('/');
            };

            $scope.save = function () {

                var vm = this;

                if (Payment.state === 'pending') {
                    alertify.error('ожидается ответ от сервера');
                    return;
                };

                Payment.state = 'pending';

                Base.postPayment({ client: Payment.client, totalSum: Payment.sum, debts: Payment.debts })
                    .then(function (response) {
                        Payment.state = response.data.state;
                        if (Payment.state === 'error') {
                            u12.alertErr(response.data.message);
                        } else if (Payment.state === 'success') {
                            u12.alertSuc(response.data.message);
                            vm.exit();
                        } else if (Payment.state === undefined) {
                            Payment.state = 'process';
                            u12.alertLog(response.data.message);
                        } else {
                            u12.alertLog(response.data.message);
                        };

                    })
                    .catch(
                    function (response) {
                        Payment.state = 'error';
                        //alertify.error('ошибка');
                        u12.alertErr('ошибка');
                    });

            };

        }])

    .factory('Payment',
    ['Base', '$rootScope', '$location', '$timeout',
        function (Base, $rootScope, $location, $timeout) {

            return {

                clear: function () {
                    u12.clearData(this);
                },

                init: function () {
                    u12.clearData(this);
                    //this.clientDescr = 'магомед';
                    this.state = 'started';
                    this.sum = 0;
                    this.debts = [];
                },

                onCkeckDebt: function (debt) {

                    if (debt.checked) {
                        debt.observedSum = debt.debt;
                    } else {
                        debt.observedSum = 0;
                    };

                    this.recalcSum();

                },

                recalcSum: function () {

                    if (this.debts.some(function (e) { return e.observedSum < 0; })) {
                        this.sum = 0;
                    } else {
                        this.sum = u12.money(this.debts.reduce(function (a, e) { return a + e.observedSum }, 0));
                    };
                }

            }

        }]);
