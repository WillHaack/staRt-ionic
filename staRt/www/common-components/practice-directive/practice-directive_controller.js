// bug: no rating transmitted on Wave Hidden (Trial number 10/11)
// todo: new layout to accomodate for extended words

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

	// shouldn't need to use scope
	// but kludging
	$scope.block_score = 0;
	$scope.difficulty = 1;
	var carrier_phrases = carrier_phrases_bank[1];
	var increase_difficulty_threshold = 0.8;
	var decrease_difficulty_threshold = 0.5;

	function calculate_difficulty_performance(total, count){
	    return total / count;
	};
	
	function revise_difficulty(){
	    if($scope.type == "Syllable"){
		// hackzorz
		// don't modify carrier phrase if doing a Syllable Quest
	    }
	    if($scope.difficulty == 1){
		carrier_phrases = carrier_phrases_bank[1];
	    }
	    if($scope.difficulty == 2){
		carrier_phrases = carrier_phrases_bank[2];
	    }
	    if($scope.difficulty >= 3){
		carrier_phrases = carrier_phrases_bank[3];
	    }
	}
	
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

		// also select a random carrier phrase
		$scope.carrier_phrase = carrier_phrases[Math.floor(Math.random() * carrier_phrases.length)]
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
	    if($scope.type == 'Word'){
		let tempWordList = [];
		
		// map csvs to adaptive difficulty key names
		// to cause as few side effects as possible
		
		$scope.csvs.forEach((csv) => {
		    let key = csv.replace('data/wp_', '').replace('.csv', '');
		    if($scope.difficulty <= 3){
			tempWordList = tempWordList.concat(words[key][$scope.difficulty]);
		    }else{
			// difficulty is 4 or 5
			tempWordList = tempWordList
			    .concat(words[key][1])
			    .concat(words[key][2])
			    .concat(words[key][3]);
		    }
		});

		$scope.wordList = tempWordList;
	    
		$scope.reorderWords();
		if ($scope.hasValidWordList && !$scope.isPracticing && $scope.beginOnLoad) {
		    $scope.beginWordPractice();
		}
	    }
	    if($scope.type == "Syllable"){
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
			    //console.log("Appending word list");
			    //console.log($scope.wordList);
			})
		    );
		});
		Promise.all(loadTasks).then(function (res) {
		    $scope.reorderWords();
		    if ($scope.hasValidWordList && !$scope.isPracticing && $scope.beginOnLoad) {
			$scope.beginWordPractice();
		    }
		});
	    }
	}

	$scope.$on('ratingChange', function(event, data)
	    {
		$scope.rating = data === undefined ? 0 : data;
		if (!!$scope.rating) {
		    $scope.nextWord();
		}
		// keep running average of ratings
		if(data){
		    // remap data according to specs
		    const remap_score = {
			3: 1,
			2: .5,
			1: 0
		    };
		    
		    $scope.block_score += remap_score[data];
		    let trial_count = $scope.currentWordIdx + 1;
		    // recalculate difficulty
		    if(trial_count % 10 == 0){
			let performance = calculate_difficulty_performance(
			    $scope.block_score,
			    10 // working in blocks of ten
			);
			// reset scores
			$scope.block_score = 0;
			if(performance >= increase_difficulty_threshold
			   && $scope.difficulty < 5){
			    $scope.difficulty++;
			    revise_difficulty();
			    $scope.reloadCSVData();
			}
			if(performance <= decrease_difficulty_threshold
			   && $scope.difficulty > 1){
			    $scope.difficulty--;
			    revise_difficulty();
			    $scope.reloadCSVData();
			}
			// implied else
			// keep difficulty the same
		    }
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


// save here to avoid async loads
const carrier_phrases_bank = [
    [], // placeholder
    ["___"],
    ["Say ___ to me"],
    [
	"He got detention because he said ___",
	"When he said ___, she got mad at him",
	"She passed me a note that said ___",
	"I put ___ at the top of my list",
	"He hoped she would know how to say ___",
	"I want to put ___ on the envelope",
	"I paid 10 cents to copy a sheet that said ___",
	"She hoped he would say ___",
	"I made a label that said ___",
	"You should take ___ off of the list",
	"It was funny when you said ___",
	"She put ___ on the ticket",
	"I walked past a sign that said ___",
	"My dad bought a book called ___",
	"I didn't expect to see a football team called ___",
	"I laughed when she said ___",
	"I built him a lemonade stand and called it ___",
	"He wasn't listening when she said ___",
	"I named my dog ___"
    ]
];


const words = {
    'consonantal_back': {
	'1': [
	    'rod',
	    'rot',
	    'romp',
	    'rub',
	    'rough',
	    'rust',
	    'road',
	    'rogue',
	    'roam',
	    'rope',
	    'rote',
	    'roast',
	    'rue',
	    'roof',
	    'room',
	    'root'
	],
	'2': [
	    'robin',
	    'rocket',
	    'rotten',
	    'rusty',
	    'running',
	    'rugby',
	    'roping',
	    'roaming',
	    'romance',
	    'rotate',
	    'rooting',
	    'ruby',
	    'rudest',
	    'roommate'
	],
	'3': [
	    'roll',
	    'rolled',
	    'rule',
	    'ruled',
	    'robber',
	    'Ronald',
	    'rubber',
	    'rubble',
	    'runner',
	    'roughly',
	    'parole',
	    'rolling',
	    'roadless',
	    'rower',
	    'rudely',
	    'rueful',
	    'ruling',
	    'roomful'
	]
    },
    'consonantal_front': {
	'1': [
	    'raid',
	    'rain',
	    'ray',
	    'rate',
	    'wreck',
	    'rest',
	    'reef',
	    'reek',
	    'reap',
	    'rib',
	    'wrist',
	    'rich',
	    'rhyme',
	    'rice',
	    'right',
	    'ripe',
	    'rise',
	    'write'
	],
	'2': [
	    'raisin',
	    'raven',
	    'racing',
	    'resting',
	    'remnant',
	    'ready',
	    'reading',
	    'reason',
	    'written',
	    'rigging',
	    'ribbon',
	    'riddance',
	    'rhyming',
	    'rising',
	    'rhino',
	    'arrive'
	],
	'3': [
	    'rail',
	    'railed',
	    'real',
	    'rear',
	    'rile',
	    'riled',
	    'rear',
	    'railing',
	    'rainfall',
	    'razor',
	    'restful',
	    'rental',
	    'reckless',
	    'regal',
	    'relay',
	    'really',
	    'richly',
	    'ripple',
	    'riddle',
	    'Riley',
	    'rival',
	    'writer',
	    'rifle'
	]
    },
    'vocalic_all': {
	'1': [
	    'dirt',
	    'hurt',
	    'burn',
	    'first',
	    'serve',
	    'heard'
	],
	'2': [
	    'birthday',
	    'dirty',
	    'turkey',
	    'person',
	    'certain',
	    'hurry'
	],
	'3': [
	    'curl',
	    'girl',
	    'learn',
	    'blur',
	    'worst',
	    'worth',
	    'turtle',
	    'curly',
	    'working',
	    'worried',
	    'worship',
	    'worthy'
	]
    },
    'vocalic_back': {
	'1': [
	    'chart',
	    'dart',
	    'heart',
	    'park',
	    'smart',
	    'bark',
	    'poor',
	    'score',
	    'shore',
	    'bored',
	    'cord',
	    'torn'
	],
	'2': [
	    'party',
	    'guitar',
	    'carton',
	    'hearty',
	    'harden',
	    'garden',
	    'adore',
	    'ashore',
	    'forty',
	    'tortoise',
	    'boring',
	    'boarded'
	],
	'3': [
	    'lard',
	    'large',
	    'lark',
	    'Carl',
	    'snarl',
	    'wore',
	    'swore',
	    'warm',
	    'warn',
	    'quart',
	    'wart',
	    'hardly',
	    'partly',
	    'heartless',
	    'alarm',
	    'darling',
	    'startle',
	    'galore',
	    'normal',
	    'cordless',
	    'Laura',
	    'warning',
	    'coral'
	]
    },
    'vocalic_front': {
	'1': [
	    'cared',
	    'fair',
	    'hair',
	    'spare',
	    'dare',
	    'mare',
	    'deer',
	    'fear',
	    'gear',
	    'hear',
	    'near',
	    'steer'
	],
	'2': [
	    'haircut',
	    'marry',
	    'barefoot',
	    'carry',
	    'appear',
	    'hearing',
	    'cheering',
	    'smearing',
	    'steering',
	    'nearest'
	],
	'3': [
	    'glare',
	    'lair',
	    'wear',
	    'square',
	    "we're",
	    'cleared',
	    'leer',
	    'wearing',
	    'barely',
	    'careful',
	    'Larry',
	    'weary',
	    'leering',
	    'sheerly',
	    'fearless',
	    'nearly',
	    'bleary'
	]
    }
};

