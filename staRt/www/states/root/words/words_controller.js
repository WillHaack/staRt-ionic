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

		function recordingDidStart(profileDescArray) {
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

		function createFile(dirEntry, fileName, dataObj, successCb) {
		    // Creates a new file or returns the file if it already exists.
		    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
		        writeFile(fileEntry, dataObj, successCb);
		    });

		}

		function writeFile(fileEntry, dataObj, successCb) {
		    // Create a FileWriter object for our FileEntry (log.txt).
		    fileEntry.createWriter(function (fileWriter) {

		        fileWriter.onwriteend = function() {
		            console.log("Successful file read...");
		            successCb();
		        };

		        fileWriter.onerror = function (e) {
		            console.log("Failed file read: " + e.toString());
		        };

		        fileWriter.write(dataObj);
		    });
		}

		function saveJSON(jsonObject, absolutePath, successCb)
		{
			var storageDir = absolutePath.substring(0, absolutePath.lastIndexOf('/')+1);
			var filename = absolutePath.substr(absolutePath.lastIndexOf('/') + 1);
			resolveLocalFileSystemURL("file://" + storageDir, function(dirEntry) {
				createFile(dirEntry, filename, JSON.stringify(jsonObject), successCb);
			});
		}

		// Wow. Sandboxing makes this much trickier than one would hope
		function uploadPracticeSessionFiles(session, metadata, lpc, audio)
		{
			var jsonPath = metadata.replace("-meta.csv", "-ratings.json");
			saveJSON(session.ratings, metadata.replace("-meta.csv", "-ratings.json"), function() {
				uploadFile(jsonPath, 'text/json');
			});
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
