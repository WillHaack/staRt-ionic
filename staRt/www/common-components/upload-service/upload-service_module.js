var uploadService = angular.module('uploadService', []);

var uploadURLs = [
	"https://byunlab.com/start/session/ratings",
	"https://byunlab.com/start/session/metadata",
	"https://byunlab.com/start/session/lpc",
	"https://byunlab.com/start/session/audio"
];

var downloadStatusCache = {};

uploadService.factory('UploadService', function($localForage, $http, $cordovaDialogs, StartServerService)
{
	function saveUploadStatusForSessionKey(sessionKey, status) {
		var item = downloadStatusCache[sessionKey];
		if (!item) item = {};
		downloadStatusCache[sessionKey] = Object.assign(item, status);

		$localForage.getItem(sessionKey)
			.then(function(item) {
				if (!item) item = {};
				item = Object.assign(item, status);
				$localForage.setItem(sessionKey, item);
			});
	}

	// Returns a promise that resolves when the upload is complete (or fails)
	function uploadFile(absolutePath, destURL, mimeType, sessionID, progressCb, $http, $cordovaDialogs)
	{
		return new Promise(function (resolve, reject) {

			var win = function (r) {
				console.log("Code = " + r.responseCode);
				console.log("Response = " + r.response);
				console.log("Sent = " + r.bytesSent);
				resolve(r);
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
				reject(r);
			}

			resolveLocalFileSystemURL("file://" + absolutePath, function(fileEntry) {
				fileEntry.file( function(file) {
					var options = new FileUploadOptions();
					options.fileName = absolutePath.substr(absolutePath.lastIndexOf('/') + 1);
					options.mimeType = mimeType;
					options.chunkedMode = true;

					//call getCredentials and set http headers with username and password
					StartServerService.getCredentials(function(credentials) {
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
						ft.onprogress = progressCb;
						ft.upload(fileEntry.toInternalURL(), encodeURI(destURL), win, fail, options);
					});

				}, function(error) {
					console.log(error);
				});
				console.log(fileEntry.toInternalURL());
			}, function(error) {
				console.log(error);
			});

		});
	}

	return {
		getUploadStatusForSessionKey: function(sessionKey) {
			return $localForage.getItem(sessionKey).then(function(item) {
				if (!item) item = {};
				var cachedItem = downloadStatusCache[sessionKey];
				if (!cachedItem) cachedItem = {};
				return Object.assign(item, cachedItem);
			});
		},

		uploadPracticeSessionFiles: function(session, id, progressCallback, completeCallback, errorCallback) {
			var filesToUpload = [session.Ratings, session.Metadata, session.LPC, session.Audio];
			var mimeTypes = ["text/json", "text/csv", "text/csv", "audio/mp4"];
			var uploadTodos = [];

			saveUploadStatusForSessionKey(session.Metadata.split('/').pop(), {uploading: true});

			filesToUpload.forEach(function(file, idx) {
				var progressCb = function(res) {
					progressCallback(res, idx)
				};
				uploadTodos.push(uploadFile(filesToUpload[idx],
					uploadURLs[idx],
					mimeTypes[idx],
					id,
					progressCb,
					$http,
					$cordovaDialogs
				));
			});

			Promise.all(uploadTodos)
				.then(function() {
					saveUploadStatusForSessionKey(session.Metadata.split('/').pop(), {uploading: false, uploaded: true});
					completeCallback();
				})
				.catch(function(err) {
					if (errorCallback) errorCallback(err)
				});
		}
	};
});
