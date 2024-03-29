var autoService = angular.module('autoService', []);

var INTRO_FREEPLAY_TIME = 300000; // Five minutes
var SESSION_FREEPLAY_TIME = 300000; // Five minutes
var SPEEDY_INTRO_FREEPLAY_TIME = 1000; // One second. Use this if the profile is named 'Speedy' for testing
var SPEEDY_SESSION_FREEPLAY_TIME = 1000; // One second. Use this if the profile is named 'Speedy' for testing
var TOTAL_SESSION_COUNT = 16;
var TRIALS_PER_SESSION = 100;
var SPEEDY_TRIALS_PER_SESSION = 5;

function _hasIntersection(arrayA, arrayB) {
	return arrayA.filter(function (a) {
		return arrayB.indexOf(a) !== -1;
	}).length > 0;
}

function _scramble(array) {
	for (var i = 0; i < array.length; i++) {
		var swappI = Math.floor(Math.random() * array.length);
		var temp = array[i];
		array[i] = array[swappI];
		array[swappI] = temp;
	}
}

// -----------------------------------------------------------------------
// Object to hold state of user's progress thru the protocol

var AutoState = function (profile, currentStates, onShow, initialState) {
	this.onShow = onShow;
	this.currentStep = null;
	this.restrictions = {};
	this.contextString = "abstact";
	this.state = Object.assign({}, initialState ? initialState : {});
};
AutoState.prototype = {
	currentMessage: function (profile, currentStates, changeList) {
		if (this.currentStep) {
			if (typeof (this.currentStep.dialog) === 'function') {
				return this.currentStep.dialog(profile, currentStates, changeList);
			} else {
				return this.currentStep.dialog;
			}
		}

		return null;
	},
	getState: function() {
		return Object.assign({}, this.state);
	},
	processUpdate: function (profile, currentStates, changeList) {

		var oldStep = this.currentStep;
		if (!this.currentStep) this.currentStep = this.firstStep;
		if (!this.currentStep) return;

		while (!!this.currentStep.next) {
			var nextStep = this.currentStep.next(profile, currentStates, changeList);
			if (!nextStep) break;
			this.currentStep = nextStep;
		}

		if (oldStep !== this.currentStep) {
			if (this.onShow) this.onShow(this.currentMessage(profile, currentStates), !this.currentStep.next);
		}
	}
};


// -----------------------------------------------------------------------
// Introductory auto guide, which helps the user get familiar with the app

/* NOTE: AutoState.call takes 'this' (IntroAuto state) and essentially initialises it with the AutoState prototype.
	 In this case, .call populates a new AutoState object (IntroAuto), with the data provided to IntroAuto constructor fn. The next assignment sets the IntroAuto.prototype as a descendant of AutoState.prototype -- it will inherit all methods from the AutoState.prototype.
*/
var IntroAuto = function (profile, currentStates, onShow, initialState) {

	AutoState.call(this, profile, currentStates, onShow, initialState);

	var steps = {};
	steps.welcome = {
		next: function (profile, currentStates, changeList) {
			if (profile.nWordQuizComplete >= 1) return steps.syllable;
			return null;
		},
		dialog: {
			text: "Welcome to the staRt app! Please begin by navigating to Quiz and completing our Long Word Quiz measure.",
			title: "Welcome"
		}
	};

	steps.syllable = {
		next: function (profile, currentStates, changeList) {
			if (profile.nSyllableQuizComplete >= 1) return steps.tutorial;
			return null;
		},
		dialog: {
			text: "Please proceed to our Syllable Quiz measure.",
			title: "Syllable Quiz"
		}
	};

	steps.tutorial = {
		next: function (profile, currentStates, changeList) {
			if (profile.nTutorialComplete >= 1) return steps.freePlay;
			return null;
		},
		dialog: {
			text: "Please navigate to the Tutorial.",
			title: "Tutorial"
		}
	};

	steps.freePlay = {
		next: function (profile, currentStates, changeList) {
			var timeThreshold = profile.name === 'Speedy' ? SPEEDY_INTRO_FREEPLAY_TIME : INTRO_FREEPLAY_TIME;
			if (currentStates.thisFreeplayTime >= timeThreshold) return steps.complete;
		},
		dialog: {
			text: "Please navigate to Free Play and try out the wave for approximately five minutes.",
			title: "Free Play"
		}
	};

	steps.complete = {
		dialog: {
			text: "You are done with your first session! Please come back soon to complete your first Quest.",
			title: "All done"
		}
	};

	this.firstStep = steps.welcome;
	this.contextString = "introduction";
};

