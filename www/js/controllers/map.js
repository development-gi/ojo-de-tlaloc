angular.module('App.controllers')

  .controller('MapCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, localstorage, $cordovaToast, $mdBottomSheet,
                                              $ionicModal, $sce,
                                              $ionicHistory, $ionicLoading, sessionstorage, $cordovaCamera, $ionicScrollDelegate) {

    $scope.$on('$ionicView.enter', function () {
      console.log('I N I C I A   V A L O R E S   D E   M A P A');
    });

    $scope.$on('$ionicView.afterEnter', function () {
    });

    $scope.$on('$ionicView.beforeEnter', function () {

      $rootScope.showLoading('Espere un momento...');
      $ionicScrollDelegate.scrollTo(0, 0, true);

      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }

      setTimeout(function () {
        $rootScope.closeLoading();
      }, 1000);

      // ========= Datos de marcadores inyectados por Blade =========
      $rootScope.switch_post = true;
      $rootScope.switch_internet = false;
      $rootScope.switch_building = false;
      $rootScope.switch_400 = false;
      $rootScope.switch_500 = false;

      $rootScope.map = null;
      $rootScope.markers_map = [];
      $rootScope.markers = [];
      $rootScope.polygonColor = null;
      $rootScope.lat_aux = 19.4830271;
      $rootScope.lng_aux = -99.113503;

      $rootScope.polygonColorClusters = null;

      // MAP INTERNET
      $rootScope.markersInternet = [];
      $rootScope.markers_map_internet = [];

      //MAP EDIFICIOS
      $rootScope.markersBuilding = [];
      $rootScope.markers_map_building = [];

      //MAP 400 WATTS
      $rootScope.markers400Watts = [];
      $rootScope.markers_map_400Watts = [];

      //MAP 500 WATTS
      $rootScope.markers500Watts = [];
      $rootScope.markers_map_500Watts = [];
      $rootScope.geofences = [];
      $rootScope.territorials = [];
      $rootScope.geofencesClusters = [];
      $rootScope.clusters = [];

      $rootScope.geofenceGroupClusters = [];
      $rootScope.geofenceGroup = [];

      $rootScope.geofencesStreets = [];
      $rootScope.streets = [];
      $rootScope.polygonColorStreets = null;
      $rootScope.geofenceGroupStreets = [];

      Object.keys($rootScope.columns).forEach(function (key) {

        $rootScope.markers.push({
          id: $rootScope.columns[key].id,
          lat: $rootScope.columns[key].lat,
          lng: $rootScope.columns[key].lng,
          comments: $rootScope.columns[key].comments,
          photo: $rootScope.columns[key].photo,
          assigned_colony: $rootScope.columns[key].assigned_colony,
          status: $rootScope.columns[key].status,
          ptz: $rootScope.columns[key].ptz > 0 ? $rootScope.columns[key].ptz : 0,
          bullet: $rootScope.columns[key].bullet > 0 ? $rootScope.columns[key].bullet : 0
        });

      });

      Object.keys($rootScope.internet).forEach(function (key) {

        $rootScope.markersInternet.push({
          id: $rootScope.internet[key].id,
          lat: $rootScope.internet[key].lat,
          lng: $rootScope.internet[key].lng,
          folio: $rootScope.internet[key].folio,
          consecutive: $rootScope.internet[key].consecutive,
          property: $rootScope.internet[key].property,
          address: $rootScope.internet[key].address,
          cluster: $rootScope.internet[key].cluster,
          internet_2: $rootScope.internet[key].internet_2
        });

      });

      Object.keys($rootScope.buildings).forEach(function (key) {

        $rootScope.markersBuilding.push({
          id: $rootScope.buildings[key].id,
          lat: $rootScope.buildings[key].lat,
          lng: $rootScope.buildings[key].lng,
          folio: $rootScope.buildings[key].folio,
          name: $rootScope.buildings[key].name,
          type: $rootScope.buildings[key].type
        });

      });

      Object.keys($rootScope.watts400).forEach(function (key) {

        $rootScope.markers400Watts.push({
          id: $rootScope.watts400[key].id,
          lat: $rootScope.watts400[key].lat,
          lng: $rootScope.watts400[key].lng,
          no: $rootScope.watts400[key].no,
          colony: $rootScope.watts400[key].colony,
          address: $rootScope.watts400[key].address,
          dt: $rootScope.watts400[key].dt,
          no_pld: $rootScope.watts400[key].no_pld
        });

      });

      Object.keys($rootScope.watts500).forEach(function (key) {

        $rootScope.markers500Watts.push({
          id: $rootScope.watts500[key].id,
          lat: $rootScope.watts500[key].lat,
          lng: $rootScope.watts500[key].lng,
          no: $rootScope.watts500[key].no,
          colony: $rootScope.watts500[key].colony,
          address: $rootScope.watts500[key].address,
          dt: $rootScope.watts500[key].dt,
          no_pld: $rootScope.watts500[key].no_pld
        });

      });

      // ========= Inicializar Leaflet =========
      $rootScope.map = L.map('map_static', {zoomControl: true}).setView([$rootScope.lat_aux, $rootScope.lng_aux], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: ''
      }).addTo($rootScope.map);

      $rootScope.polygonColor = L.polygon([[0, 0]], {
        color: 'blue',
        id: 'geo_selected'
      }).addTo($rootScope.map);

      $rootScope.leafletMarkers = [];

      // =========== Puntos de POSTES ===============
      $scope.addPost();
      //============================= end MAP =================================

      Object.keys($rootScope.territorial_units).forEach(function (key) {

        var coords = [];
        $rootScope.territorials.push({
          description: $rootScope.territorial_units[key].description,
          entity: $rootScope.territorial_units[key].entity,
          cve_demarcation_t: $rootScope.territorial_units[key].cve_demarcation_t,
          dem_territorial: $rootScope.territorial_units[key].dem_territorial,
          ctto_loc: $rootScope.territorial_units[key].ctto_loc,
          cve_ut: $rootScope.territorial_units[key].cve_ut,
          electoral_sections: $rootScope.territorial_units[key].electoral_sections
        });

        Object.keys($rootScope.territorial_units[key].coors).forEach(function (key2) {
          coords.push([
            $rootScope.territorial_units[key].coors[key2].lat, $rootScope.territorial_units[key].coors[key2].lng
          ]);
        });

        $rootScope.geofences.push(coords)

      });

      $scope.addTerritorials();

      Object.keys($rootScope.clusters_data).forEach(function (key) {

        var coords = [];
        $rootScope.clusters.push({
          folio: $rootScope.clusters_data[key].folio,
          name: $rootScope.clusters_data[key].name,
          tessellate: $rootScope.clusters_data[key].tessellate,
          extrude: $rootScope.clusters_data[key].extrude,
          visibility: $rootScope.clusters_data[key].visibility
        });

        Object.keys($rootScope.clusters_data[key].coords).forEach(function (key2) {
          coords.push([
            $rootScope.clusters_data[key].coords[key2].lat, $rootScope.clusters_data[key].coords[key2].lng
          ]);
        });

        $rootScope.geofencesClusters.push(coords)

      });

      setTimeout(function() {
        $rootScope.map.invalidateSize()
      }, 50);

    });

    $scope.addPost = function() {
      Object.keys($rootScope.markers).forEach( function(id) {
        var m = $rootScope.markers[id];
        if (isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return;

        var customDivIcon = L.divIcon({
          html: '<div class=""><img src="/www/images/markers/' + m.status + '.png" alt="pin" width="38" height="38" /></div>',
          className: 'leaflet-div-icon-no-default', // evita estilos por defecto de leaflet
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        var mk = L.marker([Number(m.lat), Number(m.lng)], { icon: customDivIcon, m }).addTo($rootScope.map);
        $rootScope.markers_map.push(mk);

        mk.on('click', (e) => {
          console.log('AQUI PONER UN MODAL CON LA INFORMACION');
          console.log(mk.options.m);
        });

      });
    }

    $scope.changePost = function() {

      if($rootScope.switch_post) {
        $rootScope.markers_map.forEach(function (m) {
          $rootScope.map.removeLayer(m);
        });
        $rootScope.switch_post = false;
      } else {
        $rootScope.switch_post = true;
        $scope.addPost();
      }

    }

    $scope.changeInternet = function() {

      if($rootScope.switch_internet) {
        $rootScope.markers_map_internet.forEach(function (m) {
          $rootScope.map.removeLayer(m);
        });
        $rootScope.switch_internet = false;
      } else {
        $rootScope.switch_internet = true;
        $scope.addInternet();
      }

    }

    $scope.changeBuilding = function() {

      if($rootScope.switch_building) {
        $rootScope.markers_map_building.forEach(function (m) {
          $rootScope.map.removeLayer(m);
          // o también: m.remove();
        });
        $rootScope.switch_building = false;
      } else {
        $rootScope.switch_building = true;
        $scope.addBuilding();
      }

    }

    $scope.change400 = function() {

      if($rootScope.switch_400) {
        $rootScope.markers_map_400Watts.forEach(function (m) {
          $rootScope.map.removeLayer(m);
        });
        $rootScope.switch_400 = false;
      } else {
        $rootScope.switch_400 = true;
        $scope.add400();
      }

    }

    $scope.change500 = function() {

      if($rootScope.switch_500) {
        $rootScope.markers_map_500Watts.forEach(function (m) {
          $rootScope.map.removeLayer(m);
        });
        $rootScope.switch_500 = false;
      } else {
        $rootScope.switch_500 = true;
        $scope.add500();
      }

    }

    $scope.addTerritorials = function() {
      $rootScope.geofenceGroup = L.featureGroup().addTo($rootScope.map);

      $rootScope.geofences.forEach((coords, index) => {

        var table = `<table style="font-size:13px;">
                    <tr><td colspan="2"><b>${$rootScope.territorials[index]['description']}</b></td></tr>
                    <tr><td>Entidad:</td><td>${$rootScope.territorials[index]['entity']}</td></tr>
                    <tr><td>Clv Demarcación Territorial:</td><td>${$rootScope.territorials[index]['cve_demarcation_t']}</td></tr>
                    <tr><td>Dtto local:</td><td>${$rootScope.territorials[index]['ctto_loc']}</td></tr>
                    <tr><td>Secc Electorales Completas:</td><td>${$rootScope.territorials[index]['electoral_sections']}</td></tr>
                    <tr><td>Secc Electorales Parciales:</td><td>${($rootScope.territorials[index]['type_ut'] === undefined ? '' : $rootScope.territorials[index]['type_ut'])}</td></tr>
                </table>`;

        const polygon = L.polygon(coords, {
          color: '#a3576c',
          weight: 2,
          fillColor: '#A32446',
          fillOpacity: 0.2
        }).bindPopup(table);

        polygon.on('click', function(e) {

          $rootScope.map.removeLayer($rootScope.polygonColor);

          $rootScope.map.setView([e.latlng.lat, e.latlng.lng], 16);

          var coords_aux = [];
          var aux = e.target._latlngs[0];

          for(var idx = 0; idx < aux.length; idx++) {
            coords_aux.push([aux[idx].lat, aux[idx].lng])
          }

          $rootScope.polygonColor = L.polygon([coords_aux], {
            color: '#fffc00',
            className: 'animated-polygon',
            id: 'geo_selected'
          }).addTo($rootScope.map);

        });

        $rootScope.geofenceGroup.addLayer(polygon);
      });

      // Ajustar vista para mostrar todas las geocercas
      $rootScope.map.fitBounds($rootScope.geofenceGroup.getBounds());
    }

    $scope.addInternet = function() {
      Object.keys($rootScope.markersInternet).forEach((id) => {
        const m = $rootScope.markersInternet[id];
        if (isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return;

        const customDivIcon = L.divIcon({
          html: `<div class=""><img src="/www/images/markers/internet.png" alt="internet" width="38" height="38" /></div>`,
          className: 'leaflet-div-icon-no-default', // evita estilos por defecto de leaflet
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        const mk = L.marker([Number(m.lat), Number(m.lng)], { icon: customDivIcon, m }).addTo($rootScope.map);
        $rootScope.markers_map_internet.push(mk);

        mk.on('add', () => {
          const el = mk.getElement();

        });

        mk.bindPopup("<b>Internet</b><br><b>Folio: " + m.folio + "</b><br>Propiedad: " + m.property + "<br>Dirección: " + m.address + "<br>Cluster: " + m.cluster + "<br>Internet 2: " + m.internet_2);

      });
    }

    $scope.addBuilding = function() {
      Object.keys($rootScope.markersBuilding).forEach((id) => {
        const m = $rootScope.markersBuilding[id];
        if (isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return;

        const customDivIcon = L.divIcon({
          html: `<div class=""><img src="/www/images/markers/buildings.png" alt="edificios" width="38" height="38" /></div>`,
          className: 'leaflet-div-icon-no-default', // evita estilos por defecto de leaflet
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        const mk = L.marker([Number(m.lat), Number(m.lng)], { icon: customDivIcon, m }).addTo($rootScope.map);
        $rootScope.markers_map_building.push(mk);

        mk.on('add', () => {
          const el = mk.getElement();
        });

        mk.on('click', (e) => {
          mk.bindPopup("<b>Edificio</b><br><b>Folio: " + m.folio + "</b><br>Nombre: " + m.name + "<br>Tipo: " + m.type);
        });

      });
    }

    $scope.add400 = function() {
      Object.keys($rootScope.markers400Watts).forEach((id) => {
        const m = $rootScope.markers400Watts[id];
        if (isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return;

        const customDivIcon = L.divIcon({
          html: `<div class=""><img src="/www/images/markers/400.png" alt="400" width="38" height="38" /></div>`,
          className: 'leaflet-div-icon-no-default', // evita estilos por defecto de leaflet
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        const mk = L.marker([Number(m.lat), Number(m.lng)], { icon: customDivIcon, m }).addTo($rootScope.map);
        $rootScope.markers_map_400Watts.push(mk);

        mk.on('add', () => {
          const el = mk.getElement();
        });

        mk.on('click', (e) => {
          mk.bindPopup("<b>400 Watts</b><br><b>No: " + m.no + "</b><br>Colonia: " + m.colony + "<br>Dirección: " + m.address + "<br>D.T.: " + m.dt + "<br>No. PLD: " + m.no_pld);
        });

      });
    }

    $scope.add500 = function() {
      Object.keys($rootScope.markers500Watts).forEach((id) => {
        const m = $rootScope.markers500Watts[id];
        if (isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return;

        const customDivIcon = L.divIcon({
          html: `<div class=""><img src="/www/images/markers/500.png" alt="500" width="38" height="38" /></div>`,
          className: 'leaflet-div-icon-no-default', // evita estilos por defecto de leaflet
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        const mk = L.marker([Number(m.lat), Number(m.lng)], { icon: customDivIcon, m }).addTo($rootScope.map);
        $rootScope.markers_map_500Watts.push(mk);

        mk.on('add', () => {
          const el = mk.getElement();
        });

        mk.on('click', (e) => {
          mk.bindPopup("<b>500 Watts</b><br><b>No: " + m.no + "</b><br>Colonia: " + m.colony + "<br>Dirección: " + m.address + "<br>D.T.: " + m.dt + "<br>No. PLD: " + m.no_pld);
        });

      });
    }

    $scope.return = function () {
      $state.go('menu.principal', {}, {location: 'replace'});
      $rootScope.activeGPS();
    };

  });
