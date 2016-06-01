// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('start', ['ionic', 'LocalForageModule'])

.factory("StartUIState", function() {
  return {
    getLastActiveIndex: function(lf) {
      return lf.getItem("lastActiveIndex");
      // return parseInt(window.localStorage.lastActiveIndex) || 0;
    },
    setLastActiveIndex: function(lf, index) {
      return lf.setItem("lastActiveIndex", index);
    },
    tabTitles: [
      "Profiles",
      "Tutorial",
      "Auto",
      "Free Play",
      "Syllables",
      "Words",
      "Resources"
    ],
    content: [
      "A whole bunch of Profles",
      "A great big tutorial",
      "Auto, whatever that means",
      "Play around for free I guess",
      "Syl-la-bles",
      "Different words and stuff",
      "Gold, wood, stone"
    ]
  };
})

.controller('StartCtrl', function($scope, $timeout, $localForage, StartUIState) {

  StartUIState.getLastActiveIndex($localForage).then(function(data) {
    $scope.startUIState = data;
  });

  $scope.selectIndex = function(index) {
    StartUIState.setLastActiveIndex($localForage, index);
    $scope.content = StartUIState.content[index];
  };

  $scope.tabTitles = StartUIState.tabTitles;

  $scope.getLPCCoefficients = function(cb) {
    if (window.AudioPlugin !== undefined) {
      AudioPlugin.getLPCCoefficients(cb);
    }
  };

  $scope.recordingSuccessCB = function(status) {
    console.log(status);
  };

  $scope.recordingErrorCB = function(status) {
    console.log(status);
  };

  $scope.startRecordingDefault = function() {
    console.log("Start recording");

    if (window.AudioPlugin !== undefined) {
      var defaultDescription = {
        "age": "13",
        "gender": "M",
        "heightFeet": "5",
        "heightInches": "11",
        "name": "Testerman",
        "stdevF3": "100",
        "targetF3": "1100",
        "targetLPCOrder": "32",
        "uuid": "SomethingVeryUnique"
      };
      AudioPlugin.startRecording(defaultDescription, $scope.recordingSuccessCB, $scope.recordingErrorCB);
    }
  };

  $scope.stopRecording = function () {
    console.log("Stop recording");
    if (window.AudioPlugin !== undefined) {
      AudioPlugin.stopRecording($scope.recordingSuccessCB, $scope.recordingErrorCB);
    }
  };

  $scope.isRecording = function () {
    console.log("Is recording?");
    if (window.AudioPlugin !== undefined) {
      AudioPlugin.isRecording($scope.recordingSuccessCB, $scope.recordingErrorCB);
    }
  };

  $scope.listRecordingsDefault = function() {
    var defaultDescription = {
      "age": "13",
      "gender": "M",
      "heightFeet": "5",
      "heightInches": "11",
      "name": "Testerman",
      "stdevF3": "100",
      "targetF3": "1100",
      "targetLPCOrder": "32",
      "uuid": "SomethingVeryUnique"
    };
    AudioPlugin.recordingsForAccount(defaultDescription, $scope.recordingSuccessCB, $scope.recordingErrorCB);
  };

	//Start lpc drawer
	var sketch = function(lpc) {

		var url;
		var myCanvas;
		var myFrameRate = 30;
		var running = true;
    var frequencyScaling = 1.0;
    var points = [];
    var peaks = [];

    lpc.coefficentCallback = function(msg) {
      points = msg.coefficients;
      peaks = msg.freqPeaks;
      frequencyScaling = msg.freqScale;
    };

		lpc.preload = function() {
		};

		lpc.setup = function() {
			myCanvas = lpc.createCanvas(screen.width, screen.height/2);
      myCanvas.parent(document.getElementById('lpc-container'));
			lpc.frameRate(myFrameRate);
		};

		lpc.draw = function() {
			lpc.background('#aaffaa');
      $scope.getLPCCoefficients(lpc.coefficentCallback);
      lpc.stroke('#000000');
      lpc.strokeWeight(3);
      lpc.noFill();

      lpc.beginShape();
      // Not sure exactly how the points are meant to be scaled...
      var scaleFac = -1.0;

      for (var i=0; i<points.length; i++) {
        var px = i / (points.length) * myCanvas.width * frequencyScaling;
        var py = points[i] * scaleFac;
        py = py * (myCanvas.height/2) + (myCanvas.height/2);
        lpc.vertex(px, py);
      }
      lpc.endShape();

      lpc.strokeWeight(2);
      for (i=0; i<peaks.length; i = i+2) {
        var p1 = peaks[i];
        var p2 = peaks[i+1];
        p1.X = (p1.X/2 + 0.5) * myCanvas.width * frequencyScaling;
        p2.X = (p2.X/2 + 0.5) * myCanvas.width * frequencyScaling;
        p1.Y = ((p1.Y * scaleFac) + 1) * myCanvas.height/2;
        p2.Y = ((p2.Y * scaleFac) + 1) * myCanvas.height/2;
        lpc.line(p1.X, p1.Y, p2.X, p2.Y);
      }
		};

		lpc.mouseClicked = function() {
		};

		lpc.stopDraw = function() {
			lpc.noLoop();
			running = false;
		};

		lpc.startDraw = function() {
			lpc.loop();
			running = true;
		};
	};
	$scope.myP5 = new p5(sketch);
})

// This is all automatic boilerplate, none of which is apparently necessary for
// running the program. But it says not to disable it, so...
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
