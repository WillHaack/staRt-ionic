var startStateService = angular.module('startStateService', []);

startStateService.factory('StartUIState', function()
{
  return {
    getLastActiveIndex: function(lf) {
      return lf.getItem("lastActiveIndex");
      // return parseInt(window.localStorage.lastActiveIndex) || 0;
    },
    setLastActiveIndex: function(lf, index) {
      return lf.setItem("lastActiveIndex", index);
    },
    tabData: [
      {
        title: "Profiles",
        sref: "profiles"
      },
      {
        title: "Tutorial",
        sref: "tutorial" 
      },
      {
        title: "Auto",
        sref: "auto"
      },
      {
        title: "Free Play",
        sref: "free-play"
      },
      {
        title: "Syllables",
        sref: "syllables"
      },
      {
        title: "Words",
        sref: "words"
      },
      {
        title: "Resources",
        sref: "resources"
      }
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