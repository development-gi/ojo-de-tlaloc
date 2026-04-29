
angular.module('App.controllers')

.controller('IntroStart2Ctrl',function($scope, $state, localstorage, $ionicHistory, $rootScope) {

    $scope.$on('$ionicView.enter', function () {
        try {
          $rootScope.realIndexSwiper = 1;
            $scope.swiper = new Swiper('.swiper-container', {
                effect: 'slider',


              on: {
                slideChange: function () {

                  $rootScope.realIndexSwiper = (this.realIndex + 1);
                  setTimeout(function() {
                    $scope.$apply();
                  }, 10);
                }
              },

              scrollbar: {
                el: ".swiper-scrollbar",
              },

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
