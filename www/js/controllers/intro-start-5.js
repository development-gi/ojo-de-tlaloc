
angular.module('App.controllers')

.controller('IntroStart5Ctrl',function($scope, $state, localstorage, $ionicHistory, $rootScope) {

    $scope.$on('$ionicView.enter', function () {
        try {
          $rootScope.realIndexSwiper = 1;
            $scope.swiper = new Swiper('.swiper-container', {
                effect: 'fade',
                pagination: {
                    el: '.swiper-pagination',
                    dynamicBullets: false
                },
              on: {
                slideChange: function () {

                  $rootScope.realIndexSwiper = (this.realIndex + 1);
                  setTimeout(function() {
                    $scope.$apply();
                  }, 10);
                }
              }
            });
            $ionicHistory.clearHistory();

        } catch (e) { }

    });

    $scope.next_intro = function () {
        $scope.swiper.slideNext();
    };

  $scope.back_intro = function () {
    $scope.swiper.slidePrev();
  };

    $scope.gologin = function () {
        localstorage.setObject('introOjo', 1);
        $state.go('main.login', {}, {location: 'replace'});
    };

});
