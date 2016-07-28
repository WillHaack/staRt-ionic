/*globals console:false, angular:false, window:false, alert:false */
/*globals AudioPlugin:false */

'use strict';

( function(  )
{
	var words = angular.module( 'words' );

	words.controller('WordsController', function($scope, $timeout, $localForage, StartUIState, wordListData, $rootScope, $state)
	{
		console.log('WordsController here!');

		var uploadURL = "http://127.0.0.1:5000";

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
		$scope.rating = 0;
		$scope.isRecording = false;
		var wordList = parseCSV(wordListData.data).slice(1).map(function(w) {
			return w[0];
		});
		$scope.currentWordIdx = -1;
		var wordOrder = [];
		$scope.currentPracticeSession = null;
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

		function recordingDidStart() {
			$scope.isRecording = true;
		}

		function recordingDidFail() {

		}

		function uploadFile(absolutePath, mimeType) 
		{
			var win = function (r) {
			    console.log("Code = " + r.responseCode);
			    console.log("Response = " + r.response);
			    console.log("Sent = " + r.bytesSent);
			}

			var fail = function (error) {
			    alert("An error has occurred: Code = " + error.code);
			    console.log("upload error source " + error.source);
			    console.log("upload error target " + error.target);
			}
			
			resolveLocalFileSystemURL("file://" + absolutePath, function(fileEntry) {
				fileEntry.file( function(file) {
					var options = new FileUploadOptions();
					options.fileKey = "csv";
					options.fileName = absolutePath.substr(absolutePath.lastIndexOf('/') + 1);
					options.mimeType = mimeType;

					var headers={'filename':options.fileName};
					options.headers = headers;

					var ft = new FileTransfer();
					ft.upload(fileEntry.toInternalURL(), encodeURI(uploadURL), win, fail, options);

				}, function(error) {
					console.log(error);
				});
				console.log(fileEntry.toInternalURL());
			}, function(error) {
				console.log(error);
			});
		}

		// Wow. Sandboxing makes this much trickier than one would hope
		function uploadPracticeSessionFiles(session, metadata, lpc, audio)
		{
			uploadFile(metadata, 'text/csv');
			uploadFile(lpc, 'text/csv');
			uploadFile(audio, 'audio/wav');
		}

		function recordingDidStop(files) {
			console.log("Finished recording");
			console.log("Metadata: " + files.Metadata);
			console.log("LPC: " + files.LPC);
			console.log("Audio: " + files.Audio);
			uploadPracticeSessionFiles($scope.currentPracticeSession, files.Metadata, files.LPC, files.Audio);

			$scope.isRecording = false;
		}

		function beginPracticeForUser(user) {
			$scope.isPracticing = true;
			$scope.currentPracticeSession = initialPracticeSession();
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.startRecording(user, recordingDidStart, recordingDidFail);
			}
			advanceWord();
		}

		function advanceWord() {
			if ($scope.currentWord !== null) {
				if ($scope.rating === 0) {
					alert("Rate pronunciation before advancing!");
					return;
				}
				$scope.currentPracticeSession.ratings.push([$scope.currentWord, $scope.rating]);
				$scope.rating = 0;
			}
			$scope.currentWordIdx = ($scope.currentWordIdx + 1) % wordOrder.length;
			if ($scope.currentWordIdx === 0) {
				scrambleArray(wordOrder);
			}
			$scope.currentWord = wordList[wordOrder[$scope.currentWordIdx]];
		}

		$scope.beginWordPractice = function() {
			console.log("Beginning to practice words");

			if (window.AudioPlugin === undefined) {
				alert("Can't record word practice --- no Audio");
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
			$scope.rating = 0;
			$scope.currentWord = null;
			$scope.currentWordIdx = -1;
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.stopRecording(recordingDidStop, recordingDidFail);
			}
			console.log("Ending to practice words");
		};

		$scope.nextWord = function() {
			if ($scope.isPracticing)
				advanceWord();
		};
	});

} )(  );
