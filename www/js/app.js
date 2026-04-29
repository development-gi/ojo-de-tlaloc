angular.module('App', ['ionic','oc.lazyLoad', 'App.controllers','App.directives',
  'ngCordova','angular-jwt','ionic.contrib.drawer','ng-mfb','onezone-datepicker','ngMaterial','angularLoad',
  'angular-img-cropper',
  'ngAria',
  'pascalprecht.translate',
  'highcharts-ng',
  'ionic.contrib.drawer.vertical'])

.run(function($ionicPlatform, $rootScope, $state, jwtHelper, AuthFactory, $http, $ionicHistory, $ionicConfig, $translate,
              $filter, localstorage, $mdToast, $ionicPopup, sessionstorage, $mdDialog) {

  $rootScope.mdDialogGeneral = function (title, detail, avatar) {
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(false)
        .title(title)
        .textContent(detail)
        .ok('Aceptar')
        .srcAvatar(avatar)
    );
  };

  $ionicPlatform.registerBackButtonAction(function (e) {

    e.stopPropagation();

    e.preventDefault();

    var state_app = $ionicHistory.currentView().stateName;

    if (state_app == 'menu.principal' || state_app.search('main') >= 0) {

      navigator.app.exitApp();


    }

  }, 100);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  try {
    if (localstorage.getObject('gpsPermissionGranted')) {
      $rootScope.gpsPermissionGranted = true;
    } else {
      localstorage.setObject('gpsPermissionGranted', false);
      $rootScope.gpsPermissionGranted = false;
    }
  } catch (e) {
    localstorage.setObject('gpsPermissionGranted', false);
    $rootScope.gpsPermissionGranted = false;
    console.log(e);
  }

  try {
    if (localstorage.getObject('cameraPermissionGranted')) {
      $rootScope.cameraPermissionGranted = true;
    } else {
      localstorage.setObject('cameraPermissionGranted', false);
      $rootScope.cameraPermissionGranted = false;
    }
  } catch (e) {
    localstorage.setObject('cameraPermissionGranted', false);
    $rootScope.cameraPermissionGranted = false;
    console.log(e);
  }

  $rootScope.checkCameraPermission = function (callback) {

    try {

      if (ionic.Platform.isAndroid() || $rootScope.device_platform === "Android") {

        var permissions = cordova.plugins.permissions;

        permissions.checkPermission(permissions.CAMERA, function (status) {

          if (status.hasPermission) {

            console.log('Permiso de camara concedido.');
            localstorage.setObject('cameraPermissionGranted', true);
            $rootScope.cameraPermissionGranted = true;

            //callback();

          } else {
            setTimeout(function () {
              // Solicitar permiso
              var confirm = $mdDialog.confirm()
                .title('Aviso')
                .textContent('Se requiere permisos de cámara para poder enviar evidencia')
                .ariaLabel('Lucky day')
                .targetEvent($rootScope.$event)
                .ok('Solicitar')
                .srcAvatar('images/svg/lost_camera.svg')
                .cancel('Cancelar');

              $mdDialog.show(confirm).then(function () {

                permissions.requestPermission(permissions.CAMERA, function (status) {

                  if (status.hasPermission) {

                    localstorage.setObject('cameraPermissionGranted', true);
                    $rootScope.cameraPermissionGranted = true;

                    //callback();

                  } else {
                    // Permiso denegado

                    $rootScope.mdDialogGeneral('Aviso', 'Se requiere permisos de cámara para poder enviar el avatar o alguna evidencia fotográfica', 'images/svg/lost_camera.svg');
                    localstorage.setObject('cameraPermissionGranted', false);
                    $rootScope.cameraPermissionGranted = false;
                  }

                }, function () {
                  // Error al solicitar permiso
                  console.error('La solicitud de permiso de cámara falló.');
                  localstorage.setObject('cameraPermissionGranted', false);
                  $rootScope.cameraPermissionGranted = false;
                });

              });
            }, 2000);
          }

        }, function () {
          // Error al verificar permiso
          console.error('La verificación del permiso de cámara falló.');
          localstorage.setObject('cameraPermissionGranted', false);
          $rootScope.cameraPermissionGranted = false;
        });
      } else if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {

        cordova.plugins.diagnostic.isCameraAuthorized(function (authorized) {

          if (authorized) {

            $rootScope.$apply(function () {
              $rootScope.cameraPermissionGranted = true;
            });

            callback();

          } else {
            // Solicitar permiso
            cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {

              if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                $rootScope.$apply(function () {
                  $rootScope.cameraPermissionGranted = true;
                });

                callback();

              } else {
                // Permiso denegado
                $rootScope.mdDialogGeneral('Aviso', 'Se requiere permisos de cámara para poder enviar el avatar o alguna evidencia fotográfica', 'images/svg/lost_camera.svg');
                $rootScope.cameraPermissionGranted = false;
              }
            }, function (error) {
              // Error al solicitar permiso
              $rootScope.cameraPermissionGranted = false;
              console.error('La solicitud de permiso de cámara falló: ' + error);
            });
          }
        }, function (error) {
          // Error al verificar permiso
          $rootScope.cameraPermissionGranted = false;
          console.error('La verificación del permiso de cámara falló: ' + error);
        });
      }

    } catch (e) {
      console.log(e);
    }

  };

  $rootScope.checkGPSPermission = function (callback) {

    console.log($rootScope.gpsPermissionGranted);

    try {
      if (ionic.Platform.isAndroid() || $rootScope.device_platform === "Android") {

        var permissions = cordova.plugins.permissions;
        var locationPermission = permissions.ACCESS_FINE_LOCATION;

        permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {

          if (status.hasPermission) {

            $rootScope.$apply(function () {
              console.log('Permiso de ubicación concedido.');
              console.log($rootScope.gpsPermissionGranted);
              localstorage.setObject('gpsPermissionGranted', true);
              $rootScope.gpsPermissionGranted = true;
            });

            //callback();

          } else {
            setTimeout(function () {
              // Solicitar permiso
              var confirm = $mdDialog.confirm()
                .title('Aviso')
                .textContent('Se requiere permisos de ubicación para poder enviar evidencia de documentación')
                .ariaLabel('Lucky day')
                .targetEvent($rootScope.$event)
                .ok('Solicitar')
                .srcAvatar('images/svg/lost_gps.svg')
                .cancel('Cancelar');

              $mdDialog.show(confirm).then(function () {
                permissions.requestPermission(locationPermission, function (status) {
                  if (status.hasPermission) {
                    $rootScope.$apply(function () {
                      localstorage.setObject('gpsPermissionGranted', true);
                      $rootScope.gpsPermissionGranted = true;
                    });
                    callback();
                  } else {
                    $rootScope.mdDialogGeneral('Aviso', 'Se requiere permisos de ubicación para poder enviar evidencia de documentación', 'images/svg/lost_gps.svg');
                    localstorage.setObject('gpsPermissionGranted', false);
                    $rootScope.gpsPermissionGranted = false;
                  }
                }, function (error) {
                  console.error('La solicitud de permiso de ubicación falló: ' + error);
                  localstorage.setObject('gpsPermissionGranted', false);
                  $rootScope.gpsPermissionGranted = false;
                });
              });
            }, 2000);
          }

        }, function () {
          // Error al verificar permiso
          console.error('La verificación del permiso de cámara falló.');
          localstorage.setObject('gpsPermissionGranted', false);
          $rootScope.gpsPermissionGranted = false;
        });

      } else if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {

        cordova.plugins.diagnostic.isLocationAvailable(function (authorized) {

          if (authorized) {

            $rootScope.$apply(function () {
              $rootScope.gpsPermissionGranted = true;
            });

            callback();

          } else {
            // Solicitar permiso
            cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {

              if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                // Permiso concedido, actualizar $rootScope y ejecutar el callback
                $rootScope.$apply(function () {
                  $rootScope.gpsPermissionGranted = true;
                });

                callback();

              } else {
                // Permiso denegado
                $rootScope.mdDialogGeneral('Aviso', 'Se requiere permisos de ubicación para poder enviar evidencia de documentación', 'images/svg/lost_gps.svg');
                $rootScope.gpsPermissionGranted = false;
              }
            }, function (error) {
              // Error al solicitar permiso
              console.error('La solicitud de permiso de cámara falló: ' + error);
              $rootScope.gpsPermissionGranted = false;
            });
          }
        }, function (error) {
          // Error al verificar permiso
          console.error('La verificación del permiso de cámara falló: ' + error);
          $rootScope.gpsPermissionGranted = false;
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  $rootScope.BASE_GRAL = "https://ojo-de-tlaloc.genioinventivo.com";
  $rootScope.BASE_URL = "https://ojo-de-tlaloc.genioinventivo.com/api/";
  $rootScope.BASE_URL_API = "https://ojo-de-tlaloc.genioinventivo.com/api";
  $rootScope.BASE_URL_IMG = "https://ojo-de-tlaloc.genioinventivo.com/storage/";

  $rootScope.NAME_APP = 'Ojo de Tláloc';
  $rootScope.COMPANY = 'Genio Inventivo S.A.P.I. de C.V.';
  $rootScope.LOGIN_URL = $rootScope.BASE_URL_API + "/login";
  $rootScope.PIN = $rootScope.BASE_URL_API + "pin";

  $rootScope.LOGOUT = $rootScope.BASE_URL_API + "/logout";

  $rootScope.TRACKING = $rootScope.BASE_URL_API + "/tracking";
  $rootScope.TRACKING_POST = $rootScope.BASE_URL_API + "/trackingPost";

  $rootScope.NOTIFICATIONS = $rootScope.BASE_URL_API + "/notifications";

  $rootScope.ADD_POST = $rootScope.BASE_URL_API + "/addPost";
  $rootScope.UPDATE_FILE_MINUTE = $rootScope.BASE_URL_API + "/addFileMinute";

  $rootScope.UPDATE_POST_WORKS = $rootScope.BASE_URL_API + "/updatePostWorks";
  $rootScope.UPDATE_FILE_WORKS = $rootScope.BASE_URL_API + "/updateFileWorks";

  $rootScope.UPDATE_PHOTO = $rootScope.BASE_URL_API + "/addPhoto";
  $rootScope.UPDATE_PHOTO_64 = $rootScope.BASE_URL_API + "/addPhotoBase64";

  $rootScope.UPDATE_PHOTO_64_GENERAL = $rootScope.BASE_URL_API + "/addPhotoBase64Gral";

  $rootScope.ADD_POST_CAMERAS = $rootScope.BASE_URL_API + "/addPostCameras";

  /////////////////////////// O J O  D E  T L A L O C ////////////////////////////////////////////

  $rootScope.POINTS_MAP = $rootScope.BASE_URL_API + "/pointsMap";
  $rootScope.GET_TARGETS_LIST = $rootScope.BASE_URL_API + "/targetsNested";
  $rootScope.CREATE_TARGET_LIST = $rootScope.BASE_URL_API + "/createTargetList";
  $rootScope.UPDATE_STATUS_TARGET_LIST = $rootScope.BASE_URL_API + "/updateStatusTargetList";
  $rootScope.UPDATE_TARGET_LIST = $rootScope.BASE_URL_API + "/updateTargetList";

  $rootScope.STREAMING = $rootScope.BASE_URL_API + "/streaming";

  ////////////////////////////////////////////////////////////////////////////I N I   C O O R D E N A D A S

  $rootScope.successAudio = function () {
    try {
      var audio = document.getElementById("successAudio");
      if (audio) {
        audio.play().then(() => {
          console.log("Audio reproducido correctamente");
      }).catch((error) => {
          console.error("Error al reproducir el audio: ", error);
      });
      } else {
        console.error("Elemento de audio no encontrado");
      }
    } catch (e) {
      console.error("Error al intentar reproducir el audio: ", e);
    }
  }

  $rootScope.errorAudio = function () {
    try {
      var audio = document.getElementById("errorAudio");
      if (audio) {
        audio.play().then(() => {
          console.log("Audio reproducido correctamente");
      }).catch((error) => {
          console.error("Error al reproducir el audio: ", error);
      });
      } else {
        console.error("Elemento de audio no encontrado");
      }
    } catch (e) {
      console.error("Error al intentar reproducir el audio: ", e);
    }
  }

  $rootScope.activeGPS = function () {

    try {
      cordova.plugins.locationAccuracy.canRequest(function (canRequest) {

        if (canRequest) {
          cordova.plugins.locationAccuracy.request(function () {
            }, function (error) {
              if (error) {
                if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {

                }
              }
            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
          );
        }
      });
    } catch (e) {
      //console.log(e)
    }

    try {

      navigator.geolocation.getCurrentPosition(function (position) {

        sessionstorage.setObject("lat", position.coords.latitude);
        sessionstorage.setObject("lng", position.coords.longitude);

      })

    } catch (e) {
      //console.log(e)
    }

    try {

      navigator.geolocation.watchPosition(function (position) {

        sessionstorage.setObject("lat", position.coords.latitude);
        sessionstorage.setObject("lng", position.coords.longitude);

      }, function(error) {

        console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');

      }, { timeout: 3000, enableHighAccuracy: true })

    } catch (e) {
      console.log(e)
    }

  };

  $rootScope.activeGPS();
  ////////////////////////////////////////////////////////////////////////////E N D   C O O R D E N A D A S
  var popLoading;
  $rootScope.showLoading = function (msg) {
    $('#nav_view').removeClass('app_blur');

    setTimeout(function() {
      $('#nav_view').addClass('app_blur');
    }, 10);

    $rootScope.message = msg;
    popLoading = $ionicPopup.show({
      templateUrl: 'templates/modal/loading.html',
      scope: $rootScope,
      cssClass: 'customPopup'
    });
  };

  $rootScope.closeLoading = function () {
    popLoading.close();
    setTimeout(function() {
      $('#nav_view').removeClass('app_blur');
    }, 10);
  };

  $ionicPlatform.ready(function() {

    $ionicConfig.views.transition('none');

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      if (ionic.Platform.isAndroid()) {
        StatusBar.backgroundColorByHexString("#4d0080");
      }
      //StatusBar.styleDefault();
    }

    $ionicPlatform.ready(function() {
      setTimeout(function () {
        try {navigator.splashscreen.hide();} catch (e) {}
      }, 100);
    })

    setTimeout(function() {
      try {navigator.splashscreen.hide();} catch (e) {}
    }, 1000);

  });

  $rootScope.toastPulse = function (message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom')
        .theme('md-default-content-theme')
        .hideDelay(3000)
    );
  };

  //Valida si hay conexion a internet
  $rootScope.toastGeneral = function (message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom')
        .hideDelay(3000)
    );
  };

  $rootScope.toastSuccess = function(message) {
    $mdToast.show({
      templateUrl: 'templates/toast/success-toast.html',
      hideDelay: 3000,
      position: 'top center',
      locals: { message: message },
      controller: function($scope, message) {
        $scope.message = message;
      }
    });
  };

  $rootScope.toastError = function(message) {
    $mdToast.show({
      templateUrl: 'templates/toast/error-toast.html',
      hideDelay: 3000,
      position: 'top center',
      locals: { message: message },
      controller: function($scope, message) {
        $scope.message = message;
      }
    });
  };

  $rootScope.toastWarning = function () {
    $mdToast.show(
      $mdToast.simple()
        .textContent( "Por favor ¡intenta nuevamente!" )
        .theme('warning-content')
        .hideDelay(false)
        .action('⟳')
        .highlightAction(true)
        .toastClass('custom-toast-action')
    );
  };

  $rootScope.toastWifi = function () {
    var toast = $mdToast.simple()
      .textContent( "Upps! Lo siento... Algo salió mal. Se perdió la conexión a internet, vuelve a conectarte a internet e intenta nuevamente" )
      .theme('error-content')
      .hideDelay(false)
      .action('⟳')
      .highlightAction(true)
      .toastClass('custom-toast-action');

    $mdToast.show(toast).then(function(response) {

      if (response === 'ok') {
        $mdToast.hide();
        try {
          $rootScope.checkWifiConnection();
        } catch(exx) {
          console.log(exx);
        }
      }
    });
  };

  $rootScope.checkWifiConnection = function() {

    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    if (networkState !== Connection.NONE) {

      $http.post($rootScope.PIN, {}, {headers: {
        'Authorization' : 'Bearer '+ localstorage.getObject('token_PulseHRConnect')
      }})
        .then(function (success) {

            try { SpinnerDialog.hide(); } catch (e) { }

            $mdToast.hide();

            setTimeout(function() { $rootScope.toastWarning(); }, 100);

          },
          function (error) {

            try { SpinnerDialog.hide(); } catch (e) { }

            $rootScope.toastWifi();

          });

    } else {

      try { SpinnerDialog.hide(); } catch (e) { }

      $rootScope.toastWifi();

    }

  };

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $mdThemingProvider, $translateProvider, $mdGestureProvider, $mdIconProvider, $compileProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content|blob|ionic|app|cdvfile|tel|geo|mailto|sms|market|local|ms-appx|x-wmapp0|chrome-extension)|^\s*data:image\/|\/?img\//);

  $mdIconProvider.iconSet('device', 'img/icons/sets/device-icons.svg', 24);

  $mdGestureProvider.skipClickHijack();
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink');

  $mdThemingProvider.theme('alt')
    .primaryPalette('cyan')
    .accentPalette('green');


  // We use a http interceptor to listen for the Token Expired-exception
