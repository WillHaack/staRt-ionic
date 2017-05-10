var uploadService = angular.module('uploadService', []);

var uploadURLs = [
	"https://byunlab.com/start/session/ratings",
	"https://byunlab.com/start/session/metadata",
	"https://byunlab.com/start/session/lpc",
	"https://byunlab.com/start/session/audio"
];

uploadService.factory('UploadService', function($localForage, $http, $cordovaDialogs)
{
	function getCredentials($http, cb) {
		$http.get("data/credentials.json",  {
			headers: {
				'Content-type': 'application/json'
			}
		})
		.success(function(res) {
			cb(res);
		})
		.error(function(data, status) {
			cb(false);
		})
	}

	function uploadFile(absolutePath, destURL, mimeType, sessionID, progressCb, completeCb, $http, $cordovaDialogs)
	{
		var win = function (r) {
			console.log("Code = " + r.responseCode);
			console.log("Response = " + r.response);
			console.log("Sent = " + r.bytesSent);
			if (completeCb)
				completeCb(r);
		}

		var fail = function (error) {
			if (error.code === 3) {
				$cordovaDialogs.alert(
					"Server Upload Failed. Please check your internet connection and try again.",
					"Upload Error",
					"Okay"
				);
			} else {
				$cordovaDialogs.alert(
					"An error has occurred: Code = " + error.code,
					"Unexpected Error",
					"Okay"
				);
				console.log("upload error source " + error.source);
				console.log("upload error target " + error.target);
			}
		}

		resolveLocalFileSystemURL("file://" + absolutePath, function(fileEntry) {
			fileEntry.file( function(file) {
				var options = new FileUploadOptions();
				options.fileName = absolutePath.substr(absolutePath.lastIndexOf('/') + 1);
				options.mimeType = mimeType;
				options.chunkedMode = true;

				//call getCredentials and set http headers with username and password
				getCredentials($http, function(credentials) {
					var headers = {
						'filename':options.fileName,
					};
					if (credentials) {
						headers['Authorization'] = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
					}
					options.headers = headers;
					var params = {
						"session_id": sessionID
					};
					options.params = params;

					// HACK: Add the session id to the URL, so that the server will recognize it
					destURL = destURL + "?session_id=" + sessionID;

					var ft = new FileTransfer();
					ft.onProgress = progressCb;
					ft.upload(fileEntry.toInternalURL(), encodeURI(destURL), win, fail, options);
				});

			}, function(error) {
				console.log(error);
			});
			console.log(fileEntry.toInternalURL());
		}, function(error) {
			console.log(error);
		});
	}

	return {
		uploadPracticeSessionFiles: function(session, id, uploadCallback, completeCallback) {
			var filesToUpload = [session.Ratings, session.Metadata, session.LPC, session.Audio];
			var mimeTypes = ["text/json", "text/csv", "text/csv", "audio/mp4"];
			filesToUpload.forEach(function(file, idx) {
				var uploadCb = function(res) {
					uploadCallback(res, idx)
				};
				var completeCb = function(res) {
					console.log(idx);
					completeCallback(res, idx)
				};
				uploadFile(filesToUpload[idx],
					uploadURLs[idx],
					mimeTypes[idx],
					session.id,
					uploadCb,
					completeCb,
					$http,
					$cordovaDialogs
				);
			});
		}
	};
});