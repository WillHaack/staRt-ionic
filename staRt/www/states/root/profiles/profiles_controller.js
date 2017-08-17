/*globals console:false, angular:false, window:false, alert:false */

'use strict';

var UploadStatus = Object.freeze({
	INCOMPLETE: "INCOMPLETE",
	ERROR: "ERROR",
	COMPLETE: "COMPLETE"
});

function dateFromString(str) {
	var a = str.split(/[^0-9]/);
	a = a.map(function (s) { return parseInt(s, 10) });
  return new Date(a[0], a[1]-1 || 0, a[2] || 1, a[3] || 0, a[4] || 0, a[5] || 0, a[6] || 0);
}

function compareRecordings(ra, rb) {
	var da = dateFromString(ra.date);
	var db = dateFromString(rb.date);
	if (da > db) return -1;
	if (da === db) return 0;
	return 1;
}

( function(  )
{
	var profiles = angular.module( 'profiles' );

	profiles.controller('ProfilesController', function($scope, $timeout, $localForage, StartUIState, ProfileService, UploadService, $rootScope, $state, $cordovaDialogs)
	{
		console.log('ProfilesController here!');

		// Nota Bene: A valid profile must have the following kv pairs:
		// "name" (string) the name of the profile
		// "uuid" (string) some string that is unique to each account
		// "age" (int) age in years
		// "gender" (string) Male or Female
		// "heightFeet" (int) feet portion of height
		// "heightInches" (int) inches portion of heightInches
		// "targetF3" (double, optional) the saved target F3 value
		// "stdevF3" (double, optional) the saved stdeviation F3 value
		// "targetLPCOrder" (int, optional) the saved target LPC order

		function init()
		{

			$scope.isEditing = false;
			$scope.data = {};

			$scope.data.uploadMessage = "";

			ProfileService.getAllProfiles().then( function(res) {
				console.log(res);
				$scope.data.profiles = res;
			});

			ProfileService.getCurrentProfile().then(function(res)
			{
				console.log(res);
				if (res)
				{
					$scope.data.currentProfile = res;
					$scope.data.currentProfileUUID = res.uuid;
				}
			});

			$scope.$watchCollection('data.currentProfile', function(data)
			{
				if (data)
				{
					$scope.data.currentProfileUUID = $scope.data.currentProfile.uuid;
					if (window.AudioPlugin !== undefined)
					{
						if ($scope.data.currentProfile.lpcOrder) {
							AudioPlugin.setLPCOrder($scope.data.currentProfile.lpcOrder, null);
						}
					};

					$scope.updateRecordingsList();
				}
			});

			$scope.$on( "$ionicView.enter", function( scopes, states ) {
				$scope.updateRecordingsList();
			});
		}

		$scope.updateCurrentProfile = function(profile)
		{
			ProfileService.setCurrentProfile(profile).then(function() {
				ProfileService.getCurrentProfile().then(function(res) {
					if (res) {
						$scope.data.currentProfile = res;
					}
				});
			});
		};

		$scope.updateRecordingsList = function() {
			ProfileService.getRecordingsForProfile($scope.data.currentProfile, function(recordings) {
				var statusesToFetch = [];
				recordings.sort(compareRecordings); // Prefer the recordings sorted from present to past
				recordings.forEach(function(recording) {
					statusesToFetch.push(
						UploadService.getUploadStatusForSessionKey(recording.Metadata.split('/').pop())
							.then(function(status) {
								recording.uploaded = !!status.uploaded;
							})
					);
				});
				Promise.all(statusesToFetch).then(function() {
					$scope.data.currentProfileRecordings = recordings;
				});
			});
		}

		$scope.setIsEditing = function(isEditing)
		{
			$scope.isEditing = isEditing;
			$scope.editing = isEditing ? "editing" : "";
		};

		$scope.saveProfile = function()
		{
			if ($scope.data.currentProfile.name !== undefined &&
				$scope.data.currentProfile.age !== undefined &&
				$scope.data.currentProfile.heightFeet !== undefined &&
				$scope.data.currentProfile.heightInches !== undefined &&
				$scope.data.currentProfile.gender !== undefined)
			{
				ProfileService.saveProfile($scope.data.currentProfile).then(function()
				{
					ProfileService.getAllProfiles().then(function(res)
					{
						$scope.data.profiles = res;
						$scope.setIsEditing(false);
						ProfileService.setCurrentProfile($scope.data.currentProfile);
					});
				});
			} else {
				alert("Profile is missing some data");
			}

		};

		$scope.cancelEdit = function()
		{
			ProfileService.getCurrentProfile().then( function(res) {
				$scope.data.currentProfile = res;
			});
			$scope.setIsEditing(false);
		};

		$scope.createProfile = function()
		{
			$scope.data.currentProfile = ProfileService.createProfile();
			$scope.setIsEditing(true);
		};

		function clamp(x, lo, hi)
		{
			return (x < lo ? lo : (x > hi ? hi : x));
		}

		$scope.deleteProfile = function(profile)
		{
			function doDelete()
			{
				var profileIdx = $scope.data.profiles.indexOf(profile);
				profileIdx = clamp(profileIdx, 0, $scope.data.profiles.length - 2);
				ProfileService.deleteProfile(profile).then(function()
				{
					ProfileService.getAllProfiles().then(function(res)
					{
						$scope.data.profiles = res;
						if(!res.length)
						{
							$scope.data.currentProfile = null;
							$scope.updateCurrentProfile(null);
						}
						else
						{
							$scope.data.currentProfile = $scope.data.profiles[profileIdx];
							$scope.updateCurrentProfile($scope.data.currentProfile);
						}
					});
				});
			}

			// Check if we're in the browser or in iOS
			if(navigator.notification)
			{
				navigator.notification.confirm("Are you sure you want to delete " + profile.name + "?" , function(i)
				{
					if(i == 1)
					{
						doDelete();
					}
				}, "Delete All", ["OK", "Cancel"]);
			}
			else
			{
				doDelete();
			}
		}

		$scope.deleteAllProfiles = function()
		{
			function doDelete()
			{
				$scope.data.currentProfile = undefined;
				$scope.data.profiles = [];
				ProfileService.deleteAllProfiles();
			}
			if(navigator.notification)
			{
				navigator.notification.confirm("Are you sure you want to delete all profiles?", function(i)
				{
					if(i == 1)
					{
						doDelete();
					}
				}, "Delete All", ["OK", "Cancel"]);
			}
			else
			{
				doDelete();
			}
		};

		$scope.updateSelectedRecording = function(recording) {
			$scope.data.selectedProfileRecording = recording;
		};

		$scope.deleteSelectedRecording = function() {
			if (window.AudioPlugin) {
				if ($scope.data.selectedProfileRecording) {
					var recording = $scope.data.selectedProfileRecording;
					$scope.data.selectedProfileRecording = null;
					window.AudioPlugin.deleteRecording(recording, function() {
						$scope.updateRecordingsList();
					}, function(err) {
						console.log(err);
					});
				}
			}
		};

		$scope.uploadSelectedRecording = function() {

			$scope.data.uploadMessage = "Uploading...";
			$scope.uploading = true;

			function progress() {
				// do something
			}

			function win() {
				$cordovaDialogs.alert(
					"Session uploaded successfully",
					"Upload Complete",
					"Okay"
				);
				$scope.uploading = false;
				$scope.data.uploadMessage = "Upload succeeded";
				$scope.updateRecordingsList();
			}

			function fail(err) {
				$cordovaDialogs.alert(
					"Session upload failed",
					"Upload Error",
					"Okay"
				);
				$scope.uploading = false;
				$scope.data.uploadMessage = "Upload failed";
			}

			if (window.AudioPlugin) {
				if ($scope.data.selectedProfileRecording) {
					var session = {
						files: {},
						id: null
					};
					session.files.Metadata = $scope.data.selectedProfileRecording.Metadata;
					session.files.Audio = $scope.data.selectedProfileRecording.Audio;
					session.files.LPC = $scope.data.selectedProfileRecording.LPC;
					session.files.Ratings = session.files.Metadata.replace('-meta.csv', '-ratings.json');
					session.id = session.files.Metadata.split('/').pop().substr(0, 36);
					UploadService.uploadPracticeSessionFiles(session.files, session.id, progress, win, fail);
				}
			}
		};

		init();

	});

} )(  );
