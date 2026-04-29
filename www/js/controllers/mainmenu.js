'use strict';

angular.module('starter.controllers')

.controller('MainMenuCtrl',function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup, $ionicPopover,
                                    $timeout, sessionstorage, $translate, $filter,
                                $ionicHistory, localstorage) {

  var popInfo;
  $rootScope.showAlertMSG = function (detalle) {
    $scope.detalle = detalle;
    popInfo = $ionicPopup.show({
      templateUrl: 'templates/modal/alert.html',
      scope: $scope,
      cssClass: 'customPopup'
    });
  }

  $rootScope.closeAlertMSG = function () {
    popInfo.close(true);
  };

  $scope.menuoption = function (opc) {
    $rootScope.colorSelect = opc;
    switch(opc){
      case 1:
        break;
      case 2:
        $state.go('app.config')
        break;
      case 3:
        $rootScope.muestraacceso = 1;
        $rootScope.styleMapMenu = "filter: blur(100px); width: 100%!important; height: 100%!important; position: absolute!important;";
        break;
      case 4:
        //Cambio de idioma
        console.log('Cambio de idioma')
        /*$rootScope.muestraidioma = 1;
        $rootScope.styleMapMenu = "filter: blur(100px);width: 100%!important; height: 100%!important; position: absolute!important;";*/
        $rootScope.showAlertLanguage();
        break;
      case 5:
        //Muestra menu completo
        $rootScope.muestraacceso = 0;
        $rootScope.muestraidioma = 0;
        $rootScope.muestraenfoque = 0;
        $rootScope.styleMapMenu = "width: 100%!important; height: 100%!important; position: absolute!important;";
        break;
      case 6:
        //Muestra enfoque
        if($rootScope.acceso == 0) {
          $scope.menuoption(3)
        } else {
          $rootScope.showLoading('Espere un momento');
          //$rootScope.muestraenfoque = 1;
          //$rootScope.styleMapMenu = "filter: blur(100px);width: 100%!important; height: 100%!important; position: absolute!important;";
          $rootScope.focusDrawerVertical();
        }
        break;
      case 7:
        $rootScope.isTraffic = true;
        $rootScope.viewTraffic(true);
        break;
      case 9:
        $rootScope.isTraffic = false;
        $rootScope.viewTraffic(false);
        break;
      case 8:
        //$state.go('app.login');
        localstorage.setObject('usuario', null);
        break
    }
  }

  $scope.setLanguage = function (opc) {
    sessionstorage.setObject('slanguage', opc);
    switch (opc) {
      case 1:
        $translate.use('es');
        localstorage.set("idioma","es");
        $rootScope.closeLanguage();
        break;
      case 2:
        $translate.use('en');
        localstorage.set("idioma","en");
        $rootScope.closeLanguage();
        break;
    }
    $rootScope.muestraidioma = 0;
    $rootScope.styleMapMenu = "width: 100%!important; height: 100%!important; position: absolute!important;";
  }

  $scope.goCloseContact = function () {
    $rootScope.muestramenu = 0;
    $rootScope.styleMapMenu = "width: 100%!important; height: 100%!important; position: absolute!important;";
  }

  $scope.goCloseLanguage = function () {
    $rootScope.muestraidioma = 0;
    $rootScope.styleMapMenu = "width: 100%!important; height: 100%!important; position: absolute!important;";
  }





});
