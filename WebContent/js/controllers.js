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
appControllers.controller('HomeCtrl', ['$scope', function($scope) {
	$scope.title = "ACCUEIL";
	$scope.locationBtnTxt = "Me localiser";
}]);



/**
 * Le controleur ListviewCtrl
 */
appControllers.controller('ListviewCtrl', ['$scope', function($scope) {
	$scope.title = "INFOS DETAILLEES";
	$scope.locationBtnTxt = "Me localiser";
}]);



/**
 * Le controleur MapCtrl
 */
appControllers.controller('MapCtrl', ['$scope', function($scope) {
	$scope.title = "CARTE";
	$scope.locationBtnTxt = "Me localiser";
}]);
