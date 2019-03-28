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
	};

	var initTB_freePlay = function() {
		tbArray = [];
		tbArray.push( tbBtns.help);

		return tbArray;
	};

	var initTB_questBF = function() {
		tbArray = [];
		tbArray.push( tbBtns.stop );
		tbArray.push( tbBtns.help );
		tbArray[tbArray.length -1].helpMsg = 'HELP clicked for questBF';

		return tbArray;
	};

	var initTB_questNoBF = function() {
		tbArray = [];
		tbArray.push( tbBtns.stop );
		tbArray.push( tbBtns.help );
		tbArray[tbArray.length -1].helpMsg = 'HELP clicked for questNoBF';

		return tbArray;
	};

	var initTB_quizSyll = function() {
		tbArray = [];
		tbArray.push( tbBtns.stop );
		tbArray.push( tbBtns.help );
		tbArray[tbArray.length -1].helpMsg = 'HELP clicked for qzSyll';

		return tbArray;
	};

	var initTB_quizSWQ = function() {
		tbArray = [];
		tbArray.push( tbBtns.stop );
		tbArray.push( tbBtns.help );
		tbArray[tbArray.length -1].helpMsg = 'HELP clicked for quizSWQ';

		return tbArray;
	};

	var initTB_quizLWQ = function() {
		tbArray = [];
		tbArray.push( tbBtns.stop );
		tbArray.push( tbBtns.help );
		tbArray[tbArray.length -1].helpMsg = 'HELP clicked for quizLWQ';

		return tbArray;
	};


	// SERVICE EXPORT ------------------------------------------
	return {
		logMe: function() { console.log('toolbarService works!'); },
		initTB_freePlay: initTB_freePlay,
		initTB_questBF: initTB_questBF,
		initTB_questNoBF: initTB_questNoBF,
		initTB_quizSyll: initTB_quizSyll,
		initTB_quizSWQ: initTB_quizSWQ,
		initTB_quizLWQ: initTB_quizLWQ
	}; //end return

});
