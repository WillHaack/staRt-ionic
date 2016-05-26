// Ionic Starter App

var start = angular.module('start',
[
    'ionic',
    'LocalForageModule',
    'startStateService'
]);

start.controller('StartCtrl', function($scope, $timeout, $localForage, StartUIState) {

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

	//Start lpc drawer
	var sketch = function(lpc) {

		var url;
		var myCanvas;
		var myFrameRate = 30;
		var running = true;
    var frequencyScaling = 1.0;
    var points = [];

    lpc.coefficentCallback = function(msg) {
      points = msg.coefficients;
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
start.run(function($ionicPlatform) {
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
