// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('start', ['ionic'])

.factory("StartUIState", function() {
  return {
    getLastActiveIndex: function() {
      return parseInt(window.localStorage.lastActiveIndex) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage.lastActiveIndex = index;
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

.controller('LPCCtrl', function($scope){
  $scope.drawRandomPoints = function() {
    var pntCnt = 50;
    var points = [];
    for (var i=0; i<pntCnt; ++i) {
      var x = i / (pntCnt-1);
      var y = Math.random();
      points.push([x,y,0.0]);
    }
    drawLPC(points);
    console.log(points);
  };
})

.controller('StartCtrl', function($scope, $timeout, StartUIState) {

  $scope.startUIState = StartUIState.getLastActiveIndex();

  $scope.selectIndex = function(index) {
    StartUIState.setLastActiveIndex(index);
    $scope.content = StartUIState.content[index];
    AudioPlugin.iosalert('alert', ''+index, 'Okay', null);
  };

  $scope.tabTitles = StartUIState.tabTitles;
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
