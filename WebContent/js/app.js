/**
 * app.js
 * 
 * Fichier contenant le module prinicpal de l'application, ainsi que le routage
 */

/**
 * module principal de l'application
 */
var app = angular.module('app', ['ngRoute', 'ngResource', 'appControllers', 'appServices']);

/**
 * routage
 */
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when("/home", {
			"templateUrl": "partials/home.html",
			"controller": "HomeCtrl"
		})
		.when("/infos-parkings", {
			"templateUrl": "partials/infos.html",
			"controller": "ListviewCtrl"
		})
		.when("/carte", {
			"templateUrl": "partials/carte.html",
			"controller": "MapCtrl"
		})
		.otherwise({"redirectTo": "/home"});
}]);