// IntroAuto.prototype inherits all methods from from AutoState.prototype
IntroAuto.prototype = Object.create(AutoState.prototype);

IntroAuto.shouldBegin = function (profile) {
	return profile.nIntroComplete === 0 && profile.formalTester;
};


// -----------------------------------------------------------------------
// One of the sixteen guided runs through the app
var SessionAuto = function (profile, currentStates, onShow, initialState) {
	AutoState.call(this, profile, currentStates, onShow, initialState);

	if (initialState && initialState.categoryRestrictions) {
		this.restrictions.categoryRestrictions = Object.assign(initialState.categoryRestrictions);
	}

	this.state = Object.assign({
		hasAcceptedSessionPrompt: false,
		wantsToDoItLater: false,
		hasAcceptedBiofeedbackPrompt: false,
		hasAcceptedQuestPrompt: false,
		didFinishSession: false,
	}, this.state);

	var steps = {};
	var ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth"];
	var sessionIndex = profile.nBiofeedbackSessionsCompleted + profile.nNonBiofeedbackSessionsCompleted;

	// Re-use the biofeedback constraint, if you have one saved
	if (!this.state.biofeedback) {
		var biofeedback = [];
		for (var i = 0; i < (TOTAL_SESSION_COUNT / 2); i++) {
			if (i >= profile.nBiofeedbackSessionsCompleted) {
				biofeedback.push("BF");
			}
		}
		for (var i = 0; i < (TOTAL_SESSION_COUNT / 2); i++) {
			if (i >= profile.nNonBiofeedbackSessionsCompleted) {
				biofeedback.push("TRAD");
			}
		}
		_scramble(biofeedback);

		this.state.biofeedback = biofeedback.pop();
	}

	if (this.state.biofeedback === "BF") {
		this.restrictions.rootWaveForced = true;
		this.restrictions.rootWaveHidden = false;
	} else {
		this.restrictions.rootWaveForced = true;
		this.restrictions.rootWaveHidden = true;
	}
	this.restrictions.rootTrialCount = profile.name === 'Speedy'
		? SPEEDY_TRIALS_PER_SESSION
		: TRIALS_PER_SESSION;

	steps.confirm = {
		next: (function () {
			if (this.state.hasAcceptedSessionPrompt) return steps.biofeedbackPrompt;
			if (this.state.wantsToDoItLater) return steps.laterPrompt;
			return null;
		}).bind(this),
		dialog: (function (profile, currentStates, changeList) {
			return {
				title: ordinals[sessionIndex] + " Session",
				text: "Welcome back. Would you like to complete your " + ordinals[sessionIndex].toLowerCase() + " session now?",
				buttons: ["Later", "Okay"],
				callback: (function (index) {
					if (index === 0 || index === 1) {
						this.state.wantsToDoItLater = true;
					}
					if (index === 2) {
						this.state.hasAcceptedSessionPrompt = true;
					}
					this.processUpdate(profile, currentStates, []);
				}).bind(this)
			};
		}).bind(this)
	};

	steps.laterPrompt = {
		dialog: {
			title: "See You Later",
			text: "You'll be prompted to begin your session the next time you pick this profile."
		}
	};

	steps.biofeedbackPrompt = {
		next: (function () {
			if (this.state.hasAcceptedBiofeedbackPrompt) return steps.freePlay;
			return null;
		}).bind(this),
		dialog: (function (profile, currentStates, changeList) {
			var text = this.state.biofeedback === "BF" ?
				"Please complete this session with biofeedback." :
				"Please complete this session using traditional (no-biofeedback) practice.";
			return {
				text: text,
				title: "Biofeedback",
				button: "Okay",
				callback: (function () {
					this.state.hasAcceptedBiofeedbackPrompt = true;
					this.processUpdate(profile, currentStates, []);
				}).bind(this)
			};
		}).bind(this)
	};

	steps.freePlay = {
		next: function (profile, currentStates) {
			var timeThreshold = profile.name === 'Speedy' ? SPEEDY_SESSION_FREEPLAY_TIME : SESSION_FREEPLAY_TIME;
			if (currentStates.thisFreeplayTime >= timeThreshold) return steps.quest;
			return null;
		},
		dialog: {
			text: "Please navigate to Free Play and practice in any way you like for five minutes.",
			title: "Free Play",
			button: "Okay"
		}
	};

	steps.quest = {
		next: (function (profile, currentStates) {
			if (this.state.hasAcceptedQuestPrompt && currentStates.thisCurrentView === "words") return steps.whichQuest;
			return null;
		}).bind(this),
		dialog: (function (profile, currentStates, changeList) {
			return {
				text: "You are ready to get started! Please navigate to Quest to begin.",
				title: "Quest Time",
				callback: (function () {
					this.state.hasAcceptedQuestPrompt = true;
					this.processUpdate(profile, currentStates, []);
				}).bind(this)
			};
		}).bind(this)
	};

	var goal = profile.name === "Speedy" ? SPEEDY_TRIALS_PER_SESSION : TRIALS_PER_SESSION;
	steps.whichQuest = {
		next: (function (profile, currentStates) {
			if (currentStates.thisQuestTrialsCompleted >= goal) {
				this.state.didFinishSession = true;
				return steps.allDone;
			}
			return null;
		}).bind(this),
		dialog: (function (profile, currentStates, changeList) {
			var text;
			if (profile.allTrialsCorrect < 100) {
				text = "Please choose Syllable Quest to practice at the syllable level. Each Quest is 100 " +
          "syllables long, but you can break your Quest into shorter sessions if " +
          "you need to. Remember that the clinician should provide a model before " +
          "each syllable.";
			} else {
				text = "Please choose Word Quest to practice at the word level. Each Quest is 100 " +
          "words long, but you can break your Quest into shorter sessions if you need to. " +
          "Remember that the clinician should provide a model only at the start of each " +
          "block of 10 words.";
			}
			return {
				text: text,
				title: "Quest"
			};
		}).bind(this)
	};

	steps.allDone = {
		dialog: function (profile, currentStates) {
			var text;
			if (sessionIndex === (TOTAL_SESSION_COUNT - 1)) {
				var percentCorrectStr = profile.percentTrialsCorrect.toString().split(".")[0];
				text = "Congratulations, you finished your sixteen quests! Your total accuracy was approximately " + percentCorrectStr +
          "% correct. Your accuracy in your final session was approximatedly " + currentStates.thisQuestPercentTrialsCorrect + "% correct." +
          " To complete your tasks as a formal pilot tester, please schedule one more visit to complete the Word Quiz and the Syllable Quiz " +
          "at the post-treatment time point.";
			} else {
				var percentCorrectStr = currentStates.thisQuestPercentTrialsCorrect.toString().split(".")[0];
				text = "Congratulations, you have completed this quest! You scored approximately " +
        percentCorrectStr + "% correct. " +
          "Please come back soon to complete your next session.";
			}
			return {
				text: text,
				title: "All done"
			};
		}
	};

	this.firstStep = steps.confirm;
	this.contextString = this.state.biofeedback + "-" + sessionIndex;
};
SessionAuto.prototype = Object.create(AutoState.prototype);
SessionAuto.shouldBegin = function (profile) {
	var introGood = profile.nIntroComplete >= 1;
	var formalGood = !!profile.formalTester;
	var bfSessions = profile.nBiofeedbackSessionsCompleted;
	var tradSessions = profile.nNonBiofeedbackSessionsCompleted;
	var sessionsGood = (bfSessions + tradSessions) < TOTAL_SESSION_COUNT;
	var treatmentComplete = !!profile.nFormalTreatmentComplete;
	return introGood && formalGood && sessionsGood && !treatmentComplete;
};

