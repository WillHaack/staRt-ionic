var LONG_TRIAL_TIME_MILLIS = 600000;

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
			creationTimestamp: Date.now(),
			lastLoginTimestamp: Date.now(),
			firstSessionTimestamp: null,
			lastSessionTimestamp: null,
			pronunciationsRated: 0,
			allTrialsCompleted: 0,
			longTrialsCompleted: 0,
			totalPracticeTime: 0,
			uuid: guid()
		};
	};

	var normsData;
	var filterOrderData;
	var norms;
	var filterOrder;
	var profilesInterfaceState;

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
				profile.pronunciationsRated += session.ratings.length;
				profile.totalPracticeTime += (session.endTimestamp - session.startTimestamp);

				if (recordingTime >= LONG_TRIAL_TIME_MILLIS) {
					profile.longTrialsCompleted += 1;
				}

				if (session.ratings.length === session.count) {
					profile.allTrialsCompleted += 1;
				}

				_saveProfile(profile);
			}
		});
	}

	NotifyingService.subscribe('recording-completed', $rootScope, _updateProfileForRecording);

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
					profile.lastLoginTime = Date.now();
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