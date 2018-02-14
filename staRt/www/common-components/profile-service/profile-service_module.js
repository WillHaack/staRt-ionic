var LONG_SESSION_MILLIS = 600000; // Ten minutes

var profileService = angular.module('profileService', [ 'firebaseService', 'notifyingService' ]);

profileService.factory('ProfileService', function($rootScope, $localForage, $http, FirebaseService, NotifyingService, StartServerService)
{
	function guid() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	};

	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	};

	function newUserProfile() {
		if (!FirebaseService.loggedIn()) { return null; }

		return {
			accountId: FirebaseService.userId(),
			name: undefined,
			age: undefined,
			heightFeet: undefined,
			heightInches: undefined,
			gender: undefined,
			uuid: guid(),

			// Profile cumulative statistics
			allSessionTime: 0, // Milliseconds logged in for this profile
			allFreeplayTime: 0, // Milliseconds spend in free play for this profile
			allQuestTime: 0, // Milliseconds spend in a syllable/word quest
			allTrialsCompleted: 0, // Total number of trials elicited and scored for a given profile
			allTrialsCorrect: 0, // Total number of 'points' accumulated for a profile (good>1, okay>0.5, try again>0)
			percentTrialsCorrect: 0, // 100 * correct / completed	
			nQuestsInitiated: 0, // total number of quests initiated
			nQuestsCompleted: 0, // total number of quests completed
			nLongSessionsCompleted: 0, // total number of times a user is logged in for at least 10 minutes

			// Profile component statistics
			nWordQuizComplete: 0, // number of times Word Quiz has been completed
			nSyllableQuizComplete: 0, // number of times Syllable Quiz has been completed
			nTutorialComplete: 0, // number of times the tutorial has been completed
			nIntroComplete: 0, // number of times intro sequence has been completed
			
			// Other profile statistics
			firstSessionTimestamp: null, // Unix timestamp of first trial
			lastSessionTimestamp: null, // Unix timestamp of most recent trial
			creationTimestamp: Date.now(), // Unix timestamp profile creation
			lastLoginTimestamp: Date.now(), // Unix time of last login
		};
	};

	var normsData;
	var filterOrderData;
	var norms;
	var filterOrder;
	var profilesInterfaceState;

	var lastSessionChronoTime;
	var profileSessionTimerId;
	var profileLongSessionTimerId;

	var currentProfileStats = {
		thisQuestTrialsCompleted: 0, // trials completed since the start of this session
		thisQuestTrialsCorrect: 0, // score since the start of this session
		thisQuestPercentTrialsCorrect: 0, // 100 * correct / completed
		thisSessionTime: 0, // time elapsed since the start of this session
		thisFreeplayTime: 0, // time elapsed in freeplay since the start of this session
		thisQuestTime: 0 // time elapsed in quest since the start of this session
	};

	$http.get('data/F3r_norms_Lee_et_al_1999.csv').then(function(res)
	{
		// Set up norms data
		normsData = res;
		norms = parseCSV(normsData.data).slice(1);
	});

	$http.get('data/filter_norms.csv').then(function(res)
	{
		filterOrderData = res;
		filterOrder = parseCSV(filterOrderData.data).slice(1);
	});

	function parseCSV(str) {
		var arr = [];
		var quote = false;
		var row=0, col=0, c=0;
		for (; c < str.length; c++) {
			var cc = str[c], nc = str[c+1];
			arr[row] = arr[row] || [];
			arr[row][col] = arr[row][col] || '';
			if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
			if (cc == '"') { quote = !quote; continue; }
			if (cc == ',' && !quote) { ++col; continue; }
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }
			arr[row][col] += cc;
		}
		return arr;
	}

	function commitProfilesInterfaceState() {
		var promises = [];
		return profilesInterfaceState.then(function(res) {
			for (var k in res) {
				if (res.hasOwnProperty(k)) {
					promises.push($localForage.setItem(k, res[k]));
				}
			}
			return Promise.all(promises);
		});
	}

	function loadProfilesInterfaceState() {
		return $localForage.keys().then(function(keys, err) {
			var profilePromises = [];
			keys.forEach(function(key) {
				profilePromises.push( $localForage.getItem(key) );
			});

			if (profilePromises.length === 0) {
				return {
					currentProfileUUID : null
				}
			}

			return Promise.all(profilePromises).then( function(result) {
				var retVal = {};
				for (var i=0; i<result.length; i++) {
					retVal[keys[i]] = result[i];
				}
				console.log(retVal);
				return retVal;
			});
		});
	}

	function _checkForPrompt(profile) {
		StartServerService.getCredentials(function (credentials) {
			if (credentials) {
				var headers = {}, options = {};
				headers['Authorization'] = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
				options.headers = headers;
				var params = {
					profile: profile
				};
				$http.post('https://byunlab.com/start/prompt', {name: "hey"} , options)
					.success(function (res) {
						console.log(res);
					})
					.error(function (err, status) {
						console.log(err);
						console.log(status);
					});
			}
		});
	}

	function _getAllProfiles() {
		if (!FirebaseService.loggedIn()) { return Promise.resolve(null); }
		return FirebaseService.db().collection("profiles")
			.where("accountId", "==", FirebaseService.userId())
			.get()
			.then(function (querySnapshot) {
				var profiles = [];
				querySnapshot.forEach(function (doc) {
					profiles.push(doc.data());
				});
				return profiles;
			})
			.catch(function (error) {
				console.log("Error fetching profiles data");
				return null;
			});
	}

	function _getCurrentProfile() {
		return profilesInterfaceState.then( function(res) {
			var currentId = res['currentProfileUUID'];
			var currentProfile = null;
			if (currentId) {
				return FirebaseService.db().collection("profiles")
					.where("uuid", "==", currentId)
					.get()
					.then(function (querySnapshot) {
						querySnapshot.forEach(function (doc) {
							currentProfile = doc.data(); // there should only be one...
						});
						return currentProfile;
					})
					.catch(function (err) {
						console.log(err);
						return null;
					});
			} else {
				return Promise.resolve(null);
			}
		});
	}

	function _logProfileUseInterval() {
		var nextSessionChronoTime = Date.now();
		var duration = nextSessionChronoTime - lastSessionChronoTime;
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				_incrementProfileStat(profile, "allSessionTime", duration);
				_incrementProfileStat(currentProfileStats, "thisSessionTime", duration);
				_saveProfile(profile);
			}
		})
		lastSessionChronoTime = nextSessionChronoTime;
	}

	function _incrementProfileStat(profile, stat, increment) {
		profile[stat] = (profile[stat] ? profile[stat] : 0) + increment;
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

	function _saveProfile(profile) {
		return FirebaseService.db().collection("profiles")
			.doc(profile.uuid)
			.set(profile);
	}

	function _updateProfileForRecording(msg, session) {
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				var recordingTime = session.endTimestamp - session.startTimestamp;
				if (profile.firstSessionTimestamp === null) profile.firstSessionTimestamp = session.startTimestamp;
				profile.lastSessionTimestamp = session.startTimestamp;

				if (session.ratings.length) {
					// Remember, each rating is an array of length 2, eg ["target", <rating>]
					var score = session.ratings.map(function (x) { return Math.max(0, (x[1] - 1) / 2 )})
						.reduce(function (x, accum) { return x + accum; });

					// Increment and calculate stats for the profile
					_incrementProfileStat(profile, "allTrialsCompleted", session.ratings.length);
					_incrementProfileStat(profile, "allTrialsCorrect", score);
					profile.percentTrialsCorrect = (100 * profile.allTrialsCorrect / profile.allTrialsCompleted);

					// Increment and calculate stats for the session
					currentProfileStats.thisQuestTrialsCompleted = session.ratings.length;
					currentProfileStats.thisQuestTrialsCorrect = score;
					currentProfileStats.thisQuestPercentTrialsCorrect =
						(100 * currentProfileStats.thisQuestPercentTrialsCorrect) / currentProfileStats.thisQuestTrialsCompleted;
				}

				if (session.ratings.length === session.count) {
					_incrementProfileStat(profile, "nQuestsCompleted", 1);
					if (session.type.toLowerCase() === "word" && session.probe)
						_incrementProfileStat(profile, "nWordQuizComplete", 1);
					if (session.type.toLowerCase() === "syllable" && session.probe)
						_incrementProfileStat(profile, "nSyllabeQuizComplete", 1);
				}

				_saveProfile(profile);
			}
		});
	}

	// Notifications
	NotifyingService.subscribe('recording-completed', $rootScope, _updateProfileForRecording);
	NotifyingService.subscribe('freeplay-tick', $rootScope, function(msg, duration) {
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				_incrementProfileStat(profile, "allFreeplayTime", duration);
				_incrementProfileStat(currentProfileStats, "thisFreeplayTime", duration);
				_saveProfile(profile);
			}
		});
	});
	NotifyingService.subscribe('quest-start', $rootScope, function(msg) {
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				_incrementProfileStat(profile, "nQuestsInitiated", 1);
				_saveProfile(profile);
			}
		});
	});
	NotifyingService.subscribe('quest-tick', $rootScope, function(msg, duration) {
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				_incrementProfileStat(profile, "allQuestTime", duration);
				_incrementProfileStat(currentProfileStats, "thisQuestTime", duration);
				_saveProfile(profile);
			}
		});
	});
	NotifyingService.subscribe('tutorial-completed', $rootScope, function(msg) {
		_getCurrentProfile().then(function (profile) {
			if (profile) {
				_incrementProfileStat(profile, "nTutorialComplete", 1);
				_saveProfile(profile);
			}
		});
	});

	profilesInterfaceState = loadProfilesInterfaceState();

	return {
		getAllProfiles: function()
		{
			return _getAllProfiles();
		},

		deleteAllProfiles: function()
		{
			if (!FirebaseService.loggedIn()) { return Promise.resolve(null); }

			return FirebaseService.db().collection("profiles")
				.where("accountId", "==", FirebaseService.userId())
				.get()
				.then(function (querySnapshot) {
					var deletes = [];
					querySnapshot.forEach(function (doc) {
						deletes.push(doc.ref.delete());
					});
					return Promise.all(deletes);
				});
		},

		getCurrentProfile: function()
		{
			return _getCurrentProfile();
		},

		getRecordingsForProfile: function(profile, cb) {
			if (window.AudioPlugin !== undefined) {
				var pluginRecordingsCallback = function(recordings) {
					cb(recordings);
				}
				window.AudioPlugin.recordingsForProfile (
					profile,
					pluginRecordingsCallback,
					function() {cb([])}
				);
			} else {
				cb([]);
			}
		},

		setCurrentProfile: function(profile)
		{
			return profilesInterfaceState.then( function (res) {
				if (profile && profile.uuid && (res['currentProfileUUID'] !== profile.uuid)) {
					if (profileLongSessionTimerId) clearTimeout(profileLongSessionTimerId);
					profileLongSessionTimerId = null;
					profileLongSessionTimerId = setTimeout(function() {
						_incrementProfileStat(profile, "nLongSessionsCompleted", 1);
						_saveProfile(profile);
					}, LONG_SESSION_MILLIS);
					profile.lastLoginTime = Date.now();
					_resetProfileChrono();
					_resetSessionStats();
					_saveProfile(profile);
					_checkForPrompt(profile);
				}
				res['currentProfileUUID'] = profile ? profile.uuid : null;
				commitProfilesInterfaceState();
				return res['currentProfileUUID'];
			});
		},

		saveProfile: function(profile)
		{
			return _saveProfile(profile);
		},

		createProfile: function()
		{
			return newUserProfile();
		},

		deleteProfile: function(profile)
		{
			return FirebaseService.db().collection("profiles")
				.doc(profile.uuid)
				.delete()
				.then(_getAllProfiles);
		},

		lookupDefaultF3: function(profile) {
			if (profile.age && profile.gender) {
				var age = profile.age;
				age = age <= 5 ? 5 : age;
				age = age >= 19 ? "19+" : age;
				age = age.toString();
				var gender = profile.gender;
				gender = gender === 'Male' ? 'M' : 'F';

				var normRow = norms.find(function (row) {
					return row[0] === gender && row[1] === age;
				});
				if (normRow) return parseInt(normRow[2]);
				return 0;
			} else {
				return 0;
			}
		},

		lookupDefaultFilterOrder: function(profile) {
			if (profile.age !== undefined &&
				profile.heightFeet !== undefined &&
				profile.heightInches !== undefined &&
				profile.age !== undefined) {
				var gender = profile.gender;
				gender = gender === 'Male' ? 'M' : 'F';
				var ageBit = profile.age >= 15 ? '1' : '0';
				var heightBit = profile.heightFeet * 12 + profile.heightInches >= 64 ? '1' : '0';

				var filterRow = filterOrder.find(function (row) {
					return row[0] === gender && row[1] === ageBit && row[2] === heightBit;
				});
				if (filterRow) return parseInt(filterRow[3]);
				return 35;
			} else {
				return 35;
			}
		}
	}

});