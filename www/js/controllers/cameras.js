angular.module('App.controllers')

  .controller('CamerasCtrl',function($scope, $rootScope, $state, $http, localstorage, $mdDialog, $ionicHistory, $ionicModal, $mdBottomSheet, $ionicScrollDelegate) {
    $scope.CurrentDate = new Date();

    $scope.$on('$ionicView.enter', function () {
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    $scope.$on('$ionicView.afterEnter', function () {

      //const videoUrl = response.data.url;

      setTimeout(function() {

        console.log('----------->')

        $http.post($rootScope.STREAMING,
          {
            id: 260
          }, {
            headers: {}
          })
          .then(function (success) {

              console.log('-----------')

              const videoUrl = $rootScope.BASE_URL_IMG + success.data.url
              var videoElement = document.getElementById('videoPlayer');

              const hls = new Hls({
                lowLatencyMode:true,
                liveSyncDurationCount: 1,
                backBufferLength: 15,
                fragLoadPolicy: { default: { maxTimeToFirstByteMs: 1000, maxLoadTimeMs: 2000 } },
                progressive: true
              });
              hls.loadSource(videoUrl);
              hls.attachMedia(videoElement);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play();
              });

            },
            function (error) {
              console.log(error)
            });

      }, 10);

    });

    $scope.return = function () {
      $state.go('menu.principal', {}, {location: 'replace'});
    };

  });

