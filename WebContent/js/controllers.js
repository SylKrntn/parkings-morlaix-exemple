/**
 * controllers.js
 * 
 * Fichier contenant le module englobant les controleurs de l'application, ainsi que les controleurs
 */

/**
 * Le module englobant les controleurs
 */
var appControllers = angular.module('appControllers', []);


/**
 * Le controleur HomeCtrl
 */
appControllers.controller('HomeCtrl', ['$scope', 'geolocalisation', function($scope, geolocalisation) {
	$scope.title = "ACCUEIL";
	$scope.locationBtnTxt = "Me localiser";
	
	function handleTime(timestamp) {
		var date = new Date(timestamp);
		
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		
		if (h < 10) { h = "0"+h; }
		if (m < 10) { m = "0"+m; }
		if (s < 10) { s = "0"+s; }
		
		return h+":"+m+":"+s;
	}
	
	$scope.locateUser = function() {
		geolocalisation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000})
			.then(function(data) {
				var lat = data.position.coords.latitude;
				var lng = data.position.coords.longitude;
				var acc = data.position.coords.accuracy;
				var time = handleTime(data.position.timestamp);
				
				$scope.locationBtnTxt = "Dernière localisation à " + time;
			});
	};
}]);



/**
 * Le controleur ListviewCtrl
 */
appControllers.controller('ListviewCtrl', ['$scope', 'geolocalisation', 'serverDAO', function($scope, geolocalisation, serverDAO) {
	$scope.title = "INFOS DETAILLEES";
	$scope.locationBtnTxt = "Me localiser";
	
	function handleTime(timestamp) {
		var date = new Date(timestamp);
		
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		
		if (h < 10) { h = "0"+h; }
		if (m < 10) { m = "0"+m; }
		if (s < 10) { s = "0"+s; }
		
		return h+":"+m+":"+s;
	}
	
	$scope.locateUser = function() {
		geolocalisation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000})
			.then(function(data) {
				var lat = data.position.coords.latitude;
				var lng = data.position.coords.longitude;
				var acc = data.position.coords.accuracy;
				var time = handleTime(data.position.timestamp);
				
				$scope.locationBtnTxt = "Dernière localisation à " + time;
				
				$scope.parkings = serverDAO.getParkings([lat, lng])
					.then(function(data) {
						$scope.parkings = data;
					});
			});
	};
}]);



/**
 * Le controleur MapCtrl
 */
appControllers.controller('MapCtrl', ['$scope', function($scope) {
	$scope.title = "CARTE";
	$scope.locationBtnTxt = "Me localiser";
}]);
