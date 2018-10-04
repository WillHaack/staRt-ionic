'use strict';

( function(  )
{
	var resources = angular.module( 'resources' );

	resources.controller('ResourcesController', function($scope, $timeout, $localForage, ProfileService, StartUIState, $rootScope, $state)
	{
		console.log('ResourcesController here!');

		$scope.data = {
			configuring: false,
      lpcOrder: 35,
      version: "",
      platform: "",
			navTitle: "SLP Resources"

    };
    cordova.getAppVersion.getVersionNumber().then(function (version) {
      $scope.data.version = `${version}`;
      $scope.data.platform = `${device.platform} ${device.version}`
    });

		$scope.$on("$ionicView.enter", function() {
			console.log('view content loaded!');
			if (window.AudioPlugin !== undefined)
			{
				console.log("Did enter resources view");
				ProfileService.getCurrentProfile().then( function(res) {
					console.log("Got current user profile");
					if (res && res.lpcOrder) {
						$scope.currentProfileName = res.name;
						$scope.data.lpcOrder = res.lpcOrder;
						AudioPlugin.setLPCOrder($scope.data.lpcOrder, $scope.logPluginLPCOrder);
					} else {
						$scope.resetPluginLPCOrder();
					}
				});
			};
		});

		$scope.configureLPC = function() {
			$scope.data.configuring = true;
		}

		$scope.logPluginLPCOrder = function(order)
		{
			console.log("Plugin LPC order is now: " + order);
		};

		$scope.resetPluginLPCOrder = function() {
			ProfileService.getCurrentProfile().then(function(res) {
				if (res) {
					$scope.data.lpcOrder = ProfileService.lookupDefaultFilterOrder(res);
				} else {
					$scope.data.lpcOrder = 35;
				}
				$scope.updatePluginLPCOrder();
			});
		};

		$scope.setLPCOrder = function(order)
		{
			$scope.data.lpcOrder = order;
		};

		$scope.updatePluginLPCOrder = function() {
			if (window.AudioPlugin !== undefined) {
        ProfileService.runTransactionForCurrentProfile(function(handle, doc, t) {
          AudioPlugin.setLPCOrder($scope.data.lpcOrder, $scope.logPluginLPCOrder);
          t.update(handle, {lpcOrder: $scope.data.lpcOrder});
        });
			}
		};

		// ============================================================
		// RESOURCES INDEX PAGE CONTENT -------------------------------
		$scope.resPageData = {
			downloads: {
				title: "Downloads",
				description: "Download resources as PDFs.",
				items: [
					{
						title: "staRt User Manual",
						order: 0,
						url: "https://www.dropbox.com/sh/x5m8iz4u6crve6r/AACxiy7yjmz9yH_n8vIscBqca"
					}
					/*,{
						title: "Guide for Starting Pilot Study",
						order: 0,
						url: "https://www.dropbox.com/sh/z4uvvnm6wajgve3/AADxCwlmmB6yKa3Ijs4lD26Va"
					}
					,{
						title: "Checklist for Interested Clinicians",
						order: 0,
						url: "https://www.dropbox.com/sh/uanqcaau83s5uaa/AABnlD5sca9EmmnptSYyCHF9a"
					}
					,{
						title: "Principal Letter",
						order: 0,
						url: "https://www.dropbox.com/sh/dw2l2l4555ucwrj/AAD6JzC3WMfZ4SdexFLWRI4ka"
					}
					,{
						title: "Parent Letter",
						order: 0,
						url: "https://www.dropbox.com/sh/41fay3xx5aniw1e/AACV8basbDgEX13Da68y9EJOa"
					}
					,{
						title: "SLP Informational Letter",
						order: 0,
						url: "https://www.dropbox.com/sh/pq5p6j0fz03sgjw/AAC-Wy7W9t61ugTfO-tZNEg0a"
					}
					,{
						title: "Clinician Questionnaires",
						order: 0,
						url: "https://www.dropbox.com/sh/p79m84qq9kprare/AACmj0X28Xmr6HFPk8I_erOAa"
					} */
				]
			},
			links: {
				title: "Links",
				description: "Opens in your device's browser.",
				items: [
					{
						title: "staRt Video Demo",
						order: 0,
						url: "https://www.youtube.com/watch?v=kGFdED4HDcw"
					}
					,{
						title: "Become a Pilot Tester",
						order: 0,
						url: "https://wp.nyu.edu/byunlab/projects/start/participate/"
					}
					/*,{
						title: "Pilot Tester Survey",
						order: 0,
						url: "https://docs.google.com/forms/d/e/1FAIpQLSewiD8Uxle5WRPh5ArgUwYNQA6lktpjA8-xwSQVqinTW1IQiA/viewform?c=0&w=1"
					}
					,{
						title: "Bug Report",
						order: 0,
						url: "https://docs.google.com/forms/d/e/1FAIpQLScfSrv-fbkMg7AaZerT0ssXAbLJ20LD2h-XZQXBFAXbyUkWmw/viewform?c=0&w=1"
					} */
				]
			}
		};
		// end res page content ----------------

	});

} )(  );
