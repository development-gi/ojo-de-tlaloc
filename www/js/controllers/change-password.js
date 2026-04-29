angular.module('App.controllers')

  .controller('ChangePasswordCtrl',function($scope, $rootScope, $state, $http, $ionicPopup, $ionicPopover, localstorage, $translate, $filter,
                                    $ionicModal, $ionicScrollDelegate, $mdDialog, $ionicHistory, $mdToast) {

    $scope.$on('$ionicView.enter', function () {

      $ionicScrollDelegate.scrollTo(0, 0, false);

      if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {
        try {
          $ionicHistory.clearHistory();
        } catch (e) {
        }
      }

    });

    $scope.$on('$ionicView.beforeEnter', function () {

      if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {
        try {
          $ionicHistory.clearHistory();
        } catch (e) {
        }
      }

      $scope.minus_ = false;
      $scope.mayus = false;
      $scope.number_ = false;
      $scope.length_ = false;

      $scope.minus_confirm = false;
      $scope.mayus_confirm = false;
      $scope.number_confirm = false;
      $scope.length_confirm = false;

      $scope.step = 1;

      document.getElementById("input_password_change").value = '';
      document.getElementById("input_password_change_confirm").value = '';

    });

    $scope.return = function () {
      if($scope.step === 2) {
        $scope.step = 1;
      } else {
        $state.go('menu.config', {}, {location: 'replace'});
      }
    };

    $scope.viewPasswordChange = function (opc) {
      var tipo = document.getElementById("input_password_change" + opc);
      if (tipo.type === "password") {
        tipo.type = "text";
        $('#visibility_password_change' + opc).attr("src", 'images/icons/eye.png');
      } else {
        tipo.type = "password";
        $('#visibility_password_change' + opc).attr("src", 'images/icons/no-eye.png');
      }
    };

    $scope.changeIcons = function (opc) {

      var input = document.getElementById("input_password_change" + opc).value.trim();

      var idx = 0,
        letter = '';

      if(opc === '') {
        $scope.minus_ = false;
        $scope.mayus = false;
        $scope.number_ = false;
        $scope.length_ = false;

        for (idx = 0; idx < input.length; idx++) {
          letter = input.charAt(idx);

          if (/\d/.test(letter)) {
            console.log(letter + " es numero");
            $scope.number_ = true;
          } else {
            if (isUpper(letter)) {
              console.log("La letra " + letter + " es mayúscula");
              $scope.mayus = true;
            }

            if (isLower(letter)) {
              console.log("La letra " + letter + " es minúscula");
              $scope.minus_ = true;
            }
          }

        }

        if ($scope.minus_ === false) {
          $('#img_minus').removeClass("heart-select");
        } else {
          $('#img_minus').addClass("heart-select");
        }

        if ($scope.mayus === false) {
          $('#img_mayus').removeClass("heart-select");
        } else {
          $('#img_mayus').addClass("heart-select");
        }

        if ($scope.number_ === false) {
          $('#img_number_').removeClass("heart-select");
        } else {
          $('#img_number_').addClass("heart-select");
        }

        if (input.length >= 8) {
          console.log("Contiene 8+");
          $scope.length_ = true;
          $('#img_length_').addClass("heart-select");
        } else {
          $('#img_length_').removeClass("heart-select");
        }
      } else {
        $scope.minus_confirm = false;
        $scope.mayus_confirm = false;
        $scope.number_confirm = false;
        $scope.length_confirm = false;

        for (idx = 0; idx < input.length; idx++) {
          letter = input.charAt(idx);

          if (/\d/.test(letter)) {
            console.log(letter + " es numero");
            $scope.number_confirm = true;
          } else {
            if (isUpper(letter)) {
              console.log("La letra " + letter + " es mayúscula");
              $scope.mayus_confirm = true;
            }

            if (isLower(letter)) {
              console.log("La letra " + letter + " es minúscula");
              $scope.minus_confirm = true;
            }
          }

        }

        if ($scope.minus_confirm === false) {
          $('#img_minus_confirm').removeClass("heart-select");
        } else {
          $('#img_minus_confirm').addClass("heart-select");
        }

        if ($scope.mayus_confirm === false) {
          $('#img_mayus_confirm').removeClass("heart-select");
        } else {
          $('#img_mayus_confirm').addClass("heart-select");
        }

        if ($scope.number_confirm === false) {
          $('#img_number_confirm').removeClass("heart-select");
        } else {
          $('#img_number_confirm').addClass("heart-select");
        }

        if (input.length >= 8) {
          console.log("Contiene 8+");
          $scope.length_confirm = true;
          $('#img_length_confirm').addClass("heart-select");
        } else {
          $('#img_length_confirm').removeClass("heart-select");
        }
      }

    };

    function isUpper(letter) {
      return letter === letter.toUpperCase();
    }

    function isLower(letter) {
      return letter === letter.toLowerCase();
    }

    $scope.continueStepChange = function () {
      $scope.step = 2;
    };

    $scope.savePassword = function() {

      var input = document.getElementById("input_password_change").value.trim();
      var input2 = document.getElementById("input_password_change_confirm").value.trim();

      if(input === input2) {

        $scope.showLoading();

        $http.post($rootScope.CHANGE_PASSWORD,
          {
            user_id: localstorage.getObject('userLetAccount').id_,
            password: input
          }, {
            headers: {},
            timeout: $rootScope.HTTP_TIME_OUT_MINUTES
          })
          .then(function (success) {

              $scope.closeLoading();
              if (success.status === 200) {
                if (success.data.valid === 1) {

                  $scope.step = 3;
                  $rootScope.successAudio();

                } else {
                  $scope.msgToast($filter('translate')('CHANGE_PASSWORD_JS_2'));
                  $rootScope.errorAudio();
                }
              } else {
                $rootScope.errorAudio();
                $scope.msgToast(success.data.message);
              }

            },
            function (error) { // optional
              $scope.closeLoading();
              //$scope.msgToast($filter('translate')('CHANGE_PASSWORD_JS_2'));

              if(error.status == -1) {
                $rootScope.checkWifiConnection();
              } else if(error.status == 403) {
                $rootScope.toastLetAccount(error.data.message);
              } else {
                $rootScope.toastLetAccountWifi();
              }

            });

      } else {
        $scope.msgToast($filter('translate')('CHANGE_PASSWORD_JS_1'));
      }

    };

    $scope.msgToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom')
          .hideDelay(3000)
      );
    };

    $scope.showLoading = function () {

      try {
        SpinnerDialog.show(null, null, true, {textColorRed: 0.1, textColorGreen: 0.1, textColorBlue: 1});
      } catch (e) {
        console.log(e)
      }

    };

    $scope.closeLoading = function () {
      setTimeout(function () {
        try {
          SpinnerDialog.hide();
        } catch (e) {
          console.log(e)
        }
      }, 500)
    };

  });
