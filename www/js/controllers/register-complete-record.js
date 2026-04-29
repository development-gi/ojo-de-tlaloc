angular.module('App.controllers')

  .controller('RegisterCompleteRecordCtrl', function ($scope, $state, $http, $ionicLoading,  $translate, $rootScope, $ionicPopup, localstorage, sessionstorage, $timeout, $ionicScrollDelegate, $ionicHistory, $cordovaToast, $mdDialog, $mdToast, $filter) {

    $scope.$on('$ionicView.beforeEnter', function () {

      if (ionic.Platform.isIOS() || $rootScope.device_platform === "iOS") {
        try {
          $ionicHistory.clearHistory();
        } catch (e) {
        }
      }

      $ionicScrollDelegate.scrollTo(0, 0, false);

      $scope.vol = Math.floor(Math.random() * 100);
      $scope.bass = 40;
      $scope.treble = 80;

      try {
        $rootScope.activeGPS();
      } catch (e) {
      }
      $rootScope.dataRegisterCompleteRecord = {
        id: null,
        name_store: '',
        curp: null,
        siscovip: null,
        state: null,
        city: null,
        colony: null,
        postal_code: null,
        street: null,
        number_exterior: null,
        number_inside: null,
        date_register: null,
        antiquity: null,
        organization: null,
        permit_type: '',
        trade: '',
        twist: 2,
        sub_twist: 140,
        width: 0,
        height: 0,
        large: 0
      };

      $rootScope.days_schedule = [];
      $rootScope.days_schedule.push({
        idx: 1,
        name: $filter('translate')('DAY_1'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 2,
        name: $filter('translate')('DAY_2'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 3,
        name: $filter('translate')('DAY_3'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 4,
        name: $filter('translate')('DAY_4'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 5,
        name: $filter('translate')('DAY_5'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 6,
        name: $filter('translate')('DAY_6'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });
      $rootScope.days_schedule.push({
        idx: 7,
        name: $filter('translate')('DAY_7'),
        ini_time: '--:--',
        end_time: '--:--',
        active: false
      });

      $rootScope.sepomex_state = [];
      $rootScope.sepomex_cities = [];
      $rootScope.sepomex_colonies = [];

      $rootScope.date_register = {
        y: null,
        m: 1,
        d: 1
      };

      $scope.step = 1;
      $rootScope.nationalities = $rootScope.getNationalities();
      $rootScope.state_list = $rootScope.getStates();
      $rootScope.twist_list = $rootScope.getTwist();
      $rootScope.dataRegisterCompleteRecord.twist = 2;
      $rootScope.getSubTwist(2);

      $rootScope.arr_photo_evidence = [];
      $rootScope.arr_photo_evidence.push({id: 1, type: 'id', name: '', base64: '', active: false}); //identificación oficial
      $rootScope.arr_photo_evidence.push({id: 2, type: 'permission', name: '', base64: '', active: false}); //permiso
      $rootScope.arr_photo_evidence.push({id: 3, type: 'trade', name: '', base64: '', active: false}); //comercio
    });

    $scope.photo_add_complete_record = function (opc) {

      $scope.idx_photo = opc;

      var t_w = 1000,
        t_h = 1000;

      switch (opc) {
        case 0: //id
          t_w = 1038;
          t_h = 696;
          break;
        case 1://permiso
          t_w = 1240;
          t_h = 1754;
          break;
        case 2://negocio
          t_w = 1000;
          t_h = 800;
          break;
      }

      var cameraOptions = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        targetWidth: t_w,
        targetHeight: t_h,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      try {
        navigator.camera.getPicture(movePic, function cameraError(error) {

          console.debug("Unable to obtain picture: " + error, "app");

        }, cameraOptions);

      } catch (e) {
      }

    };

    function movePic(imageData) {
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var namePhoto = "";
      for (var i = 0; i < 20; i++) {
        namePhoto += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      $rootScope.arr_photo_evidence[$scope.idx_photo].name = "LetAccount_" + namePhoto + ".jpeg";
      $rootScope.arr_photo_evidence[$scope.idx_photo].base64 = "data:image/jpeg;base64," + imageData.replace("data:image/jpeg;base64,", '');
      $rootScope.arr_photo_evidence[$scope.idx_photo].active = true;

      console.log($rootScope.arr_photo_evidence);

      setTimeout(function () {
        $scope.$apply();
      }, 100);

    }

    function DialogController($scope, $mdDialog, day_time_picker) {

      $scope.day_time_picker = day_time_picker;

      $scope.hide = function () {
        $mdDialog.hide();
      };

      $scope.cancelTimeRecord = function () {
        $mdDialog.cancel();
      };

      $scope.addTimeRecord = function () {
        var arr = [];
        arr.push($('#time_h_ini').val());
        arr.push($('#time_m_ini').val());
        arr.push($('#time_h_end').val());
        arr.push($('#time_m_end').val());
        $mdDialog.hide(arr);
      };

    }

    $scope.selectSchedule = function (opc) {

      for (var idx = 0; idx < $rootScope.days_schedule.length; idx++) {
        if ($rootScope.days_schedule[idx].idx === opc) {
          $rootScope.day_time_picker = $rootScope.days_schedule[idx].name;
          break;
        }
      }

      $mdDialog.show({
        locals: {day_time_picker: $rootScope.day_time_picker},
        controller: DialogController,
        templateUrl: 'templates/modal/time-picker.html',
        parent: angular.element(document.body),
        targetEvent: $scope.$event,
        clickOutsideToClose: false
      })
        .then(function (param) {

          for (var idx = 0; idx < $rootScope.days_schedule.length; idx++) {
            if ($rootScope.days_schedule[idx].name === $rootScope.day_time_picker) {
              $rootScope.days_schedule[idx].ini_time = param[0] + ':' + param[1];
              $rootScope.days_schedule[idx].end_time = param[2] + ':' + param[3];
              $rootScope.days_schedule[idx].active = true;
            }
          }

        }, function () {
        });

      /*console.log(opc)
      for(var idx = 0; idx < $rootScope.days_schedule.length; idx++) {
        if($rootScope.days_schedule[idx].idx === opc) {
          $rootScope.days_schedule[idx].active = true;
        }
      }

      setTimeout(function() {
        $scope.$apply();
      }, 100);*/

    };

    $scope.deleteSchedule = function (opc) {

      $scope.delete_indx = opc;
      var confirm = $mdDialog.confirm()
        .title($filter('translate')('MENU_PAYMENT_JS_4'))
        .textContent($filter('translate')('REGISTER_COMPLETE_JS_1'))
        .ariaLabel('Lucky day')
        .targetEvent($scope.$event)
        .ok($filter('translate')('REGISTER_COMPLETE_JS_2'))
        .cancel($filter('translate')('CANCEL'));

      $mdDialog.show(confirm).then(function () {

        for (var idx = 0; idx < $rootScope.days_schedule.length; idx++) {
          if ($rootScope.days_schedule[idx].idx === $scope.delete_indx) {
            $rootScope.days_schedule[idx].ini_time = '--:--';
            $rootScope.days_schedule[idx].end_time = '--:--';
            $rootScope.days_schedule[idx].active = false;
            break;
          }
        }

      }, function () {

      });

    };

    $rootScope.getTwist = function () {
      var results = [
        {id: 2, name: 'Abarrotes'},
        {id: 51, name: 'Accesorios para dama y caballero'},
        {id: 3, name: 'Acuario y mascotas'},
        {id: 1, name: 'Alimentos y bebidas'},
        {id: 4, name: 'Antigüedades'},
        {id: 5, name: 'Aparatos electrónicos y de importacion'},
        {id: 57, name: 'Artesanías'},
        {id: 50, name: 'Artículos deportivos'},
        {id: 55, name: 'Artículos de uso militar'},
        {id: 9, name: 'Artículos esotéricos y religiosos'},
        {id: 19, name: 'Artículos médicos'},
        {id: 18, name: 'Artículos para automóviles'},
        {id: 17, name: 'Artículos para calzado'},
        {id: 63, name: 'Artículos para el hogar'},
        {id: 6, name: 'Artículos para limpieza'},
        {id: 34, name: 'Artículos para pintura, dibujos y cuadros'},
        {id: 44, name: 'Artículos varios'},
        {id: 24, name: 'Artículos y alimentos para mascotas'},
        {id: 27, name: 'Artículos y reparaciones para celulares y computadoras'},
        {id: 42, name: 'Bisutería'},
        {id: 28, name: 'Blancos'},
        {id: 41, name: 'Bonetería'},
        {id: 21, name: 'Calzado dama y caballero'},
        {id: 16, name: 'Carnicería'},
        {id: 10, name: 'Cassettes y discos de audio y video'},
        {id: 32, name: 'Cerrajería y venta de llaveros'},
        {id: 64, name: 'Chiles secos y derivados'},
        {id: 8, name: 'Cosméticos y perfumería'},
        {id: 15, name: 'Dulcería y cigarros'},
        {id: 22, name: 'Equipaje'},
        {id: 56, name: 'Estética'},
        {id: 67, name: 'Eventos deportivos'},
        {id: 23, name: 'Fería ambulante'},
        {id: 33, name: 'Ferretería y tlapalería'},
        {id: 39, name: 'Flores de ornato, plantas y tierra'},
        {id: 54, name: 'Fotocopias'},
        {id: 46, name: 'Frutas y verduras'},
        {id: 60, name: 'Gestoría y asesoráa en trámites'},
        {id: 66, name: 'Herbolaria medicinal y para esoterismo'},
        {id: 30, name: 'Instrumentos musicales'},
        {id: 43, name: 'Joyas y relojes'},
        {id: 40, name: 'Juguetes y peluches'},
        {id: 53, name: 'Material didáctico'},
        {id: 26, name: 'Material eléctrico'},
        {id: 31, name: 'Material fotografico y fotos'},
        {id: 59, name: 'Mercería'},
        {id: 35, name: 'Metales'},
        {id: 36, name: 'Miel y derivados'},
        {id: 65, name: 'Muebles en general'},
        {id: 52, name: 'Pan y pasteleria en general'},
        {id: 7, name: 'Papelería'},
        {id: 13, name: 'Peletería'},
        {id: 45, name: 'Periódicos, revistas y libros'},
        {id: 25, name: 'Pescadería'},
        {id: 49, name: 'Plásticos'},
        {id: 20, name: 'Pollería'},
        {id: 14, name: 'Postres'},
        {id: 37, name: 'Productos naturistas'},
        {id: 47, name: 'Regalos y envolturas'},
        {id: 12, name: 'Ropa'},
        {id: 48, name: 'Ropa usada y chacharas'},
        {id: 38, name: 'Salchichoneria y lácteos'},
        {id: 58, name: 'Semillas y legumbres'},
        {id: 62, name: 'Servicios'},
        {id: 11, name: 'Souvenirs eventos'},
        {id: 68, name: 'Tatuajes y perforaciones'},
        {id: 69, name: 'Vidriería'},
        {id: 29, name: 'Otros'}
      ];
      return results;
    };

    $rootScope.getSubTwist = function (id) {

      $rootScope.dataRegisterCompleteRecord.twist = id;

      var results = [
        {id: 91, name: 'Pollo rostizado / al carbon y bebidas', id_t: 1},
        {id: 8, name: 'Antojitos mexicanos y bebidas', id_t: 1},
        {id: 89, name: 'Caldos de gallina, otros y bebidas', id_t: 1},
        {id: 135, name: 'Otros', id_t: 1},
        {id: 137, name: 'Mixiotes y bebidas', id_t: 1},
        {id: 136, name: 'Pozole y bebidas', id_t: 1},
        {id: 134, name: 'Tostadas y bebidas', id_t: 1},
        {id: 6, name: 'Hamburguesas y hotdogs y bebidas', id_t: 1},
        {id: 7, name: 'Tacos y bebidas', id_t: 1},
        {id: 9, name: 'Birria y bebidas', id_t: 1},
        {id: 10, name: 'Barbacoa y bebidas', id_t: 1},
        {id: 11, name: 'Sushi y bebidas', id_t: 1},
        {id: 12, name: 'Comida china y bebidas', id_t: 1},
        {id: 13, name: 'Tamales y atole', id_t: 1},
        {id: 14, name: 'Tortas y bebidas', id_t: 1},
        {id: 15, name: 'Desayunos', id_t: 1},
        {id: 16, name: 'Pan y café', id_t: 1},
        {id: 24, name: 'Mariscos y bebidas', id_t: 1},
        {id: 60, name: 'Pizzas y bebidas', id_t: 1},
        {id: 17, name: 'Fruta, ensaladas, jugos y licuados', id_t: 1},
        {id: 128, name: 'Comida para llevar', id_t: 1},
        {id: 127, name: 'Pastes, empanadas y refrescos', id_t: 1},
        {id: 110, name: 'Flautas y bebidas', id_t: 1},
        {id: 54, name: 'Comida corrida y bebidas', id_t: 1},
        {id: 140, name: 'Otros', id_t: 2},
        {id: 36, name: 'Peces y otros animales', id_t: 3},
        {id: 41, name: 'Productos de TV', id_t: 5},
        {id: 75, name: 'Teléfonos fijos, bocinas, reproductores', id_t: 5},
        {id: 21, name: 'Jabones, detergentes, escobas, trapeadores, etc', id_t: 6},
        {id: 20, name: 'Cuadernos, plumas, lápices, notas, reglas, dedales, plumones, etc', id_t: 7},
        {id: 22, name: 'Rimel, maquillaje, desodorante, perfume, espejos, cepillos', id_t: 8},
        {id: 23, name: 'Imagenes, veladoras, inciensos, rosarios, figuras, etc', id_t: 9},
        {id: 85, name: 'Videojuegos', id_t: 10},
        {id: 58, name: 'Discos de acetato, cds, dvds, cables, microfonos, cámaras, etc', id_t: 10},
        {id: 25, name: 'Tazas, llaveros, playeras, gorras, plumas, etc', id_t: 11},
        {id: 26, name: 'Ropa dama y/o caballero', id_t: 12},
        {id: 84, name: 'Composturas', id_t: 12},
        {id: 74, name: 'Ropa para bebé', id_t: 12},
        {id: 94, name: 'Uniformes escolares', id_t: 12},
        {id: 77, name: 'Ropa para niño y niña', id_t: 12},
        {id: 93, name: 'Uniformes empresariales', id_t: 12},
        {id: 27, name: 'Chamarras, cinturones, bolsas, carteras, Zapatos, etc', id_t: 13},
        {id: 18, name: 'Aguas frescas, nieves y helados', id_t: 14},
        {id: 82, name: 'Bebidas tradicionales con y sin alcohol', id_t: 14},
        {id: 28, name: 'Crepas, alitas, platanos, gelatinas, arroz, esquimos, esquites, elotes', id_t: 14},
        {id: 19, name: 'Papas y frituras', id_t: 14},
        {id: 29, name: 'Dulces, cigarros, refrescos, energizantes y aguas', id_t: 15},
        {id: 115, name: 'Palomitas de maíz', id_t: 15},
        {id: 114, name: 'Algodones de azucar', id_t: 15},
        {id: 109, name: 'Dulces típicos', id_t: 15},
        {id: 56, name: 'Dulces botanas envasadas y semillas', id_t: 15},
        {id: 73, name: 'Refrescos preparados', id_t: 15},
        {id: 92, name: 'Chicharrón', id_t: 16},
        {id: 30, name: 'Carne de res y puerco', id_t: 16},
        {id: 31, name: 'Grasa, agujetas, tintas, cepillos, trapos', id_t: 17},
        {id: 32, name: 'Aromatizante, aceite, herramienta, anticongelante, etc', id_t: 18},
        {id: 99, name: 'Batas, pijamas y accesorios para médicos', id_t: 19},
        {id: 33, name: 'Otros', id_t: 20},
        {id: 86, name: 'Reparaciones', id_t: 21},
        {id: 34, name: 'Zapatos, tenis, chanclas, pantuflas', id_t: 21},
        {id: 35, name: 'Maletas, mochila y maletines', id_t: 22},
        {id: 130, name: 'Fija', id_t: 23},
        {id: 37, name: 'Croquetas, platos, correas, juguetes, arena para gato', id_t: 24},
        {id: 38, name: 'Pescado, camarones, pulpo, etc', id_t: 25},
        {id: 70, name: 'Empaques y refacciones para electrodomésticos', id_t: 26},
        {id: 39, name: 'Cables, conexiones, leds, focos, soquets, etc', id_t: 26},
        {id: 40, name: 'Cargadores, fundas, micas, chips, memorias', id_t: 27},
        {id: 100, name: 'Celulares Usados', id_t: 27},
        {id: 62, name: 'Equipos celulares', id_t: 27},
        {id: 42, name: 'Sabanas, colchas, toallas, cobertores', id_t: 28},
        {id: 43, name: 'Artículos de temporada', id_t: 29},
        {id: 108, name: 'Insumos para impresoras y copiadoras', id_t: 29},
        {id: 81, name: 'Disfraces y trajes tipicos', id_t: 29},
        {id: 121, name: 'Talabartería', id_t: 29},
        {id: 44, name: 'Guitarras, tambores, violines, teclados, etc', id_t: 30},
        {id: 45, name: 'Cámaras, memorias, lentes, luces, papel para imprimir, pantallas', id_t: 31},
        {id: 46, name: 'Candados, llaves, duplicados,Etc', id_t: 32},
        {id: 47, name: 'Herramienta, tornillos, clavos, pinzas, cables, lijas, etc', id_t: 33},
        {id: 48, name: 'Dibujos, marcos, pintura, etc', id_t: 34},
        {id: 49, name: 'Tubos, cobre, aluminio, angulos, soldaduras, etc', id_t: 35},
        {id: 50, name: 'Miel, cera, propóleo', id_t: 36},
        {id: 51, name: 'Granola, alegrías, frutos secos, shampoos, jabones, pomadas', id_t: 37},
        {id: 52, name: 'Jamón, queso, mayonesa, yogurth, crema', id_t: 38},
        {id: 132, name: 'Quesos', id_t: 38},
        {id: 95, name: 'Productos oaxaqueños', id_t: 38},
        {id: 141, name: 'Otros', id_t: 39},
        {id: 139, name: 'Otros', id_t: 40},
        {id: 101, name: 'Juguetes de destreza (trompos, cubos de rubick, etc.)', id_t: 40},
        {id: 55, name: 'Camisetas, ropa interior, lencería y medias', id_t: 41},
        {id: 78, name: 'Piercing y expansiones', id_t: 42},
        {id: 59, name: 'Reparaciones para relojes, pilas, correas, etc', id_t: 42},
        {id: 57, name: 'No contiene materiales preciosos', id_t: 42},
        {id: 69, name: 'Contiene materiales preciosos (oro, plata y otros)', id_t: 43},
        {id: 71, name: 'Novedades', id_t: 44},
        {id: 111, name: 'Audiolibros', id_t: 45},
        {id: 142, name: 'Otros', id_t: 46},
        {id: 143, name: 'Otros', id_t: 48},
        {id: 61, name: 'Bazar', id_t: 48},
        {id: 64, name: 'Calzas de regaton y cauchos', id_t: 49},
        {id: 63, name: 'Tuppers, desechables, bolsas, etc', id_t: 49},
        {id: 65, name: 'Ropa deportiva, balones, guantes de boxeo, pesas, fajas, etc', id_t: 50},
        {id: 120, name: 'Artículos para bicicletas', id_t: 50},
        {id: 66, name: 'Gorras, gorros, bufandas, cinturones, etc.', id_t: 51},
        {id: 53, name: 'Armazones y lentes', id_t: 51},
        {id: 104, name: 'Pan tradicional', id_t: 52},
        {id: 67, name: 'Pasteles, pan y galletas', id_t: 52},
        {id: 68, name: 'Rompecabezas, plastilinas, tangram, memorama, etc.', id_t: 53},
        {id: 72, name: 'Cortes de cabello, colocación de uñas y pestañas, etc.', id_t: 56},
        {id: 79, name: 'Adornos para sujetar el cabello', id_t: 56},
        {id: 98, name: 'Contiene cuarzos y otro tipo de piedras', id_t: 57},
        {id: 76, name: 'Artesanías en madera, barro, pintado a mano, bordado, tejido, etc.', id_t: 57},
        {id: 113, name: 'Hamacas', id_t: 57},
        {id: 144, name: 'Otros', id_t: 58},
        {id: 126, name: 'Frutos secos', id_t: 58},
        {id: 80, name: 'Botones, listones, hilos, borlas, lazos, lentejuela, etc.', id_t: 59},
        {id: 83, name: 'Otros', id_t: 61},
        {id: 117, name: 'Colocacion de recubrimientos: mármol, talabera, granito, etc.', id_t: 62},
        {id: 116, name: 'Renta de barquitos', id_t: 62},
        {id: 131, name: 'Internet', id_t: 62},
        {id: 107, name: 'Maquillista y pintacaritas', id_t: 62},
        {id: 112, name: 'Magos, payasos y personificadores', id_t: 62},
        {id: 106, name: 'Herrería', id_t: 62},
        {id: 145, name: 'Bolero', id_t: 62},
        {id: 122, name: 'Construcción', id_t: 62},
        {id: 124, name: 'Globero', id_t: 62},
        {id: 118, name: 'Vulcanizadora y reparaciones automotrices', id_t: 62},
        {id: 149, name: 'Mudanzas', id_t: 62},
        {id: 150, name: 'Instalación de puertas eléctricas', id_t: 62},
        {id: 152, name: 'Cilindrero', id_t: 62},
        {id: 102, name: 'Brincolines', id_t: 62},
        {id: 87, name: 'Autolavado y lavautos', id_t: 62},
        {id: 90, name: 'Boletos de lotería y pronósticos', id_t: 62},
        {id: 88, name: 'Sanitarios', id_t: 62},
        {id: 103, name: 'Toma de presión y muestras médicas', id_t: 62},
        {id: 119, name: 'Reparación de bicicletas', id_t: 62},
        {id: 146, name: 'Venta de recargas', id_t: 62},
        {id: 147, name: 'Maquinitas', id_t: 62},
        {id: 148, name: 'Rótulos', id_t: 62},
        {id: 96, name: 'Artículos para cocina', id_t: 63},
        {id: 125, name: 'Artículos decorativos', id_t: 63},
        {id: 97, name: 'Artículos para baños', id_t: 63},
        {id: 129, name: 'Tapetes y alfombras', id_t: 63},
        {id: 105, name: 'Muebles en madera, metal, etc.', id_t: 65},
        {id: 123, name: 'Otros', id_t: 66},
        {id: 133, name: 'Maratones', id_t: 67}
      ];

      var results_arr = [];
      for (var idx = 0; idx < results.length; idx++) {

        if (id === results[idx].id_t) {
          results_arr.push(results[idx]);
        }

      }

      if (results_arr.length === 0) {
        results_arr.push({id: 0, name: 'Otros', id_t: id});
      }

      $rootScope.sub_twist_list = results_arr;

      setTimeout(function () {
        $rootScope.dataRegisterCompleteRecord.sub_twist = results_arr[0].id;

        $scope.$apply();
      }, 100);

    };

    $rootScope.setSubTwistSelected = function (opc) {
      $rootScope.dataRegisterCompleteRecord.sub_twist = opc;
    };

    $rootScope.getDays = function () {

      var now_ = new Date().getFullYear();

      var now_year = now_;
      var back_year = now_ - 100;

      if ($rootScope.date_register.y.length > 3) {
        if ($rootScope.date_register.y < back_year) {
          $rootScope.date_register.y = null;
          $rootScope.msgToastRegister($filter('translate')('REGISTER_ATMS_JS_1') + back_year);
        } else if ($rootScope.date_register.y > now_year) {
          $rootScope.date_register.y = null;
          $rootScope.msgToastRegister($filter('translate')('REGISTER_ATMS_JS_2') + now_year);
        } else {
          try {
            var results = new Date($rootScope.date_register.y, ($rootScope.date_register.m), 0).getDate();
            $rootScope.date_register.d = 1;
            $rootScope.list_days = [];
            for (var idx = 1; idx <= results; idx++) {
              $rootScope.list_days.push(idx);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }

    };

    $rootScope.getStates = function () {
      var results = [
        {id: "Aguascalientes", name: "Aguascalientes"},
        {id: "Baja California", name: "Baja California"},
        {id: "Baja California Sur", name: "Baja California Sur"},
        {id: "Campeche", name: "Campeche"},
        {id: "Coahuila de Zaragoza", name: "Coahuila de Zaragoza"},
        {id: "Colima", name: "Colima"},
        {id: "Chiapas", name: "Chiapas"},
        {id: "Chihuahua", name: "Chihuahua"},
        {id: "Ciudad de México", name: "Ciudad de México"},
        {id: "Durango", name: "Durango"},
        {id: "Guanajuato", name: "Guanajuato"},
        {id: "Guerrero", name: "Guerrero"},
        {id: "Hidalgo", name: "Hidalgo"},
        {id: "Jalisco", name: "Jalisco"},
        {id: "México", name: "México"},
        {id: "Michoacán de Ocampo", name: "Michoacán de Ocampo"},
        {id: "Morelos", name: "Morelos"},
        {id: "Nayarit", name: "Nayarit"},
        {id: "Nuevo León", name: "Nuevo León"},
        {id: "Oaxaca", name: "Oaxaca"},
        {id: "Puebla", name: "Puebla"},
        {id: "Querétaro", name: "Querétaro"},
        {id: "Quintana Roo", name: "Quintana Roo"},
        {id: "San Luis Potosí", name: "San Luis Potosí"},
        {id: "Sinaloa", name: "Sinaloa"},
        {id: "Sonora", name: "Sonora"},
        {id: "Tabasco", name: "Tabasco"},
        {id: "Tamaulipas", name: "Tamaulipas"},
        {id: "Tlaxcala", name: "Tlaxcala"},
        {id: "Veracruz de Ignacio de la Llave", name: "Veracruz de Ignacio de la Llave"},
        {id: "Yucatán", name: "Yucatán"},
        {id: "Zacatecas", name: "Zacatecas"}
      ];
      return results;
    };

    $rootScope.getNationalities = function () {
      var results = [
        {id: 173, code: 'AD', name: 'Andorra', country: 'Andorra'},
        {id: 174, code: 'AF', name: 'Afgana', country: 'Afganistán'},
        {id: 175, code: 'AG', name: 'Antigua y Barbado', country: 'Antigua y Barbado'},
        {id: 176, code: 'AI', name: 'Anguila', country: 'Anguila'},
        {id: 177, code: 'AN', name: 'Albania', country: 'Albania'},
        {id: 178, code: 'AO', name: 'Angola', country: 'Angola'},
        {id: 179, code: 'AS', name: 'Ascensión', country: 'Ascensión'},
        {id: 180, code: 'AT', name: 'Argentina', country: 'Argentina'},
        {id: 181, code: 'AU', name: 'Australiana', country: 'Australia'},
        {id: 182, code: 'AW', name: 'Árabe', country: 'Arabia'},
        {id: 183, code: 'AX', name: 'Azores', country: 'Azores'},
        {id: 184, code: 'BB', name: 'Barbados', country: 'Barbados'},
        {id: 185, code: 'BD', name: 'Bangladesh', country: 'Bangladesh'},
        {id: 186, code: 'BE', name: 'Belga', country: 'Bélgica'},
        {id: 187, code: 'BF', name: 'Burkina', country: 'Burkina'},
        {id: 188, code: 'BG', name: 'Búlgara', country: 'Bulgaria'},
        {id: 189, code: 'BH', name: 'Bahrein', country: 'Bahrein'},
        {id: 190, code: 'BI', name: 'Burundi', country: 'Burundi'},
        {id: 191, code: 'BJ', name: 'Benin', country: 'Benin'},
        {id: 192, code: 'BK', name: 'Birmania', country: 'Birmania'},
        {id: 193, code: 'BM', name: 'Bután', country: 'Bután'},
        {id: 194, code: 'BN', name: 'Brunei', country: 'Brunei'},
        {id: 195, code: 'BO', name: 'Boliviana', country: 'Bolivia'},
        {id: 196, code: 'BR', name: 'Brasileño', country: 'Brasil'},
        {id: 197, code: 'BS', name: 'Bahamas', country: 'Bahamas'},
        {id: 198, code: 'BU', name: 'Bermudas', country: 'Bermudas'},
        {id: 199, code: 'BW', name: 'Botswana', country: 'Botswana'},
        {id: 200, code: 'BX', name: 'Bosnia Herzegovina', country: 'Bosnia Herzegovina'},
        {id: 201, code: 'BZ', name: 'Belice', country: 'Belice'},
        {id: 202, code: 'CB', name: 'Colombiana', country: 'Colombia'},
        {id: 203, code: 'CC', name: 'Córcega', country: 'Córcega'},
        {id: 204, code: 'CD', name: 'Chad', country: 'Chad'},
        {id: 205, code: 'CF', name: 'Rep. Central Africana', country: 'Rep. Central Africana'},
        {id: 206, code: 'CG', name: 'Congo', country: 'Congo'},
        {id: 207, code: 'CH', name: 'Liechtenstein', country: 'Liechtenstein'},
        {id: 208, code: 'CI', name: 'Islas Caimán', country: 'Islas Caimán'},
        {id: 209, code: 'CJ', name: 'Comoros', country: 'Comoros'},
        {id: 210, code: 'CL', name: 'Chilena', country: 'Chile'},
        {id: 211, code: 'CM', name: 'Camerunés', country: 'Camerún'},
        {id: 212, code: 'CN', name: 'Canadiense', country: 'Canadá'},
        {id: 213, code: 'CP', name: 'China', country: 'China Pekín)'},
        {id: 214, code: 'CS', name: 'República Checa Eslovaca', country: 'República Checa Eslovaca'},
        {id: 215, code: 'CU', name: 'Cariacou', country: 'Cariacou'},
        {id: 216, code: 'CV', name: 'Cabo Verde', country: 'Cabo Verde'},
        {id: 217, code: 'CY', name: 'Chipre', country: 'Chipre'},
        {id: 218, code: 'DF', name: 'Austriaca', country: 'Austria'},
        {id: 219, code: 'DJ', name: 'Djibouti', country: 'Djibouti'},
        {id: 220, code: 'DK', name: 'Danés', country: 'Dinamarca'},
        {id: 221, code: 'DM', name: 'Dominicana', country: 'Dominicana'},
        {id: 222, code: 'DO', name: 'Dominicana', country: 'República Dominicana'},
        {id: 223, code: 'DW', name: 'Alemana', country: 'Alemania'},
        {id: 224, code: 'DZ', name: 'Argelia', country: 'Argelia'},
        {id: 225, code: 'EC', name: 'Ecuatoriana', country: 'Ecuador'},
        {id: 226, code: 'EG', name: 'Egipcia', country: 'Egipto'},
        {id: 227, code: 'EM', name: 'Timor Oriental', country: 'Timor Oriental'},
        {id: 228, code: 'ES', name: 'Española', country: 'España'},
        {id: 229, code: 'ET', name: 'Etiopia', country: 'Etiopia'},
        {id: 230, code: 'FA', name: 'Islas Falkland Malvinas)', country: 'Islas Falkland Malvinas)'},
        {id: 231, code: 'FE', name: 'Islas Faroe', country: 'Islas Faroe'},
        {id: 232, code: 'FI', name: 'Finlandia', country: 'Finlandia'},
        {id: 233, code: 'FJ', name: 'Fiji', country: 'Fiji'},
        {id: 234, code: 'FP', name: 'Polinesia', country: 'Polinesia'},
        {id: 235, code: 'FR', name: 'Francesa', country: 'Francia'},
        {id: 236, code: 'GB', name: 'Gabón', country: 'Gabón'},
        {id: 237, code: 'GD', name: 'Granada', country: 'Granada'},
        {id: 238, code: 'GE', name: 'Groenlandia', country: 'Groenlandia'},
        {id: 239, code: 'GF', name: 'Guayana Francesa', country: 'Guayana Francesa'},
        {id: 240, code: 'GH', name: 'Ghana', country: 'Ghana'},
        {id: 241, code: 'GI', name: 'Gibraltar', country: 'Gibraltar'},
        {id: 242, code: 'GM', name: 'Gambia', country: 'Gambia'},
        {id: 243, code: 'GN', name: 'Guinea', country: 'Guinea'},
        {id: 244, code: 'GP', name: 'Guadalupe', country: 'Guadalupe'},
        {id: 245, code: 'GQ', name: 'Guinea Ecuatorial', country: 'Guinea Ecuatorial'},
        {id: 246, code: 'GR', name: 'Griega', country: 'Grecia'},
        {id: 247, code: 'GT', name: 'Guatemalteca', country: 'Guatemala'},
        {id: 248, code: 'GW', name: 'Guinea Bissau', country: 'Guinea Bissau'},
        {id: 249, code: 'GX', name: 'República De Georgia', country: 'República De Georgia'},
        {id: 250, code: 'GY', name: 'Guyana', country: 'Guyana'},
        {id: 251, code: 'HA', name: 'Haitiana', country: 'Haití'},
        {id: 252, code: 'HK', name: 'Hong Kong', country: 'Hong Kong'},
        {id: 253, code: 'HN', name: 'Hondureña', country: 'Honduras'},
        {id: 254, code: 'HR', name: 'Cubano', country: 'Cuba'},
        {id: 255, code: 'HU', name: 'Húngara', country: 'Húngara'},
        {id: 256, code: 'HX', name: 'Croata', country: 'Croacia'},
        {id: 257, code: 'IB', name: 'India', country: 'India'},
        {id: 258, code: 'IC', name: 'Costa De Marfil', country: 'Costa De Marfil'},
        {id: 259, code: 'IE', name: 'Irlandesa', country: 'Irlandesa'},
        {id: 260, code: 'IF', name: 'Indonesia', country: 'Indonesia'},
        {id: 261, code: 'IG', name: 'Israelí', country: 'Israelí'},
        {id: 262, code: 'IQ', name: 'Iraquí', country: 'Iraquí'},
        {id: 263, code: 'IR', name: 'Iraní', country: 'Iraní'},
        {id: 264, code: 'IS', name: 'Islandia', country: 'Islandia'},
        {id: 265, code: 'IT', name: 'Italiano', country: 'Italiano'},
        {id: 266, code: 'JM', name: 'Jamaicano', country: 'Jamaicano'},
        {id: 267, code: 'JO', name: 'Jordano', country: 'Jordano'},
        {id: 268, code: 'JP', name: 'Japonesa', country: 'Japonesa'},
        {id: 269, code: 'KA', name: 'Kampuchea', country: 'Kampuchea'},
        {id: 270, code: 'KE', name: 'Kenya', country: 'Kenya'},
        {id: 271, code: 'KI', name: 'Kiribati', country: 'Kiribati'},
        {id: 272, code: 'KN', name: 'San Cristóbal De Neváis', country: 'San Cristóbal De Neváis'},
        {id: 273, code: 'KR', name: 'Corea Del Sur', country: 'Corea Del Sur'},
        {id: 274, code: 'KW', name: 'Kuwait', country: 'Kuwait'},
        {id: 275, code: 'KX', name: 'Corea Del Norte', country: 'Corea Del Norte'},
        {id: 276, code: 'LB', name: 'Libanes', country: 'Libanes'},
        {id: 277, code: 'LC', name: 'Santa Lucia', country: 'Santa Lucia'},
        {id: 278, code: 'LE', name: 'Islas De Sotavento', country: 'Islas De Sotavento'},
        {id: 279, code: 'LK', name: 'Sri Lanka', country: 'Sri Lanka'},
        {id: 280, code: 'LO', name: 'Laos', country: 'Laos'},
        {id: 281, code: 'LR', name: 'Liberia', country: 'Liberia'},
        {id: 282, code: 'LS', name: 'Lesotho', country: 'Lesotho'},
        {id: 283, code: 'LT', name: 'Lituania', country: 'Lituania'},
        {id: 284, code: 'LU', name: 'Luxemburgo', country: 'Luxemburgo'},
        {id: 285, code: 'LV', name: 'Libia', country: 'Libia'},
        {id: 286, code: 'LX', name: 'Letonia', country: 'Letonia'},
        {id: 287, code: 'MC', name: 'Mongolia', country: 'Mongolia'},
        {id: 288, code: 'MD', name: 'Madeira', country: 'Madeira'},
        {id: 289, code: 'MG', name: 'Madagascar', country: 'Madagascar'},
        {id: 290, code: 'MH', name: 'Macedonia', country: 'Macedonia'},
        {id: 291, code: 'MJ', name: 'Macao', country: 'Macao'},
        {id: 292, code: 'MK', name: 'Montserrat', country: 'Montserrat'},
        {id: 293, code: 'ML', name: 'Mali', country: 'Mali'},
        {id: 294, code: 'MM', name: 'Montenegro', country: 'Montenegro'},
        {id: 295, code: 'MP', name: 'Sao Tome y Principado', country: 'Sao Tome y Principado'},
        {id: 296, code: 'MQ', name: 'Martinico', country: 'Martinico'},
        {id: 297, code: 'MR', name: 'Mauritania', country: 'Mauritania'},
        {id: 298, code: 'MT', name: 'Malta', country: 'Malta'},
        {id: 299, code: 'MU', name: 'Mauricio', country: 'Mauricio'},
        {id: 300, code: 'MV', name: 'Maldivas', country: 'Maldivas'},
        {id: 301, code: 'MW', name: 'Malawi', country: 'Malawi'},
        {id: 302, code: 'MX', name: 'Mexicana', country: 'México'},
        {id: 303, code: 'MY', name: 'Malasia', country: 'Malasia'},
        {id: 304, code: 'MZ', name: 'Mozambique', country: 'Mozambique'},
        {id: 305, code: 'NA', name: 'Nauru', country: 'Nauru'},
        {id: 306, code: 'ND', name: 'No Definido', country: 'No Definido'},
        {id: 307, code: 'NI', name: 'Nicaragua', country: 'Nicaragua'},
        {id: 308, code: 'NL', name: 'Holandesa', country: 'Holanda'},
        {id: 309, code: 'NN', name: 'Antillas Holandesas', country: 'Antillas Holandesas'},
        {id: 310, code: 'NO', name: 'Noruega', country: 'Noruega'},
        {id: 311, code: 'NP', name: 'Nepal', country: 'Nepal'},
        {id: 312, code: 'NR', name: 'Nigeriano', country: 'Nigeria'},
        {id: 313, code: 'NW', name: 'Nueva Caledonia', country: 'Nueva Caledonia'},
        {id: 314, code: 'NZ', name: 'Nueva Zelandia', country: 'Nueva Zelandia'},
        {id: 315, code: 'OA', name: 'Katar', country: 'Katar'},
        {id: 316, code: 'OM', name: 'Omán', country: 'Omán'},
        {id: 317, code: 'PG', name: 'Papúa Nueva Guinea', country: 'Papúa Nueva Guinea'},
        {id: 318, code: 'PH', name: 'Filipinas', country: 'Filipinas'},
        {id: 319, code: 'PK', name: 'Pakistán', country: 'Pakistán'},
        {id: 320, code: 'PL', name: 'Polaco', country: 'Polonia'},
        {id: 321, code: 'PM', name: 'Panameño', country: 'Panamá'},
        {id: 322, code: 'PS', name: 'Islas Pitcairn', country: 'Islas Pitcairn'},
        {id: 323, code: 'PT', name: 'Portugués', country: 'Portugal'},
        {id: 324, code: 'PU', name: 'Peruana', country: 'Perú'},
        {id: 325, code: 'PY', name: 'Paraguayo', country: 'Paraguay'},
        {id: 326, code: 'RC', name: 'Marroquí', country: 'Marruecos'},
        {id: 327, code: 'RE', name: 'Islas Reunión', country: 'Islas Reunión'},
        {id: 328, code: 'RO', name: 'Rumana', country: 'Rumania'},
        {id: 329, code: 'RU', name: 'Rusa', country: 'Rusia'},
        {id: 330, code: 'RW', name: 'Ruanda', country: 'Ruanda'},
        {id: 331, code: 'SA', name: 'Saudí Árabe', country: 'Arabia Saudita'},
        {id: 332, code: 'SB', name: 'Sudan', country: 'Sudan'},
        {id: 333, code: 'SE', name: 'Sueco', country: 'Suecia'},
        {id: 334, code: 'SF', name: 'San Vencen y Las Granadas', country: 'San Vencen y Las Granadas'},
        {id: 335, code: 'SH', name: 'Santa Helena', country: 'Santa Helena'},
        {id: 336, code: 'SI', name: 'Islas Salmon', country: 'Islas Salmon'},
        {id: 337, code: 'SN', name: 'Senegal', country: 'Senegal'},
        {id: 338, code: 'SO', name: 'Somalia', country: 'Somalia'},
        {id: 339, code: 'SP', name: 'San Pierre y Miquelón', country: 'San Pierre y Miquelón'},
        {id: 340, code: 'SR', name: 'Surinam', country: 'Surinam'},
        {id: 341, code: 'SS', name: 'San Kitts', country: 'San Kitts'},
        {id: 342, code: 'ST', name: 'Islas Santa Cruz', country: 'Islas Santa Cruz'},
        {id: 343, code: 'SU', name: 'Estonia', country: 'Estonia'},
        {id: 344, code: 'SV', name: 'Salvadoreña', country: 'El Salvador'},
        {id: 345, code: 'SW', name: 'Suiza', country: 'Suiza'},
        {id: 346, code: 'SX', name: 'Serbia', country: 'Serbia'},
        {id: 347, code: 'SY', name: 'Siria', country: 'Siria'},
        {id: 348, code: 'SZ', name: 'Swazilandia', country: 'Swazilandia'},
        {id: 349, code: 'TA', name: 'Tonga', country: 'Tonga'},
        {id: 350, code: 'TC', name: 'Turcos e Islas Caicos', country: 'Turcos e Islas Caicos'},
        {id: 351, code: 'TD', name: 'Tristán De Cunha', country: 'Tristán De Cunha'},
        {id: 352, code: 'TG', name: 'Togo', country: 'Togo'},
        {id: 353, code: 'TH', name: 'Tailandia', country: 'Tailandia'},
        {id: 354, code: 'TR', name: 'Turca', country: 'Turquía'},
        {id: 355, code: 'TT', name: 'Trinidad y Tobago', country: 'Trinidad y Tobago'},
        {id: 356, code: 'TU', name: 'Túnez', country: 'Túnez'},
        {id: 357, code: 'TV', name: 'Tuvala', country: 'Tuvala'},
        {id: 358, code: 'TW', name: 'Taiwán', country: 'Taiwán'},
        {id: 359, code: 'TZ', name: 'Tanzania', country: 'Tanzania'},
        {id: 360, code: 'UA', name: 'Ucraniano', country: 'Ucrania'},
        {id: 361, code: 'UG', name: 'Uganda', country: 'Uganda'},
        {id: 362, code: 'UK', name: 'Reino Unido', country: 'Reino Unido'},
        {id: 363, code: 'UM', name: 'Árabe', country: 'Emiratos Árabes Unidos'},
        {id: 364, code: 'US', name: 'Estadounidense', country: 'Estados Unidos'},
        {id: 365, code: 'UY', name: 'Uruguayo', country: 'Uruguay'},
        {id: 366, code: 'VC', name: 'Ciudad Del Vaticano', country: 'Ciudad Del Vaticano'},
        {id: 367, code: 'VE', name: 'Venezolana', country: 'Venezuela'},
        {id: 368, code: 'VG', name: 'Islas Vírgenes Inglesas', country: 'Islas Vírgenes Inglesas'},
        {id: 369, code: 'VN', name: 'Vietnami', country: 'Vietnam'},
        {id: 370, code: 'VU', name: 'Vanuatu', country: 'Vanuatu'},
        {id: 371, code: 'WS', name: 'Samoa Oeste', country: 'Samoa Oeste'},
        {id: 372, code: 'WT', name: 'Gales / Isla Futura', country: 'Gales / Isla Futura'},
        {id: 373, code: 'XN', name: 'Eslovenia', country: 'Eslovenia'},
        {id: 374, code: 'YE', name: 'Yemen Del Sur)', country: 'Yemen Del Sur)'},
        {id: 375, code: 'YS', name: 'Yemen Del Norte)', country: 'Yemen Del Norte)'},
        {id: 376, code: 'ZA', name: 'Sudafricana', country: 'África Del Sur'},
        {id: 377, code: 'ZM', name: 'Zambia', country: 'Zambia'},
        {id: 378, code: 'ZR', name: 'Zaire', country: 'Zaire'},
        {id: 379, code: 'ZW', name: 'Zimbabwe', country: 'Zimbabwe)'}
      ];
      return results;
    };

    $rootScope.twistSelected = function (item) {
      $rootScope.dataRegisterCompleteRecord.twist = item;

    };

    $rootScope.stateSelected = function (item) {
      $rootScope.dataRegisterCompleteRecord.state = item;
    };

    $scope.selectPermitType = function (opc) {
      try {
        $rootScope.activeGPS();
      } catch (e) {
      }
      $rootScope.dataRegisterCompleteRecord.permit_type = opc;
      $('#step_' + $scope.step).removeClass('animFade2');
      $('#btn_continue').removeClass('animFade2');
      $scope.step = $scope.step + 1;
      $('#step_' + $scope.step).addClass('animFade2');
      $('#btn_continue').addClass('animFade2');
    };

    $scope.selectTrade = function (opc) {
      try {
        $rootScope.activeGPS();
      } catch (e) {
      }
      $rootScope.dataRegisterCompleteRecord.trade = opc;
      $('#step_' + $scope.step).removeClass('animFade2');
      $('#btn_continue').removeClass('animFade2');
      $scope.step = $scope.step + 1;
      $('#step_' + $scope.step).addClass('animFade2');
      $('#btn_continue').addClass('animFade2');
    };

    $rootScope.search_postal_code = function (cp) {

      if (cp.length == 5) {

        console.log(cp);

        $scope.showLoading();

        $http.get($rootScope.SEARCH_POSTAL_CODE + '?postal_code=' + cp,
          {}, {
            headers: {},
            timeout: $rootScope.HTTP_TIME_OUT_MINUTES
          })
          .then(function (success) {

              console.log(success.data);

              $scope.closeLoading();

              $rootScope.sepomex_state = [];
              $rootScope.sepomex_cities = [];
              $rootScope.sepomex_colonies = [];
              $rootScope.dataRegisterCompleteRecord.state = '';
              $rootScope.dataRegisterCompleteRecord.city = '';
              $rootScope.dataRegisterCompleteRecord.colony = '';

              $rootScope.sepomex_state = success.data.sepomex_state;
              $rootScope.sepomex_cities = success.data.sepomex_cities;
              $rootScope.sepomex_colonies = success.data.sepomex_colonies;

              $rootScope.dataRegisterCompleteRecord.state = success.data.sepomex_state[0];
              $rootScope.dataRegisterCompleteRecord.city = success.data.sepomex_cities[0];
              $rootScope.dataRegisterCompleteRecord.colony = success.data.sepomex_colonies[0];

              /*
              //Ciudad
              setTimeout(function () {

                var sepomex_cities = success.data.sepomex_cities;
                console.log(sepomex_cities);
                for (var idx = 0; idx < sepomex_cities.length; idx++) {
                  $rootScope.sepomex_cities.push(sepomex_cities[idx].city);
                }

              }, 600);

              //Colonias
              setTimeout(function () {

                var sepomex_colonies = result_select;
                console.log(sepomex_colonies);
                for (var idx = 0; idx < sepomex_colonies.length; idx++) {
                  if (opc == 1) { //gestion direccion del ciudadano
                    $rootScope.sepomex_colonies.push(sepomex_colonies[idx].colony);
                    $rootScope.dataManagement.colony = sepomex_colonies[0].colony;
                  } else if (opc == 2) { //gestion direccion del servicio
                    $rootScope.sepomex_colonies_service.push(sepomex_colonies[idx].colony);
                    $rootScope.dataManagement.colony_service = sepomex_colonies[0].colony;
                  } else if (opc == 3) { //promotores
                    $rootScope.sepomex_colonies.push(sepomex_colonies[idx].colony);
                    $rootScope.dataAdvertising.colony = sepomex_colonies[0].colony;
                  }
                }
                console.log('--------------------');

                $scope.$apply();

                $rootScope.closeLoading();
              }, 1000);

              if (success.data.sepomex_state.length == 0) {
                $rootScope.dataManagement.cp = '';
                $rootScope.dataManagement.cp_service = '';
                $rootScope.msgToast('¡Uups!. El código postal es inválido o no corresponde al municipio/alcaldía, intenta nuevamente');
              }
              */

            },
            function (error) {

              $scope.closeLoading();

              if(error.status == -1) {
                $rootScope.checkWifiConnection();
              } else if(error.status == 403) {
                $rootScope.toastLetAccount(error.data.message);
              } else {
                $rootScope.toastLetAccountWifi();
              }

            });

      }

    };

    $scope.continueStepCompleteRecord = function () {

      $ionicScrollDelegate.scrollTo(0, 0, false);

      try {
        $rootScope.activeGPS();
      } catch (e) {
      }

      switch ($scope.step) {
        case 1:
          if ($rootScope.dataRegisterCompleteRecord.id === null || $rootScope.dataRegisterCompleteRecord.id.length < 5) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_3'));
          } else {
            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');
            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
          }

          break;
        case 2:
          if ($rootScope.dataRegisterCompleteRecord.postal_code === null || $rootScope.dataRegisterCompleteRecord.postal_code.length < 5) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_4'));
          } else if ($rootScope.dataRegisterCompleteRecord.street === null || $rootScope.dataRegisterCompleteRecord.street < 5) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_5'));
          } else {

            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');

            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
            $ionicScrollDelegate.scrollTo(0, 0, false);

          }
          break;
        case 3:

          if($rootScope.dataRegisterCompleteRecord.name_store === null || $rootScope.dataRegisterCompleteRecord.name_store.length < 3) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_19'));
          } else if ($rootScope.dataRegisterCompleteRecord.organization === null || $rootScope.dataRegisterCompleteRecord.organization.length < 3) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_6'));
          } else {
            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');
            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
          }
          break;
        case 6:
          if ($rootScope.date_register.y === null || $rootScope.date_register.y.toString().length < 4) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_7'));
          } else if ($rootScope.dataRegisterCompleteRecord.antiquity === null || $rootScope.dataRegisterCompleteRecord.toString().length === 0) {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_8'));
          } else {
            $rootScope.dataRegisterCompleteRecord.date_register = $rootScope.date_register.y + '-' +
              ($rootScope.date_register.m < 10 ? '0' + $rootScope.date_register.m : $rootScope.date_register.m) + '-' +
              ($rootScope.date_register.d < 10 ? '0' + $rootScope.date_register.d : $rootScope.date_register.d);
            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');
            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
          }
          break;
        case 7:
          $('#step_' + $scope.step).removeClass('animFade2');
          $('#btn_continue').removeClass('animFade2');
          $scope.step = $scope.step + 1;
          $('#step_' + $scope.step).addClass('animFade2');
          $('#btn_continue').addClass('animFade2');
          break;
        case 8:

          var valid = false;
          for (var idx = 0; idx < $rootScope.days_schedule.length; idx++) {
            if ($rootScope.days_schedule[idx].active) {
              valid = true;
              break;
            }
          }

          if (valid) {
            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');
            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
          } else {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_9'));
          }
          break;
        case 9:
          var valid = true;
          for (var idx = 0; idx < $rootScope.arr_photo_evidence.length; idx++) {
            if ($rootScope.arr_photo_evidence[idx].active === false) {
              valid = false;
              break;
            }
          }

          if (valid) {
            $('#step_' + $scope.step).removeClass('animFade2');
            $('#btn_continue').removeClass('animFade2');
            $scope.step = $scope.step + 1;
            $('#step_' + $scope.step).addClass('animFade2');
            $('#btn_continue').addClass('animFade2');
          } else {
            $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_10'));
          }
          break;
      }
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

    $rootScope.focusInputCode = function () {
      console.log('focus');
      setTimeout(function () {
        $scope.$digest();
      }, 100);
      setTimeout(function () {
        $scope.$apply();
      }, 110);
    };

    $rootScope.blurInput = function () {
      console.log('refresh module');
      setTimeout(function () {
        $scope.$digest();
      }, 100);
      setTimeout(function () {
        $scope.$apply();
      }, 110);
    };

    $rootScope.convertToMayus = function () {
      try {
        $rootScope.dataRegisterCompleteRecord.id = $rootScope.dataRegisterCompleteRecord.id.toUpperCase();
      } catch (e) {
      }
      try {
        $rootScope.dataRegisterCompleteRecord.curp = $rootScope.dataRegisterCompleteRecord.curp.toUpperCase();
      } catch (e) {
      }
      try {
        $rootScope.dataRegisterCompleteRecord.siscovip = $rootScope.dataRegisterCompleteRecord.siscovip.toUpperCase();
      } catch (e) {
      }
    };

    $scope.sendCode = function () {

      //valid code
      if ($rootScope.dataRegisterCompleteRecord.email === null || $rootScope.dataRegisterCompleteRecord.email.length < 3) {
        $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_11'));
      } else if ($rootScope.dataRegisterCompleteRecord.phone === null || $rootScope.dataRegisterCompleteRecord.phone.length < 10) {
        $rootScope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_18'));
      } else {
        $scope.showLoading();

        $http.post($rootScope.SEND_CODE,
          {
            'email': $rootScope.dataRegisterCompleteRecord.email,
            'phone': $rootScope.dataRegisterCompleteRecord.phone,
            'name': $rootScope.dataRegisterCompleteRecord.name
          }, {
            headers: {},
            timeout: $rootScope.HTTP_TIME_OUT_MINUTES
          })
          .then(function (success) {

              $scope.closeLoading();
              if (success.data[0].results === 'ok') {
                $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(false)
                    .title($filter('translate')('REGISTER_COMPLETE_JS_12'))
                    .textContent($filter('translate')('REGISTER_COMPLETE_JS_13'))
                    .ok($filter('translate')('CONFIG_MENU_JS_14'))
                    .openFrom({
                      top: -50,
                      width: 30,
                      height: 80
                    })
                    .closeTo({
                      left: 1500
                    })
                );
              } else {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent($filter('translate')('REGISTER_COMPLETE_JS_14'))
                    .position('bottom')
                    .hideDelay(3000)
                );
              }

            },
            function (error) {

              $scope.closeLoading();
              console.log(error);

              if(error.status == -1) {
                $rootScope.checkWifiConnection();
              } else if(error.status == 403) {
                $rootScope.toastLetAccount(error.data.message);
              } else {
                $rootScope.toastLetAccountWifi();
              }

            });
      }

    };

    $scope.return = function () {

      $ionicScrollDelegate.scrollTo(0, 0, false);

      if ($scope.step > 0) {
        $('#step_' + $scope.step).removeClass('animFade2');
        $('#btn_continue').removeClass('animFade2');
      }

      $scope.step = $scope.step - 1;

      if ($scope.step === 0) {
        $state.go('menu.principal', {}, {location: 'replace'});
      } else {
        $('#step_' + $scope.step).addClass('animFade2');
        $('#btn_continue').addClass('animFade2');
      }

    };

    $scope.continuePrincipal = function () {
      $state.go('menu.principal', {}, {location: 'replace'});
    };

    $rootScope.msgToastRegister = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom')
          .hideDelay(3000)
      );
    };

    $scope.$on('$ionicView.enter', function () {
      $ionicScrollDelegate.scrollTo(0, 0, false);
      try {
        $ionicHistory.clearHistory();
      } catch (e) {
      }
    });

    $scope.updateAccount = function () {
      console.log($rootScope.dataRegisterCompleteRecord);

      try {
        $rootScope.activeGPS();
      } catch (e) {
      }

      if ($rootScope.dataRegisterCompleteRecord.width === 0) {
        $scope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_15'));
      } else if ($rootScope.dataRegisterCompleteRecord.height === 0) {
        $scope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_16'));
      } else if ($rootScope.dataRegisterCompleteRecord.large === 0) {
        $scope.msgToastRegister($filter('translate')('REGISTER_COMPLETE_JS_17'));
      } else {
        $scope.showLoading();
        $rootScope.user = localstorage.getObject('userLetAccount');

        $http.post($rootScope.CREATE_ESTABLISHMENTS,
          {
            'name': $rootScope.user.name,
            'first_name': $rootScope.user.first_name,
            'last_name': $rootScope.user.last_name,
            'phone': $rootScope.user.phone,
            'curp': $rootScope.dataRegisterCompleteRecord.curp,
            'id': $rootScope.dataRegisterCompleteRecord.id,
            'user_id': localstorage.getObject('userLetAccount').id,
            'street': $rootScope.dataRegisterCompleteRecord.street,
            'outdoor_number': $rootScope.dataRegisterCompleteRecord.number_exterior,
            'interior_number': $rootScope.dataRegisterCompleteRecord.number_inside,
            'colony': $rootScope.dataRegisterCompleteRecord.colony,
            'postal_code': $rootScope.dataRegisterCompleteRecord.postal_code,
            'town_hall': $rootScope.dataRegisterCompleteRecord.city,
            'state': $rootScope.dataRegisterCompleteRecord.state,
            'siscovip': $rootScope.dataRegisterCompleteRecord.siscovip,

            'twist_id': $rootScope.dataRegisterCompleteRecord.twist,
            'sub_twist_id': $rootScope.dataRegisterCompleteRecord.sub_twist,

            'antiquity': $rootScope.dataRegisterCompleteRecord.antiquity,

            'type_of_permit': $rootScope.dataRegisterCompleteRecord.permit_type,
            'kind_of_position': $rootScope.dataRegisterCompleteRecord.trade,

            'organization': $rootScope.dataRegisterCompleteRecord.organization,
            'date_register': $rootScope.dataRegisterCompleteRecord.date_register,
            'lat': sessionstorage.getObject("latLetAccount"),
            'lng': sessionstorage.getObject("lngLetAccount"),
            'photos_evidence': $rootScope.arr_photo_evidence,
            'days_schedule': $rootScope.days_schedule,

            'width': $rootScope.dataRegisterCompleteRecord.width,
            'height': $rootScope.dataRegisterCompleteRecord.height,
            'large': $rootScope.dataRegisterCompleteRecord.large,
            'name_store' : $rootScope.dataRegisterCompleteRecord.name_store

          }, {
            headers: {},
            timeout: $rootScope.HTTP_TIME_OUT_MINUTES
          })
          .then(function (success) {

              console.log(success);

              if (success.status === 200) {

                $('#step_' + $scope.step).removeClass('animFade2');
                $('#btn_continue').removeClass('animFade2');
                $('#congratulations').addClass('animFade2');
                $rootScope.successAudio();

                $scope.step = $scope.step + 1;

                $http.post($rootScope.UPDATE_STATUS_SEND_ESTABLISHMENT,
                  {
                    'user_id': localstorage.getObject('userLetAccount').id_
                  }, {
                    headers: {},
                    timeout: $rootScope.HTTP_TIME_OUT_MINUTES
                  })
                  .then(function (success) {
                      $scope.closeLoading();
                      localstorage.setObject('userLetAccount', success.data.user);
                    },
                    function (error) {
                      $scope.closeLoading();

                      if(error.status == -1) {
                        $rootScope.checkWifiConnection();
                      } else if(error.status == 403) {
                        $rootScope.toastLetAccount(error.data.message);
                      } else {
                        $rootScope.toastLetAccountWifi();
                      }

                    });

              } else {
                $scope.closeLoading();
                $scope.msgToastRegister(success.data.message);
              }

            },

            function (error) { // optional
              console.log(error);
              $scope.closeLoading();

              if(error.status == -1) {
                $rootScope.checkWifiConnection();
              } else if(error.status == 403) {
                $rootScope.toastLetAccount(error.data.message);
              } else {
                $rootScope.toastLetAccountWifi();
              }

            });
      }

    };

  });
