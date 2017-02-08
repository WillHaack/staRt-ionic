var tutorialService = angular.module('tutorialService', []);

tutorialService.factory('tutorialDataService', function($http)
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
        sref: "profiles",
        ani: "tada"
      },
      {
        title: "Tutorial",
        sref: "tutorial",
        ani: "rotateIn"
      },
      {
        title: "Test",
        sref: "auto",
        ani: "flipInX"
      },
      {
        title: "Free Play",
        sref: "free-play",
        ani: "bounce"
      },
      {
        title: "Syllables",
        sref: "syllables",
        ani: "bounceIn"
      },
      {
        title: "Words",
        sref: "words",
        ani: "bounceIn"

      },
      {
        title: "Resources",
        sref: "resources",
        ani: "flipInY"
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


/*
angular.module('hellosolarsystem').service('PeopleService', function($http) {
  var service = {
    getAllPeople: function() {
      return $http.get('data/people.json', { cache: true }).then(function(resp) {
        return resp.data;
      });
    },
    
    getPerson: function(id) {
      function personMatchesParam(person) {
        return person.id === id;
      }
      
      return service.getAllPeople().then(function (people) {
        return people.find(personMatchesParam)
      });
    }
  }
  
  return service;
})
*/