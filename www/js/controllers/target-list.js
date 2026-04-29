angular.module('App.controllers')

  .controller('TargetListCtrl',function($scope, $rootScope, $state, $http, localstorage, $mdDialog, $ionicHistory, $ionicModal, $mdBottomSheet, $ionicScrollDelegate) {
    $scope.CurrentDate = new Date();

    $scope.$on('$ionicView.enter', function () {
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    // Movimiento del FAB al hacer scroll

    $scope.lastScrollTop = 0;
    $scope.fabVisible = true;

    $scope.handleScroll = function () {

      let scrollTop = $ionicScrollDelegate.getScrollPosition().top;

      // Scroll hacia abajo → ocultar
      if (scrollTop > $scope.lastScrollTop && scrollTop > 80) {
        $scope.fabVisible = false;
      }
      // Scroll hacia arriba → mostrar
      else {
        $scope.fabVisible = true;
      }

      $scope.lastScrollTop = scrollTop;
      $scope.$applyAsync();
    };

    // Modal Editar Lista de Objetivos

    $ionicModal.fromTemplateUrl('templates/modal/edit-target.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal_edit_target = modal;
    });
    $scope.openModalEditTarget = function (list) {
      $scope.editTargetData = angular.copy(list);
      $scope.modal_edit_target.show();
    };
    $scope.closeModalEditTarget = function () {
      $scope.modal_edit_target.hide();
    };
    $scope.$on('$destroy', function () {
      if ($scope.modal_edit_target) {
        $scope.modal_edit_target.remove();
      }
    });

    $scope.$on('openEditTargetModal', function (event, list) {
      $scope.openModalEditTarget(list);
    });

    // Funciones

    $rootScope.saveEditTarget = function () {

      console.log($scope.editTargetData);

      if ($scope.editTargetData.lib_name === null || $scope.editTargetData.lib_name.length < 1) {
        $rootScope.toastError('Escribe el nombre de la lista.');
      }
      else if ($scope.editTargetData.lib_type === null) {
        $rootScope.toastError('Selecciona el tipo de lista.');
      }
      else if ($scope.editTargetData.threshold === null || $scope.editTargetData.threshold <= 0) {
        $rootScope.toastError('Selecciona el umbral de confianza.');
      }
      else if ($scope.editTargetData.lib_link_alarm === null) {
        $rootScope.toastError('Selecciona si la alarma esta activada o no.');
      } else {

        $scope.closeModalEditTarget();

        var confirm = $mdDialog.confirm()
          .title('¿Está seguro?')
          .textContent('¿Desea actualizar la información de esta lista?')
          .ariaLabel('Lucky day')
          .ok('Aceptar')
          .srcAvatar('images/svg/update-info.svg')
          .cancel('Cancelar');

        $mdDialog.show(confirm).then(function () {

          $rootScope.showLoading('Espera un momento...');
          $http.post($rootScope.UPDATE_TARGET_LIST,
            {
              id: $scope.editTargetData.id,
              lib_type_new: $scope.editTargetData.lib_type,
              thresholdNew: $scope.editTargetData.threshold,
              lib_name_new: $scope.editTargetData.lib_name,
              lib_link_alarm_new: $scope.editTargetData.lib_link_alarm
            }, {
              headers: {}
            })
            .then(function (success) {
                console.log(success);
                $rootScope.closeLoading();
                if (success.status === 200) {

                  $rootScope.toastSuccess('Exito, lista actualizada correctamente');

                } else {
                  $rootScope.mdDialogGeneral('Aviso', 'No se pudo actualizar la lista', 'images/warning.svg');
                }

              },//SUCCESS
              function (error) { // optional
                $rootScope.closeLoading();
                $rootScope.mdDialogGeneral('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
              });

        });

      }

    };

    $scope.search = {
      text: ''
    };

    $scope.getThresholdStyle = function(value) {
      return {
        height: value + '%',
        backgroundColor: value >= 51 ? '#28a745' : '#dc3545'
      };
    };

    $scope.selectList = function(obj) {
      $mdBottomSheet.show({
        templateUrl: 'templates/sheet-select-list.html',
        controller: 'ListSelectSheetCtrl',
        locals: { objective: obj }
      });
    };

    $scope.createList = function () {
      $state.go('menu.create-target-list', {}, {location: 'replace'});
    };

    $scope.return = function () {
      $state.go('menu.principal', {}, {location: 'replace'});
    };

  })

  .controller('ListSelectSheetCtrl', function($scope, $mdBottomSheet, $mdDialog, $state, $rootScope, $http, objective) {

    $scope.objective = objective;

    $scope.toggleAlarm = function () {

      $mdBottomSheet.hide();

      var nextStateText =
        objective.lib_link_alarm === '1'
          ? 'desactivar las alarmas'
          : 'activar las alarmas';

      var confirm = $mdDialog.confirm()
        .title('¿Está seguro?')
        .textContent('¿Desea ' + nextStateText + ' de esta lista?')
        .ariaLabel('Lucky day')
        .ok('Aceptar')
        .srcAvatar('images/svg/out.svg')
        .cancel('Cancelar');

      $mdDialog.show(confirm).then(function () {

        console.log(objective.id);

        $rootScope.showLoading('Espera un momento...');

        $http.post($rootScope.UPDATE_STATUS_TARGET_LIST,
          {
            id: objective.id
          }, {
            headers: {}
          })
          .then(function (success) {

            console.log(success);
            $rootScope.closeLoading();

            if (success.status === 200) {

              objective.lib_link_alarm = success.data.lib_link_alarm ? '1' : '0';
              $rootScope.toastSuccess('Éxito, estatus actualizado correctamente.');

            } else {

              $rootScope.toastError('' + success.data.message + '.');

            }

          }, function (error) {

            $rootScope.closeLoading();
            console.log(error);

          });
      });
    };

    $scope.editTarget = function() {
      $mdBottomSheet.hide();
      $rootScope.$broadcast('openEditTargetModal', objective);
    };

    $scope.objectives = function () {
      $mdBottomSheet.hide();

      if (!objective.targets || objective.targets.length === 0) {
        $rootScope.mdDialogGeneral('Aviso', 'No hay objetivos que mostrar', 'images/warning.svg');
        return;
      }

      $rootScope.currentTargetList = objective;
      $state.go('menu.objective-list');

    };

  });
