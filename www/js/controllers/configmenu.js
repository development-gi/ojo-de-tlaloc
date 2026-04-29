angular.module('App.controllers')

  .controller('ConfigMenuCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicPopover, localstorage,
                                          $cordovaToast, $mdDialog, $ionicHistory, $mdToast) {

    document.addEventListener("deviceready", function () {
      try {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.version = version;
        });
      } catch (e) {
      }
    })

    var initUser;

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.CurrentDate = new Date();

      $scope.send_information = {
        result: false
      };

      try {
        $scope.send_information.result = !!localstorage.getObject('send_information');
      } catch (e) {
        $scope.send_information.result = false;
      }

      $scope.$watch('send_information.result', function (newValue, oldValue) {
        console.log('Toggle cambio de', oldValue, 'a', newValue);
        console.log('send_information esta en ' + localstorage.getObject('send_information'));
      });

      initUser = localstorage.getObject('user_ojo');

      if (localstorage.getObject('user_ojo').avatar != null) {
        $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar;
      } else {
        $rootScope.avatar = "images/anonimo.jpg";
      }

      $scope.editDataRegister = false;
      $scope.account = {};
      $scope.account.password = "";
      $rootScope.user = initUser;

      $scope.driver = localstorage.getObject('driver');

      $rootScope.user = initUser;
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }

    });


    $scope.$on('$ionicView.enter', function () {
      try {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.version = version;
        });
      } catch (e) {
      }

      initUser = localstorage.getObject('user_ojo');

      if (localstorage.getObject('user_ojo').avatar != null) {
        $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar
      } else {
        $rootScope.avatar = "images/anonimo.jpg";
      }

      $scope.editDataRegister = false;
      $scope.account = {};
      $scope.account.password = "";
      $rootScope.user = initUser;

      $scope.driver = localstorage.getObject('driver');

      $rootScope.user = initUser;
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }

    });

    $scope.return = function () {
      $state.go('menu.principal', {}, {location: 'replace'});
      localstorage.setObject('send_information', $scope.send_information.result);
      console.log($scope.send_information.result)
    };

    try {
      if (localstorage.getObject('user_ojo').avatar != null) {
        $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar
      } else {
        $rootScope.avatar = "images/anonimo.jpg";
      }
    } catch (e) {
      $rootScope.avatar = "images/anonimo.jpg";
    }

    $scope.logout = function () {

      var confirm = $mdDialog.confirm()
        .title('Cerrar sesión')
        .textContent('¿Estás seguro de cerrar sesión?')
        .ariaLabel('Lucky day')
        .targetEvent($scope.$event)
        .ok('Aceptar')
        .srcAvatar('images/svg/out.svg')
        .cancel('Cancelar');

      $mdDialog.show(confirm).then(function (result) {

        $rootScope.showLoading('Cerrando sesión');

        $http.post($rootScope.LOGOUT,
          {
            user_id: localstorage.getObject('user_id')
          }, {
            headers: {}
          })
          .then(function (success) {

              console.log(success);

              try {
                localStorage.clear();
                window.localStorage.clear();
              } catch (e) {
              }

              localstorage.setObject('introOjo', 1);
              localstorage.setObject('legalOjo', 1);

              $rootScope.closeLoading();
              $state.go('main.login', {}, {location: 'replace'});

            },
            function (error) {

              $rootScope.closeLoading();
              console.log(error);

            });

      });
    };

    $scope.goOpcionConfig = function (opc) {
      switch (opc) {
        case 1:

          if($rootScope.type_access === 'apk_admin') {
            $state.go('menu.config', {}, {location: 'replace'});
          } else {
            $rootScope.mdDialogGeneral('Aviso', 'El perfíl es de invitado, por lo cual no cuentas con acceso suficiente para poder visualizar el perfíl.', 'images/invalid.svg');
          }

          break;
        case 2:
          $state.go('menu.map', {}, {location: 'replace'});
          break;
      }
      localstorage.setObject('send_information', $scope.send_information.result);
    };

    $scope.showInfo = function (ev) {
      $mdDialog.show({
        templateUrl: 'templates/modal/about-dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        controller: function DialogController($scope, $mdDialog, version) {
          $scope.version = version;
          $scope.closeDialog = function () {
            $mdDialog.hide();
          };
        },
        locals: {
          version: $scope.version
        }
      });
    };

  });
