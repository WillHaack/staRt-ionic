// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todo', ['ionic'])

.factory("Projects", function() {
  return {
    all: function() {
      var projectString = window.localStorage.projects;
      if (projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage.projects = angular.toJson(projects);
    },
    newProject: function(title) {
      return {
        title: title,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage.lastActiveProject) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage.lastActiveProject = index;
    }
  };
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length - 1);
  };

  $scope.projects = Projects.all();
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  $scope.newProject = function() {
    var projectTitle = prompt("Project Name");
    if (projectTitle) {
      createProject(projectTitle);
    }
  };

  $scope.selectProject = function(project, index) {
    Projects.setLastActiveIndex(index);
    $scope.activeProject = project;
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function(task) {
    if (!$scope.activeProject || !task)
      return;
    $scope.activeProject.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();
    Projects.save($scope.projects);
    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $timeout(function() {
    if ($scope.projects.length == 1) {
      while(true) {
        var projectTitle = prompt("Your first project title:");
        if (projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  }, 1000);
});

// .run(function($ionicPlatform) {
//   $ionicPlatform.ready(function() {
//     if(window.cordova && window.cordova.plugins.Keyboard) {
//       // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
//       // for form inputs)
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//
//       // Don't remove this line unless you know what you are doing. It stops the viewport
//       // from snapping when text inputs are focused. Ionic handles this internally for
//       // a much nicer keyboard experience.
//       cordova.plugins.Keyboard.disableScroll(true);
//     }
//     if(window.StatusBar) {
//       StatusBar.styleDefault();
//     }
//   });
// });
