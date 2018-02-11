angular.module('sweaApp', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/home'
            })
            .when('/home', {
                templateUrl: 'pages/home.html',
                controller: 'homeCtrl'
            })
            .when('/login', {
                templateUrl: 'pages/login.html',
                controller: 'loginCtrl'
            })
            .when('/email', {
                templateUrl: 'pages/email.html',
                controller: 'emailCtrl'
            })
            .otherwise({
                redirectTo: '/login'
            });
    });


// Global Controller
angular.module('sweaApp')
    .controller('globalCtrl', function($rootScope, $location, $http, $routeParams) {
        // $rootScope.apiUrl = 'http://localhost:9000/';
        $rootScope.apiUrl = 'https://codeenigma.tech/';
        $rootScope.checkAuth = function() {
            if (Cookies.get('adminKey')) {
                $rootScope.adminKey = Cookies.get('adminKey');
                $rootScope.signStatus = true;
                $rootScope.getAdminData();
                var path = $location.path();
                if (path == '/login')
                    $location.path('/home').replace();
            } else {
                $rootScope.adminKey = '';
                $rootScope.signStatus = false;
                var path = $location.path();
                if (path == '/home')
                    $location.path('/login').replace();
            }
        };
        $rootScope.logOut = function() {
            Cookies.remove('adminKey');
            $location.path('/login').replace();
            swal({
                title: 'Success',
                text: 'You have successfully Logged Off !!',
                type: 'success',
                showConfirmButton: true
            });
        };
        $rootScope.getAdminData = function() {
            $http({
                method: 'GET',
                url: $rootScope.apiUrl + 'admin',
                params: {
                    adminKey: $rootScope.adminKey
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.adminData = res.data.data;
                    for (i = 0; i < $rootScope.adminData.teams1.length; i++) {
                        $rootScope.adminData.teams1[i].tCount = 0;
                        for (j = 0; j < $rootScope.adminData.teams1[i].transaction.length; j++) {
                            if ($rootScope.adminData.teams1[i].transaction[j].status == 'false')
                                $rootScope.adminData.teams1[i].tCount++;
                        }
                    }
                    for (i = 0; i < $rootScope.adminData.teams2.length; i++) {
                        $rootScope.adminData.teams2[i].tCount = 0;
                        for (j = 0; j < $rootScope.adminData.teams2[i].transaction.length; j++) {
                            if ($rootScope.adminData.teams2[i].transaction[j].status == 'false')
                                $rootScope.adminData.teams2[i].tCount++;
                        }
                    }
                    for (i = 0; i < $rootScope.adminData.teams3.length; i++) {
                        $rootScope.adminData.teams3[i].tCount = 0;
                        for (j = 0; j < $rootScope.adminData.teams3[i].transaction.length; j++) {
                            if ($rootScope.adminData.teams3[i].transaction[j].status == 'false')
                                $rootScope.adminData.teams3[i].tCount++;
                        }
                    }
                } else {
                    swal({
                        title: 'Failed',
                        text: res.data.msg,
                        type: 'error',
                        showConfirmButton: true
                    });
                    Cookies.remove('adminKey');
                    $location.path('/login').replace();
                }
            }, function(res) {
                swal("Fail", "Some error occurred, try again.", "error");
            });
        };
    });

// Login Controller
angular.module('sweaApp')
    .controller('loginCtrl', function($scope, $http, $location, $rootScope) {
        $rootScope.checkAuth();
        $scope.loginAdmin = function() {
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'admin/login',
                data: $scope.admin
            }).then(function(res) {
                if (res.data.status == true) {
                    var adminKey = res.data.adminKey;
                    Cookies.set('adminKey', adminKey);
                    $location.path('/home').replace();
                    swal({
                        title: 'Success',
                        text: 'You have successfully Signed In !!',
                        type: 'success',
                        showConfirmButton: true
                    });
                } else
                    swal({
                        title: 'Failed',
                        text: res.data.msg,
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: true
                    });
            }, function(res) {
                swal("Fail", "Some error occurred, try again.", "error");
            });
        };
    });

