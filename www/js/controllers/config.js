angular.module('App.controllers')

  .controller('ConfigCtrl',function($scope, $rootScope, $state, $http, $ionicPopup, $ionicPopover, localstorage,
                                    $ionicModal, $ionicScrollDelegate, $mdDialog, $ionicHistory) {

    $scope.mdDialog = function (title, detalle) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(title)
          .textContent(detalle)
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
    }

    $rootScope.user = localstorage.getObject('user_ojo');
    $scope.$on('$ionicView.enter', function () {
      $ionicScrollDelegate.scrollTo(0, 0, false);

      $rootScope.user = localstorage.getObject('user_ojo');
      try {
        if (localstorage.getObject('user_ojo').avatar != null) {
          $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar
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

    })

    $scope.cropper = {};
    $scope.cropper.sourceImage = null;
    $scope.cropper.croppedImage   = null;
    $scope.bounds = {};
    $scope.bounds.left = 0;
    $scope.bounds.right = 0;
    $scope.bounds.top = 0;
    $scope.bounds.bottom = 0;
    $scope.cropper.width = $(window).width();
    $scope.cropper.height = $(window).height() + 20;

    console.log($scope.cropper.width + ' ' + $scope.cropper.height)

    try {
      if (localstorage.getObject('user_ojo').avatar != null) {
        $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar
      } else {
        $rootScope.avatar = "images/anonimo.jpg";
      }
    } catch (e) {
      $rootScope.avatar = "images/anonimo.jpg";
    }

    document.addEventListener("deviceready", function () {
      // code to run each time view is entered

      $rootScope.user = localstorage.getObject('user_ojo');
      try {
        if (localstorage.getObject('user_ojo').avatar != null) {
          $rootScope.avatar = $rootScope.BASE_GRAL + localstorage.getObject('user_ojo').avatar
        } else {
          $rootScope.avatar = "images/anonimo.jpg";
        }
      } catch (e) {
        $rootScope.avatar = "images/anonimo.jpg";
      }

    });


    $scope.return = function () {
      $state.go('menu.configmenu', {}, {location: 'replace'});
    };

    var popAvatar;
    $scope.avatarCamera = function () {
      popAvatar = $ionicPopup.show({
        templateUrl: 'templates/modal/takepicture.html',
        scope: $scope,
        cssClass: 'customPopup'
      });
      //$state.go('menu.takepicture');
    };

    $rootScope.closeAvatar = function () {
      popAvatar.close();
    };

    $scope.takePhoto = function () {

      $rootScope.closeAvatar();

      setTimeout(function(){
        $scope.photo_add();
      }, 100);

    };

    var avatar;
    $scope.takeGallery = function () {

      $rootScope.closeAvatar();

      setTimeout(function(){

        var cameraOptions = '';
        if (ionic.Platform.isIOS()) {
          cameraOptions = {
            quality: 75,
            targetWidth: 400,
            targetHeight: 400,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true,  //Corrects Android orientation quirks
            popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
          };
          window.onorientationchange = function () {
            var cameraPopoverHandle = new CameraPopoverHandle();
            var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
            cameraPopoverHandle.setPosition(cameraPopoverOptions);
          }
        } else {
          cameraOptions = {
            quality: 75,
            targetWidth: 400,
            targetHeight: 400,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true  //Corrects Android orientation quirks
          };
        }

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

          $scope.cropper.sourceImage = "data:image/jpeg;base64," + imageUri.replace("data:image/jpeg;base64,", "");
          $scope.openModal();

        }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");

        }, cameraOptions);

      }, 100);

    };

    var popLoading;
    $scope.showLoadingConfig = function (msg) {
      $scope.message = msg;
      popLoading = $ionicPopup.show({
        templateUrl: 'templates/modal/loading.html',
        scope: $scope,
        cssClass: 'customPopup'
      });
    };

    $scope.closeLoading = function () {
      popLoading.close();
    };

    // init the popover
    $ionicPopover.fromTemplateUrl('templates/popover/config.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
    });

    $scope.save = function () {
      avatar = $scope.cropper.croppedImage;
      $scope.closeModal();
      updateAvatar();
    };

    $ionicModal.fromTemplateUrl('templates/modal/edit-image.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    // Open modal
    $scope.openModal = function () {
      $scope.modal.show();
    };

    ////////////////////////////////////////////////////////////////////// F O T O G R A F I A

    $scope.photo_add = function() {
      $rootScope.closeAvatar();

      setTimeout(function(){
        var cameraOptions = '';
        if (ionic.Platform.isIOS()) {
          cameraOptions = {
            quality: 75,
            targetWidth: 400,
            targetHeight: 400,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true
          };
        } else {
          cameraOptions = {
            quality: 75,
            targetWidth: 400,
            targetHeight: 400,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true
          };
        }

        if (ionic.Platform.isIOS()) {
          try {
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
              $scope.cropper.sourceImage = "data:image/jpeg;base64," + imageUri.replace("data:image/jpeg;base64,", "");
              $scope.openModal();

            }, function cameraError(error) {
              $scope.progress_upload = false;
              console.debug("Unable to obtain picture: " + error, "app");

            }, cameraOptions);
          } catch (e) {
            $scope.progress_upload = false;
          }
        } else {
          try {
            navigator.camera.getPicture(onSuccess_native, onFail_native, cameraOptions);
          } catch (e) {
            $scope.progress_upload = false;
          }
        }
      }, 100);

    };

    function onSuccess_native(imageData) {
      $scope.cropper.sourceImage = "data:image/jpeg;base64," + imageData.replace("data:image/jpeg;base64,", "");
      $scope.openModal();
    }

    function onFail_native(message) {
      $scope.progress_upload = false;
      console.debug("Unable to obtain picture: " + error, "app");
    }

    function update_avatar() {
      console.log('sube evidencia')

      $scope.progress_upload = true;

      $http.post($rootScope.UPDATE_PHOTO_64,
        {
          user_id: localstorage.getObject('user_id'),
          image: $scope.evidence_photo,
          name: $scope.evidence_name
        }, {
          headers: {}
        })
        .then(function (success) {

            $scope.progress_upload = false;
            if (success.status == 200) {

              console.log('----------------------------------------------------> exito')

              console.log($scope.evidence_name);

              $rootScope.avatar = '/storage/avatars/' + $scope.evidence_name;

              var obj = localstorage.getObject('user_ojo');

              obj.avatar = $rootScope.avatar;

              localstorage.setObject('user_ojo', obj);

              $rootScope.avatar = $rootScope.BASE_GRAL + $rootScope.avatar;

              setTimeout(function () {
                $scope.$apply();
              }, 10);

              console.log(localstorage.getObject('user_ojo'));

            } else {
              console.log('----------------------------------------------------> error')
              console.log(success)
              console.log('Intenta nuevamente')
            }

          },//SUCCESS
          function (error) {
            $scope.progress_upload = false;
            $scope.mdDialog('Aviso', '¡Verifica tu conexión a internet e intenta nuevamente!');
          });
    }

    ////////////////////////////////////////////////////////////////////// F O T O G R A F I A

    $scope.save = function() {
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var namePhoto = "";
      for (var i = 0; i < 20; i++) {
        namePhoto += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      $scope.evidence_name = "ava_" + namePhoto + ".jpeg";
      $scope.evidence_photo = $scope.cropper.croppedImage;
      $scope.closeModal();
      update_avatar();
    };

    $ionicModal.fromTemplateUrl('templates/modal/edit-image.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeModal = function() {
      $scope.progress_upload = false;
      $scope.modal.hide();
    };

    // Open modal
    $scope.openModal = function() {
      $scope.progress_upload = true;
      $scope.modal.show();
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
    }


  });
