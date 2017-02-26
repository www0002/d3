'use strict';

angular

    .module('Order')

    .controller('OrderController',
    ['$scope', 'Base', '$location', 'Order', '$rootScope', '$routeParams', '$timeout', '$anchorScroll',
        function ($scope, Base, $location, Order, $rootScope, $routeParams, $timeout, $anchorScroll) {

            if (!Order.state) { $location.path('/'); return; };

            $scope.Order = Order;
            
            $scope.activeView = $routeParams.link;

            $scope.defaultFocus = true;

            //*******************************************************************
            //******************   product
            //*******************************************************************

            $scope.chooseProduct = function() {
                $location.path('/order/product/filter');
            };

            $scope.findProduct = function() {
                //$timeout(Order.getProducts);
                Base.getProducts({ descr: encodeURIComponent(Order.productDescr||' ') })
                    .then( function (response) { 
                        Order.productList = response.data.value; 
                        $scope.productView = "select";

                    });
                $scope.productView = "select";
  
            };

            $scope.onSelectProduct = function (product) {

                // find existing line by product ref_key

                Order.currSpecLine.product = product;
                // Order.currSpecLine.price = (product.price || 0) ;
                Order.currSpecLine.price =  0;

                var existLine = Order.specFindLineByProduct(product);
                if (existLine) {
                    u12.alertLog('Товар уже есть в заказе');
                    Order.currSpecLine = angular.copy(existLine);
                };

                Base.getProducts({ ProductId: Order.currSpecLine.product.ref_key, ClientId: Order.client.ref_key })
                    .then( function (response) {
                        if (response.data.value) {
                            Order.currSpecLine.product = response.data.value[0];
                            var prodData = Order.currSpecLine.product.restByStock;
                            if (prodData.length > 0 && prodData[0].price) {
                                Order.currSpecLine.price =  prodData[0].price;
                                Order.currSpecLine.priceDescr = ' (' + prodData[0].priceDescr + '):';
                            }
                        };
                    });

                $rootScope.deliberateBack = true;
                window.history.back();

            };


            if (Order.productList === undefined) {$scope.productView = "filter"} else {$scope.productView = "select"};


            $scope.switchToProductFilter = function () {
                $scope.productView = "filter";
                // $scope.defaultFocus = true;
                
            };

            //*******************************************************************
            //******************   client 
            //*******************************************************************


            // if (Order.clientList === undefined) {
            if ($rootScope.clientList === undefined) {
                $scope.clientView = "filter";
            } else {
                $scope.clientView = "select";
                if ($rootScope.clientListLastSelected) { 
                    $timeout( function() { $anchorScroll($rootScope.clientListLastSelected); } );
                };
            };

            $scope.chooseClient = function() {
                $location.path('/order/client/filter');
            };

            if ($scope.activeView === 'document' && Order.autoClientChoice && !Order.client) {
                $scope.chooseClient();
                Order.autoClientChoice = false;
            };

            $scope.findClient = function () {
                // $timeout(Order.getClients);

                Base.getClients({ descr: encodeURIComponent(Order.clientDescr||' ') })
                    .then( function (response) { 
                        
                        // Order.clientList = response.data.value;
                        $rootScope.clientList = response.data.value;

                        $scope.clientView = "select";
                     });

            };

            $scope.switchToClientFilter = function () {
                $scope.clientView = "filter";
                // $scope.defaultFocus = true;
                
            };

            $scope.onSelectClient = function (idx) {
                // var client = Order.clientList[idx];
                var client = $rootScope.clientList[idx];
                $rootScope.clientListLastSelected = 'cli-' + idx;
                Order.setClient(client);
                $rootScope.deliberateBack = true;
                window.history.back();
                //$location.path('/order/document');
            };

            //*******************************************************************
            //******************   spec line
            //*******************************************************************            



            if ($scope.activeView === 'spec' && !Order.currSpecLine.product && Order.productAutoChoice) {
                Order.productAutoChoice = false;
                $scope.chooseProduct();
            };

            $scope.startLine = function() {
                Order.currSpecLine = {quantity: 1};
                Order.productAutoChoice = true;
                $location.path('/order/spec');
                //$location.path('/order/product/filter');
            };

            // if ($scope.activeView === 'document' && Order.autoSpecNewLine) {
            //     $scope.startLine();
            // };

            $scope.editSpecLine = function(lineIdx) {
                // console.log('lineIdx ' + lineIdx);
                Order.currSpecLine = angular.copy(Order.spec[lineIdx]);
                $location.path('/order/spec');
            };

            $scope.saveLine = function() {
                
                if (!Order.currSpecLine.product) {
                    // pass
                } else  if (!Order.currSpecLine.id && Order.currSpecLine.quantity > 0){
                    Order.specAddLine(Order.currSpecLine);
                } else if (Order.currSpecLine.id && Order.currSpecLine.quantity == 0) {
                    Order.specDeleteLine(Order.currSpecLine);
                } else if (Order.currSpecLine.id) {
                    Order.specEditLine(Order.currSpecLine);
                };

                window.history.back();
                
                $timeout( function() { $anchorScroll('blankLine'); } );
            };


            $scope.deleteLine = function() {
                Order.specDeleteLine(Order.currSpecLine);
                $location.path('/order/document');
            };

            // $scope.cancelLine = function() {
            //     $location.path('/order/document');
            // };

            //*******************************************************************
            //******************   doc form
            //*******************************************************************

            $scope.onSelectFirm = function () {
                console.log(Order.firm);
            };

            if (!Order.firm && $rootScope.User && $rootScope.User.firms) {
                Order.firm = $rootScope.User.firms[0];
            };
            
            $scope.onSelectStock = function () {
                console.log(Order.stock);
            };

            if (!Order.stock && $rootScope.User && $rootScope.User.stocks) {
                Order.stock = $rootScope.User.stocks[0];
            };
            
            $scope.onSelectDlvType = function () {
                console.log(Order.dlvType);
            };

            if (!Order.dlvType && $rootScope.User && $rootScope.User.dlvTypes) {
                Order.dlvType = $rootScope.User.dlvTypes[0];
            };
            

            $scope.exit = function () {
                Order.clear();
                $location.path('/');
            };

            $scope.saveDocument = function () {

                var vm = this;

                if (Order.state === 'pending') {
                    alertify.error('ожидается ответ от сервера');
                    return;
                };

                Order.state = 'pending';

                Base.postOrder( { client: Order.client, dlvDate: Order.dlvDate, firm: Order.firm, stock: Order.stock, dlvType: Order.dlvType, comment: Order.comment, spec: Order.spec } )
                    .then( function (response) {
                        Order.state = response.data.state;
                        if (Order.state === 'error') {
                            u12.alertErr(response.data.message);
                        } else if (Order.state === 'success') {
                            u12.alertSuc(response.data.message);
                            vm.exit();
                        } else if (Order.state === undefined) {
                            Order.state = 'process';
                            u12.alertLog(response.data.message);
                        } else {
                            u12.alertLog(response.data.message);
                        };
                    })
                    .catch( function (response) {
                        Order.state = 'error';
                        u12.alertErr('ошибка');
                    });
            };

        }])

    .factory('Order',
    ['Base', '$rootScope', '$location', '$timeout',
        function (Base, $rootScope, $location, $timeout) {

            var Order = {

                init: function () {
                    u12.clearData(this);
                    
                    this.state = 'started';

                    this.dlvDate = new Date();
			        this.dlvDate.setDate(this.dlvDate.getDate() + 1);
                    
                    this.autoClientChoice = true;
                    //this.autoSpecNewLine = true;

                    // if ($rootScope.User.firms) {
                    //     this.firm =  $rootScope.User.firms[0];
                    // };

                    this.spec = [];
                    if ($rootScope.User && $rootScope.User.rotatingTare) {
                        this.rotatingTare = $rootScope.User.rotatingTare.map(function(e) {  return {tare: e}; });
                    };
                },

                setClient: function (client) {
                    Order.client = client;
                },

                // setFirm: function (firm) {
                //     Order.firm = firm;
                // },

                specEditLine: function (specLine) {
                    this.spec.forEach( function(e, i, a){
                        if (e.id === specLine.id) { a[i] = angular.copy(specLine); }
                    });
                },

                specFindLineByProduct: function (product) {
                    var existLine = Order.spec.filter( function(e){ return (e.product) && (e.product.ref_key === product.ref_key) } );
                    if (existLine.length > 0) { 
                        return existLine[0];
                    } else {
                        return undefined;
                    };
                },

                specDeleteLine: function (specLine) {
                    Order.spec.forEach(function(line, index, orderSpec) {
                        if (line.id === specLine.id) {
                            orderSpec.splice(index, 1);
                        };
                    });
                },

                specAddLine: function (specLine) {
                    var existLine = this.specFindLineByProduct(specLine.product);
                    if (existLine === undefined) { 
                        specLine.id = u12.guid();
                        Order.spec.push(angular.copy(specLine));
                    } else {
                        specLine.id = existLine.id; 
                        this.specEditLine(angular.copy(specLine));
                    };
                },

                clear: function () {
                    u12.clearData(this);
                },

               specTotal: function () {
                    return u12.money(  (this.spec) ? this.spec.reduce(function (a, e) { return a + e.price * e.quantity }, 0) : 0 );
                }

            };

        return Order;

        }]);