// coming from the backend (Laravel 5.1 and JWTAuth) on any http calls performed.
  $httpProvider.interceptors.push('httpInterceptor');

  $stateProvider
    .state('main', {
      url: '/main',
      data: {
        requiresLogin: false
      },
      abstract: true,
      templateUrl: 'templates/main.html'
    })

    .state('main.intro', {
      url: '/intro',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro.js']);
              }]
          },
          controller: 'IntroCtrl'
        }
      }
    })

    .state('main.intro-start', {
      url: '/intro-start',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro-start.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro-start.js']);
              }]
          },
          controller: 'IntroStartCtrl'
        }
      }
    })

    .state('main.intro-start-2', {
      url: '/intro-start-2',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro-start-2.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro-start-2.js']);
              }]
          },
          controller: 'IntroStart2Ctrl'
        }
      }
    })

    .state('main.intro-start-3', {
      url: '/intro-start-3',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro-start-3.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro-start-3.js']);
              }]
          },
          controller: 'IntroStart3Ctrl'
        }
      }
    })

    .state('main.intro-start-4', {
      url: '/intro-start-4',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro-start-4.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro-start-4.js']);
              }]
          },
          controller: 'IntroStart4Ctrl'
        }
      }
    })

    .state('main.intro-start-5', {
      url: '/intro-start-5',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/intro-start-5.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/intro-start-5.js']);
              }]
          },
          controller: 'IntroStart5Ctrl'
        }
      }
    })

    .state('main.login', {
      url: '/login',
      data: {
        requiresLogin: false
      },
      views: {
        'main': {
          templateUrl: 'templates/login.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/login.js']);
              }]
          },
          controller: 'LoginCtrl'
        }
      }
    })

    .state('menu', {
      url: '/menu',
      data: {
        requiresLogin: true
      },
      abstract: true,
      templateUrl: 'templates/menu.html',
      resolve: {
        deps: ['$ocLazyLoad',
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(['js/controllers/menu.js']);
          }]
      },
      controller: 'MenuCtrl'
    })

    .state('menu.principal', {
      url: '/principal',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/principal.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/principal.js']);
              }]
          },
          controller: 'PrincipalCtrl'
        }
      }
    })

    .state('menu.cameras', {
      url: '/cameras',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/cameras.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/cameras.js']);
              }]
          },
          controller: 'CamerasCtrl'
        }
      }
    })

    .state('menu.target-list', {
      url: '/target-list',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/target-list.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/target-list.js']);
              }]
          },
          controller: 'TargetListCtrl'
        }
      }
    })

    .state('menu.create-target-list', {
      url: '/create-target-list',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/create-target-list.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/create-target-list.js']);
              }]
          },
          controller: 'CreateTargetListCtrl'
        }
      }
    })

    .state('menu.objective-list', {
      url: '/objective-list',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/objective-list.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/objective-list.js']);
              }]
          },
          controller: 'ObjectiveListCtrl'
        }
      }
    })

    .state('menu.config', {
      url: '/config',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/config.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/config.js']);
              }]
          },
          controller: 'ConfigCtrl'
        }
      }
    })

    .state('menu.map', {
      url: '/map',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/map.js']);
              }]
          },
          controller: 'MapCtrl'
        }
      }
    })

    .state('menu.configmenu', {
      url: '/configmenu',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/configmenu.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/configmenu.js']);
              }]
          },
          controller: 'ConfigMenuCtrl'
        }
      }
    })

    .state('menu.legal', {
      url: '/legal',
      data: {
        requiresLogin: true
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/legal.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function ($ocLazyLoad) {
                return $ocLazyLoad.load(['js/controllers/legal.js']);
              }]
          },
          controller: 'LegalCtrl'
        }
      }
    });

  if (localStorage.getItem('user') == null || localStorage.getItem('user') == undefined) {
    try {
      console.log(localStorage.getItem('introOjo'))
      if (localStorage.getItem('introOjo') === '1') {
        console.log('if')
        $urlRouterProvider.otherwise('/main/login');
      } else {
        console.log('else')
        $urlRouterProvider.otherwise('/main/intro');
      }
    } catch (e) {
      console.log('catch')
      $urlRouterProvider.otherwise('/main/intro');
    }
  } else {
    console.log('else 2')
    $urlRouterProvider.otherwise('/menu/principal');
  }

  // I N G L É S
  $translateProvider.translations('en', {

    INTERNET_ERROR : 'Oops! Sorry... Something went wrong. The internet connection was lost, please reconnect to the internet',
    INTERNET_SUCCESS: 'Please try again!',

    // I N T R O
    INTRO_LBL_1: 'Official App',
    INTRO_LBL_2: 'Choose the language!',
    INTRO_LBL_3: 'Choose language!',
    INTRO_LBL_4: 'Spanish',
    INTRO_LBL_5: 'Spanish',
    INTRO_LBL_6: 'English',
    INTRO_LBL_7: 'English',
    INTRO_LBL_8: 'Advanced Collection and Payment Technology!',
    INTRO_LBL_9: 'Make your collections and payments safely and quickly. Avoid the use of cash by reducing risks. Get your point of sale totally free, digital management, really know your business.',
    INTRO_LBL_10: 'Empowering your business!',
    INTRO_LBL_11: 'Business-related training.',
    INTRO_LBL_12: 'Expert support.',
    INTRO_LBL_13: 'Offers service charging.',
    INTRO_LBL_14: 'Increase your sales and reduce administrative costs.',
    INTRO_LBL_15: 'Generate financial history and access to credits',
    INTRO_LBL_16: 'JOIN!',

    // W E L C O M E
    WELCOME_LBL_1: 'Hello',
    WELCOME_LBL_2: 'With ItzaPay® transform your way of paying, enjoy the convenience and security of a digital wallet on your phone',
    WELCOME_LBL_3: 'Enter',
    WELCOME_LBL_4: 'Register',
    WELCOME_LBL_5: 'Or start from a social network',
    WELCOME_LBL_6: 'Create a business account.',
    WELCOME_LBL_7: 'Here!',

    // L O G I N
    LOGIN_LBL_1: 'Welcome',
    LOGIN_LBL_2: 'Sign in to continue',
    LOGIN_LBL_3: 'User',
    LOGIN_LBL_4: 'Password',
    LOGIN_LBL_5: 'Start now',
    LOGIN_LBL_6: 'Forgot your password?',
    LOGIN_LBL_7: 'Get it back here!',
    LOGIN_LBL_8: 'Don´t have an account?',
    LOGIN_LBL_9: 'Create an account here!',
    LOGIN_LBL_10: 'Password Rescue',
    LOGIN_LBL_11: 'What cell phone number did you create your account with?',
    LOGIN_LBL_12: 'Write here',
    LOGIN_LBL_13: 'Confirm',
    LOGIN_LBL_14: 'Cancel',
    LOGIN_LBL_15: 'Enter your password',
    LOGIN_LBL_16: 'Enter a valid cell phone number',
    LOGIN_LBL_17: 'Your password was sent to the email you registered in your account!',
    LOGIN_LBL_18: 'Check your internet connection and try again!',
    LOGIN_LBL_19: 'The cell phone number does not exist in our records!',
    LOGIN_LBL_20: 'Check your internet connection and try again!',
    LOGIN_LBL_21: 'You need to write the cell phone number :)',
    LOGIN_LBL_22: 'Report this error to ',
    LOGIN_LBL_23: 'Invalid generates a new one',

    /* R E G I S T E R */
    REGISTER_LBL_1: 'Please write it down!',
    REGISTER_LBL_2: 'Name',
    REGISTER_LBL_3: 'Firts name',
    REGISTER_LBL_4: 'Last name',
    REGISTER_LBL_5: 'Enter your e-mail account and request the verification code',
    REGISTER_LBL_6: 'E-mail',
    REGISTER_LBL_7: 'Mobile number',
    REGISTER_LBL_8: 'Verification code',
    REGISTER_LBL_9: 'Get code',
    REGISTER_LBL_10: 'Now we need a password for your new account',
    REGISTER_LBL_11: 'Minimum 6 characters required',
    REGISTER_LBL_12: 'Repeat your password',
    REGISTER_LBL_13: 'How do you identify yourself?',
    REGISTER_LBL_14: 'To give you a better experience we need to know your gender',
    REGISTER_LBL_15: 'Male',
    REGISTER_LBL_16: 'Female',
    REGISTER_LBL_17: 'Non-binary',
    REGISTER_LBL_18: 'I prefer not to reveal',
    REGISTER_LBL_19: 'When is your birthday?',
    REGISTER_LBL_20: 'We want to celebrate you :)',
    REGISTER_LBL_21: 'What is your nationality?',
    REGISTER_LBL_22: 'To give you a better experience we need to know',
    REGISTER_LBL_23: 'Nationality',
    REGISTER_LBL_24: 'State where you reside',
    REGISTER_LBL_25: 'Your account has been successfully created!',
    REGISTER_LBL_26: 'Enjoy our service',
    REGISTER_LBL_27: 'Enter a year longer than ',
    REGISTER_LBL_28: 'Enter a year less than ',
    REGISTER_LBL_29: 'Enter your e-mail address',
    REGISTER_LBL_30: 'Enter your telephone number',
    REGISTER_LBL_31: 'Enter the verification code sent to your e-mail address',
    REGISTER_LBL_32: 'The passwords do not match, please repeat your passwords',
    REGISTER_LBL_33: 'There is already a registered user with the number ',

    // A M O U N T
    AMOUNT_LBL_1: 'Currently accounts with',
    AMOUNT_LBL_2: 'Payment amount',

    // C A R D
    CARD_LBL_1: 'VALID UP',
    CARD_LBL_2: 'Name',
    CARD_LBL_3: 'Card number',
    CARD_LBL_4: 'AAAA',
    CARD_LBL_5: 'Pay now!',
    CARD_LBL_6: 'Card details',
    CARD_LBL_7: 'Lastname',

    // C A R D   C U S T O M E R
    CARD_CUSTOMER_LBL_1: 'Add a card to your account',
    CARD_CUSTOMER_LBL_2: 'Credit',
    CARD_CUSTOMER_LBL_3: 'Debit',
    CARD_CUSTOMER_LBL_4: 'Services',
    CARD_CUSTOMER_LBL_5: 'My cards',

    // C O D E   A C C E S S
    CODE_ACCESS_LBL_1: 'Unique access code',
    CODE_ACCESS_LBL_2: 'We have sent it to the email registered in the ItzaPay® account.',
    CODE_ACCESS_LBL_3: 'It is valid for',
    CODE_ACCESS_LBL_4: 'minutes',
    CODE_ACCESS_LBL_5: 'Time out...',
    CODE_ACCESS_LBL_6: 'Please enter it now!',
    CODE_ACCESS_LBL_7: '... request a new one',
    CODE_ACCESS_LBL_8: 'here',

    // C O M P A N Y   A M O U N T S
    COMPANY_AMOUNTS_LBL_1: 'Subcategory',
    COMPANY_AMOUNTS_LBL_2: 'Select one',
    COMPANY_AMOUNTS_LBL_3: 'Company',

    // C O M P L E T E   P A Y M E N T   S T O R E
    COMPLETE_PAYMENT_STORE_LBL_1: 'Thank you for your purchase!',
    COMPLETE_PAYMENT_STORE_LBL_2: 'Dictate the following sheet to the cashier or simply continue',

    // C O M P L E T E   R E C O R D
    COMPLETE_RECORD_LBL_1: 'Your account is in the process of being applied for',
    COMPLETE_RECORD_LBL_2: 'Please enter the required information of your business',
    COMPLETE_RECORD_LBL_3: 'Add',
    COMPLETE_RECORD_LBL_4: 'Your account is being verified',
    COMPLETE_RECORD_LBL_5: 'You will soon receive a reply on your request!',

    /* E R R O R */
    ERROR_LBL_1: 'Operation error',
    ERROR_LBL_2: 'Your payment will be refunded immediately',
    ERROR_LBL_3: 'Accept',

    /* H I S T O R Y */
    HISTORY_LBL_1: 'Recharge',
    HISTORY_LBL_2: 'Service',
    HISTORY_LBL_3: 'Payment with',
    HISTORY_LBL_4: 'Payment with card',
    HISTORY_LBL_5: 'Attended',
    HISTORY_LBL_6: 'To',
    HISTORY_LBL_7: 'Hello',
    HISTORY_LBL_8: 'Wallet balance',
    HISTORY_LBL_9: 'Recent transactions',
    HISTORY_LBL_10: 'Recent transactions',
    HISTORY_LBL_11: 'Previous month',
    HISTORY_LBL_12: 'Previous month',
    HISTORY_LBL_13: 'No results found',

    /* P A Y M E N T   R E C H A R G E */
    PAYMENT_RECHARGE_LBL_1: 'Select payment method',
    PAYMENT_RECHARGE_LBL_2: 'Available balance',
    PAYMENT_RECHARGE_LBL_3: 'Digital',
    PAYMENT_RECHARGE_LBL_4: 'Payment methods',

    /* P R O D U C T S   L I S T */
    PRODUCTS_LIST_LBL_1: 'Matches',

    /* Q R   S T O R E */
    QR_STORE_LBL_1: 'Write the folio that the client dictates to you after payment',

    /* S C A N N I N G   P R O D U C T */
    SCANNING_PRODUCT_LBL_1: 'Scan the product',

    /* S E R V I C E   L I S T */
    SERVICE_LIST_LBL_1: 'Choose Company',

    /* S U C C E S S   A D D   C A R D */
    SUCCESS_ADD_CARD_LBL_1: 'Card added successfully!',
    SUCCESS_ADD_CARD_LBL_2: 'Thank you for adding your payment method',

    /* S U C C E S S   D E L E T E D   C A R D */
    SUCCESS_DELETED_CARD_LBL_1: 'Card deleted successfully!',
    SUCCESS_DELETED_CARD_LBL_2: 'Thank you, your payment method has been completely removed from our records.',

    /* S U C C E S S   P A Y M E N T */
    SUCCESS_PAYMENT_LBL_1: 'The transaction was completed successfully!',
    SUCCESS_PAYMENT_LBL_2: 'Thank you for your payment',

    /* T A K E P I C T U R E */
    TAKE_PICTURE_LBL_1: 'Change avatar',
    TAKE_PICTURE_LBL_2: 'Photos',
    TAKE_PICTURE_LBL_3: 'Camera',

    /* T I M E   P I C K E R */
    TIME_PICKER_LBL_1: 'Time for the day',
    TIME_PICKER_LBL_2: 'Opening hours',
    TIME_PICKER_LBL_3: 'Closing hours',

    /* T Y P E   P A Y M E N T */
    TYPE_PAYMENT_LBL_1: 'Choose a payment option',
    TYPE_PAYMENT_LBL_2: 'Manual Search',
    TYPE_PAYMENT_LBL_3: 'Scan QR Code',

    /* V I E W   D E T A I L   I T E M */
    VIEW_DETAIL_ITEM_LBL_1: 'Total',
    VIEW_DETAIL_ITEM_LBL_2: 'Payment by credit card',
    VIEW_DETAIL_ITEM_LBL_3: 'Payment by debit card',
    VIEW_DETAIL_ITEM_LBL_4: 'Payment by utility card',
    VIEW_DETAIL_ITEM_LBL_5: 'Reference',

    /* B L O G */
    BLOG_LBL_1: 'Detail',

    /* B L O G   L I S T */
    BLOG_LIST_LBL_1: 'See more',
    BLOG_LIST_LBL_2: 'Promotions and discounts',
    BLOG_LIST_LBL_3: 'News',

    /* C A R D   N E W */
    CARD_NEW_LBL_1: 'Phone',
    CARD_NEW_LBL_2: 'Add card',
    CARD_NEW_LBL_3: 'New card',
    CARD_NEW_LBL_4: 'E-mail',

    /* C H A N G E   P A S S W O R D */
    CHANGE_PASSWORD_LBL_1: 'Set your password',
    CHANGE_PASSWORD_LBL_2: 'Follow the instructions below',
    CHANGE_PASSWORD_LBL_3: 'Lowercase',
    CHANGE_PASSWORD_LBL_4: 'Uppercase',
    CHANGE_PASSWORD_LBL_5: 'Number',
    CHANGE_PASSWORD_LBL_6: 'Characters',
    CHANGE_PASSWORD_LBL_7: 'Start creating a password',
    CHANGE_PASSWORD_LBL_8: 'Confirm your password',
    CHANGE_PASSWORD_LBL_9: 'Repeat password',
    CHANGE_PASSWORD_LBL_10: 'Change now',
    CHANGE_PASSWORD_LBL_11: 'Your password has been set successfully!',

    /* C O M M E N T S */
    COMMENTS_LBL_1: 'Please write your feedback',
    COMMENTS_LBL_2: 'Thank you for taking the time to send us your feedback.',
    COMMENTS_LBL_3: 'Submit Now',
    COMMENTS_LBL_4: 'Thank you for your feedback',
    COMMENTS_LBL_5: 'While we cant review everything we receive and respond, we do use feedback like yours to improve the ItzaPay® experience for everyone!',

    /* C O N F I G */
    CONFIG_LBL_1: 'Member since',
    CONFIG_LBL_2: 'User',
    CONFIG_LBL_3: 'Profile',
    CONFIG_LBL_4: 'Admin',
    CONFIG_LBL_5: 'Customer',
    CONFIG_LBL_6: 'Cashier',
    CONFIG_LBL_7: 'Commerce',
    CONFIG_LBL_8: 'Set password',

    /* C O N F I G   M E N U */
    CONFIG_MENU_LBL_1: 'My Profile',
    CONFIG_MENU_LBL_2: 'Linked Devices',
    CONFIG_MENU_LBL_3: 'Send Us Feedback',
    CONFIG_MENU_LBL_4: 'Help',
    CONFIG_MENU_LBL_5: 'Request Account Deletion',
    CONFIG_MENU_LBL_6: 'Version',
    CONFIG_MENU_LBL_7: 'Log Out',
    CONFIG_MENU_LBL_8: 'Settings',
    CONFIG_MENU_LBL_9: 'Bank Details',

    /* D A T A B A N K */
    DATA_BANK_LBL_1: 'Please enter your bank details',
    DATA_BANK_LBL_2: 'Click on the continue button',
    DATA_BANK_LBL_3: 'Continue',
    DATA_BANK_LBL_4: 'Enter the following details',
    DATA_BANK_LBL_5: 'Name of the banking institution',
    DATA_BANK_LBL_6: 'Interbank code',
    DATA_BANK_LBL_7: 'Confirm details',
    DATA_BANK_LBL_8: 'Edit details',
    DATA_BANK_LBL_9: 'Please enter the full name of the account holder',
    DATA_BANK_LBL_10: 'Please enter the paternal surname of the account holder',
    DATA_BANK_LBL_11: 'Please enter the account holders maternal surname',
    DATA_BANK_LBL_12: 'Please enter the name of the banking institution',
    DATA_BANK_LBL_13: 'Please enter the interbank code',
    DATA_BANK_LBL_14: 'Full name of the account holder',
    DATA_BANK_LBL_15: 'Paternal surname of the account holder',
    DATA_BANK_LBL_16: 'Mothers surname of the account holder',
    DATA_BANK_LBL_19: 'The interbank code must be 18 digits',
    DATA_BANK_LBL_20: 'Select',
    DATA_BANK_LBL_21: 'Do you really want to enter this data to your user?',
    DATA_BANK_LBL_22: 'Confirm',
    DATA_BANK_LBL_23: 'Accept',

    /* D E V I C E   A C C E S S */
    DEVICE_ACCESS_LBL_1: 'Choose the device you want to unlink from your account',
    DEVICE_ACCESS_LBL_2: 'Linked devices',

    /* L E G A L */
    LEGAL_LBL_1: 'Consent',
    LEGAL_LBL_2: 'by',
    LEGAL_LBL_3: 'Accept and continue',
    LEGAL_LBL_4: 'I do not accept',
    LEGAL_LBL_5: 'Legal',
    LEGAL_LBL_6: 'The personal data collected will be protected, incorporated and processed in the ItzaPay® Personal Data System,' +
    'same as those based on the Personal Data Protection Law for Mexico City Articles 7, 8, 9, 13, 14 and 15, ' +
    'Mexico City Transparency and Access to Public Information Act, Articles 36 and 38, Sections I and IV, ' +
    'Mexico City Archives Law Articles 30 fractions VI and VII, 31, 32, 33, 34, 35 fractions VIII, 37, 38 and 40, ' +
    'Regulation of the Mexico City Transparency and Access to Public Information Act Articles 23, 30 to 32, ' +
    'Guidelines for the Protection of Personal Data in Mexico City, Numerals 5, 10, 11 and 13. ',
    LEGAL_LBL_7: 'The data required are mandatory and without them the relevant steps to provide the requested services cannot be completed.',
    LEGAL_LBL_8: 'You are also informed that your data may not be disseminated without your express consent, except as provided for in the Law.',
    LEGAL_LBL_9: 'The person responsible for the personal data system is Genio Inventico SAPI de CV. and the e-mail address where you can exercise your access rights, ' +
    'rectification, cancellation and opposition as well as revocation of consent is {{ EMAIL }}.',
    LEGAL_LBL_10: 'The person concerned may contact the Institute for Access to Public Information in Mexico City, where he or she will receive advice on rights ' +
    'which protects the Personal Data Protection Law for Mexico City at the telephone number: 5636-4636; email: ' +
    'datos.personales@infodf.org.mx or www.infodf.org.mx.',

    /* L I S T   A T M S */
    LIST_ATMS_LBL_1: 'Inactive',
    LIST_ATMS_LBL_2: 'Active',
    LIST_ATMS_LBL_3: 'Add a cashier to the list',
    LIST_ATMS_LBL_4: 'Cashiers',

    /* M E N U   W A L L E T */
    MENU_WALLET_LBL_1: 'Your wallet is valid for',
    MENU_WALLET_LBL_2: 'minutes',
    MENU_WALLET_LBL_3: 'Invalid QR, generates new one',
    MENU_WALLET_LBL_4: 'Show code',
    MENU_WALLET_LBL_5: 'Choose a payment method to top up your wallet',
    MENU_WALLET_LBL_6: 'Recharge without saving card',

    MENU_WALLET_LBL_7: 'My',
    MENU_WALLET_LBL_8: 'Transactions',
    MENU_WALLET_LBL_9: 'Cards',
    MENU_WALLET_LBL_10: 'Share',
    MENU_WALLET_LBL_11: '+ New card',
    MENU_WALLET_LBL_12: 'Wallet',
    MENU_WALLET_LBL_13: 'Recharge with OXXO',
    MENU_WALLET_LBL_14: 'Recharge with PAYNET',

    /* O X X O  M O D A L */
    OXXO_MODAL_LBL_1: 'Your reference for cash payment in OXXO stores is ready',
    OXXO_MODAL_LBL_2: 'You must pay:',
    OXXO_MODAL_LBL_3: 'You have a 48-hour period to make the payment.',
    OXXO_MODAL_LBL_4: 'OXXO will charge an additional commission at the time of payment.',
    OXXO_MODAL_LBL_5: 'INSTRUCTIONS',
    OXXO_MODAL_LBL_6: 'Go to the OXXO shop nearest you for payment',
    OXXO_MODAL_LBL_7: 'Mention that you will make a cash payment through',
    OXXO_MODAL_LBL_8: 'OXXO Pay',
    OXXO_MODAL_LBL_9: 'Displays the barcode to the cashier and verifies the information',
    OXXO_MODAL_LBL_10: 'Make your payment in cash',
    OXXO_MODAL_LBL_11: 'We will send you a confirmation e-mail',
    OXXO_MODAL_LBL_12: 'Payment information',

    /* P A Y N E T  M O D A L */

    PAYNET_MODAL_LBL_1: 'Your reference for paying cash in convenience stores is ready!',
    PAYNET_MODAL_LBL_2: 'You must pay:',
    PAYNET_MODAL_LBL_3: 'You have a 48 hours period to make the payment',
    PAYNET_MODAL_LBL_4: 'PAYNET will charge an additional commission at the time of payment',
    PAYNET_MODAL_LBL_5: 'INSTRUCTIONS',
    PAYNET_MODAL_LBL_6: 'Go to one of the different convenience stores to make payment',
    PAYNET_MODAL_LBL_7: 'Mention that you will make a cash payment through',
    PAYNET_MODAL_LBL_8: 'PAYNET',
    PAYNET_MODAL_LBL_9: 'Displays the barcode to the cashier and verifies the information',
    PAYNET_MODAL_LBL_10: 'Make your payment in cash',
    PAYNET_MODAL_LBL_11: 'We will send you a confirmation e-mail',

    /* M Y   P R O D U C T S*/
    MY_PRODUCTS_LBL_1: 'My Products',
    MY_PRODUCTS_LBL_2: 'Do you really want to edit this product?',

    /* P A Y M E N T   C U S T O M E R */
    PAYMENT_CUSTOMER_LBL_1: 'Scan QR',
    PAYMENT_CUSTOMER_LBL_2: 'Enter Code',
    PAYMENT_CUSTOMER_LBL_3: 'You have not yet scanned the stores QR code or enter the folio below.',
    PAYMENT_CUSTOMER_LBL_4: 'Enter the amount to transfer',
    PAYMENT_CUSTOMER_LBL_5: 'Payment to store',
    PAYMENT_CUSTOMER_LBL_6: 'Digital Wallet',

    /* R E C H A R G E */
    RECHARGE_LBL_1: 'Recharges',
    RECHARGE_LBL_2: 'Scan the users QR code',

    /* R E G I S T E R   A T M S */
    REGISTER_ATMS_LBL_1: 'In order to create an account we need the full name of the cashier',
    REGISTER_ATMS_LBL_2: 'Please enter an email address',
    REGISTER_ATMS_LBL_3: 'Now we need a password for the new cashier account',
    REGISTER_ATMS_LBL_4: 'What is the nationality of the new cashier?',
    REGISTER_ATMS_LBL_5: 'The cashier account has been created successfully!',
    REGISTER_ATMS_LBL_6: 'Cashier',

    /* R E G I S T E R   C O M P L E T E   R E C O R D */
    REGISTER_COMPLETE_RECORD_LBL_1: 'Please write them down!',
    REGISTER_COMPLETE_RECORD_LBL_2: 'Official ID number or passport',
    REGISTER_COMPLETE_RECORD_LBL_3: 'CURP',
    REGISTER_COMPLETE_RECORD_LBL_4: 'Optional',
    REGISTER_COMPLETE_RECORD_LBL_5: 'SISCOVIP number',
    REGISTER_COMPLETE_RECORD_LBL_6: 'Write your business address',
    REGISTER_COMPLETE_RECORD_LBL_7: 'Postal code',
    REGISTER_COMPLETE_RECORD_LBL_8: 'State',
    REGISTER_COMPLETE_RECORD_LBL_9: 'City',
    REGISTER_COMPLETE_RECORD_LBL_10: 'Colony',
    REGISTER_COMPLETE_RECORD_LBL_11: 'Street',
    REGISTER_COMPLETE_RECORD_LBL_12: 'No. outside',
    REGISTER_COMPLETE_RECORD_LBL_13: 'No. inside',

    REGISTER_COMPLETE_RECORD_LBL_14: 'Now we need the name of your organization and store name',
    REGISTER_COMPLETE_RECORD_LBL_15: 'If you dont have an organization, type the word none',
    REGISTER_COMPLETE_RECORD_LBL_16: 'Organization',
    REGISTER_COMPLETE_RECORD_LBL_17: 'What type of permission do you have?',
    REGISTER_COMPLETE_RECORD_LBL_18: 'To give you a better experience we need to know a little more',
    REGISTER_COMPLETE_RECORD_LBL_19: 'Tolerated',
    REGISTER_COMPLETE_RECORD_LBL_20: 'Credential',
    REGISTER_COMPLETE_RECORD_LBL_21: 'SISCOVIP',
    REGISTER_COMPLETE_RECORD_LBL_22: 'Other',
    REGISTER_COMPLETE_RECORD_LBL_23: 'What is the type of position?',
    REGISTER_COMPLETE_RECORD_LBL_24: 'To give you a better experience we need to know a little more',
    REGISTER_COMPLETE_RECORD_LBL_25: 'Fixed',
    REGISTER_COMPLETE_RECORD_LBL_26: 'Semi-fixed',
    REGISTER_COMPLETE_RECORD_LBL_27: 'Romería',
    REGISTER_COMPLETE_RECORD_LBL_28: 'When did you register the business?',
    REGISTER_COMPLETE_RECORD_LBL_29: 'How many years old is your business?',
    REGISTER_COMPLETE_RECORD_LBL_30: 'What is the line of business and sub giro?',
    REGISTER_COMPLETE_RECORD_LBL_31: 'To give you a better experience we need to know',
    REGISTER_COMPLETE_RECORD_LBL_32: 'Giro',
    REGISTER_COMPLETE_RECORD_LBL_33: 'Sub giro',
    REGISTER_COMPLETE_RECORD_LBL_34: 'Business hours',
    REGISTER_COMPLETE_RECORD_LBL_35: 'Please tell us your opening and closing hours',
    REGISTER_COMPLETE_RECORD_LBL_36: 'We know how important it is for everyone to register a safe business',
    REGISTER_COMPLETE_RECORD_LBL_37: 'Now we need some pictures!',
    REGISTER_COMPLETE_RECORD_LBL_38: 'Governmental ID',
    REGISTER_COMPLETE_RECORD_LBL_39: 'You can add your INE or your passport',
    REGISTER_COMPLETE_RECORD_LBL_40: 'Permit',
    REGISTER_COMPLETE_RECORD_LBL_41: 'The photo must be as clear and understandable as possible',
    REGISTER_COMPLETE_RECORD_LBL_42: 'Photograph of the business',
    REGISTER_COMPLETE_RECORD_LBL_43: 'The photo must be of the front of your business',
    REGISTER_COMPLETE_RECORD_LBL_44: 'Finally...',
    REGISTER_COMPLETE_RECORD_LBL_45: 'Approximately, what are the measurements in meters of the business?',
    REGISTER_COMPLETE_RECORD_LBL_46: 'width',
    REGISTER_COMPLETE_RECORD_LBL_47: 'high',
    REGISTER_COMPLETE_RECORD_LBL_48: 'long',
    REGISTER_COMPLETE_RECORD_LBL_49: 'Your information has been sent successfully!',
    REGISTER_COMPLETE_RECORD_LBL_50: 'We will activate your point of sale very soon',
    REGISTER_COMPLETE_RECORD_LBL_51: 'Store name',

    /* R E G I S T E R   E D I T */
    REGISTER_EDIT_LBL_1: 'Update Account',
    REGISTER_EDIT_LBL_2: 'Your account has been successfully updated!',

    /* S C A N N E R   Q R */
    SCANNER_QR_LBL_1: 'Scanning',

    /* S E R V I C E   T E L E V I S I O N */
    SERVICE_TELEVISION_LBL_1: 'Choose your company',
    SERVICE_TELEVISION_LBL_2: 'Now we need your cell phone number or service number',
    SERVICE_TELEVISION_LBL_3: 'Please scan or write it down!',
    SERVICE_TELEVISION_LBL_4: 'Service number',
    SERVICE_TELEVISION_LBL_5: 'Scan the barcode or qr code on your receipt/service',
    SERVICE_TELEVISION_LBL_6: 'To give you a better experience we need...',
    SERVICE_TELEVISION_LBL_7: 'Confirm that the following information is correct',
    SERVICE_TELEVISION_LBL_8: 'You must',

    SERVICE_TELEVISION_LBL_9: 'Choose a payment method',
    SERVICE_TELEVISION_LBL_10: 'Available balance',
    SERVICE_TELEVISION_LBL_11: 'You have no payment methods, please enter a new payment method or top up your wallet and try again',
    SERVICE_TELEVISION_LBL_12: 'ItzaPay® charges a fee for using the app',
    SERVICE_TELEVISION_LBL_13: 'Your payment has been processed successfully!',
    SERVICE_TELEVISION_LBL_14: 'Television Service',

    /* S E R V I C E   I N T E R N E T */
    SERVICE_INTERNET_LBL_1: 'Internet Service',

    /* S E R V I C E   R E C H A R G E */
    SERVICE_RECHARGE_LBL_1: 'We need your cell phone number',
    SERVICE_RECHARGE_LBL_2: 'Please repeat the cell phone number',
    SERVICE_RECHARGE_LBL_3: 'Now choose a recharge or a package',
    SERVICE_RECHARGE_LBL_4: 'Your recharge has been processed successfully!',
    SERVICE_RECHARGE_LBL_5: 'Recharge',

    /* S E R V I C E   P A Y M E N T */
    SERVICE_PAYMENT_LBL_1: 'Service',
    SERVICE_PAYMENT_LBL_2: 'We now need your TAG number',
    SERVICE_PAYMENT_LBL_3: 'TAG Number',
    SERVICE_PAYMENT_LBL_4: 'Cell phone number or service number',

    /* T R A N S F E R */
    TRANSFER_LBL_1: 'Now use your camera to scan the store’s QR code or enter the reference number',
    TRANSFER_LBL_2: 'Now use your camera to scan the other persons QR code or enter the reference',
    TRANSFER_LBL_3: 'Scan QR',
    TRANSFER_LBL_4: 'Enter Reference Number',
    TRANSFER_LBL_5: 'Scan Wallet QR',
    TRANSFER_LBL_6: 'Enter Reference',
    TRANSFER_LBL_7: 'You have not yet scanned the store’s QR code or entered the reference number',
    TRANSFER_LBL_8: 'You have not yet scanned the wallet’s QR code or entered the reference shared with you',
    TRANSFER_LBL_9: 'Click continue to enter the amount to pay',
    TRANSFER_LBL_10: 'Click continue to enter the amount to transfer',
    TRANSFER_LBL_11: 'Scan QR',
    TRANSFER_LBL_12: 'Transfer balance',
    TRANSFER_LBL_13: 'Payment at store',

    /*VIEW CARDS*/
    VIEW_CARDS_LBL_1: 'Stored Cards',
    VIEW_CARDS_LBL_2: 'Active',
    VIEW_CARDS_LBL_3: 'Inactive',

    /* M E N U   P A Y M E N T */
    MENU_PAYMENT_LBL_1: 'Pending Payment',
    MENU_PAYMENT_LBL_2: 'Payment at OXXO',
    MENU_PAYMENT_LBL_3: 'Exclusive to OXXO',
    MENU_PAYMENT_LBL_4: 'Generate receipt',
    MENU_PAYMENT_LBL_5: 'Payment at other stores',
    MENU_PAYMENT_LBL_6: 'Check stores',
    MENU_PAYMENT_LBL_7: 'Generate receipt',
    MENU_PAYMENT_LBL_8: 'Pay with your wallet. You still have',
    MENU_PAYMENT_LBL_9: 'Choose one of your cards',
    MENU_PAYMENT_LBL_10: 'Enter card details',
    MENU_PAYMENT_LBL_11: 'Account payment',

    /* P R I N C I P A L */
    PRINCIPAL_LBL_1: 'Hello',
    PRINCIPAL_LBL_2: 'Welcome to',
    PRINCIPAL_LBL_3: 'Balance',
    PRINCIPAL_LBL_4: 'History',
    PRINCIPAL_LBL_5: 'Transfer',
    PRINCIPAL_LBL_6: 'Payment',
    PRINCIPAL_LBL_7: 'Cards',
    PRINCIPAL_LBL_8: 'Your account is in the application process',
    PRINCIPAL_LBL_9: 'Please enter the required information for your business',
    PRINCIPAL_LBL_10: 'Your account is under verification',
    PRINCIPAL_LBL_11: 'You will soon receive a response regarding your application!',
    PRINCIPAL_LBL_12: 'Promotions and discounts',
    PRINCIPAL_LBL_13: 'See more',
    PRINCIPAL_LBL_14: 'Recharges and services',
    PRINCIPAL_LBL_15: 'Recharges',
    PRINCIPAL_LBL_16: 'Toll Tag',
    PRINCIPAL_LBL_17: 'Electricity',
    PRINCIPAL_LBL_18: 'Internet',
    PRINCIPAL_LBL_19: 'Water',
    PRINCIPAL_LBL_20: 'Television',
    PRINCIPAL_LBL_21: 'Mobile Plan',
    PRINCIPAL_LBL_22: 'News',

    /* L I T T L E   S H O P */
    LITTLE_SHOP_LBL_1: 'Enter the product name',
    LITTLE_SHOP_LBL_2: 'Enter the barcode',
    LITTLE_SHOP_LBL_3: 'Scan the barcode',
    LITTLE_SHOP_LBL_4: 'Total Products',
    LITTLE_SHOP_LBL_5: 'NOTE',
    LITTLE_SHOP_LBL_6: 'If the customer wishes to pay from their phone, they must scan their QR code or enter their reference number',
    LITTLE_SHOP_LBL_7: 'Show QR',
    LITTLE_SHOP_LBL_8: 'Scan again',
    LITTLE_SHOP_LBL_9: 'Insufficient Balance',
    LITTLE_SHOP_LBL_10: 'Charge now',
    LITTLE_SHOP_LBL_11: 'Store',
    LITTLE_SHOP_LBL_12: 'Product Catalog',

    CONNECTION: 'Please check your internet connection and try again!',
    CANCEL: 'Cancel',

    CONFIGMENU_CHANGE_LANGUAGE: 'Change language',
    REGISTER_STEP_ONE: 'To create an account, we need your full name',

    REGISTER_EDIT_STEP_ONE: 'To update your account, we need your full name',

    REGISTER_COMPLETE_RECORD_STEP_ONE: 'To complete your registration, we need the following information',

    YEAR: 'Year',
    MONTH: 'Month',

    MONTH_1: 'January',
    MONTH_2: 'February',
    MONTH_3: 'March',
    MONTH_4: 'April',
    MONTH_5: 'May',
    MONTH_6: 'June',
    MONTH_7: 'July',
    MONTH_8: 'August',
    MONTH_9: 'September',
    MONTH_10: 'October',
    MONTH_11: 'November',
    MONTH_12: 'December',

    DAY : 'Day',
    DAY_1 : 'Monday',
    DAY_2 : 'Tuesday',
    DAY_3 : 'Wednesday',
    DAY_4 : 'Thursday',
    DAY_5 : 'Friday',
    DAY_6 : 'Saturday',
    DAY_7 : 'Sunday',
    TO: 'to',

    BACK: 'Previous',
    NEXT: 'Next',
    START: 'Start',
    SKIP: 'Skip',
    CONTINUE: 'Continue',
    CREATE_ACCOUNT: 'Create account',
    CONGRATULATIONS: 'Congratulations',
    STORE: 'Store',
    CONFIRM: 'Confirm',
    SUCCESS: 'Success',
    CLOSE: 'Close',

    /* C A R D  N E W */

    CARD_NEW_JS_1: 'Please enter your name.',
    CARD_NEW_JS_2: 'You need a 16-digit card.',
    CARD_NEW_JS_3: 'Enter your expiration month, which is 2 digits.',
    CARD_NEW_JS_4: 'Enter your expiration year.',
    CARD_NEW_JS_5: 'Enter your CVC, which is 3 digits.',
    CARD_NEW_JS_6: 'Enter your email address.',
    CARD_NEW_JS_7: 'Enter your phone number, which is 10 digits.',
    CARD_NEW_JS_8: 'Please verify the card details and try again!',
    CARD_NEW_JS_9: 'Accept',

    /* C H A N G E  P A S S W O R D */

    CHANGE_PASSWORD_JS_1: 'The password confirmation does not match',
    CHANGE_PASSWORD_JS_2: 'Something went wrong, please check your internet connection',

    /* C O N F I G */

    CONFIG_JS_1: 'The password confirmation does not match',
    CONFIG_JS_2: 'Notice',
    CONFIG_JS_3: 'Please check your internet connection and try again!',

    /* C O N F I G  M E N U */

    CONFIG_MENU_JS_1: 'Account Deletion',
    CONFIG_MENU_JS_2: 'We are sorry to see you go, but please note that account deletion is irreversible',
    CONFIG_MENU_JS_3: 'Continue',
    CONFIG_MENU_JS_4: 'Cancel',
    CONFIG_MENU_JS_5: 'After the successful deletion of your account',
    CONFIG_MENU_JS_6: '® will continue to retain transactional data for administrative audit purposes.',
    CONFIG_MENU_JS_7: ' After the successful deletion of your account, you will not be able to log in with a deleted account or view the previous accounts history.',
    CONFIG_MENU_JS_8: '® reserves the right to deny future account creation requests.',
    CONFIG_MENU_JS_9: 'After the successful deletion of your account',
    CONFIG_MENU_JS_10: 'Confirmation',
    CONFIG_MENU_JS_11: 'Once deleted, this account will be logged out, and you will no longer be able to log in with this account.',
    CONFIG_MENU_JS_12: 'Proceed',
    CONFIG_MENU_JS_13: 'We have successfully deleted your account; we will miss you :)',
    CONFIG_MENU_JS_14: 'Accept',
    CONFIG_MENU_JS_15: 'No information to display',
    CONFIG_MENU_JS_16: 'Log Out',
    CONFIG_MENU_JS_17: 'Do you really wish to log out on this device?',

    /* D E V I C E  A C C E S S */

    DEVICE_ACCESS_JS_1: 'Do you really wish to unlink the device',
    DEVICE_ACCESS_JS_2: ' from your account?',
    DEVICE_ACCESS_JS_3: 'We have successfully unlinked the device from the account; we will miss you :)',

    /* L E G A L */

    LEGAL_JS_1: 'To use the apps features, you must accept the legal consent notice',
    LEGAL_JS_2: 'Try',
    LEGAL_JS_3: 'Exit',

    /* L I S T  A T M */

    LIST_ATM_JS_1: 'Do you really wish to ',
    LIST_ATM_JS_2: 'DEACTIVATE',
    LIST_ATM_JS_3: 'ACTIVATE',
    LIST_ATM_JS_4: ' the cashier?',
    LIST_ATM_JS_5: 'Yes, Continue',
    LIST_ATM_JS_6: 'We have changed the status of the cashier!',
    LIST_ATM_JS_7: 'Please try again!',

    /* L I T T L E  S H O P */

    LITTLE_SHOP_JS_1: 'Search',
    LITTLE_SHOP_JS_2: 'Enter the name of the desired product',
    LITTLE_SHOP_JS_3: 'Enter here',
    LITTLE_SHOP_JS_4: 'Search',
    LITTLE_SHOP_JS_5: 'Enter the product barcode',
    LITTLE_SHOP_JS_6: '¡This product ',
    LITTLE_SHOP_JS_7: ' is no longer in stock! Please notify the franchise manager to add more stock',
    LITTLE_SHOP_JS_8: ' is no longer available for sale!',
    LITTLE_SHOP_JS_9: 'The scanned barcode is invalid; please try with a correct one!',
    LITTLE_SHOP_JS_11: 'The product is already in the cart',
    LITTLE_SHOP_JS_12: 'Product added to the cart',
    LITTLE_SHOP_JS_13: 'Do you really wish to remove this product from the cart?',
    LITTLE_SHOP_JS_14: 'Yes, Remove',
    LITTLE_SHOP_JS_15: 'Added',
    LITTLE_SHOP_JS_16: 'Add',
    LITTLE_SHOP_JS_17: 'Insufficient balance',
    LITTLE_SHOP_JS_18: 'Do you really wish to process the payment for this sale? Please check that the order is correct',
    LITTLE_SHOP_JS_19: 'Yes, CHARGE',
    LITTLE_SHOP_JS_20: 'Insufficient balance',
    LITTLE_SHOP_JS_21: 'Do you really wish to leave the shop?',
    LITTLE_SHOP_JS_22: 'Yes, EXIT',
    LITTLE_SHOP_JS_23: 'Enter the customer code',
    LITTLE_SHOP_JS_24: 'Confirm',
    LITTLE_SHOP_JS_25: 'The entered code is invalid; please try with a correct one!',
    LITTLE_SHOP_JS_26: 'Do you wish to process the store payment?',
    LITTLE_SHOP_JS_27: 'YES, ACCEPT',
    LITTLE_SHOP_JS_28: 'DO NOT PROCESS',
    LITTLE_SHOP_JS_29: 'The payment is greater than the total for the products; do you wish to process the store payment?',
    LITTLE_SHOP_JS_30: 'The payment is less than the total for the products; do you wish to process the store payment?',
    LITTLE_SHOP_JS_31: 'No payment with that reference number exists; please try again!',
    LITTLE_SHOP_JS_32: 'Enter a folio!',

    /* M A I N  M E N U */

    MAIN_MENU_JS_1: 'Please wait a moment',

    /* M E N U  P A Y M E N T */

    MENU_PAYMENT_JS_1: 'Please select a concept :) !',
    MENU_PAYMENT_JS_2: 'Please enter the amount :) !',
    MENU_PAYMENT_JS_3: 'You have added a new concept to the team :)',
    MENU_PAYMENT_JS_4: 'IMPORTANT',
    MENU_PAYMENT_JS_5: 'Are you completely sure you want to proceed with this operation?',
    MENU_PAYMENT_JS_6: 'Please enter the amount to pay!',
    MENU_PAYMENT_JS_7: 'Do you wish to make the payment with this card?',
    MENU_PAYMENT_JS_8: 'Yes, Pay',

    /* M E N U  W A L L E T */

    MENU_WALLET_JS_1: 'Invalid, please generate a new one',
    MENU_WALLET_JS_2: 'Just copy this reference in the wallet section *',
    MENU_WALLET_JS_3: '* in the app *',
    MENU_WALLET_JS_4: '®*',
    MENU_WALLET_JS_5: 'Your code is: ',
    MENU_WALLET_JS_6: 'Please use the code appropriately!',
    MENU_WALLET_JS_7: 'Wallet updated :P!',
    MENU_WALLET_JS_8: 'Please try again later!',
    MENU_WALLET_JS_9: 'Do you wish to make the payment with this card? A bank fee will be charged for ',
    MENU_WALLET_JS_10: 'Please verify the card details and try again!',
    MENU_WALLET_JS_11: 'You do not yet have a history :(',
    MENU_WALLET_JS_12: 'Please try again later!',
    MENU_WALLET_JS_13: 'The deposit slip has been saved in your images :P',
    MENU_WALLET_JS_14: 'You can take a screenshot of the deposit slip :P',
    MENU_WALLET_JS_15: 'We could not generate your deposit slip; please try again later :)',

    /* P A Y M E N T  C U S T O M E R */

    PAYMENT_CUSTOMER_JS_1: 'Please enter the reference you were sent',
    PAYMENT_CUSTOMER_JS_2: 'The reference is invalid; please try with a correct one!',
    PAYMENT_CUSTOMER_JS_3: 'Do you really wish to proceed with the balance transfer from your wallet?',
    PAYMENT_CUSTOMER_JS_4: 'NO',
    PAYMENT_CUSTOMER_JS_5: 'Transfer successful',
    PAYMENT_CUSTOMER_JS_6: 'NOTICE!',

    /* R E C H A R G E */

    RECHARGE_JS_1: 'Please scan the user’s QR code!',
    RECHARGE_JS_2: 'Do you wish to reload the wallet?',
    RECHARGE_JS_3: 'Yes, RELOAD',
    RECHARGE_JS_4: 'Please enter the amount to pay!',

    /* R E G I S T E R  A T M S */

    REGISTER_ATMS_JS_1: 'Please enter a year later than ',
    REGISTER_ATMS_JS_2: 'Please enter a year earlier than ',
    REGISTER_ATMS_JS_3: 'Enter the name',
    REGISTER_ATMS_JS_4: 'Please enter the first name',
    REGISTER_ATMS_JS_5: 'Please enter the last name',
    REGISTER_ATMS_JS_6: 'Please enter the email address',
    REGISTER_ATMS_JS_7: 'Please enter the phone number',
    REGISTER_ATMS_JS_8: 'Please enter your password',
    REGISTER_ATMS_JS_9: 'Please re-enter your password',
    REGISTER_ATMS_JS_10: 'The passwords do not match; please re-enter your passwords',
    REGISTER_ATMS_JS_11: 'Do you really wish to create a cashier account?',
    REGISTER_ATMS_JS_12: 'Yes, Create',

    /* R E G I S T E R  C O M P L E T E */

    REGISTER_COMPLETE_JS_1: 'Do you wish to delete the schedule?',
    REGISTER_COMPLETE_JS_2: 'Yes, delete',
    REGISTER_COMPLETE_JS_3: 'Please enter your official identification',
    REGISTER_COMPLETE_JS_4: 'Please enter the postal code',
    REGISTER_COMPLETE_JS_5: 'Please enter the street name',
    REGISTER_COMPLETE_JS_6: 'Please enter the name of your organization',
    REGISTER_COMPLETE_JS_7: 'Please enter the registration date',
    REGISTER_COMPLETE_JS_8: 'Please enter how many years your business has been established',
    REGISTER_COMPLETE_JS_9: 'Please select your business hours',
    REGISTER_COMPLETE_JS_10: 'We need photographs of the documents and the business',
    REGISTER_COMPLETE_JS_11: 'Please enter your email address',
    REGISTER_COMPLETE_JS_12: 'Code sent!',
    REGISTER_COMPLETE_JS_13: 'Check your email inbox or spam folder',
    REGISTER_COMPLETE_JS_14: 'We were unable to send the verification code; please check that the information is correct',
    REGISTER_COMPLETE_JS_15: 'We need you to specify the approximate width of the business',
    REGISTER_COMPLETE_JS_16: 'We need you to specify the approximate height of the business',
    REGISTER_COMPLETE_JS_17: 'We need you to specify the approximate length of the business',
    REGISTER_COMPLETE_JS_18: 'Please enter your phone number',
    REGISTER_COMPLETE_JS_19: 'Please enter the name of your store',

    /* R E G I S T E R  E D I T */

    REGISTER_EDIT_JS_1: 'Enter your name',
    REGISTER_EDIT_JS_2: 'Please enter your first name',
    REGISTER_EDIT_JS_3: 'Please enter your last name',
    REGISTER_EDIT_JS_4: 'Please enter your year of birth',

    /* S C A N N E R  Q R */

    SCANNER_QR_JS_1: 'The scanned QR code is invalid, please try with a correct one!',
    SCANNER_QR_JS_2: 'Scan the QR code from your captain’s mobile phone',
    SCANNER_QR_JS_3: 'Scan the QR code from the mobile phone to be recharged',
    SCANNER_QR_JS_4: 'Scan the QR code from the wallet',
    SCANNER_QR_JS_5: 'Scan the QR code from the store',
    SCANNER_QR_JS_6: 'Scan the QR code from the other users mobile phone',
    SCANNER_QR_JS_7: 'Scan now',

    /* S E R V I C E */

    SERVICE_JS_1: 'Please enter your mobile number',
    SERVICE_JS_2: 'Please choose a payment method!',
    SERVICE_JS_3: 'Do you wish to proceed with the payment for your service?',
    SERVICE_JS_4: 'Yes, Proceed',
    SERVICE_JS_5: 'Please enter your mobile or service number',
    SERVICE_JS_6: 'Please enter your TAG number',
    SERVICE_JS_7: 'Do you wish to proceed with your recharge?',
    SERVICE_JS_8: 'Please re-enter your mobile number',
    SERVICE_JS_9: 'The mobile number is different',

    /* T R A N S F E R */

    TRANSFER_JS_1: 'Transfer',
    TRANSFER_JS_2: 'Payment',
    TRANSFER_JS_3: 'Enter the oficial store reference number',
    TRANSFER_JS_4: 'Enter the reference you were sent',
    TRANSFER_JS_5: 'The reference number is invalid, please try with a correct one!',
    TRANSFER_JS_6: 'The reference is invalid, please try with a correct one!',
    TRANSFER_JS_7: 'Store Payment',
    TRANSFER_JS_8: 'Balance Transfer',
    TRANSFER_JS_9: 'Do you really wish to proceed with the transaction? ',
    TRANSFER_JS_10: 'A bank fee will be charged for',
    TRANSFER_JS_11: 'Please enter the amount to pay!',

    /* V I E W  C A R D S */

    VIEW_CARDS_JS_1: 'Do you wish to DELETE this card?',
    VIEW_CARDS_JS_2: 'Yes, DELETE',
    VIEW_CARDS_JS_3: 'Do you really wish to ',
    VIEW_CARDS_JS_4: 'ACTIVATE',
    VIEW_CARDS_JS_5: 'DEACTIVATE',
    VIEW_CARDS_JS_6: ' your card?',
    VIEW_CARDS_JS_7: 'Yes, Continue',
    VIEW_CARDS_JS_8: 'Card successfully registered, you may now proceed with your payment. :)',

    /* P R I N C I P A L */

    PRINCIPAL_JS_1: 'The maximum wallet limit must be $9,000.00 MXN',
    PRINCIPAL_JS_2: 'The maximum wallet limit must be $25,000.00 MXN',
    PRINCIPAL_JS_3: 'All services are currently inactive.',
    PRINCIPAL_JS_4: 'More services will be available soon!',
    PRINCIPAL_JS_5: 'Please try again later!',
    PRINCIPAL_JS_6: 'Camera permission is required to scan.',
    PRINCIPAL_JS_7: 'Log Out',
    PRINCIPAL_JS_8: 'This device has been unlinked from ',
    PRINCIPAL_JS_9: '® by the account holder after multiple logins were detected on different devices.',
    PRINCIPAL_JS_10: 'Password Reset',
    PRINCIPAL_JS_11: 'We require you to change your password.',
    PRINCIPAL_JS_12: 'Your password has been successfully changed.',
    PRINCIPAL_JS_13: 'Your password must contain at least 6 characters. Please try again later.',
    PRINCIPAL_JS_14: 'Coming Soon!',
    PRINCIPAL_JS_15: 'Information has been updated!',

    /* N E W P R O D U C T */
    NEW_PRODUCT_LBL_1: 'In order to create a new product we need the full name of the product',
    NEW_PRODUCT_LBL_2: 'Category',
    NEW_PRODUCT_LBL_3: 'Pantry',
    NEW_PRODUCT_LBL_4: 'Bakery and Tortilleria',
    NEW_PRODUCT_LBL_5: 'Meats, Fish and Seafood',
    NEW_PRODUCT_LBL_6: 'Hardware and Cars',
    NEW_PRODUCT_LBL_7: 'Dairy',
    NEW_PRODUCT_LBL_8: 'Beer, Wine and Liquors',
    NEW_PRODUCT_LBL_9: 'Juices and Drinks',
    NEW_PRODUCT_LBL_10: 'Cleaning and Pets',
    NEW_PRODUCT_LBL_11: 'Deli',
    NEW_PRODUCT_LBL_12: 'Stationery',
    NEW_PRODUCT_LBL_13: 'Frozen',
    NEW_PRODUCT_LBL_14: 'Fruits and Vegetables',
    NEW_PRODUCT_LBL_15: 'Pharmacy',
    NEW_PRODUCT_LBL_16: 'Hygiene and Beauty',
    NEW_PRODUCT_LBL_17: 'Babies and Children',
    NEW_PRODUCT_LBL_18: 'Other',
    NEW_PRODUCT_LBL_19: 'Write the name of the product',
    NEW_PRODUCT_LBL_20: 'Barcode',
    NEW_PRODUCT_LBL_21: 'Write the barcode of the product',
    NEW_PRODUCT_LBL_22: 'If you do not have one, you can write your identifier without spaces',
    NEW_PRODUCT_LBL_23: 'A product is already registered with the barcode entered',
    NEW_PRODUCT_LBL_24: 'Now we need you to write the prices of the product',
    NEW_PRODUCT_LBL_25: 'List price',
    NEW_PRODUCT_LBL_26: 'Sale price',
    NEW_PRODUCT_LBL_27: 'We need them to generate your reports',
    NEW_PRODUCT_LBL_28: 'Write the list price',
    NEW_PRODUCT_LBL_29: 'Write the sale price',
    NEW_PRODUCT_LBL_30: 'The sale price must be higher than the list price',
    NEW_PRODUCT_LBL_31: 'Stock',
    NEW_PRODUCT_LBL_32: 'Packaging content/presentation',
    NEW_PRODUCT_LBL_33: 'Grams',
    NEW_PRODUCT_LBL_34: 'Milligrams',
    NEW_PRODUCT_LBL_35: 'Liter',
    NEW_PRODUCT_LBL_36: 'Milliliters',
    NEW_PRODUCT_LBL_37: 'Piece',
    NEW_PRODUCT_LBL_38: 'Kilograms',
    NEW_PRODUCT_LBL_39: 'Enter the stock',
    NEW_PRODUCT_LBL_40: 'Enter the quantity of the contents of the packaging/presentation',
    NEW_PRODUCT_LBL_41: 'Take a photo of the product as clear as possible',
    NEW_PRODUCT_LBL_42: 'Stock',
    NEW_PRODUCT_LBL_43: 'Add now',
    NEW_PRODUCT_LBL_44: 'Your product has been successfully created!',
    NEW_PRODUCT_LBL_45: 'New Product',

    /* P R O D U C T C A T A L O G */
    PRODUCT_CATALOG_LBL_1: 'Product Catalog',
    PRODUCT_CATALOG_LBL_2: 'Product Name or Code',
    PRODUCT_CATALOG_LBL_3: 'Product List',
    PRODUCT_CATALOG_LBL_4: 'Selected Product',
    PRODUCT_CATALOG_LBL_5: 'Confirm Products',
    PRODUCT_CATALOG_LBL_6: 'Add to List',
    PRODUCT_CATALOG_LBL_7: 'Remove',
    PRODUCT_CATALOG_LBL_8: 'Product Name',
    PRODUCT_CATALOG_LBL_9: 'Barcode',
    PRODUCT_CATALOG_LBL_10: 'Stock',
    PRODUCT_CATALOG_LBL_11: 'List Price',
    PRODUCT_CATALOG_LBL_12: 'Sale Price',
    PRODUCT_CATALOG_LBL_13: 'Measure',
    PRODUCT_CATALOG_LBL_14: 'Unit of measure',
    PRODUCT_CATALOG_LBL_15: 'Category',
    PRODUCT_CATALOG_LBL_16: 'Select',
    PRODUCT_CATALOG_LBL_17: 'Please enter the quantity of stock in warehouse',
    PRODUCT_CATALOG_LBL_18: 'Please enter the list price',
    PRODUCT_CATALOG_LBL_19: 'Please enter the sale price',
    PRODUCT_CATALOG_LBL_20: 'Enter the quantity of the contents of the packaging/presentation',
    PRODUCT_CATALOG_LBL_21: 'Please enter the unit of measure of the product',
    PRODUCT_CATALOG_LBL_22: 'The product is already exists in list',
    PRODUCT_CATALOG_LBL_23: 'Product added',
    PRODUCT_CATALOG_LBL_24: 'Product removed',
    PRODUCT_CATALOG_LBL_25: 'Add',
    PRODUCT_CATALOG_LBL_26: 'Confirmation',
    PRODUCT_CATALOG_LBL_27: 'Do you want to remove this product from your cart?',
    PRODUCT_CATALOG_LBL_28: 'Do you want to exit the product catalog?',
    PRODUCT_CATALOG_LBL_29: 'Exit',
    PRODUCT_CATALOG_LBL_30: 'Want to add these products to your store?',

    TYPE_ACCOUNT_1: 'Type Account',

    EXIT_APP: 'Do you want to exit the ItzaPay® mobile application?',

    CLIPBOARD: 'Content copied to clipboard',
    CLIPBOARD_ERROR: 'Copy error',
    COPY: 'Copy',

    SALES: 'Income',
    MENU: 'Menu',

    /* V I E W   D E T A I L   I T E M */
    VIEW_DETAIL_ITEM_LBL: 'Banking commission',
    VIEW_DETAIL_ITEM_LBL_0: 'Sub total',

  });

  // E S P A Ñ O L
  $translateProvider.translations('es', {

    INTERNET_ERROR : 'Upps! Lo siento... Algo salió mal. Se perdió la conexión a internet, vuelve a conectarte a internet e intenta nuevamente',
    INTERNET_SUCCESS: 'Por favor ¡intenta nuevamente!',

    // I N T R O
    INTRO_LBL_1: 'App oficial',
    INTRO_LBL_2: '¡Elige el idioma!',
    INTRO_LBL_3: 'Choose the language!',
    INTRO_LBL_4: 'Spanish',
    INTRO_LBL_5: 'Español',
    INTRO_LBL_6: 'English',
    INTRO_LBL_7: 'Inglés',
    INTRO_LBL_8: '¡Tecnología de cobro y pago avanzada!',
    INTRO_LBL_9: 'Realiza tus cobros y pagos de manera segura y rápida. Evita el uso de efectivo reduciendo riesgos. Obten tu punto de venta totalmente gratis, administración digital, conoce realmente tu negocio.',
    INTRO_LBL_10: '¡Empoderamiento de tu comercio!',
    INTRO_LBL_11: 'Capacitación sobre temas de negocio.',
    INTRO_LBL_12: 'Soporte con expertos.',
    INTRO_LBL_13: 'Ofrece cobro de servicios.',
    INTRO_LBL_14: 'Aumenta tus ventas y reduce costos administrativos.',
    INTRO_LBL_15: 'Genera Historial financiero y accede a créditos',
    INTRO_LBL_16: '¡ÚNETE!',

    // W E L C O M E
    WELCOME_LBL_1: 'Hola',
    WELCOME_LBL_2: 'Con ItzaPay® transforma tu forma de pagar, disfruta de la comodidad y seguridad de una billetera digital en su teléfono',
    WELCOME_LBL_3: 'Ingresa',
    WELCOME_LBL_4: 'Registrate',
    WELCOME_LBL_5: 'O empieza desde una red social',
    WELCOME_LBL_6: 'Crea una cuenta de negocio.',
    WELCOME_LBL_7: '¡Aquí!',

    // L O G I N
    LOGIN_LBL_1: 'Bienvenido',
    LOGIN_LBL_2: 'Inicia sesión para continuar',
    LOGIN_LBL_3: 'Usuario',
    LOGIN_LBL_4: 'Contraseña',
    LOGIN_LBL_5: 'Empezar ahora',
    LOGIN_LBL_6: '¿Olvidaste tu contraseña?',
    LOGIN_LBL_7: '¡Recuperala aquí!',
    LOGIN_LBL_8: '¿No tienes una cuenta?',
    LOGIN_LBL_9: '¡Crea una cuenta aquí!',
    LOGIN_LBL_10: 'Rescate de contraseña',
    LOGIN_LBL_11: '¿Con qué número de celular creaste tu cuenta?',
    LOGIN_LBL_12: 'Escribe aquí',
    LOGIN_LBL_13: 'Confirmar',
    LOGIN_LBL_14: 'Cancelar',
    LOGIN_LBL_15: 'Escribe tu contraseña',
    LOGIN_LBL_16: 'Escribe un número de celular válido',
    LOGIN_LBL_17: '¡Tu contraseña se envió al correo que registraste en tu cuenta!',
    LOGIN_LBL_18: '¡Verifica tu conexión a internet e intenta nuevamente!',
    LOGIN_LBL_19: '¡El número celular no existe en nuestros registros!',
    LOGIN_LBL_20: '¡Verifica tu conexión a internet e intenta nuevamente!',
    LOGIN_LBL_21: 'Es necesario escribir el número celular :)',
    LOGIN_LBL_22: '¡Reporta este error al ',
    LOGIN_LBL_23: 'Inválido genera uno nuevo',

    /* R E G I S T E R */
    REGISTER_LBL_1: '¡Por favor escríbelo!',
    REGISTER_LBL_2: 'Nombre',
    REGISTER_LBL_3: 'Apellido paterno',
    REGISTER_LBL_4: 'Apellido materno',
    REGISTER_LBL_5: 'Escribe tu cuenta de correo electrónico y solicita el código de verificación',
    REGISTER_LBL_6: 'Correo electrónico',
    REGISTER_LBL_7: 'Número de celular',
    REGISTER_LBL_8: 'Código de verificación',
    REGISTER_LBL_9: 'Obtener código',
    REGISTER_LBL_10: 'Ahora necesitamos una contraseña para tu nueva cuenta',
    REGISTER_LBL_11: 'Se requiere mínimo 6 caracteres',
    REGISTER_LBL_12: 'Repita su contraseña',
    REGISTER_LBL_13: '¿Cómo te identificas?',
    REGISTER_LBL_14: 'Para brindarte una mejor experiencia necesitamos saber tu género',
    REGISTER_LBL_15: 'Masculino',
    REGISTER_LBL_16: 'Femenino',
    REGISTER_LBL_17: 'No binario',
    REGISTER_LBL_18: 'Prefiero no revelar',
    REGISTER_LBL_19: '¿Cuándo es tu fecha de cumpleaños?',
    REGISTER_LBL_20: 'Queremos festejarte :)',
    REGISTER_LBL_21: '¿Cuál es tu nacionalidad?',
    REGISTER_LBL_22: 'Para brindarte una mejor experiencia necesitamos saberlo',
    REGISTER_LBL_23: 'Nacionalidad',
    REGISTER_LBL_24: 'Estado donde reside',
    REGISTER_LBL_25: '¡Tu cuenta ha sido creada satisfactoriamente!',
    REGISTER_LBL_26: 'Disfruta de nuestro servicio',
    REGISTER_LBL_27: 'Escriba un año superior a ',
    REGISTER_LBL_28: 'Escriba un año inferior a ',
    REGISTER_LBL_29: 'Escriba su correo electrónico',
    REGISTER_LBL_30: 'Escriba su número de teléfono',
    REGISTER_LBL_31: 'Escriba el código de verificación enviado a su correo electrónico',
    REGISTER_LBL_32: 'Las contraseñas no coinciden, por favor repita sus contraseñas',
    REGISTER_LBL_33: '¡Ya existe un usuario registrado con el número ',

    // A M O U N T
    AMOUNT_LBL_1: 'Actualmente cuentas con',
    AMOUNT_LBL_2: 'Monto del pago',

    // C A R D
    CARD_LBL_1: 'VALIDA HASTA',
    CARD_LBL_2: 'Nombre',
    CARD_LBL_3: 'Número de tarjeta',
    CARD_LBL_4: 'AAAA',
    CARD_LBL_5: '¡Pagar ahora!',
    CARD_LBL_6: 'Datos de la tarjeta',
    CARD_LBL_7: 'Apellidos',

    // C A R D   C U S T O M E R
    CARD_CUSTOMER_LBL_1: 'Agrega una tarjeta a tu cuenta',
    CARD_CUSTOMER_LBL_2: 'Crédito',
    CARD_CUSTOMER_LBL_3: 'Débito',
    CARD_CUSTOMER_LBL_4: 'Servicios',
    CARD_CUSTOMER_LBL_5: 'Mis tarjetas',

    // C O D E   A C C E S S
    CODE_ACCESS_LBL_1: 'Código de acceso único',
    CODE_ACCESS_LBL_2: 'Lo hemos enviado al correo registrado en la cuenta de ItzaPay®.',
    CODE_ACCESS_LBL_3: 'Tiene una validez de',
    CODE_ACCESS_LBL_4: 'minutos',
    CODE_ACCESS_LBL_5: 'Tiempo agotado...',
    CODE_ACCESS_LBL_6: '¡Por favor escribelo ahora!',
    CODE_ACCESS_LBL_7: '... solicita uno nuevo',
    CODE_ACCESS_LBL_8: 'aquí',

    // C O M P A N Y   A M O U N T S
    COMPANY_AMOUNTS_LBL_1: 'Subcategoría',
    COMPANY_AMOUNTS_LBL_2: 'Selecciona una',
    COMPANY_AMOUNTS_LBL_3: 'Compañía',

    // C O M P L E T E   P A Y M E N T   S T O R E
    COMPLETE_PAYMENT_STORE_LBL_1: '¡Gracias por su compra!',
    COMPLETE_PAYMENT_STORE_LBL_2: 'Dicte el siguiente folio al cajero o simplemente continue',

    // C O M P L E T E   R E C O R D
    COMPLETE_RECORD_LBL_1: 'Su cuenta se encuentra en proceso de solicitud',
    COMPLETE_RECORD_LBL_2: 'Por favor ingrese la información requerida de su negocio',
    COMPLETE_RECORD_LBL_3: 'Agregar',
    COMPLETE_RECORD_LBL_4: 'Su cuenta se encuentra en proceso de verificación',
    COMPLETE_RECORD_LBL_5: '¡Pronto recibirá respuesta sobre su solicitud!',

    /* E R R O R */
    ERROR_LBL_1: 'Error en la operación',
    ERROR_LBL_2: 'Tú pago sera devuelto enseguida',
    ERROR_LBL_3: 'Aceptar',

    /* H I S T O R Y */
    HISTORY_LBL_1: 'Recarga',
    HISTORY_LBL_2: 'Servicio',
    HISTORY_LBL_3: 'Pago con',
    HISTORY_LBL_4: 'Pago con tarjeta',
    HISTORY_LBL_5: 'Atendió',
    HISTORY_LBL_6: 'Para',
    HISTORY_LBL_7: 'Hola',
    HISTORY_LBL_8: 'Balance monedero',
    HISTORY_LBL_9: 'Transacciones recientes',
    HISTORY_LBL_10: 'Transacciones recientes',
    HISTORY_LBL_11: 'Mes anterior',
    HISTORY_LBL_12: 'Mes anterior',
    HISTORY_LBL_13: 'No hay resultados encontrados',

    /* P A Y M E N T   R E C H A R G E */
    PAYMENT_RECHARGE_LBL_1: 'Selecciona el método de pago',
    PAYMENT_RECHARGE_LBL_2: 'Saldo disponible',
    PAYMENT_RECHARGE_LBL_3: 'Digital',
    PAYMENT_RECHARGE_LBL_4: 'Métodos de pago',

    /* P R O D U C T S   L I S T */
    PRODUCTS_LIST_LBL_1: 'Coincidencias',

    /* Q R   S T O R E */
    QR_STORE_LBL_1: 'Escriba el folio que le dicte el cliente después del pago',

    /* S C A N N I N G   P R O D U C T */
    SCANNING_PRODUCT_LBL_1: 'Escanea el producto',

    /* S E R V I C E   L I S T */
    SERVICE_LIST_LBL_1: 'Elige Compañia',

    /* S U C C E S S   A D D   C A R D */
    SUCCESS_ADD_CARD_LBL_1: '¡Tarjeta agregada exitosamente!',
    SUCCESS_ADD_CARD_LBL_2: 'Gracias por agregar tu método de pago',

    /* S U C C E S S   D E L E T E D   C A R D */
    SUCCESS_DELETED_CARD_LBL_1: '¡Tarjeta eliminada exitosamente!',
    SUCCESS_DELETED_CARD_LBL_2: 'Gracias, tu método de pago se ha eliminado de nuestros registros completamente',

    /* S U C C E S S   P A Y M E N T */
    SUCCESS_PAYMENT_LBL_1: '¡La operación se realizó exitosamente!',
    SUCCESS_PAYMENT_LBL_2: 'Gracias por tu pago',

    /* T A K E P I C T U R E */
    TAKE_PICTURE_LBL_1: 'Cambiar avatar',
    TAKE_PICTURE_LBL_2: 'Fotos',
    TAKE_PICTURE_LBL_3: 'Camara',

    /* T I M E   P I C K E R */
    TIME_PICKER_LBL_1: 'Horario para el día',
    TIME_PICKER_LBL_2: 'Hr de apertura',
    TIME_PICKER_LBL_3: 'Hr de cierre',

    /* T Y P E   P A Y M E N T */
    TYPE_PAYMENT_LBL_1: 'Elija una opción de cobro',
    TYPE_PAYMENT_LBL_2: 'Busqueda Manual',
    TYPE_PAYMENT_LBL_3: 'Escanear Codigo QR',

    /* V I E W   D E T A I L   I T E M */
    VIEW_DETAIL_ITEM_LBL_1: 'Total',
    VIEW_DETAIL_ITEM_LBL_2: 'Pago con tarjeta de crédito',
    VIEW_DETAIL_ITEM_LBL_3: 'Pago con tarjeta de débito',
    VIEW_DETAIL_ITEM_LBL_4: 'Pago con tarjeta de servicios',
    VIEW_DETAIL_ITEM_LBL_5: 'Referencia',

    /* B L O G */
    BLOG_LBL_1: 'Detalle',

    /* B L O G   L I S T */
    BLOG_LIST_LBL_1: 'Ver más',
    BLOG_LIST_LBL_2: 'Promociones y descuentos',
    BLOG_LIST_LBL_3: 'Noticias',

    /* C A R D   N E W */
    CARD_NEW_LBL_1: 'Teléfono',
    CARD_NEW_LBL_2: 'Agregar tarjeta',
    CARD_NEW_LBL_3: 'Nueva tarjeta',
    CARD_NEW_LBL_4: 'Correo electrónico',

    /* C H A N G E   P A S S W O R D */
    CHANGE_PASSWORD_LBL_1: 'Configurar su contraseña',
    CHANGE_PASSWORD_LBL_2: 'Siga las instrucciones a continuación',
    CHANGE_PASSWORD_LBL_3: 'Minúscula',
    CHANGE_PASSWORD_LBL_4: 'Mayúscula',
    CHANGE_PASSWORD_LBL_5: 'Número',
    CHANGE_PASSWORD_LBL_6: 'Caracteres',
    CHANGE_PASSWORD_LBL_7: 'Inicia creando una contraseña',
    CHANGE_PASSWORD_LBL_8: 'Confirmar su contraseña',
    CHANGE_PASSWORD_LBL_9: 'Repita la contraseña',
    CHANGE_PASSWORD_LBL_10: 'Cambiar ahora',
    CHANGE_PASSWORD_LBL_11: '¡Su contraseña ha sido configurada satisfactoriamente!',

    /* C O M M E N T S */
    COMMENTS_LBL_1: 'Escriba sus comentarios',
    COMMENTS_LBL_2: 'Gracias por dedicar tiempo a enviarnos sus comentarios.',
    COMMENTS_LBL_3: 'Enviar ahora',
    COMMENTS_LBL_4: 'Gracias por tus comentarios',
    COMMENTS_LBL_5: '¡Aunque no podemos revisar todo lo que recibimos y responder, sí usamos los comentarios como el tuyo para mejorar la experiencia de ItzaPay® para todas las personas!',

    /* C O N F I G */
    CONFIG_LBL_1: 'Miembro desde',
    CONFIG_LBL_2: 'Usuario',
    CONFIG_LBL_3: 'Perfil',
    CONFIG_LBL_4: 'Admin',
    CONFIG_LBL_5: 'Cliente',
    CONFIG_LBL_6: 'Cajero',
    CONFIG_LBL_7: 'Comercio',
    CONFIG_LBL_8: 'Configurar contraseña',

    /* C O N F I G   M E N U */
    CONFIG_MENU_LBL_1: 'Mi perfíl',
    CONFIG_MENU_LBL_2: 'Dispositivos vinculados',
    CONFIG_MENU_LBL_3: 'Envíanos un comentario',
    CONFIG_MENU_LBL_4: 'Ayuda',
    CONFIG_MENU_LBL_5: 'Solicitar la eliminación de la cuenta',
    CONFIG_MENU_LBL_6: 'Versión',
    CONFIG_MENU_LBL_7: 'Cerrar sesión',
    CONFIG_MENU_LBL_8: 'Configuración',
    CONFIG_MENU_LBL_9: 'Datos Bancarios',

    /* D A T A  B A N K */
    DATA_BANK_LBL_1: 'Por favor ingresa tus datos bancarios',
    DATA_BANK_LBL_2: 'Pulsa en el boton de continuar',
    DATA_BANK_LBL_3: 'Continuar',
    DATA_BANK_LBL_4: 'Ingresa los siguientes datos',
    DATA_BANK_LBL_5: 'Nombre de la institución bancaria',
    DATA_BANK_LBL_6: 'Clabe interbancaria',
    DATA_BANK_LBL_7: 'Confirmar datos',
    DATA_BANK_LBL_8: 'Editar datos',
    DATA_BANK_LBL_9: 'Por favor ingresa el nombre completo del titular de la cuenta',
    DATA_BANK_LBL_10: 'Por favor ingresa el apellido paterno del titular de la cuenta',
    DATA_BANK_LBL_11: 'Por favor ingresa el apellido materno del titular de la cuenta',
    DATA_BANK_LBL_12: 'Por favor ingresa el nombre de la institución bancaria',
    DATA_BANK_LBL_13: 'Por favor ingresa la clabe interbancaria',
    DATA_BANK_LBL_14: 'Nombre completo del titular de la cuenta',
    DATA_BANK_LBL_15: 'Apellido paterno del titular de la cuenta',
    DATA_BANK_LBL_16: 'Apellido materno del titular de la cuenta',
    DATA_BANK_LBL_19: 'La clabe interbancaria debe de ser de 18 dígitos',
    DATA_BANK_LBL_20: 'Selecciona',
    DATA_BANK_LBL_21: '¿Desea realmente ingresar estos datos a su usuario?',
    DATA_BANK_LBL_22: 'Confirmar',
    DATA_BANK_LBL_23: 'Aceptar',

    /* D E V I C E   A C C E S S */
    DEVICE_ACCESS_LBL_1: 'Elije el dispositivo que deseas desvincular de tu cuenta',
    DEVICE_ACCESS_LBL_2: 'Dispositivos vinculados',

    /* L E G A L */
    LEGAL_LBL_1: 'Consentimiento',
    LEGAL_LBL_2: 'by',
    LEGAL_LBL_3: 'Aceptar y continuar',
    LEGAL_LBL_4: 'No acepto',
    LEGAL_LBL_5: 'Legal',
    LEGAL_LBL_6: 'Los datos personales recabados serán protegidos, incorporados y tratados en los Sistema de Datos Personales de ItzaPay®, ' +
    'mismos que tienen su fundamento en la Ley de Protección de Datos Personales para la Ciudad de México Artículos 7, 8, 9, 13, 14 y 15, ' +
    'Ley de Transparencia y Acceso a la información Pública de la Ciudad de México, Artículos 36 y 38 fracción I y IV, ' +
    'Ley de Archivos de la Ciudad de México Artículos 30 fracción VI y VII, 31, 32, 33, 34, 35 fracción VIII, 37, 38 y 40, ' +
    'Reglamento de la Ley de Transparencia y Acceso a la Información Pública de la Ciudad de México Artículos 23, 30 al 32, ' +
    'Lineamientos para la Protección de Datos Personales en la Ciudad de México, Numerales 5, 10, 11 y 13.',
    LEGAL_LBL_7: 'Los datos requeridos son obligatorios y sin ellos no podrán completarse las gestiones pertinentes para brindar los servicios solicitados.',
    LEGAL_LBL_8: 'Asimismo, se le informa que sus datos no podrán ser difundidos sin su consentimiento expreso, salvo las excepciones previstas en la Ley.',
    LEGAL_LBL_9: 'El responsable del Sistema de datos personales es Genio Inventico SAPI de CV. y la dirección de correo donde podrá ejercer los derechos de acceso, ' +
    'rectificación, cancelación y oposición, así como la revocación del consentimiento es {{ EMAIL }}.',
    LEGAL_LBL_10: 'El interesado podrá dirigirse al Instituto de Acceso a la Información Pública de la Ciudad de México, donde recibirá asesoría sobre los derechos ' +
    'que tutela la Ley de Protección de Datos Personales para la Ciudad de México al teléfono: 5636-4636; correo electrónico: ' +
    'datos.personales@infodf.org.mx o www.infodf.org.mx.',

    /* L I S T   A T M S */
    LIST_ATMS_LBL_1: 'Inactivo',
    LIST_ATMS_LBL_2: 'Activo',
    LIST_ATMS_LBL_3: 'Agrega un cajero a la lista',
    LIST_ATMS_LBL_4: 'Cajeros',

    /* M E N U   W A L L E T */
    MENU_WALLET_LBL_1: 'Tu wallet tiene una validez de',
    MENU_WALLET_LBL_2: 'minutos',
    MENU_WALLET_LBL_3: 'QR invalido, genera uno nuevo',
    MENU_WALLET_LBL_4: 'Mostrar código',
    MENU_WALLET_LBL_5: 'Elige una forma de pago para recargar tu monedero',
    MENU_WALLET_LBL_6: 'Recarga sin guardar tarjeta',
    MENU_WALLET_LBL_7: 'Mis',
    MENU_WALLET_LBL_8: 'movimientos',
    MENU_WALLET_LBL_9: 'tarjetas',
    MENU_WALLET_LBL_10: 'Compartir',
    MENU_WALLET_LBL_11: '+ Nueva tarjeta',
    MENU_WALLET_LBL_12: 'Monedero',
    MENU_WALLET_LBL_13: 'Recarga con OXXO',
    MENU_WALLET_LBL_14: 'Recarga con PAYNET',

    /* O X X O  M O D A L */

    OXXO_MODAL_LBL_1: 'Tu referencia para pagar en efectivo en Tiendas OXXO está lista',
    OXXO_MODAL_LBL_2: 'Debes pagar:',
    OXXO_MODAL_LBL_3: 'Tienes un lapso de 48 hrs para realizar el pago.',
    OXXO_MODAL_LBL_4: 'OXXO cobrará una comisión adicional al momento de realizar el pago.',
    OXXO_MODAL_LBL_5: 'INSTRUCCIONES',
    OXXO_MODAL_LBL_6: 'Ve a la tienda OXXO más cercana a ti para realizar el pago',
    OXXO_MODAL_LBL_7: 'Menciona que harás un pago en efectivo a través de',
    OXXO_MODAL_LBL_8: 'OXXO Pay',
    OXXO_MODAL_LBL_9: 'Muestra al cajero el código de barras y verifica la información',
    OXXO_MODAL_LBL_10: 'Realiza tu pago en efectivo',
    OXXO_MODAL_LBL_11: 'Te enviaremos un correo electrónico de confirmación',
    OXXO_MODAL_LBL_12: 'Información del pago',

    /* P A Y N E T  M O D A L */

    PAYNET_MODAL_LBL_1: '¡Tu referencia para pagar en efectivo en Tiendas de Conveniencia está lista!',
    PAYNET_MODAL_LBL_2: 'Debes pagar:',
    PAYNET_MODAL_LBL_3: 'Tienes un lapso de 48 hrs para realizar el pago',
    PAYNET_MODAL_LBL_4: 'PAYNET cobrará una comisión adicional al momento de realizar el pago',
    PAYNET_MODAL_LBL_5: 'INSTRUCCIONES',
    PAYNET_MODAL_LBL_6: 'Ve a una de las diferentes tiendas de conveniencia para realizar el pago',
    PAYNET_MODAL_LBL_7: 'Menciona que harás un pago en efectivo a través de',
    PAYNET_MODAL_LBL_8: 'PAYNET',
    PAYNET_MODAL_LBL_9: 'Muestra al cajero el código de barras y verifica la información',
    PAYNET_MODAL_LBL_10: 'Realiza tu pago en efectivo',
    PAYNET_MODAL_LBL_11: 'Te enviaremos un correo electrónico de confirmación',

    /* M Y   P R O D U C T S*/
    MY_PRODUCTS_LBL_1: 'Mis Productos',
    MY_PRODUCTS_LBL_2: '¿Desea realmente editar este producto?',

    /* P A Y M E N T   C U S T O M E R */
    PAYMENT_CUSTOMER_LBL_1: 'Escanea QR',
    PAYMENT_CUSTOMER_LBL_2: 'Ingresar Código',
    PAYMENT_CUSTOMER_LBL_3: 'Aún no escaneas el código QR de la tienda o ingresa el folio que se encuentra debajo.',
    PAYMENT_CUSTOMER_LBL_4: 'Escribe la cantidad a transferir',
    PAYMENT_CUSTOMER_LBL_5: 'Pago a tienda',
    PAYMENT_CUSTOMER_LBL_6: 'Wallet Digital',

    /* R E C H A R G E */
    RECHARGE_LBL_1: 'Recargas',
    RECHARGE_LBL_2: 'Escanea el código QR del usuario',

    /* R E G I S T E R   A T M S */
    REGISTER_ATMS_LBL_1: 'Para poder crear una cuenta necesitamos el nombre completo del cajero',
    REGISTER_ATMS_LBL_2: 'Escribe una cuenta de correo electrónico',
    REGISTER_ATMS_LBL_3: 'Ahora necesitamos una contraseña para la nueva cuenta del cajero',
    REGISTER_ATMS_LBL_4: '¿Cuál es la nacionalidad del nuevo cajero?',
    REGISTER_ATMS_LBL_5: '¡La cuenta del cajero ha sido creada satisfactoriamente!',
    REGISTER_ATMS_LBL_6: 'Cajero',

    /* R E G I S T E R   C O M P L E T E   R E C O R D */
    REGISTER_COMPLETE_RECORD_LBL_1: '¡Por favor escríbalos!',
    REGISTER_COMPLETE_RECORD_LBL_2: 'Número de identificación oficial o pasaporte',
    REGISTER_COMPLETE_RECORD_LBL_3: 'CURP',
    REGISTER_COMPLETE_RECORD_LBL_4: 'Opcional',
    REGISTER_COMPLETE_RECORD_LBL_5: 'Número de SISCOVIP',
    REGISTER_COMPLETE_RECORD_LBL_6: 'Escribe la dirección de tu negocio',
    REGISTER_COMPLETE_RECORD_LBL_7: 'Código postal',
    REGISTER_COMPLETE_RECORD_LBL_8: 'Estado',
    REGISTER_COMPLETE_RECORD_LBL_9: 'Ciudad',
    REGISTER_COMPLETE_RECORD_LBL_10: 'Colonia',
    REGISTER_COMPLETE_RECORD_LBL_11: 'Calle',
    REGISTER_COMPLETE_RECORD_LBL_12: 'No. exterior',
    REGISTER_COMPLETE_RECORD_LBL_13: 'No. interior',

    REGISTER_COMPLETE_RECORD_LBL_14: 'Ahora necesitamos el nombre de tu organización y el nombre de la tienda',
    REGISTER_COMPLETE_RECORD_LBL_15: 'Si no cuentas con una organización escribe la palabra ninguna',
    REGISTER_COMPLETE_RECORD_LBL_16: 'Organización',
    REGISTER_COMPLETE_RECORD_LBL_17: '¿Cuál es el tipo de permiso con el que cuentas?',
    REGISTER_COMPLETE_RECORD_LBL_18: 'Para brindarte una mejor experiencia necesitamos saber un poco más',
    REGISTER_COMPLETE_RECORD_LBL_19: 'Tolerado',
    REGISTER_COMPLETE_RECORD_LBL_20: 'Credencial',
    REGISTER_COMPLETE_RECORD_LBL_21: 'SISCOVIP',
    REGISTER_COMPLETE_RECORD_LBL_22: 'Otro',
    REGISTER_COMPLETE_RECORD_LBL_23: '¿Cuál es el tipo de puesto?',
    REGISTER_COMPLETE_RECORD_LBL_24: 'Para brindarte una mejor experiencia necesitamos saber un poco más',
    REGISTER_COMPLETE_RECORD_LBL_25: 'Fijo',
    REGISTER_COMPLETE_RECORD_LBL_26: 'Semifijo',
    REGISTER_COMPLETE_RECORD_LBL_27: 'Romería',
    REGISTER_COMPLETE_RECORD_LBL_28: '¿Cuándo registró el negocio?',
    REGISTER_COMPLETE_RECORD_LBL_29: '¿Cuántos años de antigüedad tiene tu negocio?',
    REGISTER_COMPLETE_RECORD_LBL_30: '¿Cuál es el giro y subgiro?',
    REGISTER_COMPLETE_RECORD_LBL_31: 'Para brindarte una mejor experiencia necesitamos saberlo',
    REGISTER_COMPLETE_RECORD_LBL_32: 'Giro',
    REGISTER_COMPLETE_RECORD_LBL_33: 'Sub giro',
    REGISTER_COMPLETE_RECORD_LBL_34: 'Horarios del negocio',
    REGISTER_COMPLETE_RECORD_LBL_35: 'Indícanos cuáles son los horarios de apertura y cierre',
    REGISTER_COMPLETE_RECORD_LBL_36: 'Sabemos lo importante que es para todos registrar un negocio seguro',
    REGISTER_COMPLETE_RECORD_LBL_37: '¡Ahora necesitamos algunas fotografías!',
    REGISTER_COMPLETE_RECORD_LBL_38: 'Identificación oficial',
    REGISTER_COMPLETE_RECORD_LBL_39: 'Puede agregar su INE o su pasaporte',
    REGISTER_COMPLETE_RECORD_LBL_40: 'Permiso',
    REGISTER_COMPLETE_RECORD_LBL_41: 'La fotografía debe ser lo más clara y entendible',
    REGISTER_COMPLETE_RECORD_LBL_42: 'Fotografía del negocio',
    REGISTER_COMPLETE_RECORD_LBL_43: 'La fotografía debe ser el frente de su negocio',
    REGISTER_COMPLETE_RECORD_LBL_44: 'Por último...',
    REGISTER_COMPLETE_RECORD_LBL_45: 'Apróximadamente, ¿cuáles son las medidas en metros del negocio?',
    REGISTER_COMPLETE_RECORD_LBL_46: 'ancho',
    REGISTER_COMPLETE_RECORD_LBL_47: 'alto',
    REGISTER_COMPLETE_RECORD_LBL_48: 'largo',
    REGISTER_COMPLETE_RECORD_LBL_49: '¡Se ha enviado su información satisfactoriamente!',
    REGISTER_COMPLETE_RECORD_LBL_50: 'Muy pronto activaremos tu punto de venta',
    REGISTER_COMPLETE_RECORD_LBL_51: 'Nombre del negocio',

    /* R E G I S T E R   E D I T */
    REGISTER_EDIT_LBL_1: 'Actualizar cuenta',
    REGISTER_EDIT_LBL_2: '¡Tu cuenta ha sido actualizada satisfactoriamente!',

    /* S C A N N E R   Q R */
    SCANNER_QR_LBL_1: 'Escaneando',

    /* S E R V I C E   T E L E V I S I O N */
    SERVICE_TELEVISION_LBL_1: 'Elije tu compañía',
    SERVICE_TELEVISION_LBL_2: 'Ahora necesitamos tu número de celular o número de servicio',
    SERVICE_TELEVISION_LBL_3: '¡Por favor escanéalo o escríbalo!',
    SERVICE_TELEVISION_LBL_4: 'Número de servicio',
    SERVICE_TELEVISION_LBL_5: 'Escanéa el código de barras o qr de tu recibo/servicio',
    SERVICE_TELEVISION_LBL_6: 'Para brindarte una mejor experiencia necesitamos...',
    SERVICE_TELEVISION_LBL_7: 'Que confirmes que la siguiente información es correcta',
    SERVICE_TELEVISION_LBL_8: 'Debes',

    SERVICE_TELEVISION_LBL_9: 'Elija una forma de pago',
    SERVICE_TELEVISION_LBL_10: 'Saldo disponible',
    SERVICE_TELEVISION_LBL_11: 'No tiene medios de pago, por favor ingrese un nuevo medio de pago o realice una recarga a su wallet y vuelva a intentar',
    SERVICE_TELEVISION_LBL_12: 'ItzaPay® cobra una comisión por uso de la app de',
    SERVICE_TELEVISION_LBL_13: '¡Tu pago ha sido procesado satisfactoriamente!',
    SERVICE_TELEVISION_LBL_14: 'Servicio Televisión',

    /* S E R V I C E   I N T E R N E T */
    SERVICE_INTERNET_LBL_1: 'Servicio Internet',

    /* S E R V I C E   R E C H A R G E */
    SERVICE_RECHARGE_LBL_1: 'Necesitamos tu número de celular',
    SERVICE_RECHARGE_LBL_2: 'Repita el número de celular',
    SERVICE_RECHARGE_LBL_3: 'Ahora elije una recarga o un paquete',
    SERVICE_RECHARGE_LBL_4: '¡Tu recarga ha sido procesada satisfactoriamente!',
    SERVICE_RECHARGE_LBL_5: 'Recarga',

    /* S E R V I C E   P A Y M E N T */
    SERVICE_PAYMENT_LBL_1: 'Servicio',
    SERVICE_PAYMENT_LBL_2: 'Ahora necesitamos tu número de TAG',
    SERVICE_PAYMENT_LBL_3: 'Número de TAG',
    SERVICE_PAYMENT_LBL_4: 'Número de celular o servicio',

    /* T R A N S F E R */
    TRANSFER_LBL_1: 'Ahora usa tu cámara para escanear el código QR de la tienda o escribe el folio',
    TRANSFER_LBL_2: 'Ahora usa tu cámara para escanear el código QR de la otra persona o escribe la referencia',
    TRANSFER_LBL_3: 'Escanea QR',
    TRANSFER_LBL_4: 'Ingresar Folio',
    TRANSFER_LBL_5: 'Escanea Wallet QR',
    TRANSFER_LBL_6: 'Ingresar Referencia',
    TRANSFER_LBL_7: 'Aún no escaneas el código QR de la tienda o ingresa el folio',
    TRANSFER_LBL_8: 'Aún no escaneas el código QR del monedero o ingresa la referencia que te compartieron',
    TRANSFER_LBL_9: 'Pulse en continuar para escribir el monto a pagar',
    TRANSFER_LBL_10: 'Pulse en continuar para escribir el monto a transferir',
    TRANSFER_LBL_11: 'Escanea QR',
    TRANSFER_LBL_12: 'Transferir saldo',
    TRANSFER_LBL_13: 'Pago a tienda',

    /*VIEW CARDS*/
    VIEW_CARDS_LBL_1: 'Tarjetas almacenadas',
    VIEW_CARDS_LBL_2: 'Activa',
    VIEW_CARDS_LBL_3: 'Inactiva',

    /* M E N U   P A Y M E N T */
    MENU_PAYMENT_LBL_1: 'Pendiente por pagar',
    MENU_PAYMENT_LBL_2: 'Pago en OXXO',
    MENU_PAYMENT_LBL_3: 'Exclusivo para OXXO',
    MENU_PAYMENT_LBL_4: 'Generar ficha',
    MENU_PAYMENT_LBL_5: 'Pago en otras tiendas',
    MENU_PAYMENT_LBL_6: 'Consultar tiendas',
    MENU_PAYMENT_LBL_7: 'Generar ficha',
    MENU_PAYMENT_LBL_8: 'Paga con tu monedero. Aún tienes',
    MENU_PAYMENT_LBL_9: 'Elige una de tus tarjeta',
    MENU_PAYMENT_LBL_10: 'Ingresa los datos de una tarjeta',
    MENU_PAYMENT_LBL_11: 'Pago de cuenta',

    /* P R I N C I P A L */
    PRINCIPAL_LBL_1: 'Hola',
    PRINCIPAL_LBL_2: 'Bienvenido a',
    PRINCIPAL_LBL_3: 'Balance',
    PRINCIPAL_LBL_4: 'Historial',
    PRINCIPAL_LBL_5: 'Transferir',
    PRINCIPAL_LBL_6: 'Pago',
    PRINCIPAL_LBL_7: 'Tarjetas',
    PRINCIPAL_LBL_8: 'Su cuenta se encuentra en proceso de solicitud',
    PRINCIPAL_LBL_9: 'Por favor ingrese la información requerida de su negocio',
    PRINCIPAL_LBL_10: 'Su cuenta se encuentra en proceso de verificación',
    PRINCIPAL_LBL_11: '¡Pronto recibirá respuesta sobre su solicitud!',
    PRINCIPAL_LBL_12: 'Promociones y descuentos',
    PRINCIPAL_LBL_13: 'Ver más',
    PRINCIPAL_LBL_14: 'Recargas y servicios',
    PRINCIPAL_LBL_15: 'Recarga',
    PRINCIPAL_LBL_16: 'Tag',
    PRINCIPAL_LBL_17: 'Luz',
    PRINCIPAL_LBL_18: 'Internet',
    PRINCIPAL_LBL_19: 'Agua',
    PRINCIPAL_LBL_20: 'Televisión',
    PRINCIPAL_LBL_21: 'Plan Celular',
    PRINCIPAL_LBL_22: 'Noticias',

    /* L I T T L E   S H O P */
    LITTLE_SHOP_LBL_1: 'Escribe el nombre del producto',
    LITTLE_SHOP_LBL_2: 'Escribe el código de barras',
    LITTLE_SHOP_LBL_3: 'Escanea el código de barras',
    LITTLE_SHOP_LBL_4: 'Total Productos',
    LITTLE_SHOP_LBL_5: 'NOTA',
    LITTLE_SHOP_LBL_6: 'Si el cliente desea pagar desde su celular debe escanear su código QR o escribir su folio',
    LITTLE_SHOP_LBL_7: 'Mostrar QR',
    LITTLE_SHOP_LBL_8: 'Escanear de nuevo',
    LITTLE_SHOP_LBL_9: 'Saldo Insuficiente',
    LITTLE_SHOP_LBL_10: 'Cobrar ahora',
    LITTLE_SHOP_LBL_11: 'Tiendita',
    LITTLE_SHOP_LBL_12: 'Catalogo de Productos',

    CONNECTION: '¡Verifica tu conexión a internet e intenta nuevamente!',
    CANCEL: 'Cancelar',

    CONFIGMENU_CHANGE_LANGUAGE: 'Cambiar idioma',
    REGISTER_STEP_ONE: 'Para poder crear una cuenta necesitamos tu nombre completo',

    REGISTER_EDIT_STEP_ONE: 'Para actualizar tu cuenta necesitamos tu nombre completo',

    REGISTER_COMPLETE_RECORD_STEP_ONE: 'Para poder completar tu registro necesitamos los siguientes datos',

    YEAR: 'Año',
    MONTH: 'Mes',

    MONTH_1: 'Enero',
    MONTH_2: 'Febrero',
    MONTH_3: 'Marzo',
    MONTH_4: 'Abril',
    MONTH_5: 'Mayo',
    MONTH_6: 'Junio',
    MONTH_7: 'Julio',
    MONTH_8: 'Agosto',
    MONTH_9: 'Septiembre',
    MONTH_10: 'Octubre',
    MONTH_11: 'Noviembre',
    MONTH_12: 'Diciembre',

    DAY : 'Día',
    DAY_1 : 'Lunes',
    DAY_2 : 'Martes',
    DAY_3 : 'Miércoles',
    DAY_4 : 'Jueves',
    DAY_5 : 'Viernes',
    DAY_6 : 'Sábado',
    DAY_7 : 'Domingo',
    TO: 'a',

    BACK: 'Anterior',
    NEXT: 'Siguiente',
    START: 'Comenzar',
    SKIP: 'Omitir',
    CONTINUE: 'Continuar',
    CREATE_ACCOUNT: 'Crear cuenta',
    CONGRATULATIONS: 'Felicidades',
    STORE: 'Tienda',
    CONFIRM: 'Confirmar',
    SUCCESS: 'Éxito',
    CLOSE: 'Cerrar',

    /* C A R D  N E W */

    CARD_NEW_JS_1: 'Escriba su nombre por favor.',
    CARD_NEW_JS_2: 'Necesita una tarjeta de 16 dígitos.',
    CARD_NEW_JS_3: 'Ingrese su mes de expiración, son 2 dígitos.',
    CARD_NEW_JS_4: 'Ingrese su año de expiración.',
    CARD_NEW_JS_5: 'Ingrese su cvc, son 3 dígitos.',
    CARD_NEW_JS_6: 'Ingrese su correo electrónico.',
    CARD_NEW_JS_7: 'Ingrese su teléfono, son 10 dígitos.',
    CARD_NEW_JS_8: '¡Verifica los datos de la tarjeta e intenta nuevamente!',
    CARD_NEW_JS_9: 'Aceptar',

    /* C H A N G E  P A S S W O R D */

    CHANGE_PASSWORD_JS_1: 'La confirmación de contraseña no coinciden',
    CHANGE_PASSWORD_JS_2: 'Algo salió mal, verifica tu conexión a internet',

    /* C O N F I G */

    CONFIG_JS_1: 'La confirmación de contraseña no coinciden',
    CONFIG_JS_2: 'Aviso',
    CONFIG_JS_3: '¡Verifica tu conexión a internet e intenta nuevamente!',

    /* C O N F I G  M E N U */

    CONFIG_MENU_JS_1: 'Eliminación de cuenta',
    CONFIG_MENU_JS_2: 'Lamentamos que tengas que dejarnos, pero ten en cuenta que la eliminación de la cuenta es irreversible',
    CONFIG_MENU_JS_3: 'Continuar',
    CONFIG_MENU_JS_4: 'Cancelar',
    CONFIG_MENU_JS_5: 'Después de la eliminación exitosa de tu cuenta ',
    CONFIG_MENU_JS_6: '® continuará reteniendo datos transaccionales para fines de auditoria administrativa.',
    CONFIG_MENU_JS_7: ' Después de la eliminación exitosa de tu cuenta, no podrás iniciar sesión con una cuenta eliminada y ver el historial de la cuenta anterior.',
    CONFIG_MENU_JS_8: '® se reserva el derecho de rechazar futuras solicitudes de creación de cuentas.',
    CONFIG_MENU_JS_9: 'Después de la eliminación exitosa de tu cuenta',
    CONFIG_MENU_JS_10: 'Confirmación',
    CONFIG_MENU_JS_11: 'Una vez eliminado, se cerrará la sesión de esta cuenta y ya no podrás iniciar sesión con esta cuenta.',
    CONFIG_MENU_JS_12: 'Proceder',
    CONFIG_MENU_JS_13: 'Hemos eliminado tu cuenta exitosamente, te extrañaremos :)',
    CONFIG_MENU_JS_14: 'Aceptar',
    CONFIG_MENU_JS_15: 'No hay información que mostrar',
    CONFIG_MENU_JS_16: 'Cierre de sesión',
    CONFIG_MENU_JS_17: '¿Realmente deseas cerrar sesión en este dispositivo?',

    /* D E V I C E  A C C E S S */

    DEVICE_ACCESS_JS_1: '¿Realmente deseas desvincular el dispositivo ',
    DEVICE_ACCESS_JS_2: ' de tu cuenta?',
    DEVICE_ACCESS_JS_3: 'Hemos desvinculado el dispositivo de la cuenta exitosamente, te extrañaremos :)',

    /* L E G A L */

    LEGAL_JS_1: 'Para poder hacer uso de las funciones de la aplicación debes aceptar el aviso de consentimiento legal',
    LEGAL_JS_2: 'Intentar',
    LEGAL_JS_3: 'Salir',

    /* L I S T  A T M */

    LIST_ATM_JS_1: '¿Realmente desea ',
    LIST_ATM_JS_2: 'DESACTIVAR',
    LIST_ATM_JS_3: 'ACTIVAR',
    LIST_ATM_JS_4: ' al cajero?',
    LIST_ATM_JS_5: 'Si, Continuar',
    LIST_ATM_JS_6: '¡Hemos cambiado el estatus del cajero!',
    LIST_ATM_JS_7: '¡Por favor intente nuevamente!',

    /* L I T T L E  S H O P */

    LITTLE_SHOP_JS_1: 'Busqueda',
    LITTLE_SHOP_JS_2: 'Escribe el nombre del producto deseado',
    LITTLE_SHOP_JS_3: 'Escribe aquí',
    LITTLE_SHOP_JS_4: 'Buscar',
    LITTLE_SHOP_JS_5: 'Escribe el código de barras del producto',
    LITTLE_SHOP_JS_6: '¡Este producto ',
    LITTLE_SHOP_JS_7: ' ya no esta en stock!. Favor de avisar al encargado de la franquicia que agregue mas stock',
    LITTLE_SHOP_JS_8: ' ya no esta disponible para su venta!',
    LITTLE_SHOP_JS_9: '¡El código de barras escaneado es inválido, intenta con uno correcto!',
    LITTLE_SHOP_JS_11: 'El producto ya está en el carrito',
    LITTLE_SHOP_JS_12: 'Producto agregado al carrito',
    LITTLE_SHOP_JS_13: '¿Realmente desea eliminar este producto del carrito?',
    LITTLE_SHOP_JS_14: 'Si, Eliminar',
    LITTLE_SHOP_JS_15: 'Agregado',
    LITTLE_SHOP_JS_16: 'Agregar',
    LITTLE_SHOP_JS_17: 'No tiene el saldo suficiente',
    LITTLE_SHOP_JS_18: '¿Realmente deseas realizar el cobro de esta venta? Revisa que sea correcto el pedido',
    LITTLE_SHOP_JS_19: 'Si, COBRAR',
    LITTLE_SHOP_JS_20: 'No tiene el saldo suficiente',
    LITTLE_SHOP_JS_21: '¿Realmente deseas salir de la tiendita?',
    LITTLE_SHOP_JS_22: 'Si, SALIR',
    LITTLE_SHOP_JS_23: 'Ingresa el codigo del cliente',
    LITTLE_SHOP_JS_24: 'Confirmar',
    LITTLE_SHOP_JS_25: '¡El codigo escrito es inválido, intenta con uno correcto!',
    LITTLE_SHOP_JS_26: 'Deseas procesar el pago a tienda?',
    LITTLE_SHOP_JS_27: 'SI, ACEPTAR',
    LITTLE_SHOP_JS_28: 'NO PROCESAR',
    LITTLE_SHOP_JS_29: 'El pago es mayor al total de productos, desea procesar el pago a tienda?',
    LITTLE_SHOP_JS_30: 'El pago es menor al total de productos, desea procesar el pago a tienda?',
    LITTLE_SHOP_JS_31: 'No existe un pago con ese folio, intenta nuevamente!',
    LITTLE_SHOP_JS_32: 'Ingresa un folio!',

    /* M A I N  M E N U */

    MAIN_MENU_JS_1: 'Espere un momento',

    /* M E N U  P A Y M E N T */

    MENU_PAYMENT_JS_1: '¡Selecciona un concepto :) !',
    MENU_PAYMENT_JS_2: '¡Ingresa el monto :) !',
    MENU_PAYMENT_JS_3: 'Agregaste un nuevo concepto al equipo :)',
    MENU_PAYMENT_JS_4: 'IMPORTANTE',
    MENU_PAYMENT_JS_5: '¿Estas completamente segur@ de realizar la operación?',
    MENU_PAYMENT_JS_6: '¡Escribe la cantidad a pagar!',
    MENU_PAYMENT_JS_7: '¿Deseas realizar el pago con esta tarjeta?',
    MENU_PAYMENT_JS_8: 'Si, Pagar',

    /* M E N U  W A L L E T */

    MENU_WALLET_JS_1: 'Invalido genera uno nuevo',
    MENU_WALLET_JS_2: 'Solo copia esta referencia en la sección monedero *',
    MENU_WALLET_JS_3: '* en la app *',
    MENU_WALLET_JS_4: '®*',
    MENU_WALLET_JS_5: 'Tu código es: ',
    MENU_WALLET_JS_6: '¡Haz uso debido del código!',
    MENU_WALLET_JS_7: '¡Monedero actualizado :P!',
    MENU_WALLET_JS_8: '¡Intenta más tarde!',
    MENU_WALLET_JS_9: '¿Desea realizar el pago con esta tarjeta? Se cobrará una comisión bancaria por ',
    MENU_WALLET_JS_10: '¡Verifica los datos de la tarjeta e intenta nuevamente!',
    MENU_WALLET_JS_11: 'Aún no cuentas con historial :(',
    MENU_WALLET_JS_12: '¡Intenta más tarde!',
    MENU_WALLET_JS_13: 'Se guardó la ficha de depósito en tus imágenes :P',
    MENU_WALLET_JS_14: 'Puedes tomar una captura de pantalla de la ficha de depósito :P',
    MENU_WALLET_JS_15: 'No se pudo generar tu ficha de depósito, intenta más tarde :)',

    /* P A Y M E N T  C U S T O M E R */

    PAYMENT_CUSTOMER_JS_1: 'Ingresa la referencia que te enviaron',
    PAYMENT_CUSTOMER_JS_2: '¡La referencia es inválida, intenta con una correcta!',
    PAYMENT_CUSTOMER_JS_3: 'Realmente deseas realizar la transferencia de saldo de tu monedero',
    PAYMENT_CUSTOMER_JS_4: 'NO',
    PAYMENT_CUSTOMER_JS_5: 'Transferencia exitosa',
    PAYMENT_CUSTOMER_JS_6: '¡AVISO!',

    /* R E C H A R G E */

    RECHARGE_JS_1: '¡Escanea el código QR del usuario!',
    RECHARGE_JS_2: '¿Deseas realizar la recarga al monedero?',
    RECHARGE_JS_3: 'Si, RECARGAR',
    RECHARGE_JS_4: '¡Escribe la cantidad a pagar!',

    /* R E G I S T E R  A T M S */

    REGISTER_ATMS_JS_1: 'Escriba un año superior a ',
    REGISTER_ATMS_JS_2: 'Escriba un año inferior a ',
    REGISTER_ATMS_JS_3: 'Escriba el nombre',
    REGISTER_ATMS_JS_4: 'Escriba el primer apellido',
    REGISTER_ATMS_JS_5: 'Escriba el segundo apellido',
    REGISTER_ATMS_JS_6: 'Escriba el correo electrónico',
    REGISTER_ATMS_JS_7: 'Escriba el número de teléfono',
    REGISTER_ATMS_JS_8: 'Escriba su contraseña',
    REGISTER_ATMS_JS_9: 'Repita su contraseña',
    REGISTER_ATMS_JS_10: 'Las contraseñas no coinciden, por favor repita sus contraseñas',
    REGISTER_ATMS_JS_11: '¿Realmente desea crear una cuenta de cajero?',
    REGISTER_ATMS_JS_12: 'Si, Crear',

    /* R E G I S T E R  C O M P L E T E */

    REGISTER_COMPLETE_JS_1: '¿Desea eliminar el horario?',
    REGISTER_COMPLETE_JS_2: 'Si, eliminar',
    REGISTER_COMPLETE_JS_3: 'Escriba su identificación oficial',
    REGISTER_COMPLETE_JS_4: 'Escriba el código postal',
    REGISTER_COMPLETE_JS_5: 'Escriba la calle',
    REGISTER_COMPLETE_JS_6: 'Escriba el nombre de su organización',
    REGISTER_COMPLETE_JS_7: 'Escriba la fecha de registro',
    REGISTER_COMPLETE_JS_8: 'Escriba cuántos años de antigüedad tiene su negocio',
    REGISTER_COMPLETE_JS_9: 'Seleccione el horario de su negocio',
    REGISTER_COMPLETE_JS_10: 'Necesitamos las fotografías de los documentos y del negocio',
    REGISTER_COMPLETE_JS_11: 'Escriba su correo electrónicoo',
    REGISTER_COMPLETE_JS_12: '¡Código enviado!',
    REGISTER_COMPLETE_JS_13: 'Revise la bandeja de entrada o spam de su correo electrónico',
    REGISTER_COMPLETE_JS_14: 'No hemos podido enviar el código de verificación, revisa que la información sea la correcta',
    REGISTER_COMPLETE_JS_15: 'Necesitamos que indiques el ancho aproximado del negocio',
    REGISTER_COMPLETE_JS_16: 'Necesitamos que indiques el alto aproximado del negocio',
    REGISTER_COMPLETE_JS_17: 'Necesitamos que indiques el largo aproximado del negocio',
    REGISTER_COMPLETE_JS_18: 'Escriba su número de teléfono',
    REGISTER_COMPLETE_JS_19: 'Escriba el nombre de su negocio',

    /* R E G I S T E R  E D I T */

    REGISTER_EDIT_JS_1: 'Escriba su nombre',
    REGISTER_EDIT_JS_2: 'Escriba su primer apellido',
    REGISTER_EDIT_JS_3: 'Escriba su segundo apellido',
    REGISTER_EDIT_JS_4: 'Escriba su año de nacimiento',

    /* S C A N N E R  Q R */

    SCANNER_QR_JS_1: '¡El QR escaneado es inválido, intenta con uno correcto!',
    SCANNER_QR_JS_2: 'Escanea el código QR del celular de tu capitán',
    SCANNER_QR_JS_3: 'Escanea el código QR del celular a recargar',
    SCANNER_QR_JS_4: 'Escanea el código QR del monedero',
    SCANNER_QR_JS_5: 'Escanea el código QR de la tienda',
    SCANNER_QR_JS_6: 'Escanea el código QR del celular del otro usuario',
    SCANNER_QR_JS_7: 'Escanear ahora',

    /* S E R V I C E */

    SERVICE_JS_1: 'Escriba su número celular',
    SERVICE_JS_2: '¡Por favor elija una forma de pago!',
    SERVICE_JS_3: '¿Desea realizar el pago de su servicio?',
    SERVICE_JS_4: 'Si, Realizar',
    SERVICE_JS_5: 'Escriba su número celular o de servicio',
    SERVICE_JS_6: 'Escriba su número de TAG',
    SERVICE_JS_7: '¿Desea realizar su recarga?',
    SERVICE_JS_8: 'Repita su número celular',
    SERVICE_JS_9: 'El número celular es distinto',

    /* T R A N S F E R */

    TRANSFER_JS_1: 'Transferencia',
    TRANSFER_JS_2: 'Pago',
    TRANSFER_JS_3: 'Ingresa el folio oficial de la tienda',
    TRANSFER_JS_4: 'Ingresa la referencia que te enviaron',
    TRANSFER_JS_5: '¡El folio es inválido, intente con uno correcto!',
    TRANSFER_JS_6: '¡La referencia es inválida, intente con una correcta!',
    TRANSFER_JS_7: 'Pago a tienda',
    TRANSFER_JS_8: 'Transferencia de saldo',
    TRANSFER_JS_9: '¿Realmente desea realizar la transacción? ',
    TRANSFER_JS_10: 'Se cobrará una comisión bancaria por ',
    TRANSFER_JS_11: '¡Escriba la cantidad a pagar!',

    /* V I E W  C A R D S */

    VIEW_CARDS_JS_1: '¿Deseas ELIMINAR esta tarjeta?',
    VIEW_CARDS_JS_2: 'Si, ELIMINAR',
    VIEW_CARDS_JS_3: '¿Realmente desea ',
    VIEW_CARDS_JS_4: 'ACTIVAR',
    VIEW_CARDS_JS_5: 'DESACTIVAR',
    VIEW_CARDS_JS_6: ' su tarjeta?',
    VIEW_CARDS_JS_7: 'Si, Continuar',
    VIEW_CARDS_JS_8: 'Tarjeta registrada exitosamente, ahora puedes realizar tu pago:)',

    /* P R I N C I P A L */

    PRINCIPAL_JS_1: 'El límite máximo del monedero tiene que ser de $9,000.00 mxn',
    PRINCIPAL_JS_2: 'El límite máximo del monedero tiene que ser de $25,000.00 mxn',
    PRINCIPAL_JS_3: 'Todos los servicios están inactivos.',
    PRINCIPAL_JS_4: '¡Próximamente más servicios!',
    PRINCIPAL_JS_5: '¡Por favor intenta más tarde!',
    PRINCIPAL_JS_6: 'Se requiere permiso de cámara para escanear.',
    PRINCIPAL_JS_7: 'Cierre de sesión',
    PRINCIPAL_JS_8: 'Este dispositivo ha sido desvinculado de ',
    PRINCIPAL_JS_9: '® por el titular de la cuenta después de varios ingresos registrados en distintos dispositivos',
    PRINCIPAL_JS_10: 'Reseteo de contraseña',
    PRINCIPAL_JS_11: 'Necesitamos que cambie su contraseña',
    PRINCIPAL_JS_12: '¡Su contraseña se ha cambiado correctamente!',
    PRINCIPAL_JS_13: 'Su contraseña debe contener al menos 6 caracteres. ¡Por favor intente más tarde!',
    PRINCIPAL_JS_14: '¡Próximamente!',
    PRINCIPAL_JS_15: '¡Información actualizada!',

    /* N E W   P R O D U C T */
    NEW_PRODUCT_LBL_1: 'Para poder crear un nuevo producto necesitamos el nombre completo del producto',
    NEW_PRODUCT_LBL_2: 'Categoría',
    NEW_PRODUCT_LBL_3: 'Despensa',
    NEW_PRODUCT_LBL_4: 'Panadería y Tortillería',
    NEW_PRODUCT_LBL_5: 'Carnes, Pescados y Mariscos',
    NEW_PRODUCT_LBL_6: 'Ferretería y Autos',
    NEW_PRODUCT_LBL_7: 'Lácteos',
    NEW_PRODUCT_LBL_8: 'Cerveza, Vinos y Licores',
    NEW_PRODUCT_LBL_9: 'Jugos y Bebidas',
    NEW_PRODUCT_LBL_10: 'Limpieza y Mascotas',
    NEW_PRODUCT_LBL_11: 'Salchichonería',
    NEW_PRODUCT_LBL_12: 'Papelería',
    NEW_PRODUCT_LBL_13: 'Congelados',
    NEW_PRODUCT_LBL_14: 'Frutas y Verduras',
    NEW_PRODUCT_LBL_15: 'Farmacia',
    NEW_PRODUCT_LBL_16: 'Higiene y Belleza',
    NEW_PRODUCT_LBL_17: 'Bebés y Niños',
    NEW_PRODUCT_LBL_18: 'Otro',
    NEW_PRODUCT_LBL_19: 'Escribe el nombre del producto',
    NEW_PRODUCT_LBL_20: 'Código de barras',
    NEW_PRODUCT_LBL_21: 'Escribe el código de barras del producto',
    NEW_PRODUCT_LBL_22: 'Si no cuentas con uno puedes escribir tu identificador sin espacios',
    NEW_PRODUCT_LBL_23: 'Ya existe un producto registrado con el código de barras ingresado',
    NEW_PRODUCT_LBL_24: 'Ahora necesitamos que escribas los precios del producto',
    NEW_PRODUCT_LBL_25: 'Precio de lista',
    NEW_PRODUCT_LBL_26: 'Precio de venta',
    NEW_PRODUCT_LBL_27: 'Los necesitamos para generar tus reportes',
    NEW_PRODUCT_LBL_28: 'Escribe el precio de lista',
    NEW_PRODUCT_LBL_29: 'Escribe el precio de venta',
    NEW_PRODUCT_LBL_30: 'El precio de venta debe ser mayor al precio de lista',
    NEW_PRODUCT_LBL_31: 'Existencias',
    NEW_PRODUCT_LBL_32: 'Contenido del empaque/presentación',
    NEW_PRODUCT_LBL_33: 'Gramos',
    NEW_PRODUCT_LBL_34: 'Miligramos',
    NEW_PRODUCT_LBL_35: 'Litro',
    NEW_PRODUCT_LBL_36: 'Mililitros',
    NEW_PRODUCT_LBL_37: 'Pieza',
    NEW_PRODUCT_LBL_38: 'Kilogramos',
    NEW_PRODUCT_LBL_39: 'Escribe el stock',
    NEW_PRODUCT_LBL_40: 'Escribe la cantidad del contenido del empaque/presentación',
    NEW_PRODUCT_LBL_41: 'Toma una fotografía del producto lo más clara que puedas',
    NEW_PRODUCT_LBL_42: 'Existencias',
    NEW_PRODUCT_LBL_43: 'Agregar ahora',
    NEW_PRODUCT_LBL_44: '¡Tu producto ha sido creado satisfactoriamente!',
    NEW_PRODUCT_LBL_45: 'Nuevo Producto',

    /* P R O D U C T  C A T A L O G */
    PRODUCT_CATALOG_LBL_1: 'Catalogo de Productos',
    PRODUCT_CATALOG_LBL_2: 'Nombre o codigo de producto',
    PRODUCT_CATALOG_LBL_3: 'Lista de Productos',
    PRODUCT_CATALOG_LBL_4: 'Producto Seleccionado',
    PRODUCT_CATALOG_LBL_5: 'Confirmar productos',
    PRODUCT_CATALOG_LBL_6: 'Agregar a lista',
    PRODUCT_CATALOG_LBL_7: 'Eliminar',
    PRODUCT_CATALOG_LBL_8: 'Nombre del Producto',
    PRODUCT_CATALOG_LBL_9: 'Código',
    PRODUCT_CATALOG_LBL_10: 'Existencias',
    PRODUCT_CATALOG_LBL_11: 'Precio lista',
    PRODUCT_CATALOG_LBL_12: 'Precio a venta',
    PRODUCT_CATALOG_LBL_13: 'Medida',
    PRODUCT_CATALOG_LBL_14: 'Unidad de medida',
    PRODUCT_CATALOG_LBL_15: 'Categoría',
    PRODUCT_CATALOG_LBL_16: 'Selecciona',
    PRODUCT_CATALOG_LBL_17: 'Por favor ingrese la cantidad de stock en almacén',
    PRODUCT_CATALOG_LBL_18: 'Por favor ingrese el precio de lista',
    PRODUCT_CATALOG_LBL_19: 'Por favor ingrese el precio de venta',
    PRODUCT_CATALOG_LBL_20: 'Escribe la cantidad del contenido del empaque/presentación',
    PRODUCT_CATALOG_LBL_21: 'Por favor ingrese la unidad de medida del producto',
    PRODUCT_CATALOG_LBL_22: 'El producto ya existe en la lista',
    PRODUCT_CATALOG_LBL_23: 'Producto agregado',
    PRODUCT_CATALOG_LBL_24: 'Producto eliminado',
    PRODUCT_CATALOG_LBL_25: 'Agregar',
    PRODUCT_CATALOG_LBL_26: 'Confirmación',
    PRODUCT_CATALOG_LBL_27: 'Desea eliminar este producto de su carrito?',
    PRODUCT_CATALOG_LBL_28: '¿Desea salir del catálogo de productos?',
    PRODUCT_CATALOG_LBL_29: 'Salir',
    PRODUCT_CATALOG_LBL_30: '¿Desea agregar estos productos a su tienda?',

    TYPE_ACCOUNT_1: 'Tipo de cuenta',

    EXIT_APP: '¿Quieres salir de la aplicación movil ItzaPay®?',

    CLIPBOARD: 'Contenido copiado al portapapeles',
    CLIPBOARD_ERROR: 'Error al copiar',
    COPY: 'Copiar',

    SALES: 'Ingresos',
    MENU: 'Menú',

    /* V I E W   D E T A I L   I T E M */
    VIEW_DETAIL_ITEM_LBL: 'Comisión bancaria',
    VIEW_DETAIL_ITEM_LBL_0: 'Sub total',

  });

  $translateProvider.preferredLanguage("es");
  $translateProvider.fallbackLanguage("es");
})

