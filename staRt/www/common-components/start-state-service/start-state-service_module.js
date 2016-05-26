var startStateService = angular.module('startStateService', []);

startStateService.factory('StartUIState', function() {
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
});