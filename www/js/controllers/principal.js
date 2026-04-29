'use strict';

angular.module('App.controllers')
  .controller('PrincipalCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, localstorage,
                                         $mdDialog, $mdBottomSheet, $ionicHistory, $ionicScrollDelegate, sessionstorage,
                                         $ionDrawerVerticalDelegate) {

    $rootScope.goUp = function () {
      $ionicScrollDelegate.scrollTo(0, 0, true);
    };

    $scope.checkConnection = function () {
      var networkState = navigator.connection.type;

      var states = {};
      states[Connection.UNKNOWN] = false;
      states[Connection.ETHERNET] = false;
      states[Connection.WIFI] = true;
      states[Connection.CELL_2G] = false;
      states[Connection.CELL_3G] = false;
      states[Connection.CELL_4G] = false;
      states[Connection.CELL] = false;
      states[Connection.NONE] = false;

      return states[networkState]
    }

    $scope.salesChartConfig = {
      options: {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          height: 160,
          spacing: [10, 5, 0, 5]
        },

        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: { enabled: false },

        xAxis: {
          visible: false
        },

        yAxis: {
          visible: false
        },

        plotOptions: {
          areaspline: {
            fillOpacity: 0.1,
            marker: {
              enabled: false
            }
          },
          series: {
            lineWidth: 2,
            animation: {
              duration: 800
            }
          }
        }
      },

      series: [{
        name: 'Objetivos',
        color: '#002f53',
        data: [
          120, 140, 135, 160, 180,
          175, 190, 210, 205,
          {
            y: 230,
            marker: {
              enabled: true,
              radius: 4,
              fillColor: '#002f53'
            }
          }
        ]
      }],

      title: { text: null },
      loading: false
    };

    var popAppsNavigations;
    $rootScope.openPOPAppsNavigation = function () {
      popAppsNavigations = $ionicPopup.show({
        templateUrl: 'templates/modal/apps-navigation.html',
        scope: $scope,
        cssClass: 'customPopup'
      });
    };

    $rootScope.closePOPAppsNavigation = function () {
      popAppsNavigations.close();
    };

    $rootScope.mdDialogGeneral = function (title, detalle, avatar) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(false)
          .title(title)
          .textContent(detalle)
          .ok('Aceptar')
          .srcAvatar(avatar)
        /*.openFrom({
          top: -50,
          width: 30,
          height: 80
        })
        .closeTo({
          left: 1500
        })*/
      );
    };

    document.addEventListener("deviceready", function () {

      try {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.version = version;
        });
      } catch (e) {
      }

      $rootScope.activeGPS();

      try {
        if (ionic.Platform.isAndroid()) {
          window.plugins.imeiplugin.getImei(successCallback, errorCallback);
        }
      } catch (e) {
      }

    });

    $scope.$on('$ionicView.beforeEnter', function () {

      if (localstorage.getObject('legalOjo') === 0) {
        $state.go('menu.legal', {}, {location: 'replace'});
      } else {

        $ionicScrollDelegate.scrollTo(0, 0, false);

        try {
          console.log(localstorage.getObject('data_check'))
          if (localstorage.getObject('data_check') !== 0 && localstorage.getObject('data_c.getheck') !== null && localstorage.getObject('data_check') !== undefined) {
            $rootScope.viewInit = 1;
            $rootScope.info_store_check = localstorage.getObject('store_check');
            //$scope.$apply();

          } else {
            $rootScope.viewInit = 0;
            //$scope.$apply();
          }
        } catch (e) {
          $rootScope.viewInit = 0;
          //$scope.$apply();
        }

        //Pruebas
        //$rootScope.viewInit = 0;

        $rootScope.user = localstorage.getObject('user_ojo');
        $rootScope.type_access = localstorage.getObject('user_ojo').type_access;
        try {
          if (localstorage.getObject('user_ojo').avatar != null) {
            $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar;
          } else {
            $rootScope.avatar = "images/anonimo.jpg";
          }
        } catch (e) {
          $rootScope.avatar = "images/anonimo.jpg";
        }

        try {
          $ionicHistory.clearHistory();
        } catch (e) {
        }

        $rootScope.checkCameraPermission();

        console.log('------------------------------>Entra a beforeEnter principal');

      }

    });

    $scope.menugral = function (option) {

      switch (option) {
        case 1:
          $rootScope.showLoading('Espera un momento...');
          $http.get($rootScope.GET_TARGETS_LIST,
            {}, {
              headers: {}
            })
            .then(function (success) {
                console.log(success);
                $rootScope.closeLoading();
                if (success.status === 200) {

                  $rootScope.targets_data = success.data.data;

                  console.log($rootScope.targets_data.length);

                  if ($rootScope.targets_data.length === 0) {
                    $rootScope.mdDialogGeneral('Aviso', 'No hay listas que mostrar', 'images/warning.svg');
                  } else {

                    $state.go('menu.target-list', {}, {location: 'replace'});

                  }
                } else {
                  $rootScope.mdDialogGeneral('Aviso', 'No hay listas', 'images/warning.svg');
                }

              },
              function (error) {
                $rootScope.closeLoading();
                $rootScope.mdDialogGeneral('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
              });
          break;
        case 2:
          $state.go('menu.cameras', {}, {location: 'replace'});
          break;
        case 3:
          $rootScope.showLoading('Espera un momento...');
          $http.post($rootScope.POINTS_MAP,
            {}, {
              headers: {}
            })
            .then(function (success) {

                $rootScope.closeLoading();

                if (success.data.status === 'OK') {

                  $rootScope.buildings = success.data.buildings;
                  $rootScope.clusters_data = success.data.clusters;
                  $rootScope.columns = success.data.columns;
                  $rootScope.internet = success.data.internet;
                  $rootScope.streetsGAM = success.data.streetsGAM;
                  $rootScope.territorial_units = success.data.territorial_units;
                  $rootScope.watts400 = success.data.watts400;
                  $rootScope.watts500 = success.data.watts500;

                }

                $state.go('menu.map', {}, {location: 'replace'});

              },//SUCCESS
              function (error) { // optional
                $rootScope.mdDialogGeneral('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
                $rootScope.closeLoading();
              });
          break;
        case 4:
          $rootScope.memory_warning = false;
          if (!ionic.Platform.isAndroid()) {
            document.addEventListener('memorywarning', function () {
              $rootScope.memory_warning = true;
            });
          } else {
            try {
              cordova.plugins.CordovaPluginMemoryWarning.isMemoryUsageUnsafe(function (result) {
                if (result) {
                  $rootScope.memory_warning = true;
                }
              }, function (error) {
              });
            } catch (e) {
            }
          }
          $state.go('menu.configmenu', {}, {location: 'replace'});
          break;
        case 5:
          $rootScope.showLoading('Espera un momento...');
          $http.post($rootScope.NOTIFICATIONS,
            {
              promoter_id: localstorage.getObject('user_ojo').id,
              company_id: localstorage.getObject('user_ojo').company_id
            }, {
              headers: {}
            })
            .then(function (success) {
                console.log(success);
                $rootScope.closeLoading();
                if (success.status === 200) {
                  $rootScope.messages_data = success.data.data;

                  console.log($rootScope.messages_data.length)

                  if ($rootScope.messages_data.length === 0) {
                    $rootScope.mdDialogGeneral('Aviso', 'No hay notificaciones que mostrar', 'images/warning.svg');
                  } else {

                    localstorage.setObject('messages', $rootScope.messages_data);

                    $state.go('menu.messages', {}, {location: 'replace'});
                  }
                } else {
                  $rootScope.mdDialogGeneral('Aviso', 'No hay acceso a tus notificaciones', 'images/warning.svg');
                }

              },//SUCCESS
              function (error) { // optional
                $rootScope.closeLoading();
                $rootScope.mdDialogGeneral('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
              });
          break;
        case 6:
          break;
      }
    };

  });

