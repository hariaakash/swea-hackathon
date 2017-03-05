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
			.when('/register', {
				templateUrl: 'pages/register.html',
				controller: 'regCtrl'
			})
			.when('/error', {
				templateUrl: 'pages/error.html'
			})
			.otherwise({
				redirectTo: '/error'
			});
	});


// Global Controller
angular.module('sweaApp')
	.controller('globalCtrl', function ($rootScope, $location, $http, $routeParams) {
		$rootScope.checkAuth = function () {
			if (Cookies.get('authKey')) {
				$rootScope.authKey = Cookies.get('authKey');
				$rootScope.signStatus = true;
				$rootScope.getTeamData();
				var path = $location.path();
				if (path == '/login' || path == '/register')
					$location.path('/home').replace();
			} else {
				$rootScope.authKey = '';
				$rootScope.signStatus = false;
				var path = $location.path();
				if (path == '/home')
					$location.path('/login').replace();
			}
		};
		$rootScope.logOut = function () {
			Cookies.remove('authKey');
			$location.path('/login').replace();
			swal({
				title: 'Success',
				text: 'You have successfully Logged Off !!',
				type: 'success',
				showConfirmButton: true
			});
		};
		$rootScope.getTeamData = function () {
			$http({
				method: 'GET',
				url: 'http://localhost:3000/team/',
				params: {
					authKey: $rootScope.authKey
				}
			}).then(function (res) {
				if (res.data.status == true) {
					$rootScope.teamData = res.data.team;
				} else {
					swal({
						title: 'Failed',
						text: res.data.msg,
						type: 'error',
						showConfirmButton: true
					});
					Cookies.remove('authKey');
					$location.path('/login').replace();
				}
			}, function (res) {
				swal("Fail", "Some error occurred, try again.", "error");
			});
		};
	});

angular.module('sweaApp')
	.controller('regCtrl', function ($scope, $http, $location, $timeout, $rootScope) {
		$rootScope.checkAuth();
		$scope.createTeam = function () {
			if ($scope.team.phone1 === $scope.team.phone2 && /^\w+$/.test($scope.team.teamId)) {
				$('#button_load').button('loading');
				$scope.data = {};
				$scope.data.teamId = $scope.team.teamId;
				$scope.data.user = {
					phone: $scope.team.phone1,
					name: $scope.team.name,
					hackerEarthId: $scope.team.hackerEarthId
				};
				$scope.data.zone = {
					university: $scope.team.university,
					state: $scope.team.state
				};
				$http({
					method: 'POST',
					url: 'http://localhost:3000/team/register',
					data: $scope.data
				}).then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						});
						$location.path('/login').replace();
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
						$('#button_load').button('reset');
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
					$('#button_load').button('reset');
				});
			} else {
				swal("Fail", "Mobile Number's are not same or the team Id contains invalid input, try again.", "error");
				$('#button_load').button('reset');
			}
		};
	});

angular.module('sweaApp')
	.controller('loginCtrl', function ($scope, $http, $location, $rootScope) {
		$rootScope.checkAuth();
		$scope.user = {};
		$scope.loginTeam = function () {
			$http({
				method: 'POST',
				url: 'http://localhost:3000/team/login',
				data: $scope.team
			}).then(function (res) {
				if (res.data.status == true) {
					var authKey = res.data.authKey;
					Cookies.set('authKey', authKey);
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

angular.module('sweaApp')
	.controller('homeCtrl', function ($scope, $http, $rootScope, $window, $timeout) {
		$rootScope.checkAuth();
		$scope.openAddMemberModal = function () {
			$('#addMemberModal').modal('show');
		};
		$scope.addMember = function () {
			if ($scope.team.phone1 === $scope.team.phone2) {
				$('#button_load').button('loading');
				$scope.data = {};
				$scope.data.teamId = $rootScope.teamData.teamId;
				$scope.data.authKey = $rootScope.authKey;
				$scope.data.user = {
					phone: $scope.team.phone1,
					name: $scope.team.name,
					hackerEarthId: $scope.team.hackerEarthId
				};
				$http({
					method: 'POST',
					url: 'http://localhost:3000/team/addMember',
					data: $scope.data
				}).then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: false
						});
						$timeout(function () {
							$window.location.reload();
						}, 2000);
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
						$('#button_load').button('reset');
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
					$('#button_load').button('reset');
				});
			} else {
				swal("Fail", "Mobile Number's are not same, try again.", "error");
				$('#button_load').button('reset');
			}
		};
	});
