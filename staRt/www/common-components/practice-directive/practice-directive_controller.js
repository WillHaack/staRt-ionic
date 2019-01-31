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

function initialPracticeSession(startTimestamp, type, probe, count) {
  return {
    id: guid(),
    ratings: [],
    probe: probe,
    type: type,
    startTimestamp: startTimestamp,
    endTimestamp: null,
    count: count,
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

	/* --------------------------------
	   adaptive difficulty
  	   -------------------------------- */
	$scope.block_score = 0;
	$scope.session_score = 0;
	$scope.difficulty = 1;
	var carrier_phrases = carrier_phrases_bank[0];
	var increase_difficulty_threshold = 0.8;
	var decrease_difficulty_threshold = 0.5;

	// remap data according to specs
	const remap_adaptive_difficulty_score = {
	    3: 1,
	    2: .5,
	    1: 0
	};

	function calculate_difficulty_performance(total, count){
	    return total / count;
  };

  function handleRatingData($scope, data) {
    // visual reinforcement
    if (!$scope.probe) {
      $scope.block_coins[$scope.block_coins.length - 1].push(visual_reinforcement_coin_color_map[data]);
      $scope.session_coins[visual_reinforcement_coin_color_map[data]]++;
      if (visual_reinforcement_coin_color_map[data] == "gold") {
        $scope.consecutive_golds++;
        let temp_golds_consecutive_gold_display = 0;
        $scope.consecutive_golds_breakpoints.forEach((value) => {
          if ($scope.consecutive_golds >= value) {
            temp_golds_consecutive_gold_display = value;
          }
        })
        $scope.consecutive_golds_display = temp_golds_consecutive_gold_display;
      } else {
        $scope.consecutive_golds = 0;
      }
    }

    // adaptive difficulty

    $scope.block_score += remap_adaptive_difficulty_score[data];
    $scope.session_score += remap_adaptive_difficulty_score[data];

    if ($scope.currentWordIdx % 10 == 0 &&
      $scope.currentWordIdx != 0) {
      // todo: ratingChange emit error is preventing accurate calculation

      // recalculate difficulty
      let performance = calculate_difficulty_performance(
        $scope.block_score,
        10 // working in blocks of ten
      );


      if (!$scope.probe) {
        // recalculate highscores
        $scope.block_score_highscore = Math.max($scope.block_score_highscore, $scope.block_score);
        $scope.block_golds_highscore = Math.max($scope.block_golds_highscore,
          $scope.block_coins[$scope.block_coins.length - 1].filter(color => color == "gold").length);

        // reset scores
        $scope.block_score = 0;

        // reset coins
        $scope.block_coins.push([]);

        // reset consecutive count
        $scope.consecutive_golds = 0;
        $scope.consecutive_golds_display = 0;
      }

      if (performance >= increase_difficulty_threshold &&
        $scope.difficulty < 5) {
        $scope.difficulty++;
        revise_difficulty();
        return $scope.reloadCSVData();
      } else if (performance <= decrease_difficulty_threshold &&
        $scope.difficulty > 1) {
        $scope.difficulty--;
        revise_difficulty();
        return $scope.reloadCSVData();
      }
      // implied else
      // keep difficulty the same
    }

    return Promise.resolve();
  }

	function revise_difficulty() {
	  if ($scope.type == "Syllable" ||
	    $scope.probe) {
	    // hackzorz
	    // don't modify carrier phrase if doing a Syllable Quest or Word Quiz
	    return;
	  }

	  switch ($scope.difficulty) {
	    case 1:
	    case 2:
	    case 3:
	      carrier_phrases = carrier_phrases_bank[0];
	      break;
	    case 4:
	      carrier_phrases = carrier_phrases_bank[1];
	      break;
	    case 5:
	      carrier_phrases = carrier_phrases_bank[2];
	      break;
	    default:

	  }
	}



	/* --------------------------------
	   visual reinforcement
  	   -------------------------------- */
	if(!$scope.probe){
	    $scope.highscores = {
		session: {
		    score: {
			total: 0,
			date: null
		    },
		    golds: {
			total: 0,
			date: null
		    }
		},
		block: {
		    score: {
			total: 0,
			date: null
		    },
		    golds: {
			total: 0,
			date: null
		    }
		}
	    };

	    // push to array so that history can be preserved
	    $scope.block_coins = [[]];

	    // need history on session coins?
	    $scope.session_coins = {
		gold: 0,
		silver: 0,
		bronze: 0
	    };
	    $scope.block_golds_highscore = 0;
	    $scope.block_score_highscore = 0;

	    $scope.consecutive_golds = 0;
	    $scope.consecutive_golds_breakpoints = [3, 5, 8, 10];

	    // create helper variable to iterate through and create sandholes
	    $scope.sandholes = new Array(Math.ceil($scope.count / 10));
	}

	// need this outside for some reason
	const visual_reinforcement_coin_color_map = {
	    3: "gold",
	    2: "silver",
	    1: "bronze"
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
	    return type + " " + sesh + hidden + " " + session;
	}

	function uploadCallbackForSession(session) {
	  return function uploadProgressHandler(progressEvent, idx) {
	    session.uploadProgress[idx] = progressEvent.loaded / progressEvent.total;
	    $scope.uploadStatus.uploadProgress = session.uploadProgress.reduce(function (x, y) {
	      return x + y;
	    }) / 4;
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

  function errorCallback(error) {
    if (error.code === 3) {
      $cordovaDialogs.alert(
        "Server Upload Failed. Please check your internet connection and try again.",
        "Upload Error",
        "Okay"
      );
    } else {
      $cordovaDialogs.alert(
        "An error has occurred: Code = " + error.code,
        "Unexpected Error",
        "Okay"
      );
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
    }
  }

	function recordingDidStop(files) {
	  console.log("Finished recording");
	  console.log("Metadata: " + files.Metadata);
	  console.log("LPC: " + files.LPC);
	  console.log("Audio: " + files.Audio);
	  var jsonPath = files.Metadata.replace("-meta.csv", "-ratings.json");
	  $scope.currentPracticeSession.count = $scope.count;
	  $scope.currentPracticeSession.endTimestamp = Date.now();

	  // here
	  ProfileService.getCurrentProfile().then((profile) => {
      let doUpload = false;
      let doStoreSession = false;
	    // If the user is not done yet, we should save all the data that we need
      // to restore the practice session.
      if (profile.formalTester) {
        doUpload = ($scope.active && $scope.currentPracticeSession.ratings.length >= $scope.count);
        doStoreSession = ($scope.active && $scope.currentPracticeSession.ratings.length > 0);
      } else {
        doUpload = ($scope.active && $scope.currentPracticeSession.ratings.length > 0);
      }

	    if (doUpload) {
	      saveJSON($scope.currentPracticeSession.ratings, jsonPath, function () {
	        files.Ratings = jsonPath;
	        $scope.currentPracticeSession.files = files;
	        var practiceTypeStr = sessionDisplayString();
	        var session = $scope.currentPracticeSession;
	        navigator.notification.confirm("Would you like to upload this " + practiceTypeStr + " session?",
	          function (index) {
	            NotifyingService.notify("recording-completed", session);
	            if (index == 1) {
	              const filesToUpload = [
	                files.Metadata,
	                files.LPC,
	                files.Audio,
	                files.Ratings
	              ];
	              session.uploadProgress = [0, 0, 0, 0];
	              UploadService.uploadPracticeSessionFiles(
	                filesToUpload,
	                session.id,
	                uploadCallbackForSession(session),
	                completeCallback,
	                errorCallback
	              );
	              $scope.uploadStatus.isUploading = true;
	            }
	          }, "Upload",
	          ["OK", "Later"]);
        });
        ProfileService.runTransactionForCurrentProfile(function(handle, doc, t) {
          t.update(handle, { inProcessSession: null });
        });
	    } else if (doStoreSession) {
        ProfileService.runTransactionForCurrentProfile(function(handle, doc, t) {
          const res = t.update(handle, { inProcessSession: $scope.currentPracticeSession });
          console.log(res);
        });
      }
	  });

	  $scope.isRecording = false;
  }

  /**
   *
   * @param items An array of items.
   * @param fn A function that accepts an item from the array and returns a promise.
   * @returns {Promise}
   */
  function forEachPromise(items, fn) {
    return items.reduce(function (promise, item) {
      return promise.then(function () {
        return fn(item);
      });
    }, Promise.resolve());
  }

  // So, this would be the place to load a previous session. Why don't we just
  // store that session with the user?
  function beginPracticeForUser(user) {
    /* --------------------------------
	    visual reinforcement
  	-------------------------------- */
    if (!$scope.probe) {
      if (user.highscores) {
        // if there is user data on highscores
        // load them here
        $scope.highscores = user.highscores;
      }
      // implied else
      // use default highscores
    }

    if (user.inProcessSession) {
      $scope.currentPracticeSession = Object.assign({}, user.inProcessSession);
      const previousRatings = $scope.currentPracticeSession.ratings;
      $scope.currentWordIdx = 0;
      forEachPromise(previousRatings, (rating) => {
        $scope.currentWordIdx++;
        return handleRatingData($scope, rating.rating);
      }).then(() => {
        $scope.currentWordIdx = $scope.currentPracticeSession.ratings.length - 1;
        if (window.AudioPlugin !== undefined) {
          AudioPlugin.startRecording(user, sessionDisplayString(), recordingDidStart, recordingDidFail);
        }
        advanceWord();
      });
    } else {
      $scope.currentWordIdx = -1;
      $scope.currentPracticeSession = initialPracticeSession(
        Date.now(),
        $scope.type || "word",
        $scope.probe || "quest",
        $scope.count
      );

      if (window.AudioPlugin !== undefined) {
        AudioPlugin.startRecording(user, sessionDisplayString(), recordingDidStart, recordingDidFail);
      }
      advanceWord();
    }
  }

	function advanceWord() {
	  if ($scope.currentWord !== null) {
	    if ($scope.rating === 0) {
	      navigator.notification.alert("Rate pronunciation before advancing!", null, "No rating");
	      return;
	    }
	    $scope.currentPracticeSession.ratings.push({
        target: $scope.currentWord,
        rating: $scope.rating,
        time: Date.now(),
      });
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
      $scope.carrier_phrase = carrier_phrases[Math.floor(Math.random() * carrier_phrases.length)];
      $scope.smallFont = $scope.carrier_phrase.length >= 16;
      $scope.tinyFont = $scope.carrier_phrase.length >= 32;
	  }

	  if ($scope.pauseEvery && $scope.pauseEvery > 0 && $scope.currentWordIdx > 0) {
	    if ($scope.currentWordIdx % $scope.pauseEvery === 0) {
	      $scope.isFeedbacking = true;
	      if (navigator.notification) {
	        // will not trigger if serving
	        navigator.notification.confirm("Pausing for feedback",
	          function () {
	            $scope.$apply(() => {
	              $scope.isFeedbacking = false;
	            });
	          }, "",
	          ["Done"]);
	      } else {}
	    }
	  }
	}

	$scope.beginWordPractice = function () {
    $scope.currentWord = null;
    if ($scope.isPracticing) return;
    $scope.isPracticing = true;
	  console.log("Beginning " + sessionDisplayString());

	  if (window.AudioPlugin === undefined) {
	    if (navigator.notification)
	      navigator.notification.alert("Can't start " + sessionDisplayString() + ": no audio", null, "Error");
	  }

	  ProfileService.getCurrentProfile().then(
	    function (res) {
	      if (res) {
	        beginPracticeForUser(res);
	        if ($scope.startPracticeCallback) $scope.startPracticeCallback();
	      } else {
	        if (navigator.notification)
	          navigator.notification.alert("Can't start " + sessionDisplayString() + " -- create a profile first", null, "No profile");
	      }
	    },
	    function (err) {
	      if (navigator.notification)
	        navigator.notification.alert("Can't start " + sessionDisplayString() + ": " + err, null, "Error");
	    }
	  );
	};

	$scope.endWordPractice = function () {
	  /* --------------------------------
	       visual reinforcement
  	   -------------------------------- */
	  if (!$scope.probe) {
	    // check if new highscores
	    let shouldUpdateHighscores = false;
	    if ($scope.block_score_highscore > $scope.highscores.block.score.total) {
	      shouldUpdateHighscores = true;
	      $scope.highscores.block.score.total = $scope.block_score_highscore;
	      $scope.highscores.block.score.date = Date.now();
	    }
	    if ($scope.block_golds_highscore > $scope.highscores.block.golds.total) {
	      shouldUpdateHighscores = true;
	      $scope.highscores.block.golds.total = $scope.block_golds_highscore;
	      $scope.highscores.block.golds.date = Date.now();
	    }

	    if ($scope.session_score > $scope.highscores.session.score.total) {
	      shouldUpdateHighscores = true;
	      $scope.highscores.session.score.total = $scope.session_score;
	      $scope.highscores.session.score.date = Date.now();
	    }
	    if ($scope.session_coins['gold'] > $scope.highscores.session.golds.total) {
	      shouldUpdateHighscores = true;
	      $scope.highscores.session.golds.total = $scope.session_coins['gold'];
	      $scope.highscores.session.golds.date = Date.now();
	    }

	    if (shouldUpdateHighscores) {
	      NotifyingService.notify("update-highscores", $scope.highscores);
	    }
	  }

	  // todo: send highscores

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
	    if ($scope.isPracticing) advanceWord();
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
      scrambleArray($scope.wordOrder);
	}

	$scope.reloadCSVData = function () {
	  if ($scope.type === 'Word'
	    // hackzorz: we know that we're doing a Word Quiz and not a Quest
	    // if requested CSV is data/Word_Probe
	    &&
	    $scope.csvs[0] !== "data/Word_Probe.csv") {
	    let tempWordList = [];

	    // map csvs to adaptive difficulty key names
	    // to cause as few side effects as possible

	    $scope.csvs.forEach((csv) => {
	      let key = csv.replace('data/wp_', '').replace('.csv', '');
	      if ($scope.difficulty <= 3) {
	        tempWordList = tempWordList.concat(words[key][$scope.difficulty]);
	      } else {
	        // difficulty is 4 or 5
	        tempWordList = tempWordList
	          .concat(words[key][1])
	          .concat(words[key][2])
	          .concat(words[key][3]);
	      }
	    });

	    $scope.wordList = tempWordList;

      $scope.reorderWords();
      return Promise.resolve();
	  }
	  if ($scope.type === "Syllable" ||
	    $scope.probe) {
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
	    return Promise.all(loadTasks).then(function (res) {
	      $scope.reorderWords();
	    });
	  }
	}

	$scope.$on('ratingChange', function (event, data) {
	  console.log('rating change! ' + data);
	  $scope.rating = data === undefined ? 0 : data;
	  if (!!$scope.rating) {
	    $scope.nextWord();
	  }
	  // keep running average of ratings
	  if (data) {
      handleRatingData($scope, data);
	  }
	});

	$scope.$on('stopPractice', function (event) {
	  if ($scope.isPracticing) {
	    $scope.endWordPractice();
	  }
	});

	$scope.$watch("csvs", function () {
	    $scope.hasValidWordList = false;
	    if ($scope.csvs) {
        $scope.reloadCSVData().then(() => {
          if ($scope.hasValidWordList && !$scope.isPracticing && $scope.beginOnLoad) {
            $scope.beginWordPractice();
          }
        });
      }
	});

	if ($scope.csvs) {
    $scope.reloadCSVData().then(() => {
      if ($scope.hasValidWordList && !$scope.isPracticing && $scope.beginOnLoad) {
        $scope.beginWordPractice();
      }
    });
  }

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
