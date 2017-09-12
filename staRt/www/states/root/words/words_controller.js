/*globals console:false, angular:false, window:false, alert:false */
/*globals AudioPlugin:false */

'use strict';

( function(  )
{
	var words = angular.module( 'words' );

	words.controller('WordsController', function($scope, $timeout, $localForage, ProfileService, StartUIState, $rootScope, $state)
	{
		console.log('WordsController here!');

		$scope.practicing = false;
		$scope.configuring = false;
		$scope.csv = "";
		$scope.order = "random";
		$scope.data = {
			count: 50,
			navTitle: "Quest"
		};
		$scope.wordCategory = null;
		$scope.wordCategoryNames = [
			"Vocalic All",
			"Consonantal Front",
			"Consonantal Back",
			"Vocalic Front",
			"Vocalic Back"
		];
		$scope.wordCategoryCSVs = [
			"data/wp_vocalic_all.csv",
			"data/wp_consonantal_front.csv",
			"data/wp_consonantal_back.csv",
			"data/wp_vocalic_front.csv",
			"data/wp_vocalic_back.csv"
		];

		$scope.beginSyllableQuest = function() {
			console.log("Begin syllable quest");
			$scope.data.navTitle = "Syllable Quest";
			$scope.practicing = true;
			$scope.configuring = false;
			$scope.csv = "data/Syllable_Practice.csv";
			$scope.order = "random";
			$scope.type = "Syllable";
			$scope.data.count = 100;
		};

		$scope.beginWordQuestConfiguration = function() {
			console.log("Begin word quest configuration");
			$scope.data.navTitle = "Word Quest";
			$scope.practicing = false;
			$scope.wordCategory = null;
			$scope.csv = null;
			$scope.configuring = true;
			$scope.order = "random";
			$scope.type = "Word";
		}

		$scope.beginWordQuest = function() {
			console.log("Begin word quest");
			$scope.practicing = true;
			$scope.configuring = false;
			$scope.order = "random";
			$scope.type = "Word";
		};

		$scope.endQuestCallback = function() {
			$scope.practicing = false;
			$scope.configuring = false;
			$scope.csv = null;
		};

		$scope.selectRCategory = function(wordCategoryIdx) {
			$scope.csv = $scope.wordCategoryCSVs[wordCategoryIdx];
			$scope.wordCategory = $scope.wordCategoryNames[wordCategoryIdx];
		}

		$scope.updateCount = function() {
			console.log("count is now " + $scope.data.count);
		}
	});

} )(  );
