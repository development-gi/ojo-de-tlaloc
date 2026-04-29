angular.module('App.controllers')

  .controller('CreateTargetListCtrl',function($scope, $rootScope, $state, $http, localstorage, $mdDialog, $ionicHistory) {
    $scope.CurrentDate = new Date();

    $scope.$on('$ionicView.enter', function () {
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    $scope.$on('$ionicView.beforeEnter', function () {

      $rootScope.targetData = {
        lib_name: null,
        lib_type: null,
        threshold: 0,
        lib_link_alarm: 0,
      };

    });

    $scope.saveNewTarget = function () {
      console.log($rootScope.targetData);

      if ($rootScope.targetData.lib_name === null || $rootScope.targetData.lib_name.length < 1) {
        $rootScope.toastError('Escribe el nombre de la lista.');
      }
      else if ($rootScope.targetData.lib_type === null) {
        $rootScope.toastError('Selecciona el tipo de lista.');
      }
      else if ($rootScope.targetData.threshold === null || $rootScope.targetData.threshold <= 0) {
        $rootScope.toastError('Selecciona el umbral de confianza.');
      }
      else if ($rootScope.targetData.lib_link_alarm === null) {
        $rootScope.toastError('Selecciona si la alarma esta activada o no.');
      } else {

      $rootScope.showLoading('Espera un momento...');
      $http.post($rootScope.CREATE_TARGET_LIST,
        {
          lib_type: $rootScope.targetData.lib_type,
          threshold: $rootScope.targetData.threshold,
          lib_name: $rootScope.targetData.lib_name,
          lib_link_alarm: $rootScope.targetData.lib_link_alarm
        }, {
          headers: {}
        })
        .then(function (success) {
            console.log(success);
            $rootScope.closeLoading();
            if (success.status === 200) {

              $rootScope.toastSuccess('Exito', 'Lista creada correctamente');

            } else {
              $rootScope.mdDialogGeneral('Aviso', 'No se pudo crear la lista', 'images/warning.svg');
            }

          },//SUCCESS
          function (error) { // optional
            $rootScope.closeLoading();
            $rootScope.mdDialogGeneral('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
          });

      }

    };

    $scope.return = function () {
      $state.go('menu.target-list', {}, {location: 'replace'});
    };

  });