// Home Controller
angular.module('sweaApp')
    .controller('homeCtrl', function($scope, $http, $rootScope, $window, $timeout) {
        $rootScope.checkAuth();
        $scope.openTeamModal = function(x) {
            $scope.teamData = x;
            $('#teamModal').modal('show');
        };
        $scope.openAddAdminModal = function() {
            $('#adminModal').modal('show');
        };
        $scope.addAdmin = function() {
            $scope.admin.adminKey = $rootScope.adminKey;
            $scope.admin.role = ($scope.admin.role == 'true');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'admin/addAdmin',
                data: $scope.admin
            }).then(function(res) {
                if (res.data.status == true) {
                    swal({
                            title: 'Success',
                            text: 'Admin Created !',
                            type: 'success',
                            showConfirmButton: false
                        })
                        .then(
                            function() {},
                            function(dismiss) {
                                if (dismiss === 'timer') {
                                    $window.location.reload();
                                }
                            }
                        );
                } else
                    swal({
                        title: 'Failed',
                        text: res.data.msg,
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: true
                    });
            }, function(res) {
                swal("Fail", "Some error occurred, try again.", "error");
            });
        };
        $scope.deleteTeam = function() {
            swal({
                title: 'Are you sure to delete this team?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(function() {
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/deleteTeam',
                    data: {
                        adminKey: $rootScope.adminKey,
                        teamId: $scope.teamData.teamId
                    }
                }).then(function(res) {
                    if (res.data.status == true) {
                        swal({
                                title: 'Success',
                                text: res.data.msg,
                                type: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            })
                            .then(
                                function() {},
                                function(dismiss) {
                                    if (dismiss === 'timer') {
                                        $window.location.reload();
                                    }
                                }
                            );
                    } else
                        swal({
                            title: 'Failed',
                            text: res.data.msg,
                            type: 'error',
                            timer: 2000,
                            showConfirmButton: true
                        });
                }, function(res) {
                    swal("Fail", "Some error occurred, try again.", "error");
                });
            });
        };
        $scope.sendStatus = function() {
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'admin/sendStatus',
                data: {
                    adminKey: $rootScope.adminKey,
                    teamId: $scope.teamData.teamId
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    swal({
                            title: 'Success',
                            text: res.data.msg,
                            type: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        .then(
                            function() {},
                            function(dismiss) {
                                if (dismiss === 'timer') {
                                    $window.location.reload();
                                }
                            }
                        );
                } else
                    swal({
                        title: 'Failed',
                        text: res.data.msg,
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: true
                    });
            }, function(res) {
                swal("Fail", "Some error occurred, try again.", "error");
            });
        };
        $scope.addPayment = function() {
            swal({
                title: 'Enter the amount',
                input: 'number',
                showCancelButton: true,
                inputValidator: function(value) {
                    return new Promise(function(resolve, reject) {
                        if (value) {
                            resolve();
                        } else {
                            reject('You need to write something!');
                        }
                    })
                }
            }).then(function(result) {
                swal({
                    title: 'Dahh you really need to?',
                    html: "Entered amount was: " + result,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'For god sake, Yes!'
                }).then(function() {
                    $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'admin/paymentHandler',
                        data: {
                            adminKey: $rootScope.adminKey,
                            teamId: $scope.teamData.teamId,
                            money: result
                        }
                    }).then(function(res) {
                        if (res.data.status == true) {
                            swal({
                                    title: 'Success',
                                    text: res.data.msg,
                                    type: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                })
                                .then(
                                    function() {},
                                    function(dismiss) {
                                        if (dismiss === 'timer') {
                                            $window.location.reload();
                                        }
                                    }
                                );
                        } else
                            swal({
                                title: 'Failed',
                                text: res.data.msg,
                                type: 'error',
                                timer: 2000,
                                showConfirmButton: true
                            });
                    }, function(res) {
                        swal("Fail", "Some error occurred, try again.", "error");
                    });
                });
            });
        };
        $scope.changeTransactionStatus = function(tid) {
            swal({
                title: 'Enter the status',
                input: 'radio',
                inputOptions: {
                    'true': 'Paid',
                    'false': 'Not viewed',
                    'failed': 'Failed'
                },
                showCancelButton: true,
                inputValidator: function(value) {
                    return new Promise(function(resolve, reject) {
                        if (value) {
                            resolve();
                        } else {
                            reject('You need to write something!');
                        }
                    })
                }
            }).then(function(result) {
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/changeTransactionStatus',
                    data: {
                        adminKey: $rootScope.adminKey,
                        teamId: $scope.teamData.teamId,
                        tid: tid,
                        status: '' + result
                    }
                }).then(function(res) {
                    if (res.data.status == true) {
                        swal({
                                title: 'Success',
                                text: res.data.msg,
                                type: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            })
                            .then(
                                function() {},
                                function(dismiss) {
                                    if (dismiss === 'timer') {
                                        $window.location.reload();
                                    }
                                }
                            );
                    } else
                        swal({
                            title: 'Failed',
                            text: res.data.msg,
                            type: 'error',
                            timer: 2000,
                            showConfirmButton: true
                        });
                }, function(res) {
                    swal("Fail", "Some error occurred, try again.", "error");
                });
            });
        };
    });

// Email Controller
angular.module('sweaApp')
    .controller('emailCtrl', function($scope, $http, $location, $rootScope) {
        $rootScope.checkAuth();
        $scope.getEmail = function() {
            $http({
                method: 'GET',
                url: $rootScope.apiUrl + 'admin/email',
                params: {
                    adminKey: $scope.adminKey
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $scope.emailData = res.data.data;
                } else
                    swal({
                        title: 'Failed',
                        text: res.data.msg,
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: true
                    });
            }, function(res) {
                swal("Fail", "Some error occurred, try again.", "error");
            });
        };
        $scope.getEmail();
    });
