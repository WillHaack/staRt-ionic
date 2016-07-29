var profileService = angular.module('profileService', []);

profileService.factory('ProfileService', function($rootScope, $scope, $localForage)
{

	return
	{
		function getAllProfiles()
		{
			return $localForage.getItem('profiles');
		}

		function deleteAllProfiles()
		{
			return $localForage.setItem('profiles', undefined);
		}

		function getCurrentProfile()
		{
			return $localForage.getItem('currentProfile');
		}

		function setCurrentProfile(profile)
		{
			return $localForage.setItem('currentProfile', profile);
		}

		function saveProfile(profile)
		{
			$localForage.getItem('profiles').then(function(profiles)
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
					alert('Profile doesn\'t exist!');
				}
				$localForage.setItem('profiles', profiles);
			});
		}

		function createProfile(profile)
		{

		}

		function deleteProfile(profile)
		{

		}
	}

});