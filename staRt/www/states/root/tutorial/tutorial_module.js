'use strict';

( function(  )
{
	var tutorial = angular.module( 'tutorial',
	['ui.router'] );

	tutorial.config( function($stateProvider, $urlRouterProvider) {

		$stateProvider
		// this is the parent of all other views
		.state('root.tutorial', {
			url: 'tutorial',
			views:
			{
				'content-view':
				{
					templateUrl: 'states/root/tutorial/tutorial_template.html',
					controller: 'TutorialController as tutorial'
				}
			},
			resolve:
			{
				firstPanelData:  function($http)
				{
            		// $http returns a promise for the url data
            		return $http.get('states/root/tutorial/tutorialData/p01data.js');
            	}
         	}
		}) //end root template

		// ============================================================================
		// PAGE 1 The Wave ------------------------------------------------------------

			.state('root.tutorial.p01s1', {
				url: '/p01',
				name: 'p01',
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/noWave.html',
						controller: function($scope){
							$scope.currStep = $scope.p01s1;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							//console.log($scope);
							//var step = $scope.currStep.nav;
							//$scope.tutorialProgress(step);
							//console.log(window.location.hash);
							// $scope.activeCoin = $scope.currStep.coinRef;
							//console.log('activeCoin: ' + $scope.activeCoin);
						}
					}
				}
			}) //end p01s1 state def

			.state('root.tutorial.p01s2', {
				url: '/p01', // this sets the active left-nav tab to tutorial
				name: 'p01',
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p01s2;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							// $scope.activeCoin = $scope.currStep.coinRef;
							//console.log('activeCoin: ' + $scope.activeCoin);
						}
					}
				}
			}) //end p01s2 state def

			.state('root.tutorial.p01s3', {
				url: '/p01', // this sets the active left-nav tab to tutorial
				name: 'p01',
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p01s3;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							//console.log(window.location.hash);
							// $scope.activeCoin = $scope.currStep.coinRef;
							// console.log('activeCoin: ' + $scope.activeCoin);
						}
					}
				}
			}) //end p01s3 state def

			.state('root.tutorial.p01s4', {
				url: '/p01', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p01s4;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							// $scope.activeCoin = $scope.currStep.coinRef;
							//console.log('activeCoin: ' + $scope.activeCoin);

						}
					}
				}
			}) //end p01s4 state def

			.state('root.tutorial.p01s5', {
				url: '/p01', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/noWave.html',
						controller: function($scope){
							$scope.currStep = $scope.p01s5;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							//console.log('ctrl activeCoin: ' + $scope.activeCoin.coin);
						}
					}
				}
			}) //end p01s5 state def

		// =============================================================================
		// PAGE 2 'eee' Sounds ---------------------------------------------------------
			.state('root.tutorial.p02s1', {
				url: '/p02s1', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						//templateUrl: 'states/root/tutorial/sceneTemplates/waveSingle.html',
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p02s1;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							console.log('ctrl activeCoin: ' + $scope.activeCoin.coin);
						}
					}
				}
			}) //end p02 state def

			.state('root.tutorial.p02s2', {
				url: '/p02s1', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p02s2;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
							//.log('p02s2');
						}
					}
				}
			}) //end p02 state def

		// ==========================================================================
		// PAGE 3 'ahh' Sounds ------------------------------------------------------

			.state('root.tutorial.p03s1', {
				url: '/p03s1', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p03s1;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p03s1 state def

			.state('root.tutorial.p03s2', {
				url: '/p03s2', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p03s2;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p03s2 state def

			.state('root.tutorial.p03s3', {
			url: '/p03s3', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p03s3;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p03s3 state def

		// =============================================================================
		// PAGE 4 'ooo' Sounds (3) ---------------------------------------------------------

			.state('root.tutorial.p04s1', {
				url: '/p04s1', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p04s1;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p04s1 state def

			.state('root.tutorial.p04s2', {
				url: '/p04s2', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p04s2;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p04s2 state def

			.state('root.tutorial.p04s3', {
			url: '/p04s3', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/imgTemplate.html',
						controller: function($scope){
							$scope.currStep = $scope.p04s3;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p04s3 state def


		// ===========================================================================
		// PAGE 5 /r/ Sounds (5) ---------------------------------------------------------

			.state('root.tutorial.p05s1', {
				url: '/p05s1', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p05s1;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p05s1 state def

			.state('root.tutorial.p05s2', {
				url: '/p05s2', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p05s2;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p05s2 state def

			.state('root.tutorial.p05s3', {
			url: '/p05s3', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p05s3;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p05s3 state def

			.state('root.tutorial.p05s4', {
				url: '/p05s4', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p05s4;
							//$scope.activeCoin.coin = $scope.currStep.coinRef;
							$scope.setActiveCoin($scope.currStep.coinRef);
						}
					}
				}
			}) //end p05s4 state def

			.state('root.tutorial.p05s5', {
			url: '/p05s5', // this sets the active left-nav tab to tutorial
				views: {
					'pageView': {
						templateUrl: 'states/root/tutorial/partialTemplates/default.html',
						controller: function($scope){
							$scope.currStep = $scope.p05s5;
						}
					}
				}
			}) //end p05s5 state def

		// end of subState defs -------------------------------------------

	} ); // end tutorial.config
} )(  );
