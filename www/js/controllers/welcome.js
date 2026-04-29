angular.module('App.controllers')

  .controller('WelcomeCtrl', function ($scope, $state, $http, $ionicLoading, $rootScope, $ionicPopup, localstorage, $translate, $filter, sessionstorage, $timeout, $ionicScrollDelegate, $ionicHistory, $cordovaToast, $mdDialog, $mdToast) {

    $scope.dataLogin = {};
    $scope.dataLogin.user = "";
    $scope.dataLogin.password = "";

    $scope.config = {};

    $scope.$on('$ionicView.beforeEnter', function () {

      if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {
        try {
          $ionicHistory.clearHistory();
        } catch (e) {
        }
      }

      $scope.CurrentDate = new Date();
      $rootScope.fade_intro = false;

      if (localstorage.getObject('userLetAccount') !== null && localstorage.getObject('userLetAccount') !== undefined) {
        $state.go('menu.principal', {}, {location: 'replace'});
      } //else

    });

    $scope.msgToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom')
          .hideDelay(3000)
      );
    };

    $scope.$on('$ionicView.enter', function () {
      $ionicScrollDelegate.scrollTo(0, 0, false);
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    ////////////////////////////////////////////////////////////////////////////P U S H

    document.addEventListener("deviceready", function () {

      try {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.version = version;
        });
      } catch (e) {
      }

      $scope.regId = 0;

      ////////////////////////////////////////////////////////////////////////////C O O R D E N A D A S
      try {
        cordova.plugins.locationAccuracy.canRequest(function (canRequest) {

          if (canRequest) {
            cordova.plugins.locationAccuracy.request(function () {
              }, function (error) {
                if (error) {
                  if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {

                  }
                }
              }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
            );
          }
        });
      } catch (e) {
      }

      try {
        navigator.geolocation.getCurrentPosition(function (position) {
          sessionstorage.setObject("latLetAccount", position.coords.latitude);
          sessionstorage.setObject("lngLetAccount", position.coords.longitude);
        });
      } catch (e) {
      }

    });

    ////////////////////////////////////////////////////////////////////////////I N I   C O O R D E N A D A S
    $rootScope.activeGPS = function () {

      try {
        cordova.plugins.locationAccuracy.canRequest(function (canRequest) {

          if (canRequest) {
            cordova.plugins.locationAccuracy.request(function () {
              }, function (error) {
                if (error) {
                  if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {

                  }
                }
              }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
            );
          }
        });
      } catch (e) {
        //console.log(e)
      }

      try {

        navigator.geolocation.getCurrentPosition(function (position) {
          sessionstorage.setObject("latLetAccount", position.coords.latitude);
          sessionstorage.setObject("lngLetAccount", position.coords.longitude);
        })

      } catch (e) {
        //console.log(e)
      }

    };
    ////////////////////////////////////////////////////////////////////////////E N D   C O O R D E N A D A S

    $scope.showLoading = function () {
      try {
        SpinnerDialog.show(null, null, true, {textColorRed: 0.1, textColorGreen: 0.1, textColorBlue: 1});
      } catch (e) {
        console.log(e)
      }

    };

    $scope.closeLoading = function () {
      try {
        SpinnerDialog.hide();
      } catch (e) {
        console.log(e)
      }
    };

    $scope.mensajeToast = function (mensaje) {
      try {
        $cordovaToast.showLongCenter(mensaje)
          .then(function (success) {
            },
            function (error) {
            });
      } catch (e) {
        alert(mensaje)
      }
    };

    $scope.register = function (param) {
      $rootScope.activeGPS();
      $rootScope.is_register_store = param;
      $state.go('main.register', {}, {location: 'replace'});
    };

    $scope.login = function () {
      $state.go('main.login', {}, {location: 'replace'});
    };

  });
