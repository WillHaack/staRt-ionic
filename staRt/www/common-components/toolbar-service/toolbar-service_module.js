var toolbarService = angular.module('toolbarService', []);

toolbarService.factory('ToolbarService', function()
{

  var tbArray;

  var tbBtns = {
    back: {
      icon: './img/icons/line/back.svg',
      title: 'Back',
      action: 'tbBack()'
    },
    stop: {
      icon: './img/icons/line/anchor.svg',
      title: 'Stop',
      action: 'tbStop()'
    },
    help: {
      icon: './img/icons/line/lifesaver.svg',
      title: 'Help',
      action: 'tbHelp()'
    }
  }

  var initTB_freePlay = function() {
    tbArray = [];
    tbArray.push( tbBtns.help);

    return tbArray;
  }

  var initTB_quiz = function() {
    tbArray = [];
    tbArray.push( tbBtns.stop);
    tbArray.push( tbBtns.help);

    return tbArray;
  }

  var initTB_questBF = function() {
    tbArray = [];
    tbArray.push( tbBtns.stop );
    tbArray.push( tbBtns.help );

    return tbArray;
  }


  function initTB_questNoBF() {
    tbArray = [];
    tbArray.push( tbBtns.stop );
    tbArray.push( tbBtns.help );

    return tbArray;
  }


  // SERVICE RETURN OBJ------------------------------------------
  return {
    logMe: function() {
      console.log('toolbarService works!');
    },
    initTB_freePlay: initTB_freePlay,
    initTB_questBF: initTB_questBF,
    initTB_questNoBF: initTB_questNoBF,
    initTB_quiz: initTB_quiz
  } //end return

});
