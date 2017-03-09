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
				url: 'http://localhost:5000/team/adminGet',
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
					Cookies.remove('authKey');
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
				url: 'http://localhost:5000/team/adminLogin',
				data: $scope.admin
			}).then(function (res) {
				if (res.data.status == true) {
					var authKey = res.data.adminKey;
					Cookies.set('adminKey', authKey);
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
	});
