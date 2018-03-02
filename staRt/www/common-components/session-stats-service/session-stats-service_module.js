var LONG_SESSION_MILLIS = 600000; // Ten minutes

var sessionStatsService = angular.module('sessionStatsService', [ 'firebaseService', 'notifyingService', 'profileService' ]);

sessionStatsService.factory('SessionStatsService', function($rootScope, $localForage, $http, FirebaseService, NotifyingService, ProfileService, $state)
{
	var lastSessionChronoTime;
	var profileSessionTimerId;
	var profileLongSessionTimerId;

	var currentProfileStats = {
		thisQuestTrialsCompleted: 0, // trials completed since the start of this session
		thisQuestTrialsCorrect: 0, // score since the start of this session
		thisQuestPercentTrialsCorrect: 0, // 100 * correct / completed
		thisSessionTime: 0, // time elapsed since the start of this session
		thisFreeplayTime: 0, // time elapsed in freeplay since the start of this session
		thisQuestTime: 0, // time elapsed in quest since the start of this session
		thisCurrentView: $state.current.url // whichever view the user is currently looking at
    };

	// function _checkForPrompt(profile) {
	// 	StartServerService.getCredentials(function (credentials) {
	// 		if (credentials) {
	// 			var headers = {}, options = {};
	// 			headers['Authorization'] = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
	// 			options.headers = headers;
	// 			var params = {
	// 				profile: profile
	// 			};
	// 			$http.post('https://byunlab.com/start/prompt', {name: "hey"} , options)
	// 				.success(function (res) {
	// 					console.log(res);
	// 				})
	// 				.error(function (err, status) {
	// 					console.log(err);
	// 					console.log(status);
	// 				});
	// 		}
	// 	});
	// }

	function _logProfileUseInterval() {
		var nextSessionChronoTime = Date.now();
        var duration = nextSessionChronoTime - lastSessionChronoTime;
        ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "allSessionTime", duration, changelist);
				_incrementProfileStat(currentProfileStats, "thisSessionTime", duration, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		})
		lastSessionChronoTime = nextSessionChronoTime;
	}

	function _incrementProfileStat(profile, stat, increment, changelist) {
        var newValue = (profile[stat] ? profile[stat] : 0) + increment;
        _updateProfileStat(profile, stat, newValue, changelist);
	}
	
	function _notifyChanges(profile, currentProfileStats, changelist) {
		NotifyingService.notify('profile-stats-updated', [profile, currentProfileStats, changelist]);
	}

	function _resetProfileChrono() {
		if (profileSessionTimerId) clearInterval(profileSessionTimerId);
		lastSessionChronoTime = Date.now();
		setInterval(_logProfileUseInterval, 60000);
	}

	function _resetSessionStats() {
		for (var k in currentProfileStats) {
			if (currentProfileStats.hasOwnProperty(k)) currentProfileStats[k] = 0;
		}
	}

	function _updateProfileForRecording(msg, session) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				var recordingTime = session.endTimestamp - session.startTimestamp;
				if (profile.firstSessionTimestamp === null) profile.firstSessionTimestamp = session.startTimestamp;
				profile.lastSessionTimestamp = session.startTimestamp;
                var changelist = [];

				if (session.ratings.length) {
					// Remember, each rating is an array of length 2, eg ["target", <rating>]
					var score = session.ratings.map(function (x) { return Math.max(0, (x[1] - 1) / 2 )})
						.reduce(function (x, accum) { return x + accum; });

					// Increment and calculate stats for the profile
					_incrementProfileStat(profile, "allTrialsCompleted", session.ratings.length, changelist);
                    _incrementProfileStat(profile, "allTrialsCorrect", score, changelist);
                    _updateProfileStat(profile, "percentTrialsCorrect", (100 * profile.allTrialsCorrect / profile.allTrialsCompleted), changelist);

                    // Increment and calculate stats for the session
                    _incrementProfileStat(currentProfileStats, "thisQuestTrialsCompleted", session.ratings.length, changelist);
                    _incrementProfileStat(currentProfileStats, "thisQuestTrialsCorrect", score, changelist);
                    _updateProfileStat(
                        currentProfileStats,
                        "thisQuestPercentTrialsCorrect",
                        (100 * currentProfileStats.thisQuestTrialsCorrect) / currentProfileStats.thisQuestTrialsCompleted,
                        changelist
                    );	
				}

				if (session.ratings.length === session.count) {
					_incrementProfileStat(profile, "nQuestsCompleted", 1, changelist);
					if (session.type.toLowerCase() === "word" && session.probe)
						_incrementProfileStat(profile, "nWordQuizComplete", 1, changelist);
					if (session.type.toLowerCase() === "syllable" && session.probe)
						_incrementProfileStat(profile, "nSyllableQuizComplete", 1, changelist);
				}

                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
    }
    
    function _updateProfileStat(profile, stat, value, changelist) {
        profile[stat] = value;
        if (changelist.indexOf(stat) === -1) {
            changelist.push(stat);
        }
    }

	// Notifications
	NotifyingService.subscribe('recording-completed', $rootScope, _updateProfileForRecording);
	NotifyingService.subscribe('freeplay-tick', $rootScope, function(msg, duration) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "allFreeplayTime", duration, changelist);
				_incrementProfileStat(currentProfileStats, "thisFreeplayTime", duration, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});
	NotifyingService.subscribe('quest-start', $rootScope, function(msg) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "nQuestsInitiated", 1, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});
	NotifyingService.subscribe('quest-tick', $rootScope, function(msg, duration) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "allQuestTime", duration, changelist);
				_incrementProfileStat(currentProfileStats, "thisQuestTime", duration, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});
	NotifyingService.subscribe('intro-completed', $rootScope, function(msg) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "nIntroComplete", 1, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});
	NotifyingService.subscribe('session-completed', $rootScope, function(data) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				var practice = data.practice;
				var changelist = [];
				if (practice === "BF") {
					_incrementProfileStat(profile, "nBiofeedbackSessionsCompleted", 1, changelist);
				} else {
					_incrementProfileStat(profile, "nNonBiofeedbackSessionsCompleted", 1, changelist);
				}
				ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});
	NotifyingService.subscribe('tutorial-completed', $rootScope, function(msg) {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
                var changelist = [];
				_incrementProfileStat(profile, "nTutorialComplete", 1, changelist);
                ProfileService.saveProfile(profile);
                _notifyChanges(profile, currentProfileStats, changelist);
			}
		});
    });
    NotifyingService.subscribe('will-set-current-profile-uuid', $rootScope, function(msg, profileUUID) {
        if (profileUUID) {
			ProfileService.getProfileWithUUID(profileUUID).then(function (profile) {
				if (profileLongSessionTimerId) clearTimeout(profileLongSessionTimerId);
				profileLongSessionTimerId = null;
				profileLongSessionTimerId = setTimeout(function() {
					var changelist = [];
					_incrementProfileStat(profile, "nLongSessionsCompleted", 1, changelist);
					ProfileService.saveProfile(profile);
					_notifyChanges(profile, currentProfileStats, changelist);
				}, LONG_SESSION_MILLIS);

				{
					var changelist = [];
					_updateProfileStat(profile, "lastLoginTime", Date.now(), changelist);
					_resetProfileChrono();
					_resetSessionStats();
					ProfileService.saveProfile(profile);
					_notifyChanges(profile, currentProfileStats, changelist);
					// _checkForPrompt(profile);
				}
			});
        }
	});
	NotifyingService.subscribe('$stateChangeSuccess', $rootScope, function() {
		ProfileService.getCurrentProfile().then(function (profile) {
			if (profile) {
				var changelist = [];
				_updateProfileStat(currentProfileStats, 'thisCurrentView', $state.current.url, changelist);
				_notifyChanges(profile, currentProfileStats, changelist);
			}
		});
	});

	return {
        init: function() {
            console.log("Session stats tracking initialized");
		},
		
		getCurrentProfileStats: function() {
			return currentProfileStats;
		}
	}

});