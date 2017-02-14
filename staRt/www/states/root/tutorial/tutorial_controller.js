'use strict';

( function(  )
{
	var tutorial = angular.module( 'tutorial' );

	tutorial.controller('TutorialController', 
		function($scope, $timeout, $localForage, StartUIState, $rootScope, $state, $http, $stateParams, firstPanelData) 
		{

			// Activate first tab on "Tutorial" click
			$state.go('root.tutorial.p01s1');

				// Fetch first panel data and make sure it's ready for the view
				$scope.p01data = firstPanelData.data;
				for (var i = 0; i < $scope.p01data.length; i++)
				{
					$scope['p01s' + (i + 1)] = $scope.p01data[i];
				}

				//get data for tutorial_template.html 
				$http.get('states/root/tutorial/tutorialData/coinData.json').success(function(data){
					$scope.coinData = data;
				});

				$http.get('states/root/tutorial/tutorialData/p02data.js').success(function(data)
				{
					$scope.p02data = data;
					$scope.p02s1 = $scope.p02data[0];
					$scope.p02s2 = $scope.p02data[1];
				});

				$http.get('states/root/tutorial/tutorialData/p03data.js').success(function(data)
				{
					$scope.p03data = data;
					$scope.p03s1 = $scope.p03data[0];
					$scope.p03s2 = $scope.p03data[1];
					$scope.p03s3 = $scope.p03data[2];
				});

				$http.get('states/root/tutorial/tutorialData/p04data.js').success(function(data)
				{
					$scope.p04data = data;
					$scope.p04s1 = $scope.p04data[0];
					$scope.p04s2 = $scope.p04data[1];
					$scope.p04s3 = $scope.p04data[2];
				});

				$http.get('states/root/tutorial/tutorialData/p05data.js').success(function(data)
				{
					$scope.p05data = data;
					$scope.p05s1 = $scope.p05data[0];
					$scope.p05s2 = $scope.p05data[1];
					$scope.p05s3 = $scope.p05data[2];
					$scope.p05s4 = $scope.p05data[3];
					$scope.p05s5 = $scope.p05data[4];
				});

			// Tutorial Progress Markers
			// $scope.tutorialProgress = function(progress) {
			// 	$scope.progressSref = progress.id;
			// 	console.log("progress: ", $scope.progressSref)
			// };

			$scope.activeCoin = {
				p00: true,
				p01: false,
				p02: false,
				p03: false,
				p04: false,
				p05: false
			}

			$scope.setActiveCoin = function(coin) {
				$scope.activeCoin.p01 = false;
				$scope.activeCoin.p02 = false;
				$scope.activeCoin.p03 = false;
				$scope.activeCoin.p04 = false;
				$scope.activeCoin.p05 = false;

				$scope.activeCoin[coin] = true;			

				console.log('p00: ' + $scope.activeCoin.p00);
				// console.log('p01: ' + $scope.activeCoin.p01);
				// console.log('p02: ' + $scope.activeCoin.p02);
				// console.log('p03: ' + $scope.activeCoin.p03);
				// console.log('p04: ' + $scope.activeCoin.p04);
				// console.log('p05: ' + $scope.activeCoin.p05);
			
				

				//for(i=0; i<$scope.activeCoin.length; i++) {
					//console.log($scope.activeCoin);
				//}

				// var activeCoin = {
				// 	p00: true,
				// 	p01: false,
				// 	p02: false,
				// 	p03: false,
				// 	p04: false,
				// 	p05: false
				// };

				// $scope.objectHeaders = [];

				// for ( property in activeCoin) {
				//   $scope.objectHeaders.push(property); 
				// }

				// console.log($scope.objectHeaders[]);
				// $scope.activeCoin.forEach(self, function(key, value) {
				// 		//console.log(key + ': ' + value);
				// 	});

			}

			/*
				var values = {name: 'misko', gender: 'male'};
				var log = [];
				angular.forEach(values, function(value, key) {
				  this.push(key + ': ' + value);
				}, log);
				expect(log).toEqual(['name: misko', 'gender: male']);
			*/

				//$scope.activeCoin = coin;
				//console.log('updateCoin: ' + coin);
				
					//console.log('coinRef: ' + coinRef);
					// //$scope.activeCoin = coinRef;
				//console.log('activeCoin: ' + $scope.activeCoin.coin);
				


			$scope.progressUpdate = function(step) {
				if(step !== undefined) {
					$scope[step] = true;
					//console.log(step + ' is: ' + $scope[step]);
				}
			}				

			// $scope.log = function(input) {
			// 	console.log('log: ' + input);
			// }

		console.log('TutorialController here!');
	} 	// end of controller constructor body
	); // end of controller constructor fx
} )(  );
