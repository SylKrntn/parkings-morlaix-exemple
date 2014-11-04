

/**
 * Module englobant tous les services
 */
var appServices = angular.module('appServices', []);


/**
 * Service de géolocalisation
 */
appServices.factory('geolocalisation', ['$window', '$rootScope', '$q', function($window, $rootScope, $q) {
	
	var self = this;
	
	self.watchId = null;
	
	function isGeolocationSupported() {
		return navigator.geolocation;
	}
	
	return {
		/**
		 * Renvoie la position de l'utilisateur en cas de succès, un message d'erreur sinon
		 * @param options {JSONObject} : options de configuration (enableHighAccuracy {boolean}, maximumAge {long} et timeout {long})
		 */
		getCurrentPosition: function(options) {
			var deferred = $q.defer();
			
			if (isGeolocationSupported()) {
				navigator.geolocation.getCurrentPosition(
					function(position) {// callback de succès
						console.log(position);
						return deferred.resolve({"locationFound": true, "position": position});
					},
					function(error) {// callback d'erreur
						var errorMessage = "";
						
						switch(error.code) {
							case error.PERMISSION_DENIED:
								errorMessage = "L'utilisateur a interdit la géolocalisation.";
								break;
							case error.POSITION_UNAVAILABLE:
								errorMessage = "La position est introuvable.";
								break;
							case error.TIMEOUT:
								errorMessage = "Délai de localisation dépassé.";
								break;
							case error.UNKNOWN_ERROR:
								errorMessage = "Erreur inconnue.";
								break;
						}
						
						return deferred.reject({"locationFound": false, "message": errorMessage});
					}, options);// options de configuration
			}
			else {
				deferred.reject({"locationFound": false, "message": "Géolocalisation non supportée."});
			}
			return deferred.promise;
		},
		
		/**
		 * Renvoie la position de l'utilisateur en continu en cas de succès, un message d'erreur sinon
		 * @param options {JSONObject} : options de configuration (enableHighAccuracy {boolean}, maximumAge {long} et timeout {long})
		 */
		watchPosition: function(options) {
			var deferred = $q.defer();
			
			if (isGeolocationSupported()) {
				if (self.watchId == null) {
					self.watchId = navigator.geolocation.watchPosition(
						function(position) {// callback de succès
							return deferred.resolve({"locationFound": true, "locationId": self.watchId, "position": position});
						},
						function(error) {// callback d'erreur
							var errorMessage = "";
							
							switch(error.code) {
								case error.PERMISSION_DENIED:
									errorMessage = "L'utilisateur a interdit la géolocalisation.";
									break;
								case error.POSITION_UNAVAILABLE:
									errorMessage = "La position est introuvable.";
									break;
								case error.TIMEOUT:
									errorMessage = "Délai de localisation dépassé.";
									break;
								case error.UNKNOWN_ERROR:
									errorMessage = "Erreur inconnue.";
									break;
							}
							
							return deferred.reject({"locationFound": false, "locationId": self.watchId, "message": errorMessage});
						},
						options// options de configuration
					);
				}
			}
			else {
				deferred.reject({"locationFound": false, "message": "Géolocalisation non supportée."});
			}
			return deferred.promise;
		},
		
		/**
		 * Renvoie l'information comme quoi le suivi de localisation a bien été arrêté
		 * @param id {int} : id de la localisation
		 * @returns une promesse
		 */
		clearWatch: function() {
			var deferred = $q.defer();
			
			if (self.watchId != -1) {
				navigator.geolocation.clearWatch(self.watchId);
				self.watchId = null;
				deferred.resolve({"locationFound": true, "locationId": self.watchId, "message": "Suivi de localisation arrêté."});
			}
			return deferred.promise;
		}
	}// END return
}]);


/**
 * Service d'accès aux données du serveur (pour ce projet, les données se trouvent dans un répertoire local)
 */
appServices.factory('serverDAO', ['$http', '$q', function($http, $q) {
	var sortedParkings = [];
	
	/**
	 * calcule la distance, en ligne droite, entre 2 points (selon la formule de Haversine)
	 * @return la distance, en mètre
	 */
	var distanceBetween = function(userCoords, parkingCoords) {
		const EARTH_RADIUS = 6378137;// Terre = sphère de 6378,137km de rayon
		const DEG2RAD = Math.PI / 180;

		dLat = (parkingCoords[0] - userCoords[0]) * DEG2RAD;
		dLon = (parkingCoords[1] - userCoords[1]) * DEG2RAD;
		lat1 = userCoords[0] * DEG2RAD;
		lat2 = parkingCoords[0] * DEG2RAD;
		sin1 = Math.sin(dLat / 2);
		sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	};
	
	return {
		getParkings: function(userLatLng) {
			var deferred = $q.defer();
			
			$http.get("data/parkings-morlaix.json")
				.success(function(data) {
					console.log(data);
					var parkings = data;
					
					// trie les parkings par ordre croissant de la distance qui les sépare de l'utilisateur
					sortedParkings = _.sortBy(parkings, function(parking) {
						parking.distance = Math.round(distanceBetween(userLatLng, parking.latLng));
						return parking.distance;
					});
					return deferred.resolve(sortedParkings);
				})
				.error(function(data) {
					return deferred.reject(data);
				});
			return deferred.promise;
		}
	}
}])