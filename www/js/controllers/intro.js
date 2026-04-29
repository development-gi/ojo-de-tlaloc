
angular.module('App.controllers')

.controller('IntroCtrl',function($scope, $state, localstorage) {

  setTimeout(function(){
    $state.go('main.intro-start', {}, {location: 'replace'});
  }, 3000);

});
