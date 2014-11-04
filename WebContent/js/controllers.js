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
	
	$scope.locateUser();
}]);



/**
 * Le controleur MapCtrl
 */
appControllers.controller('MapCtrl', ['$scope', 'geolocalisation', 'serverDAO', '$q', function($scope, geolocalisation, serverDAO, $q) {
	$scope.title = "CARTE";
	$scope.locationBtnTxt = "Me localiser";
	var nearestPois = L.featureGroup();
	var userLayer = L.featureGroup();
	var userInfos = {};
	
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
			.then(function(data) {// récupère les infos de localisation de l'utilisateur
				userInfos.lat = data.position.coords.latitude;
				userInfos.lng = data.position.coords.longitude;
				userInfos.acc = data.position.coords.accuracy;
				userInfos.time = handleTime(data.position.timestamp);
				
				$scope.locationBtnTxt = "Dernière localisation à " + userInfos.time;
				
				var deferred = $q.defer();
				$scope.parkings = serverDAO.getParkings([userInfos.lat, userInfos.lng])
					.then(function(data) {// récupère les parkings à proximité de l'utilisateur
						deferred.resolve(data);
					});
				return deferred.promise;
			})
			.then(function(data) {// affiche les parkings sur la carte
				var parkings = data;
				console.log(parkings);
				// vérifie si la couche affichant le positionnement de l'utilisateur existe...
				if (userLayer != null) { userLayer.clearLayers(); }
				else { userLayer = L.featureGroup(); }
				// vérifie si la couche affichant les positionnements des parkings existe...
				if (nearestPois != null) { nearestPois.clearLayers(); }
				else { nearestPois = L.featureGroup(); }
				
				// Positionne l'utilisateur sur la carte (représenté par un marqueur bleu)
				userLayer.addLayer(L.marker(L.latLng(userInfos.lat, userInfos.lng), {"icon":blueMarker}).bindPopup("Ma position"));
				userLayer.addTo(map);
				
				// Boucle sur les parkings pour les afficher sur la carte
				for (var i=0; i<parkings.length; i++) {
					console.log(parkings[i]);
					// texte qui sera affiché dans la popup affectée au parking
					var infobulle = '<strong>Nom : </strong>' + parkings[i].name + '<br />';
					infobulle += '<strong>Distance : </strong>' + parkings[i].distance + ' m<br />';
					infobulle += '<strong>Type : </strong>' + parkings[i].status + '<br />';
					infobulle += '<strong>Places disponibles : </strong>' + parkings[i].places_dispo;
					
					// vérifie le type de stationnement (gratuit, payant ou incconu) et positionne le parking sur la carte (représenté par le marqueur correspondant au type de stationnement)
					switch(parkings[i].status) {
						case 'gratuit':
							nearestPois.addLayer(L.marker(L.latLng(parkings[i].latLng[0], parkings[i].latLng[1]), {"icon":greenMarker}).bindPopup(infobulle));
							break;
						case 'payant':
							nearestPois.addLayer(L.marker(L.latLng(parkings[i].latLng[0], parkings[i].latLng[1]), {"icon":redMarker}).bindPopup(infobulle));
							break;
						case 'Inconnu':
							nearestPois.addLayer(L.marker(L.latLng(parkings[i].latLng[0], parkings[i].latLng[1]), {"icon":orangeMarker}).bindPopup(infobulle));
							break;
						default:
							nearestPois.addLayer(L.marker(L.latLng(parkings[i].latLng[0], parkings[i].latLng[1]), {"icon":orangeMarker}).bindPopup(infobulle));
							break;
					}
				}
				nearestPois.addTo(map);
			});
	};
	
	// Marqueurs
	var blueMarker = L.icon(// icône personnalisée pour le marqueur des sites d'observations sur la carte
		{
			"iconUrl": "js/lib/leaflet-0.7.3/images/marker-icon.png",
			"iconSize": [25,41],
			"iconAnchor": [13, 8],
			"shadowUrl": "js/lib/leaflet-0.7.3/images/marker-shadow.png",
			"shadowSize": [41, 41],
			"shadowAnchor": [13, 8]
		}
	);
	var greenMarker = L.icon(// icône personnalisée pour le marqueur des sites d'observations sur la carte
		{
			"iconUrl": "js/lib/leaflet-0.7.3/images/green-marker-icon.png",
			"iconSize": [25,41],
			"iconAnchor": [13, 8],
			"shadowUrl": "js/lib/leaflet-0.7.3/images/marker-shadow.png",
			"shadowSize": [41, 41],
			"shadowAnchor": [13, 8]
		}
	);
	var orangeMarker = L.icon(// icône personnalisée pour le marqueur des sites d'observations sur la carte
		{
			"iconUrl": "js/lib/leaflet-0.7.3/images/orange-marker-icon.png",
			"iconSize": [25,41],
			"iconAnchor": [13, 8],
			"shadowUrl": "js/lib/leaflet-0.7.3/images/marker-shadow.png",
			"shadowSize": [41, 41],
			"shadowAnchor": [13, 8]
		}
	);
	var redMarker = L.icon(// icône personnalisée pour le marqueur des sites d'observations sur la carte
		{
			"iconUrl": "js/lib/leaflet-0.7.3/images/red-marker-icon.png",
			"iconSize": [25,41],
			"iconAnchor": [13, 8],
			"shadowUrl": "js/lib/leaflet-0.7.3/images/marker-shadow.png",
			"shadowSize": [41, 41],
			"shadowAnchor": [13, 8]
		}
	);
	
	// Initialisation carte
	var OSMLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	var map = L.map('map', {
		zoom: 12,
		center: [48.57, -3.82],
		layers: [OSMLayer]
	});
	
	map.whenReady(function() {
		console.log(map);
		$scope.locateUser();
	});
}]);