// The concluding guided auto run, which measures syllable and word performance at the end of the series
var ConclusionAuto = function (profile, currentStates, onShow, initialState) {
	AutoState.call(this, profile, currentStates, onShow, initialState);

	this.state = Object.assign({
		hasAcceptedSessionPrompt: false,
		wantsToDoItLater: false,
		didFinishSession: false,
	}, this.state);

	var initialWordQuizCount = profile.nWordQuizComplete;
	var initialSyllableQuizCount = profile.nSyllableQuizComplete;

	var steps = {};

	steps.confirm = {
		next: (function () {
			if (this.state.hasAcceptedSessionPrompt) return steps.wordQuizPrompt;
			if (this.state.wantsToDoItLater) return steps.laterPrompt;
			return null;
		}).bind(this),
		dialog: (function (profile, currentStates, changeList) {
			return {
				title: "Post-Treatment Assessment",
				text: "Welcome back. Would you like to complete your post-treatment assessment now?",
				buttons: ["Later", "Okay"],
				callback: (function (index) {
					if (index === 0 || index === 1) {
						this.wantsToDoItLater = true;
					}
					if (index === 2) {
						this.hasAcceptedSessionPrompt = true;
					}
					this.processUpdate(profile, currentStates, []);
				}).bind(this)
			};
		}).bind(this)
	};

	steps.laterPrompt = {
		dialog: {
			title: "See You Later",
			text: "You'll be prompted to complete your post-treatment assessment the next time you pick this profile."
		}
	};

	steps.wordQuizPrompt = {
		next: function (profile, currentStates) {
			if (initialWordQuizCount < profile.nWordQuizComplete) return steps.syllableQuizPrompt;
			return null;
		},
		dialog: {
			text: "Please begin navigate to Quiz and complete our Long Word Quiz measure.",
			title: "Word Quiz",
			button: "Okay"
		}
	};

	steps.syllableQuizPrompt = {
		next: (function (profile, currentStates) {
			if (initialSyllableQuizCount < profile.nSyllableQuizComplete) {
				this.state.didFinishSession = true;
				return steps.conclusionPrompt;
			}
			return null;
		}).bind(this),
		dialog: {
			text: "Please proceed to our Syllable Quiz measure.",
			title: "Syllable Quiz",
			button: "Okay"
		}
	};

	steps.conclusionPrompt = {
		dialog: function (profile, currentStates) {
			var text = "Thank you again for supporting our research! " +
        "You are free to keep using the staRt app, but your time as a formal pilot tester is complete.";
			return {
				text: text,
				title: "All done"
			};
		}
	};

	this.firstStep = steps.confirm;
	this.contextString = "assessment";
};
ConclusionAuto.prototype = Object.create(AutoState.prototype);
ConclusionAuto.shouldBegin = function (profile) {
	var biofeedbackCompleteGood = profile.nBiofeedbackSessionsCompleted >= (TOTAL_SESSION_COUNT / 2);
	var nonBiofeedbackCompleteGood = profile.nNonBiofeedbackSessionsCompleted >= (TOTAL_SESSION_COUNT / 2);
	var formalGood = !!profile.formalTester;
	var treatmentComplete = !!profile.nFormalTreatmentComplete;
	return biofeedbackCompleteGood && nonBiofeedbackCompleteGood && formalGood && !treatmentComplete;
};

