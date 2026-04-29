angular.module('App.controllers')

.controller('MenuCtrl',function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup, $ionicPopover,
                                $mdDialog, localstorage, $cordovaToast) {

  $scope.$on('$ionicView.enter', function () {

    try {
      console.log('version')
      $rootScope.versionApp = AppVersion.version;
    } catch (e) {
    }

  });

  try {
    console.log('version app')

    $rootScope.versionApp = AppVersion.version;
  } catch (e) {
  }


});
