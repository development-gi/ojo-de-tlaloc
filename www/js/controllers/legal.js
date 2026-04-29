angular.module('App.controllers')

  .controller('LegalCtrl',function($scope, $rootScope, $state, localstorage, $mdDialog, $ionicHistory) {
    $scope.CurrentDate = new Date();

    $scope.$on('$ionicView.enter', function () {
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    $scope.goAcept = function (opc) {
      if(opc) {
        localstorage.setObject("legalOjo", 1);
        $state.go('menu.principal');
      } else {
        var confirm = $mdDialog.confirm()
          .title('Aviso')
          .textContent('Para poder hacer uso de las funciones de la aplicación debe aceptar el aviso de consentimiento legal')
          .ariaLabel('Lucky day')
          .targetEvent($scope.$event)
          .ok('Intentar')
          .srcAvatar('images/accept.svg')
          .cancel('Salir de la app');

        $mdDialog.show(confirm).then(function () {
          console.log('%c Se queda en la App 🥜', 'color:green; font-size: 3em;');
        }, function () {
          console.log('%c Cierra App 🥜', 'color:red; font-size: 3em;');
          try {
            navigator.app.exitApp();
          } catch(e) { console.log(e); }
        });
      }
    };

  });
