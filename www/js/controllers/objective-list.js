angular.module('App.controllers')

  .controller('ObjectiveListCtrl', function ($scope, $http, $stateParams, $rootScope, $state, localstorage, $mdDialog, $ionicHistory, $ionicModal, $mdBottomSheet) {


    // Modal Editar Objetivo

    $ionicModal.fromTemplateUrl('templates/modal/edit-objective.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal_edit_objective = modal;
    });
    $scope.openModalEditObjective = function (obj) {
      $scope.editObjectiveData = angular.copy(obj);
      if ($scope.editObjectiveData.birthday) {
        var parts = $scope.editObjectiveData.birthday.split('-');
        $scope.editObjectiveData.birthdayDate = new Date(parts[0], parts[1] - 1, parts[2]);
      }
      $scope.modal_edit_objective.show();
    };
    $rootScope.closeModalEditObjective = function () {
      $scope.modal_edit_objective.hide();
    };
    $scope.$on('$destroy', function () {
      if ($scope.modal_edit_objective) {
        $scope.modal_edit_objective.remove();
      }
    });

    $scope.$on('openModalEditObjective', function (event, list) {
      $scope.openModalEditObjective(list);
    });

    // Objetivos de esa lista

    $scope.list = $rootScope.currentTargetList;

    $scope.targets = $scope.list.targets || [];

    $scope.listName = $scope.list.lib_name;

    $scope.cardTypes = {
      0: 'DNI',
      1: 'Pasaporte',
      2: 'Tarjeta de Oficial',
      3: 'Licencia de Conducir',
      4: 'Otros',
      '-1': 'Desconocido'
    };

    $scope.selectObjective = function(obj) {
      $mdBottomSheet.show({
        templateUrl: 'templates/sheet-select-objective.html',
        controller: 'ObjectiveSelectSheetCtrl',
        locals: { objective: obj }
      });
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

  })

  .controller('ObjectiveSelectSheetCtrl', function($scope, $mdBottomSheet, $mdDialog, $state, $rootScope, $http, objective) {

    $scope.objective = objective;

    $scope.toggleObjective = function () {
      $mdBottomSheet.hide();

      var nextStateText = objective.status
        ? 'deshabilitar'
        : 'habilitar';

      var confirm = $mdDialog.confirm()
        .title('¿Está seguro?')
        .textContent('¿Desea ' + nextStateText + ' este objetivo?')
        .ariaLabel('Lucky day')
        .ok('Aceptar')
        .srcAvatar('images/svg/out.svg')
        .cancel('Cancelar');

      $mdDialog.show(confirm).then(function () {
      });
    };

    $scope.editObjective = function() {
      $mdBottomSheet.hide();
      $rootScope.$broadcast('openModalEditObjective', objective);
    };

  });
