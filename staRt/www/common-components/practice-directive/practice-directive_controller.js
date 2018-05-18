'use strict';

///////// Helpers //////////////////////////////////////////////////////////////

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
};

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	.toString(16)
	.substring(1);
};

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

function scrambleArray(array) {
	for (var i=0; i<array.length; ++i) {
		var rndidx = Math.floor(Math.random()*array.length);
		var tmp = array[i];
		array[i] = array[rndidx];
		array[rndidx] = tmp;
	}
}

function initialPracticeSession(startTimestamp, type, probe) {
	return {
		id: guid(),
		ratings: [],
		probe: probe,
		type: type,
		startTimestamp: startTimestamp,
		endTimestamp: null
	};
}

function createFile(dirEntry, fileName, dataObj, successCb)
{
		// Creates a new file or returns the file if it already exists.
		dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
			writeFile(fileEntry, dataObj, successCb);
		});
}

function writeFile(fileEntry, dataObj, successCb)
{
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

////////////////////////////////////////////////////////////////////////////////

var practiceDirective = angular.module( 'practiceDirective' );

practiceDirective.controller( 'PracticeDirectiveController',
	function($scope, $timeout, $localForage, NotifyingService, FirebaseService, ProfileService, SessionStatsService, StartUIState, UploadService, $rootScope, $state, $http, $cordovaDialogs)
	{
		// var uploadURLs = [
		// 	"http://localhost:5000",
		// 	"http://localhost:5000",
		// 	"http://localhost:5000",
		// 	"http://localhost:5000"
		// ];

		$scope.active = true;
		$scope.isFeedbacking = false;
		$scope.isPracticing = false;
		$scope.currentWord = null;
		$scope.rating = 0;
		$scope.isRecording = false;
		$scope.hasValidWordList = false;
		$scope.uploadStatus = {
			isUploading: false,
			uploadProgress: 0
		}

		$scope.currentWordIdx = -1;
		$scope.currentPracticeSession = null;

		function recordingDidStart(profileDescArray) {
			$scope.isRecording = true;
		}

		function recordingDidFail(err) {
			console.log("Recording failed");
		}

		function sessionDisplayString() {
			var type = $scope.type ? $scope.type.toLowerCase() : "word";
			var sesh = $scope.probe ? "quiz" : "quest";
			var hidden = $scope.forceWaveHidden ? " hidden" : "";
			var stats = SessionStatsService.getCurrentProfileStats();
			var session = stats ? stats.thisContextString : "";
			return type + " " + sesh + hidden + " " + stats;
		}

		function uploadCallbackForSession(session) {
			return function uploadProgressHandler(progressEvent, idx) {
				session.uploadProgress[idx] = progressEvent.loaded / progressEvent.total;
				$scope.uploadStatus.uploadProgress = session.uploadProgress.reduce(function(x,y){return x+y;})/4;
			}
		}

		function completeCallback() {
			$scope.uploadStatus.isUploading = false;
			$cordovaDialogs.alert(
				"Session uploaded successfully",
				"Upload Complete",
				"Okay"
			);
		}

		function recordingDidStop(files) {
			console.log("Finished recording");
			console.log("Metadata: " + files.Metadata);
			console.log("LPC: " + files.LPC);
			console.log("Audio: " + files.Audio);
			var jsonPath = files.Metadata.replace("-meta.csv", "-ratings.json");
			$scope.currentPracticeSession.count = $scope.count;
			$scope.currentPracticeSession.endTimestamp = Date.now();

			if ($scope.active && $scope.currentPracticeSession.ratings.length > 0) {
				saveJSON($scope.currentPracticeSession.ratings, jsonPath, function() {
					files.Ratings = jsonPath;
					$scope.currentPracticeSession.files = files;
					var practiceTypeStr = sessionDisplayString();
					var session = $scope.currentPracticeSession;
					navigator.notification.confirm("Would you like to upload this " + practiceTypeStr + " session?",
						function (index) {
							NotifyingService.notify("recording-completed", session);
							if (index == 1) {
								session.uploadProgress = [0, 0, 0, 0];
								session.uploadsComplete = [false, false, false, false];
								UploadService.uploadPracticeSessionFiles(
									session.files,
									session.id,
									uploadCallbackForSession(session),
									completeCallback
								);
								$scope.uploadStatus.isUploading = true;
							}
						}, "Upload",
						["OK", "Later"]);
				});
			}

			$scope.isRecording = false;
		}

		function beginPracticeForUser(user) {
			if ($scope.isPracticing) return;
			$scope.isPracticing = true;
			$scope.currentPracticeSession = initialPracticeSession(Date.now(), $scope.type || "word", $scope.probe || "quest");
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.startRecording(user, sessionDisplayString(), recordingDidStart, recordingDidFail);
			}
			advanceWord();
		}

		function advanceWord() {
			if ($scope.currentWord !== null) {
				if ($scope.rating === 0) {
					navigator.notification.alert("Rate pronunciation before advancing!", null, "No rating");
					return;
				}
				$scope.currentPracticeSession.ratings.push([$scope.currentWord, $scope.rating, Date.now()]);
				$scope.rating = 0;
				$scope.$broadcast("resetRating");
			}

			$scope.currentWordIdx++;

			if ($scope.count && $scope.currentWordIdx >= $scope.count) {
				$scope.endWordPractice();
			} else {
				var lookupIdx = $scope.currentWordIdx % $scope.wordOrder.length;
				if ((lookupIdx === 0) && ($scope.order === "random")) {
					scrambleArray($scope.wordOrder);
				}
				$scope.currentWord = $scope.wordList[$scope.wordOrder[lookupIdx]];
			}

			if ($scope.pauseEvery && $scope.pauseEvery > 0 && $scope.currentWordIdx > 0) {
				if ($scope.currentWordIdx % $scope.pauseEvery === 0) {
				    $scope.isFeedbacking = true;
					navigator.notification.confirm("Pausing for feedback",
								       function () {
									   $scope.$apply(() => {
									       $scope.isFeedbacking = false;
									   });
						}, "",
						["Done"]);
				}
			}
		}

		$scope.beginWordPractice = function() {
			$scope.currentWord = null;
			console.log("Beginning " + sessionDisplayString());

			if (window.AudioPlugin === undefined) {
				if (navigator.notification)
					navigator.notification.alert("Can't start " + sessionDisplayString() + ": no audio" , null, "Error");
			}

			ProfileService.getCurrentProfile().then(
				function(res) {
					if (res) {
						beginPracticeForUser(res);
						if ($scope.startPracticeCallback) $scope.startPracticeCallback();
					} else {
						if (navigator.notification)
							navigator.notification.alert("Can't start " + sessionDisplayString() + " -- create a profile first", null, "No profile");
					}
				}, function (err) {
					if (navigator.notification)
						navigator.notification.alert("Can't start " + sessionDisplayString() + ": " + err, null, "Error");
				}
			);
		};

		$scope.endWordPractice = function() {
			$scope.isPracticing = false;
			$scope.rating = 0;
			$scope.$broadcast("resetRating");
			$scope.currentWord = null;
			$scope.currentWordIdx = -1;
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.stopRecording(recordingDidStop, recordingDidFail);
			}
			if ($scope.endPracticeCallback) $scope.endPracticeCallback();
		};

		$scope.nextWord = function() {
			if ($scope.isPracticing)
				advanceWord();
		};

		$scope.parseWordList = function(wordListData) {
			var nextWordList = parseCSV(wordListData).slice(1).map(function(w) {
				return w[0];
			});
			$scope.wordList = $scope.wordList.concat(nextWordList);
		}

		$scope.reorderWords = function() {
			$scope.wordOrder = [];
			$scope.hasValidWordList = $scope.wordList.length > 0;
			for (var i=0; i<$scope.wordList.length; ++i) {
				$scope.wordOrder.push(i);
			}
		}

		$scope.reloadCSVData = function() {
			console.log("Clearing word list");
			$scope.wordList = [];
		    var loadTasks = [];
			$scope.csvs.forEach(function (csv) {
				loadTasks.push(
					$http.get(csv, {
						headers: {
							'Content-type': 'application/csv'
						}
					}).then(function (res) {
						$scope.parseWordList(res.data);
						console.log("Appending word list");
						console.log($scope.wordList);
					})
				);
			});
			Promise.all(loadTasks).then(function (res) {
				$scope.reorderWords();
				console.log("Reading word list");
				console.log($scope.wordList);
				if ($scope.hasValidWordList && !$scope.isPracticing && $scope.beginOnLoad) {
					$scope.beginWordPractice();
				}
			});
		}

		$scope.$on('ratingChange', function(event, data)
		{
			$scope.rating = data === undefined ? 0 : data;
			if (!!$scope.rating) {
				$scope.nextWord();
			}
		});

		$scope.$on('stopPractice', function(event)
		{
			if ($scope.isPracticing) {
				$scope.endWordPractice();
			}
		});

		$scope.$watch("csvs", function () {
			$scope.hasValidWordList = false;
			if ($scope.csvs) $scope.reloadCSVData();
		});

		if ($scope.csvs) $scope.reloadCSVData();

		$scope.myURL = $state.current.name;

		var unsubscribe = $rootScope.$on("$urlChangeStart", function(event, next) {
			if (next === $scope.myURL) {
				$scope.active = true;
			} else {
				$scope.active = false;
				if ($scope.isRecording) {
					$scope.endWordPractice();
				}
			}
		});

		$scope.$on("$destroy", function() {
			unsubscribe();
		});
	}
);
