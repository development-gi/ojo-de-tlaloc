
angular.module('App.controllers')

  .controller('IntroStart4Ctrl',function($scope, $state, localstorage, $ionicHistory, $rootScope) {

    $scope.$on('$ionicView.enter', function () {
      try {
        $rootScope.realIndexSwiper = 1;
        $scope.swiper = new Swiper('.swiper-container', {
          effect: 'slide',
          pagination: {
            el: '.swiper-pagination',
            dynamicBullets: true
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
      localstorage.setObject('intro', 1);
      $state.go('main.login');
    };

  });
