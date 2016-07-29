var profileService = angular.module('profileService', []);

profileService.factory('ProfileService', function($localForage, $http)
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
		return {
			name: undefined,
			age: undefined,
			heightFeet: undefined,
			heightInches: undefined,
			gender: undefined,
			uuid: guid()
		};
	};

	var normsData;
	var norms;

	$http.get('data/F3r_norms_Lee_et_al_1999.csv').then(function(res)
	{
		// Set up norms data
		normsData = res;
		norms = parseCSV(normsData.data).slice(1);
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

	return {
		getAllProfiles: function()
		{
			return $localForage.getItem('profiles');
		},

		deleteAllProfiles: function()
		{
			return $localForage.setItem('profiles', undefined);
		},

		getCurrentProfile: function()
		{
			return $localForage.getItem('currentProfile');
		},

		setCurrentProfile: function(profile)
		{
			return $localForage.setItem('currentProfile', profile);
		},

		saveProfile: function(profile)
		{
			return $localForage.getItem('profiles').then(function(profiles)
			{
				var idx = profiles.findIndex(function(el)
				{
					return el.uuid == this.uuid;
				}, profile);
				if (idx !== -1)
				{
					profiles[idx] = profile;
				}
				else
				{
					profiles.push(profile);
				}
				$localForage.setItem('profiles', profiles);
			});
		},

		createProfile: function()
		{
			return newUserProfile();
		},

		deleteProfile: function(profile)
		{
			return $localForage.getItem('profiles').then(function(profiles)
			{
				var idx = profiles.findIndex(function(el)
				{
					return el.uuid == this.uuid;
				}, profile);
				if (idx !== -1)
				{
					profiles.splice(idx, 1);
				}
				else
				{
					throw 'Profile doesn\'t exist!';
				}
				$localForage.setItem('profiles', profiles);
			});
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
		}
	}

});