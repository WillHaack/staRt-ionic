'use strict';

( function(  )
{
	var root = angular.module( 'root' );

	root.controller('RootController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state, normsData)
	{
		console.log('RootController here!');

		// Setup Norms Data
		$rootScope.normsData = normsData;

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

		var norms = parseCSV(normsData.data).slice(1);

		$rootScope.lookupDefaultF3 = function(profile) {
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

		// Initialize UI
		StartUIState.getLastActiveIndex($localForage).then(function(data)
		{
			$scope.startUIState = data;
		});

		$scope.state = $state;

		console.log($scope.state);

		$scope.selectIndex = function(index)
		{
			StartUIState.setLastActiveIndex($localForage, index);
			$scope.content = StartUIState.content[index];
		};

		$scope.tabData = StartUIState.tabData;
	});

} )(  );