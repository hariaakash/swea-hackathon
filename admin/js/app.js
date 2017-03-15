angular.module('sweaApp', ['ngRoute'])
	.config(function ($routeProvider) {
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
			.otherwise({
				redirectTo: '/login'
			});
	});


// Global Controller
angular.module('sweaApp')
	.controller('globalCtrl', function ($rootScope, $location, $http, $routeParams) {
		$rootScope.checkAuth = function () {
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
		$rootScope.logOut = function () {
			Cookies.remove('adminKey');
			$location.path('/login').replace();
			swal({
				title: 'Success',
				text: 'You have successfully Logged Off !!',
				type: 'success',
				showConfirmButton: true
			});
		};
		$rootScope.getAdminData = function () {
			$http({
				method: 'GET',
				url: 'http://sweapp-hariaakash.rhcloud.com/team/adminGet',
				params: {
					adminKey: $rootScope.adminKey
				}
			}).then(function (res) {
				if (res.data.status == true) {
					$rootScope.adminData = res.data.data;
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
			}, function (res) {
				swal("Fail", "Some error occurred, try again.", "error");
			});
		};
	});
// Login Controller
angular.module('sweaApp')
	.controller('loginCtrl', function ($scope, $http, $location, $rootScope) {
		$rootScope.checkAuth();
		$scope.loginAdmin = function () {
			$http({
				method: 'POST',
				url: 'http://sweapp-hariaakash.rhcloud.com/team/adminLogin',
				data: $scope.admin
			}).then(function (res) {
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
			}, function (res) {
				swal("Fail", "Some error occurred, try again.", "error");
			});
		};
	});

// Home Controller
angular.module('sweaApp')
	.controller('homeCtrl', function ($scope, $http, $rootScope, $window, $timeout) {
		$rootScope.checkAuth();
		$scope.openTeamModal = function (x) {
			$scope.teamData = x;
			console.log($scope.teamData);
			$('#teamModal').modal('show');
		};
		$scope.deleteTeam = function () {
			swal({
				title: 'Are you sure to delete this team?',
				text: "You won't be able to revert this!",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!'
			}).then(function () {
				$http({
					method: 'POST',
					url: 'http://sweapp-hariaakash.rhcloud.com/team/deleteTeam',
					data: {
						adminKey: $rootScope.adminKey,
						teamId: $scope.teamData.teamId
					}
				}).then(function (res) {
					if (res.data.status == true) {
						swal({
								title: 'Success',
								text: res.data.msg,
								type: 'success',
								timer: 2000,
								showConfirmButton: false
							})
							.then(
								function () {},
								function (dismiss) {
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
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
			});
		};
		$scope.addPayment = function () {
			swal({
				title: 'Enter the amount',
				input: 'number',
				showCancelButton: true,
				inputValidator: function (value) {
					return new Promise(function (resolve, reject) {
						if (value) {
							resolve();
						} else {
							reject('You need to write something!');
						}
					})
				}
			}).then(function (result) {
				swal({
					title: 'Dahh you really need to?',
					html: "Entered amount was: " + result,
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'For god sake, Yes!'
				}).then(function () {
					$http({
						method: 'POST',
						url: 'http://sweapp-hariaakash.rhcloud.com/team/paymentHandler',
						data: {
							adminKey: $rootScope.adminKey,
							teamId: $scope.teamData.teamId,
							money: result
						}
					}).then(function (res) {
						if (res.data.status == true) {
							swal({
									title: 'Success',
									text: res.data.msg,
									type: 'success',
									timer: 2000,
									showConfirmButton: false
								})
								.then(
									function () {},
									function (dismiss) {
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
					}, function (res) {
						swal("Fail", "Some error occurred, try again.", "error");
					});
				});
			});
		};
	});
