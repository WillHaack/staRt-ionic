'use strict';

( function(  )
{
	var resources = angular.module( 'resources' );

	resources.controller('ResourcesController', function($scope, $timeout, $localForage, ProfileService, StartUIState, $rootScope, $state)
	{
		//console.log('ResourcesController here!');

		$scope.data = {
      version: "",
      platform: "",
			navTitle: "SLP Resources"
    };

     cordova.getAppVersion.getVersionNumber().then(function (version) {
       $scope.data.version = `${version}`;
       $scope.data.platform = `${device.platform} ${device.version}`
     });

		$scope.$on("$ionicView.enter", function() {
			console.log('resources content loaded!');
		});

	});

} )(  );