// The actual interceptor.
  .factory('httpInterceptor', function ($q, $injector, $location, $rootScope) {
    return {

      request: function (config) {

        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token_PulseHRConnect');

        return config;
      },

      responseError: function (response) {
        if (response.status === 401) {

          console.log('response.status --------------------------------->' + response.status)
          try {
            $rootScope.closeSocketApp();
          } catch (e) {

          }
          localStorage.clear();
          $rootScope.user = null;

          try {
            window.localStorage.clear();
          } catch (e) {
          }

          $location.path("/main/login");
        }
        if (response.status === -1) {
          return $q.reject(response);
        } else {
          return response;
        }

      }

    };
  })

  .factory("AuthFactory", function($http,$rootScope) {

    var interfaz = {
      attemptRefreshToken: function (requestTodoWhenDone) {
        //var token = localStorage.getItem('token_PulseHRConnect');
        var user = JSON.parse(localStorage.getItem('user'));
        return $http({
          method: 'POST',
          skipAuthorization: true,
          url: $rootScope.REFRESH_TOKEN_URL,
          data: {user_id: user.id}
        })
          .success(function (response) {
            // Set the refreshed token.
            localStorage.setItem('token_PulseHRConnect', response.token);
            console.log('Authorization success')
          })
          .then(function () {

            // Attempt to retry the request if request config is passed.
            if (!angular.isUndefined(requestTodoWhenDone) && requestTodoWhenDone.length > 0) {
              // Set the new token for the authorization header.
              /*
               requestTodoWhenDone.headers = {
               'Authorization': 'Bearer ' + localStorage.getItem('token_PulseHRConnect')
               };
               console.log('Hola');
               // Run the request again.
               return $http(requestTodoWhenDone);
               */
            }
            console.log('Authorization')
            /*
            requestTodoWhenDone.headers = {
              'Authorization': 'Bearer ' + localStorage.getItem('token_PulseHRConnect')
            };
            */
            requestTodoWhenDone.headers = {
              'Authorization': 'Bearer ' + localStorage.getItem('token_PulseHRConnect')
            };

            return $http(requestTodoWhenDone);
          });
      }
    };
    return interfaz;
  })

  .factory('localstorage', ['$window', function($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || null);
      }
    }
  }])

  .factory('sessionstorage', ['$window', function($window) {
    return {
      set: function (key, value) {
        $window.sessionStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.sessionStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.sessionStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.sessionStorage[key] || null);
      }
    }
  }])

;
