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
		$scope.order = "random";
		$scope.data = {
			categoryString: null,
			count: 50,
			csvs: [],
			navTitle: "Quest",
			selectedCategories: [],
			type: null,
			waveHidden: false
		};

		$scope.categoryNames = [
			"Syllabic",
			"Consonantal Front",
			"Consonantal Back",
			"Vocalic Front",
			"Vocalic Back"
		];

		$scope.syllableCategoryCSVs = [
			"data/sp_vocalic_all.csv",
			"data/sp_consonantal_front.csv",
			"data/sp_consonantal_back.csv",
			"data/sp_vocalic_front.csv",
			"data/sp_vocalic_back.csv"
		];

		$scope.wordCategoryCSVs = [
			"data/wp_vocalic_all.csv",
			"data/wp_consonantal_front.csv",
			"data/wp_consonantal_back.csv",
			"data/wp_vocalic_front.csv",
			"data/wp_vocalic_back.csv"
		];

		$scope.beginSyllableQuestConfiguration = function() {
			console.log("Begin syllable quest configuration");
			$scope.data.navTitle = "Syllable Quest";
			$scope.practicing = false;
			$scope.data.categoryString = null;
			$scope.data.selectedCategories = [];
			$scope.data.csvs = [];
			$scope.configuring = true;
			$scope.order = "random";
			$scope.data.type = "Syllable";
		}

		$scope.beginWordQuestConfiguration = function() {
			console.log("Begin word quest configuration");
			$scope.data.navTitle = "Word Quest";
			$scope.practicing = false;
			$scope.data.categoryString = null;
			$scope.data.selectedCategories = [];
			$scope.data.csvs = [];
			$scope.configuring = true;
			$scope.order = "random";
			$scope.data.type = "Word";
		}

		$scope.beginQuest = function() {
			console.log("Begin " + $scope.data.type + " quest");
			$scope.practicing = true;
			$scope.configuring = false;
			$scope.order = "random";
		};

		$scope.endQuestCallback = function() {
			$scope.practicing = false;
			$scope.configuring = false;
			$scope.data.csvs = [];
			$scope.data.navTitle = "Quest";
		};

		$scope.toggleRCategory = function(wordCategoryIdx) {
			var idx = $scope.data.selectedCategories.indexOf(wordCategoryIdx);
			if (idx === -1) {
				$scope.data.selectedCategories.push(wordCategoryIdx)
				$scope.data.selectedCategories.sort();
			} else {
				$scope.data.selectedCategories.splice(idx, 1);
			}

			var csvSource = $scope.data.type === "Word" ? $scope.wordCategoryCSVs : $scope.syllableCategoryCSVs;

			$scope.data.csvs = $scope.data.selectedCategories.map( function (x) { return csvSource[x]; } );
			var categories = $scope.data.selectedCategories.map( function (x) { return $scope.categoryNames[x]; } );
			$scope.data.categoryString = categories.join(", ");
		}

		$scope.updateCount = function() {
			console.log("count is now " + $scope.data.count);
		}
	});

} )(  );
