/*globals console:false, angular:false, window:false, alert:false */

'use strict';

( function(  )
{
	var words = angular.module( 'words' );

	words.controller('WordsController', function($scope, $timeout, $localForage, StartUIState, wordList, $rootScope, $state)
	{
		console.log('WordsController here!');

		$scope.isPracticing = false;
		$scope.currentWord = null;
		var currentRating = null;
		var currentWordIdx = -1;
		var wordOrder = [];
		var currentPracticeSession = null;
		for (var i=0; i<wordList.length; ++i) {
			wordOrder.push(i);
		}

		function scrambleArray(array) {
			for (var i=0; i<array.length; ++i) {
				var rndidx = Math.floor(Math.random()*array.length);
				var tmp = wordOrder[i];
				wordOrder[i] = wordOrder[rndidx];
				wordOrder[rndidx] = tmp;
			}
		}

		function initialPracticeSession() {
			return {ratings:[]};
		}

		function beginPracticeForUser(user) {
			$scope.isPracticing = true;
			currentPracticeSession = initialPracticeSession();
			advanceWord();
		}

		function advanceWord() {
			if ($scope.currentWord !== null) {
				currentPracticeSession.ratings.push([$scope.currentWord, currentRating]);
			}
			currentWordIdx = (currentWordIdx + 1) % wordOrder.length;
			if (currentWordIdx === 0) {
				scrambleArray(wordOrder);
			}
			$scope.currentWord = wordList[wordOrder[currentWordIdx]];
		}

		$scope.beginWordPractice = function() {
			console.log("Beginning to practice words");

			if (window.AudioPlugin === undefined) {
				alert("Can't start word practice --- no Audio");
			}

			$localForage.getItem('currentUser').then(
				function(res) {
					if (res) {
						beginPracticeForUser(res);
					} else {
						alert("Can't start word practice -- no current user");
					}
				}, function(err) {
					alert("Error starting word practice: " + err);
				}
			);
		};

		$scope.endWordPractice = function() {
			$scope.isPracticing = false;
			currentWordIdx = -1;
			console.log("Ending to practice words");
		};

		$scope.nextWord = function() {
			if ($scope.isPracticing)
				advanceWord();
		};

		$scope.setRatingForCurrentWord = function(rating) {
			currentRating = rating;
		};
	});

} )(  );
