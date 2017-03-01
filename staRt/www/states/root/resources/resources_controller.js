'use strict';

( function(  )
{
	var resources = angular.module( 'resources' );

	resources.controller('ResourcesController', function($scope, $timeout, $localForage, ProfileService, StartUIState, $rootScope, $state)
	{
		console.log('ResourcesController here!');

		$scope.$on("$ionicView.enter", function() {
			console.log('view content loaded!');
			if (window.AudioPlugin !== undefined)
			{
				console.log("Did enter resources view");
				ProfileService.getCurrentProfile().then( function(res) {
					console.log("Got current user profile");
					if (res && res.lpcOrder) {
						$scope.currentProfileName = res.name;
						$scope.lpcOrder = res.lpcOrder;
						AudioPlugin.setLPCOrder($scope.lpcOrder, $scope.logPluginLPCOrder);
					} else {
						AudioPlugin.getLPCOrder($scope.setLPCOrder);
					}
				});
			};
		});

		$scope.logPluginLPCOrder = function(order)
		{
			console.log("Plugin LPC order is now: " + order);
		};

		$scope.resetPluginLPCOrder = function() {
			$scope.lpcOrder = 35;
			$scope.updatePluginLPCOrder();
		};

		$scope.setLPCOrder = function(order)
		{
			$scope.lpcOrder = order;
		};

		$scope.updatePluginLPCOrder = function() {
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.setLPCOrder($scope.lpcOrder, $scope.logPluginLPCOrder);
				ProfileService.getCurrentProfile().then(function (res) {
					if (res) {
						res.lpcOrder = $scope.lpcOrder;
						ProfileService.saveProfile(res);
					}
				});
			}
		};

	});

} )(  );
