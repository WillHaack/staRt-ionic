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

	profiles.controller('ProfilesController', function($scope, $timeout, $localForage, AutoService, FirebaseService, StartUIState, NotifyingService, ProfileService, UploadService, $rootScope, $state, $cordovaDialogs)
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
			$scope.uploadCount = 0;
			$scope.displayName = FirebaseService.userName();

			// use: to change display state of card
			//values: recordings || progress || profile || settings || ""
			$scope.cardState = "profile";

			$scope.data = {};
			$scope.data.uploadMessage = "";
      $scope.data.selectedProfileRecordings = [];
      $scope.data.sessionIsActive = AutoService.isSessionActive();

      NotifyingService.subscribe("session-did-begin", $scope, function() {
        $scope.data.sessionIsActive = true;
      });

      NotifyingService.subscribe("session-did-end", $scope, function() {
        $scope.data.sessionIsActive = false;
      });

      NotifyingService.subscribe("profile-stats-updated", $scope, function(msg, updateData) {
        let profile = updateData[0];
        let currentProfileStats = updateData[1];
        let updateKeys = updateData[2];
        updateKeys.forEach(function(key) {
          $scope.data.currentProfile[key] = profile[key];
        });
      });

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


		// ===========================================================
	  // PROFILE DRAWER
	  // ===========================================================

		/* updateCurrentProfile() Notes
		 	updates $scope.data.currentProfile & $scope.data.currentProfileUUID
			trigger: selecting a new profile from the list in .profiles-layout_drawer-left
			input ele: radio-ion,
			ng-model: data.currentProfileUUID
		*/
		$scope.updateCurrentProfile = function(profile)
		{
			ProfileService.setCurrentProfileUUID(profile.uuid).then(function() {
				ProfileService.getCurrentProfile().then(function(res) {
					if (res) {
						$scope.data.currentProfile = res;
					}
				});
			});
		};

		/* updateCurrentProfile() Notes
			updates $scope.data.currentProfile & $scope.data.currentProfileUUID
			trigger: selecting a new profile from the list in .profiles-layout_drawer-left
			input ele: radio-ion,
			ng-model: data.currentProfileUUID
		*/
		$scope.createProfile = function()
		{
			$scope.data.currentProfile = ProfileService.createProfile();
			$scope.setIsEditing(true);
			$scope.setCardState('profile');
		};


		// ===========================================================
		// CARD STATE
		// vals: 'recordings' || 'progress' || 'profile' || 'settings'
		// ===========================================================
		$scope.setCardState = function(navState) {
			//let state = navState;
			console.log(navState);
			$scope.cardState = navState;
		}




		// ===========================================================
		// CARD: RECORDINGS
		// ===========================================================

		$scope.updateRecordingsList = function() {
			$scope.data.selectedProfileRecordings = [];
			ProfileService.getRecordingsForProfile($scope.data.currentProfile, function(recordings) {
				var statusesToFetch = [];
				recordings.sort(compareRecordings); // Prefer the recordings sorted from present to past
				recordings.forEach(function(recording) {
					statusesToFetch.push(
						UploadService.getUploadStatusForSessionKey(recording.Metadata.split('/').pop())
							.then(function(status) {
								recording.uploaded = !!status.uploaded;
								if (recording.endDate && recording.endDate.length > 0) {
									recording.totalTime = dateFromString(recording.endDate) - dateFromString(recording.date);
									recording.totalTimeString = Math.floor(recording.totalTime / 60000) + " min, " + ((recording.totalTime % 60000) / 1000) + " sec";
								}
							})
					);
				});
				Promise.all(statusesToFetch).then(function() {
					$scope.data.currentProfileRecordings = recordings;
					$timeout(function() {});
				});
			});
		}

		$scope.recordingClicked = function (member) {
			var index = $scope.data.selectedProfileRecordings.indexOf(member);
			if(index > -1) {
				$scope.data.selectedProfileRecordings.splice(index, 1);
				member.selected = false;
			} else {
				$scope.data.selectedProfileRecordings.push(member);
				member.selected = true;
			}
		}

		$scope.deleteSelectedRecordings = function() {
			if (window.AudioPlugin) {
				if ($scope.data.selectedProfileRecordings.length) {
					var deletionPromises = [];
					$scope.data.selectedProfileRecordings.forEach(function (recording) {
						$scope.data.selectedProfileRecording = null;
						deletionPromises.push(new Promise(function (resolve, reject) {
							window.AudioPlugin.deleteRecording(recording, function() {
								resolve();
							}, function(err) {
								console.log(err);
								reject(err);
							});
						}));
					});

					Promise.all(deletionPromises).then(function (res) {
						$scope.updateRecordingsList();
					});
				}
			}
		};

		$scope.uploadSelectedRecordings = function() {

			$scope.data.selectedProfileRecordings.forEach(function (recording) {

				$scope.data.uploadMessage = "Uploading...";

				function progress() {
					// do something
				}

				function win() {
					$cordovaDialogs.alert(
						"Session uploaded successfully",
						"Upload Complete",
						"Okay"
					);
					$scope.uploadCount -= 1;
					if ($scope.uploadCount === 0) $scope.data.uploadMessage = "";
					$scope.updateRecordingsList();
				}

				function fail(err) {
					$cordovaDialogs.alert(
						"Session upload failed",
						"Upload Error",
						"Okay"
					);
					$scope.uploadCount -= 1;
					if ($scope.uploadCount === 0) $scope.data.uploadMessage = "";
				}

				if (window.AudioPlugin) {
					if (recording) {
						var session = {
							files: {},
							id: null
						};
						session.files.Metadata = recording.Metadata;
						session.files.Audio = recording.Audio;
						session.files.LPC = recording.LPC;
						session.files.Ratings = session.files.Metadata.replace('-meta.csv', '-ratings.json');
						session.id = session.files.Metadata.split('/').pop().substr(0, 36);
						$scope.uploadCount += 1;
						UploadService.uploadPracticeSessionFiles(session.files, session.id, progress, win, fail);
					}
				}
			});
		};

		// ===========================================================
		// CARD: PROGRESS
		// ===========================================================



		// ===========================================================
		// CARD: PROFILES
		// ===========================================================
		// if
		// $scope.isEditing = false;

		$scope.setIsEditing = function(isEditing) {
			$scope.isEditing = isEditing;
			$scope.editing = isEditing ? "editing" : "";
		};

		$scope.cancelEdit = function()
		{
			ProfileService.getCurrentProfile().then( function(res) {
				$scope.data.currentProfile = res;
			});
			$scope.setIsEditing(false);
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
						ProfileService.setCurrentProfileUUID($scope.data.currentProfile.uuid);
					});
				});
			} else {
				alert("Profile is missing some data");
			}
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

		// ===========================================================
		// CARD: SETTINGS
		// ===========================================================






		$scope.deleteAllProfiles = function()
		{
			function doDelete()
			{
				ProfileService.deleteAllProfiles().then(function () {
					$scope.data.currentProfile = null;
					$scope.data.profiles = [];
					$scope.updateCurrentProfile(null);
				});
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

		$scope.logOut = function() {
			firebase.auth().signOut().then(function (thing) {
				console.log("Sign out successful");
			}, function (err) {
				console.trace(err);
			});
		}

		$scope.optInFormalTesting = function() {
			ProfileService.getCurrentProfile().then(function (profile) {
				if (profile) AutoService.promptForFormalParticipation(profile);
			});
		}

		var selected = [];


    $scope.startSession = function() {
      AutoService.startSession();
    };

    $scope.stopSession = function() {
      AutoService.stopSession();
    };

		// ----------------

		//$scope.displayName = FirebaseService.userName();
		//$scope.data = {};
		//$scope.data.currentProfile
		//console.log($scope.data);
		//---------------

		init();

	});

} )(  );