// =============================================================================
autoService.factory('AutoService', function ($rootScope, $ionicPlatform, NotifyingService, ProfileService, SessionStatsService, $cordovaDialogs) {
	var currentAuto = null;
	var currentRestrictions = null;

	function _setCurrentAuto(auto) {
		if (auto !== currentAuto) {
			if (currentRestrictions) {
				for (var restriction in currentRestrictions) {
					if (currentRestrictions.hasOwnProperty(restriction)) {
						delete $rootScope[restriction];
					}
				}
			}

			if (currentAuto) {
				SessionStatsService.endContext();
				NotifyingService.notify("session-did-end", currentAuto);
			}
		}

		currentAuto = auto;
		currentRestrictions = {};

		if (currentAuto) {
			if (currentAuto.restrictions) {
				for (var restriction in currentAuto.restrictions) {
					if (currentAuto.restrictions.hasOwnProperty(restriction)) {
						currentRestrictions[restriction] = currentAuto.restrictions[restriction];
						$rootScope[restriction] = currentAuto.restrictions[restriction];
					}
				}
			}

			SessionStatsService.beginContext(currentAuto.contextString);
			NotifyingService.notify("session-did-begin", currentAuto);
		}
	}

	function _checkForAuto(profile, currentStates, changeList, initialState) {
		if (!currentAuto) {

			// Intro session
			if (!currentAuto && IntroAuto.shouldBegin(profile)) {
				_setCurrentAuto(new IntroAuto(profile, currentStates, function (message, completed) {
					if (message) _showMessage(message);
					if (completed) {
						NotifyingService.notify('intro-completed', profile);
						_setCurrentAuto(null);
					}
				}, initialState));
			}

			// Subsequent sessions
			if (!currentAuto && SessionAuto.shouldBegin(profile, currentStates)) {
				_setCurrentAuto(new SessionAuto(profile, currentStates, function (message, completed) {
					if (message) _showMessage(message);
					if (completed) {
						if (currentAuto.state.didFinishSession) {
							NotifyingService.notify('session-completed', {
								profile: profile,
								practice: currentAuto.state.biofeedback
							});
						}
						_setCurrentAuto(null);
					}
				}, initialState));
			}

			// Conclusion session
			if (!currentAuto && ConclusionAuto.shouldBegin(profile, currentStates)) {
				_setCurrentAuto(new ConclusionAuto(profile, currentStates, function (message, completed) {
					if (message) _showMessage(message);
					if (completed) {
						if (currentAuto.state.didFinishSession) {
							NotifyingService.notify('conclusion-completed', {
								profile: profile
							});
						}
						_setCurrentAuto(null);
					}
				}, initialState));
			}

			if (currentAuto) currentAuto.processUpdate(profile, currentStates, changeList);
		}
	}

	function _showMessage(message) {
		if (message.buttons) {
			$cordovaDialogs.confirm(
				message.text,
				message.title,
				message.buttons
			).then(function (idx) {
				if (message.callback) message.callback(idx);
			});
		} else {
			$cordovaDialogs.alert(
				message.text,
				message.title,
				message.button || "Okay"
			).then(function () {
				if (message.callback) message.callback();
			});
		}
	}

	function _presentFormalPasswordChallenge(profile) {
		var weblink = "https://wp.nyu.edu/byunlab/projects/start/participate/";
		$cordovaDialogs.prompt(
			"To initiate formal testing mode, please enter the code that you received after completion of the consent process.",
			"Formal Research Pilot",
			["Cancel", "Confirm"]
		).then(function (result) {
			if (result.buttonIndex <= 1) {
				$cordovaDialogs.alert(
					"If you decide later that you want to be a formal tester, you can opt in from the profiles page.",
					"Formal Research Pilot"
				);
			} else {
				if (result.input1 !== "biofeedback") {
					$cordovaDialogs.confirm(
						"Please see our website for information on formal study participation, and to receive a code to begin testing.",
						"Invalid Password",
						["Okay", "Visit Website"]
					).then(function (idx) {
						if (idx === 2) window.open(weblink, "_blank", 'location=yes');
					});
				} else {
					NotifyingService.notify('formal-testing-validated', profile);
				}
			}
		});
	}

	function _promptForFormalParticipation(profile) {

		if (profile.formalTester) {
			$cordovaDialogs.alert(
				profile.name + " is already participating as a formal pilot tester",
				"Formal Research Pilot"
			);

			return;
		}

		var weblink = "https://wp.nyu.edu/byunlab/projects/start/participate/";
		var text = "Do you want to participate as a formal pilot tester in our research study? " +
      "Please note that we must obtain informed consent from the clinician, client, and client’s " +
      "family before formal participation is possible. Please see our website " +
      "or email nyuchildspeech@gmail.com for more information.";
		$cordovaDialogs.confirm(
			text,
			"Formal Research Pilot",
			["No", "Visit Website", "Yes"]
		).then(function (idx) {
			if (idx === 0 || idx === 1) {
				$cordovaDialogs.alert(
					"If you decide later that you want to be a formal tester, you can opt in from the profiles page.",
					"Formal Research Pilot"
				);
			} else if (idx === 2) {
				window.open(weblink, "_blank", 'location=yes');
			} else if (idx === 3) {
				_presentFormalPasswordChallenge(profile);
			}
		});
	}

	function _doPauseSession() {
		var state = currentAuto.getState();
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				ProfileService.runTransactionForCurrentProfile(function (handle, doc, t) {
					t.update(handle, {
						inProcessSessionState: state
					});
				});
			}
		});
		_setCurrentAuto(null);
	}

	function _doStartSession() {
		console.log("Starting session");
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				var currentStates = SessionStatsService.getCurrentProfileStats() || {};
				var changeList = ['resume'];

				if (profile.inProcessSession) {
					$cordovaDialogs.confirm(
						"It looks like you were in the middle of a session. Would you like to pick up where you left off, or start over?",
						"Resume Session",
						["Resume", "Start over"]
					).then(function(index) {
						if (index === 1) {
							_checkForAuto(profile, currentStates, changeList, profile.inProcessSessionState);
						} else {
							ProfileService.clearInProgressSessionForCurrentProfile().then(function() {
								_checkForAuto(profile, currentStates, changeList, {});
							});
						}
					});
				} else {
					ProfileService.clearInProgressSessionForCurrentProfile().then(function() {
						_checkForAuto(profile, currentStates, changeList, {});
					});
				}
			}
		});
	}

	function _doStopSession() {
		console.log("Stopping session");
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				var state = currentAuto.getState();
				ProfileService.runTransactionForCurrentProfile(function (handle, doc, t) {
					t.update(handle, {
						inProcessSessionState: null
					});
				});
			}
		});
		_setCurrentAuto(null);
	}

	NotifyingService.subscribe('will-set-current-profile-uuid', $rootScope, function (msg, profileUUID) {
		_setCurrentAuto(null);
		if (!profileUUID) return;
		ProfileService.getProfileWithUUID(profileUUID).then(function (profile) {
			if (profile && profile.formalTester && (profile.nFormalTreatmentComplete === 0)) {
				$cordovaDialogs.alert(
					"Welcome back! Please press the purple \"start session\" button to begin your next session",
					"Introduction",
					"Okay"
				).then(function () {
					// no-op
				});
			}
		});
	});

	NotifyingService.subscribe('profile-stats-updated', $rootScope, function (msg, data) {
		var profile = data[0];
		var currentStates = data[1];
		var changeList = data[2];

		if (currentAuto) {
			currentAuto.processUpdate(profile, currentStates, changeList);
		} else if (changeList.indexOf('brandNew') !== -1) {
			_promptForFormalParticipation(profile);
		} else if (changeList.indexOf('formalTester') !== -1) {

			$cordovaDialogs.alert(
				"Welcome to the formal testing program! Please press the purple \"start session\" button at any time to begin",
				"Introduction",
				"Okay"
			).then(function () {
				// no-op
			});

			// _checkForAuto(profile, SessionStatsService.getCurrentProfileStats(), changeList);
		}
	});

	return {
		init: function () {
			console.log("Auto Service initialized");
		},

		isSessionActive: function () {
			return currentAuto !== null;
		},

		pauseSession: function() {
			if (this.isSessionActive) _doPauseSession();
		},

		promptForFormalParticipation: function (profile) {
			_promptForFormalParticipation(profile);
		},

		startSession: function() {
			_doStartSession();
		},

		stopSession: function() {
			_doStopSession();
		},

		toggleCategoryRestriction: function (index, state) {
			if (currentAuto) {
				if (!currentAuto.state.categoryRestrictions) {
					currentAuto.state.categoryRestrictions = [];
				}

				if (state && currentAuto.state.categoryRestrictions.indexOf(index) === -1) {
					currentAuto.state.categoryRestrictions.push(index);
				} else if (!state && currentAuto.state.categoryRestrictions.indexOf(index) !== -1) {
					var pos = currentAuto.state.categoryRestrictions.indexOf(index);
					currentAuto.state.categoryRestrictions.splice(pos, 1);
				}
			}
		},
	};
});
