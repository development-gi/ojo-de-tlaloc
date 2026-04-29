angular.module('App.controllers')

  .controller('LoginCtrl', function ($scope, $state, $http, $ionicLoading, $rootScope, $ionicPopup, localstorage,
                                     $timeout, $ionicScrollDelegate, $ionicHistory, $cordovaToast, $mdDialog) {

    $scope.dataLogin = {};
    $scope.dataLogin.user = "";
    $scope.dataLogin.password = "";

    $scope.forgotpass = {};
    $scope.forgotpass.user = '';

    $scope.config = {};
    $scope.config.pass = '';
    $scope.config.newpass = '';

    var popForgotPass;
    var popLoading;
    var popChangePass;
    var popInfo;
    var popSuccess;

    $scope.viewPassword = function () {
      var tipo = document.getElementById("input_password");
      if (tipo.type == "password") {
        tipo.type = "text";
        $('#visibility_password').attr("src", 'images/icons/eye-purple.png');
      } else {
        tipo.type = "password";
        $('#visibility_password').attr("src", 'images/icons/no-eye-purple.png');
      }
    };

    $scope.$on('$ionicView.beforeEnter', function () {

      if (localstorage.getObject('user_ojo') != null && localstorage.getObject('user_ojo') != undefined) {
        $state.go('menu.principal', {}, {location: 'replace'});
      } else {
        localstorage.setObject('questions', null);
        localstorage.setObject('rrhh_id', null);
        localstorage.setObject('brands_store', null);
        localstorage.setObject('data_check', 0);
        localstorage.setObject("goals", null);
        localstorage.setObject('store_check', null)

        $rootScope.info_store_check = null;
        $rootScope.toppings_stores = [];
        $rootScope.viewInit = 0;
      }

      $rootScope.checkGPSPermission();
    });

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

      try {
        $rootScope.push = PushNotification.init({
          "android": {
            senderID: "791330578321",
            forceShow: true,
            alert: true,
            vibrate: false,
            badge: true,
            sound: true,
            clearBadge: true
          }, "ios": {
            alert: "true",
            badge: "true",
            sound: "true",
            clearBadge: "true"
          }
        });

        $rootScope.push.on('registration', function (data) {
          $rootScope.regId = data.registrationId;

          if (ionic.Platform.isAndroid()) {
            $rootScope.OS = 'ANDROID';
          } else if (ionic.Platform.isIOS()) {
            $rootScope.OS = 'IOS';
          }

          //storeDeviceToken($rootScope.OS);

        });

        $rootScope.push.on('error', function (e) {
          $rootScope.regId = null;
        });
      } catch (e) {
        //alert(e)
      }

      try {
      console.log(device.cordova);

      $rootScope.device_model = device.model;
      $rootScope.device_platform = device.platform;
      $rootScope.device_uuid = device.uuid;
      $rootScope.device_version = device.version;
      $rootScope.device_manufacturer = device.manufacturer;
      $rootScope.device_isVirtual = device.isVirtual;
      $rootScope.device_serial = device.serial;

    } catch(e) { }

    });

    ////////////////////////////////////////////////////////////////////////////P U S H

    console.log('registerDriver')

    $scope.getLogin = function () {

      var user = $scope.dataLogin.user;
      var pass = $scope.dataLogin.password;

      localstorage.setObject('segurity_validate', pass);

      $rootScope.showLoading('Iniciando sesión');

      console.log('-----------------------------------------> device: ' + ionic.Platform.device().manufacturer + ' ' + ionic.Platform.device().model)
      $http.post($rootScope.LOGIN_URL,
        {
          username: user,
          password: pass,
          DeviceToken: $rootScope.regId,
          OS: $rootScope.OS,
          device: ionic.Platform.device().manufacturer + ' ' + ionic.Platform.device().model,
          version: $scope.version
        }, {
          headers: {}
        })
        .then(function (success) {

            //leemos la base y agregamos campos
            try {
              openDatabaseGIN();
              createTablesGIN();
            } catch(e) {}

          console.log(success);

            if (success.status == 200) {
              localstorage.setObject("goals", null)
              localstorage.setObject('store_check', null)
              localstorage.setObject('data_check', 0)

              localstorage.set('token_PulseHRConnect', success.data.token);
              localstorage.setObject('token_PulseHRConnect_gral', success.data.token);
              localstorage.setObject('user_ojo', success.data.promoter);
              localstorage.setObject('user_id', success.data.user_id);
              localstorage.setObject('num_messages_chat', 0);
              localstorage.setObject('questions', success.data.questions);
              localstorage.setObject('rrhh_id', success.data.promoter.rrhh_id);

              console.log(success.data.store)
              if (success.data.store != null) {
                localstorage.setObject('store_check', success.data.store);
                $rootScope.info_store_check = localstorage.getObject('store_check');
                localstorage.setObject('data_check', 1);
              }

              console.log(success.data)

              console.log("------------------")
              $rootScope.closeLoading();

              if (success.data.promoter.rrhh_id != null) {

                $rootScope.showLoading('Cargando marcas');

                $http.post($rootScope.BRANDS_STORE,
                  {
                    store_id: success.data.promoter.store_id
                  }, {
                    headers: {}
                  })
                  .then(function (success) {
                      $rootScope.closeLoading();

                      if (success.status == 200) {
                        console.log(success);
                        console.log("------------------");

                        localstorage.setObject('brands_store', success.data.data);

                        $rootScope.viewInit = 1;

                        if (localstorage.getObject("legalOjo") === 1) {
                          $state.go('menu.principal', {}, {location: 'replace'});
                        } else {
                          $state.go('menu.legal', {}, {location: 'replace'});
                        }
                      } else {
                        console.log(success.status);
                        showAlert('Aviso', success.data.message, 'images/invalid.svg');
                      }

                    },
                    function (error) { // optional
                      console.log(error);
                      $rootScope.closeLoading();
                      showAlert('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
                    });


              } else {
                $rootScope.closeLoading();
                if (localstorage.getObject("legalOjo") === 1) {
                  $rootScope.viewInit = 0;
                  $state.go('menu.principal', {}, {location: 'replace'});
                } else {
                  $state.go('menu.legal', {}, {location: 'replace'});
                }
              }
            } else {
              console.log(success.status)
              $rootScope.closeLoading();
              showAlert('Aviso', success.data.message, 'images/invalid.svg');
            }
          },

          function (error) { // optional
            console.log(error)
            $rootScope.closeLoading();
            showAlert('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
          });

      /*
      if (localstorage.getObject("legalOjo") === 1) {
        $state.go('menu.principal')
      } else {
        $state.go('menu.legal')
      }
      */

    };

    $scope.getLoginMode = function () {

      var password = 'Guest_mode1*';
      var username = 'guest_mode';

      localstorage.setObject('segurity_validate', password);

      $rootScope.showLoading('Iniciando sesión');

      console.log('-----------------------------------------> device: ' + ionic.Platform.device().manufacturer + ' ' + ionic.Platform.device().model)
      $http.post($rootScope.LOGIN_URL,
        {
          username: username,
          password: password,
          DeviceToken: $rootScope.regId,
          OS: $rootScope.OS,
          device: ionic.Platform.device().manufacturer + ' ' + ionic.Platform.device().model,
          version: $scope.version
        }, {
          headers: {}
        })
        .then(function (success) {

            console.log(success);

            if (success.status == 200) {
              localstorage.setObject("goals", null)
              localstorage.setObject('store_check', null)
              localstorage.setObject('data_check', 0)

              localstorage.set('token_PulseHRConnect', success.data.token);
              localstorage.setObject('token_PulseHRConnect_gral', success.data.token);
              localstorage.setObject('user_ojo', success.data.promoter);
              localstorage.setObject('user_id', success.data.user_id);
              localstorage.setObject('num_messages_chat', 0);
              localstorage.setObject('questions', success.data.questions);
              localstorage.setObject('rrhh_id', success.data.promoter.rrhh_id);

              if (success.data.store != null) {
                localstorage.setObject('store_check', success.data.store);
                $rootScope.info_store_check = localstorage.getObject('store_check');
                localstorage.setObject('data_check', 1);
              }

              $rootScope.closeLoading();

              if (success.data.promoter.rrhh_id != null) {

                $rootScope.showLoading('Cargando marcas');

                $http.post($rootScope.BRANDS_STORE,
                  {
                    store_id: success.data.promoter.store_id
                  }, {
                    headers: {}
                  })
                  .then(function (success) {
                      $rootScope.closeLoading();

                      if (success.status == 200) {

                        localstorage.setObject('brands_store', success.data.data);

                        $rootScope.viewInit = 1;

                        if (localstorage.getObject("legalOjo") === 1) {
                          $state.go('menu.principal', {}, {location: 'replace'});
                        } else {
                          $state.go('menu.legal', {}, {location: 'replace'});
                        }
                      } else {
                        console.log(success.status);
                        showAlert('Aviso', success.data.message, 'images/invalid.svg');
                      }

                    },
                    function (error) { // optional
                      console.log(error);
                      $rootScope.closeLoading();
                      showAlert('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
                    });


              } else {
                $rootScope.closeLoading();
                if (localstorage.getObject("legalOjo") === 1) {
                  $rootScope.viewInit = 0;
                  $state.go('menu.principal', {}, {location: 'replace'});
                } else {
                  $state.go('menu.legal', {}, {location: 'replace'});
                }
              }
            } else {
              $rootScope.closeLoading();
              showAlert('Aviso', success.data.message, 'images/invalid.svg');
            }
          },

          function (error) { // optional
            $rootScope.closeLoading();
            showAlert('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!', 'images/internet.svg');
          });

    };

    function setTokenGCM() {
      $http.post($rootScope.SET_TOKEN_GCM_URL,
        {DeviceToken: $rootScope.regId, OS: $rootScope.OS}, {
          headers: {}
        })
        .then(function (success) {
            console.log(success);

            if (success.status == 200) {

            } else if (success.status == 400) {

            } else if (success.status == 403) {

            } else if (success.status == 500) {

            }
          },//SUCCESS
          function (error) { // optional
            // failed
          });

    }

    function showAlert(title, detalle, avatar) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(false)
          .title(title)
          .textContent(detalle)
          .ok('Aceptar')
          .srcAvatar(avatar)
          .openFrom({
            top: -50,
            width: 30,
            height: 80
          })
          .closeTo({
            left: 1500
          })
      );

    }

    $scope.closeAlert = function () {
      popInfo.close(true);
    };

    function showSuccess(detalle) {
      $scope.detalle = detalle;
      popSuccess = $ionicPopup.show({
        templateUrl: 'templates/modal/success.html',
        scope: $scope,
        cssClass: 'customPopup'
      });
    }

    $scope.closeSuccess = function () {
      popSuccess.close(true);
    };

    $scope.forgotPass = function () {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(false)
          .title('Aviso')
          .textContent('Solicita tu contraseña al administrador de la plataforma')
          .srcAvatar('images/password.svg')
          .ok('Aceptar')
          .openFrom({
            top: -50,
            width: 30,
            height: 80
          })
          .closeTo({
            left: 1500
          })
      );
    };

    $scope.cancelForgotPass = function () {
      popForgotPass.close();
    };

    $scope.focusInput = true;

    function autofocusInput() {

      $scope.focusInput = true;
      document.getElementById("inputDefault").focus();
    }

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
    }

  });
