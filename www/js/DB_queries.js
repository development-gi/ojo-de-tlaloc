'use strict';

var myDB = null;

/*
Abre la base de datos
 */
function openDatabaseGIN() {

  myDB = sqlitePlugin.openDatabase('mydb9.db', '1.0', '', 1);

}

/*
Crea las tablas de la base de datos
*/
function createTablesGIN() {

  myDB.transaction(function(tx) {

    tx.executeSql('CREATE TABLE IF NOT EXISTS product' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'rrhh_id INTEGER,' +
      'brand_id INTEGER,' +
      'store_id INTEGER,' +
      'company_id INTEGER,' +
      'promoter_id INTEGER,' +
      'real INTEGER,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS product_questions' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'id_ INTEGER,' +
      'name TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS product_answers' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'id_product_questions INTEGER,' +
      'answer TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS pop_material' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'rrhh_id INTEGER,' +
      'brand_id INTEGER,' +
      'pieces TEXT,' +
      'lat TEXT,' +
      'lng TEXT,' +
      'company_id INTEGER,' +
      'promoter_id INTEGER,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS before_pop_material' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'name TEXT,' +
      'image TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS after_pop_material' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'name TEXT,' +
      'image TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS exhibitions' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'rrhh_id INTEGER,' +
      'brand_id INTEGER,' +
      'comments TEXT,' +
      'measurements TEXT,' +
      'lat TEXT,' +
      'lng TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS exhibitions_images' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'name TEXT,' +
      'image TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS competitions' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'rrhh_id INTEGER,' +
      'is_discounts TEXT,' +
      'is_activations TEXT,' +
      'is_new TEXT,' +
      'is_others TEXT,' +
      'brand TEXT,' +
      'price TEXT,' +
      'percentage TEXT,' +
      'chain TEXT,' +
      'dateend TEXT,' +
      'dateini TEXT,' +
      'comments TEXT,' +
      'lat TEXT,' +
      'lng TEXT,' +
      'index_ TEXT);'
    );

    tx.executeSql('CREATE TABLE IF NOT EXISTS competitions_images' +
      '(Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
      'name TEXT,' +
      'image TEXT,' +
      'index_ TEXT);'
    );

  });

}

/*
Ejecuta una consulta sql INSERT/DELETE/UPDATE
*/
function setTransactionGIN(query) {

  myDB.transaction(function(tx) {

    tx.executeSql(query, [], function (tx, results) {
        console.log('Transaction DB - OK');
        console.log('%c ✅ 🍿 Transaction DB - OK', 'color:green; font-size: 3em;');
      },
      function (tx, error) {
        console.log('%c ❌​ ERROR: query ->', 'color:red; font-size: 3em;');
        console.log(error);
      });

  });

  //closeDBGIN();

}

/*
Obtiene los resultados de una consulta sql
*/
var result_select = [];
function getTransactionGIN(query) {

  myDB.readTransaction(function(tx) {

    tx.executeSql(query, [], function(tx, rs) {

      result_select = rs.rows._array;

      console.log('%c ✅ 🍿 Transaction DB - SELECT - OK', 'color:green; font-size: 3em;');

      //console.log(result_select);
      console.log('____________________________');

    }, function(tx, error) {

      console.log('%c ❌​ ERROR: query ->', 'color:red; font-size: 3em;');
      console.log(error);

      result_select = [];

    });

  });

  //closeDBGIN();

}

var result_product = [],
  result_product_questions = [],
  result_product_answers = [],
  result_images_pop_material_before = [],
  result_images_pop_material_after = [],
  result_pop_material = [],
  result_competitions = [],
  result_images_competitions = [],
  result_exhibitions = [],
  result_images_exhibitions = [],
  result_bingo = [],
  option = 0;

function getTransactionGIN_Param(query, opt) {
  option = opt;
  myDB.readTransaction(function(tx) {

    tx.executeSql(query, [], function(tx, rs) {

      switch (option) {
        case 1:
          result_product = rs.rows._array;
          break;
        case 2:
          result_images_pop_material_before = rs.rows._array;
          break;
        case 3:
          result_images_pop_material_after = rs.rows._array;
          break;
        case 4:
          result_pop_material = rs.rows._array;
          break;
        case 5:
          result_competitions = rs.rows._array;
          break;
        case 6:
          result_images_competitions = rs.rows._array;
          break;
        case 7:
          result_exhibitions = rs.rows._array;
          break;
        case 8:
          result_images_exhibitions = rs.rows._array;
          break;
        case 9:
          result_product_questions = rs.rows._array;
          break;
        case 10:
          result_product_answers = rs.rows._array;
          break;
      }

      console.log('%c ✅ 🍿 Transaction DB - SELECT - OK -> option ' + option, 'color:green; font-size: 3em;');

    }, function(tx, error) {

      console.log('%c ❌​ ERROR: query ->', 'color:red; font-size: 3em;');

      console.log(error);

      switch (option) {
        case 1:
          result_delivery = [];
          break;
        case 2:
          result_imagesGral = [];
          break;
        case 3:
          result_management = [];
          break;
        case 4:
          result_advertising = [];
          break;
        case 5:
          result_advertising_questions = [];
          break;
        case 6:
          result_answers = [];
          break;
        case 7:
          result_photo_answers = [];
          break;
        case 8:
          result_bingo = [];
          break;
      }

    });

  });

  //closeDBGIN();

}

function closeDBGIN() {
  myDB.close(function () {
    console.log("DB closed!");
  }, function (error) {
    console.log("Error closing DB:" + error.message);
  });
}
