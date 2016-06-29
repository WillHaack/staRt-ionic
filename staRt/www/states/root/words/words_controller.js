/*globals console:false, angular:false, window:false, alert:false */

'use strict';

( function(  )
{
	var words = angular.module( 'words' );

	words.controller('WordsController', function($scope, $timeout, $localForage, StartUIState, wordListData, $rootScope, $state)
	{
		console.log('WordsController here!');

		function parseCSV(str) {
		    var arr = [];
		    var quote = false;
				var row=0, col=0, c=0;
		    for (; c < str.length; c++) {
		        var cc = str[c], nc = str[c+1];
		        arr[row] = arr[row] || [];
		        arr[row][col] = arr[row][col] || '';
		        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
		        if (cc == '"') { quote = !quote; continue; }
		        if (cc == ',' && !quote) { ++col; continue; }
		        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
		        arr[row][col] += cc;
		    }
		    return arr;
		}

		$scope.isPracticing = false;
		$scope.currentWord = null;
		var wordList = parseCSV(wordListData.data).slice(1).map(function(w) {
			return w[0];
		});
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
