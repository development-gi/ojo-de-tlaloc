angular.module('App.directives', [])


  .directive('ngFocus', function($timeout) {
    return {
      link: function ( scope, element, attrs ) {
        scope.$watch( attrs.ngFocus, function ( val ) {
          if ( angular.isDefined( val ) && val ) {
            $timeout( function () { element[0].focus(); } );
          }
        }, true);

        element.bind('blur', function () {
          if ( angular.isDefined( attrs.ngFocusLost ) ) {
            scope.$apply( attrs.ngFocusLost );

          }
        });
      }
    };
  })

  .directive('awLimitLength', function () {
    return {
      restrict: "A",
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        attrs.$set("ngTrim", "false");
        var limitLength = parseInt(attrs.awLimitLength, 10);// console.log(attrs);
        scope.$watch(attrs.ngModel, function(newValue) {
          if(ngModel.$viewValue.length>limitLength){
            ngModel.$setViewValue( ngModel.$viewValue.substring(0, limitLength ) );
            ngModel.$render();
          }
        });
      }
    };
  })


  .directive('map', function() {
    return {
      restrict: 'E',
      scope: {
        onCreate: '&'
      },
      link: function ($scope, $element, $attr) {
        function initialize() {
          var script = document.createElement("script");
          script.type = "text/javascript";
          script.id = "googleMaps";
          script.src = 'http://maps.googleapis.com/maps/api/js?v=3&libraries=geometry,places&key=AIzaSyAQNm-zjzO5bYZbAbf_XfmGZ2TftF64fro&callback=mapIniciar';
          document.body.appendChild(script);

          window.mapIniciar = function(){
            iniciarMapa();
          };

          function iniciarMapa(){
            var latLng=JSON.parse(localStorage.getItem('latLng'));
            if (latLng==null||latLng==undefined){
              latLng={lat: 19.4321796, lng: -99.132875};
              localStorage.setItem('latLng',JSON.stringify(latLng));
            }
            var mapOptions = {
              center: latLng,
              zoom: 16,
              disableDefaultUI: true
              //mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map($element[0], mapOptions);

            $scope.onCreate({map: map});

            // Stop the side bar from dragging when mousedown/tapdown on the map
            google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
              e.preventDefault();
              return false;
            });
          }


        }

        if (document.readyState === "complete") {
          initialize();
        } else {
          initialize();
          //google.maps.event.addDomListener(window, 'load', initialize);
        }
      }
    }
  });
