var profileService = angular.module('profileService', []);

profileService.factory('ProfileService', function($localForage)
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
		}
	}

});