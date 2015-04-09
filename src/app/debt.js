"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");
require("angular-route");
require("angular-ui-router");
require("angular-local-storage");
var _ = require("lodash");

angular
  .module("debtApp", ["ngMaterial", "ui.router", "LocalStorageModule"])
    .config(configureLocalStorage)
    .config(configureIcons)
    .run(makeStateAvailableInScope)
    ;

require("./route-config");
require("./debts");
require("./balance-sheet");
require("./persons");
require("./expenses");


function configureLocalStorage(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix("debtApp");
}

function configureIcons($mdIconProvider) {
  
  var iconPaths = ['action/ic_delete_24px.svg', 'navigation/ic_menu_24px.svg', 'navigation/ic_more_vert_24px.svg', 'navigation/ic_chevron_right_24px.svg'];
  
  var iconProps = _.map(iconPaths, function(path) {
    
    var slashIndex = path.lastIndexOf('/');
    var filePath = path.substring(0, slashIndex + 1);
    var fileName = path.substring(slashIndex + 1);
    
    return {
      iconPath: "resources/icons/" + filePath + fileName,
      iconName: (filePath + fileName).replace("/", ":").replace(".svg", "").replace("ic_", "").replace("_24px", "")
    };
    
  });
  
  _.each(iconProps, function(prop) {
    $mdIconProvider.icon(prop.iconName, prop.iconPath);
  });

}

// Injection of $state may trigger a GET, which can show as an 
// "Unexpected request" error in your test. Workaround is to 
// $provide a mock $state to Angular.
function makeStateAvailableInScope($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}
