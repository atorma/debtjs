!function e(n,r,t){function a(i,c){if(!r[i]){if(!n[i]){var u="function"==typeof require&&require;if(!c&&u)return u(i,!0);if(o)return o(i,!0);var s=new Error("Cannot find module '"+i+"'");throw s.code="MODULE_NOT_FOUND",s}var l=r[i]={exports:{}};n[i][0].call(l.exports,function(e){var r=n[i][1][e];return a(r?r:e)},l,l.exports,e,n,r,t)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<t.length;i++)a(t[i]);return a}({1:[function(e,n,r){!function(e,n,r){"use strict";function t(){function e(e,r){return n.extend(Object.create(e),r)}function r(e,n){var r=n.caseInsensitiveMatch,t={originalPath:e,regexp:e},a=t.keys=[];return e=e.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)([\?\*])?/g,function(e,n,r,t){var o="?"===t?t:null,i="*"===t?t:null;return a.push({name:r,optional:!!o}),n=n||"",""+(o?"":n)+"(?:"+(o?n:"")+(i&&"(.+?)"||"([^/]+)")+(o||"")+")"+(o||"")}).replace(/([\/$\*])/g,"\\$1"),t.regexp=new RegExp("^"+e+"$",r?"i":""),t}var t={};this.when=function(e,a){var o=n.copy(a);if(n.isUndefined(o.reloadOnSearch)&&(o.reloadOnSearch=!0),n.isUndefined(o.caseInsensitiveMatch)&&(o.caseInsensitiveMatch=this.caseInsensitiveMatch),t[e]=n.extend(o,e&&r(e,o)),e){var i="/"==e[e.length-1]?e.substr(0,e.length-1):e+"/";t[i]=n.extend({redirectTo:e},r(i,o))}return this},this.caseInsensitiveMatch=!1,this.otherwise=function(e){return"string"==typeof e&&(e={redirectTo:e}),this.when(null,e),this},this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce",function(r,a,o,i,c,s,l){function f(e,n){var r=n.keys,t={};if(!n.regexp)return null;var a=n.regexp.exec(e);if(!a)return null;for(var o=1,i=a.length;i>o;++o){var c=r[o-1],u=a[o];c&&u&&(t[c.name]=u)}return t}function d(e){var t=x.current;g=h(),m=g&&t&&g.$$route===t.$$route&&n.equals(g.pathParams,t.pathParams)&&!g.reloadOnSearch&&!b,m||!t&&!g||r.$broadcast("$routeChangeStart",g,t).defaultPrevented&&e&&e.preventDefault()}function p(){var e=x.current,t=g;m?(e.params=t.params,n.copy(e.params,o),r.$broadcast("$routeUpdate",e)):(t||e)&&(b=!1,x.current=t,t&&t.redirectTo&&(n.isString(t.redirectTo)?a.path(v(t.redirectTo,t.params)).search(t.params).replace():a.url(t.redirectTo(t.pathParams,a.path(),a.search())).replace()),i.when(t).then(function(){if(t){var e,r,a=n.extend({},t.resolve);return n.forEach(a,function(e,r){a[r]=n.isString(e)?c.get(e):c.invoke(e,null,null,r)}),n.isDefined(e=t.template)?n.isFunction(e)&&(e=e(t.params)):n.isDefined(r=t.templateUrl)&&(n.isFunction(r)&&(r=r(t.params)),r=l.getTrustedResourceUrl(r),n.isDefined(r)&&(t.loadedTemplateUrl=r,e=s(r))),n.isDefined(e)&&(a.$template=e),i.all(a)}}).then(function(a){t==x.current&&(t&&(t.locals=a,n.copy(t.params,o)),r.$broadcast("$routeChangeSuccess",t,e))},function(n){t==x.current&&r.$broadcast("$routeChangeError",t,e,n)}))}function h(){var r,o;return n.forEach(t,function(t,i){!o&&(r=f(a.path(),t))&&(o=e(t,{params:n.extend({},a.search(),r),pathParams:r}),o.$$route=t)}),o||t[null]&&e(t[null],{params:{},pathParams:{}})}function v(e,r){var t=[];return n.forEach((e||"").split(":"),function(e,n){if(0===n)t.push(e);else{var a=e.match(/(\w+)(?:[?*])?(.*)/),o=a[1];t.push(r[o]),t.push(a[2]||""),delete r[o]}}),t.join("")}var g,m,b=!1,x={routes:t,reload:function(){b=!0,r.$evalAsync(function(){d(),p()})},updateParams:function(e){if(!this.current||!this.current.$$route)throw u("norout","Tried updating route when with no current route");e=n.extend({},this.current.params,e),a.path(v(this.current.$$route.originalPath,e)),a.search(e)}};return r.$on("$locationChangeStart",d),r.$on("$locationChangeSuccess",p),x}]}function a(){this.$get=function(){return{}}}function o(e,r,t){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,o,i,c,u){function s(){p&&(t.cancel(p),p=null),f&&(f.$destroy(),f=null),d&&(p=t.leave(d),p.then(function(){p=null}),d=null)}function l(){var i=e.current&&e.current.locals,c=i&&i.$template;if(n.isDefined(c)){var l=a.$new(),p=e.current,g=u(l,function(e){t.enter(e,null,d||o).then(function(){!n.isDefined(h)||h&&!a.$eval(h)||r()}),s()});d=g,f=p.scope=l,f.$emit("$viewContentLoaded"),f.$eval(v)}else s()}var f,d,p,h=i.autoscroll,v=i.onload||"";a.$on("$routeChangeSuccess",l),l()}}}function i(e,n,r){return{restrict:"ECA",priority:-400,link:function(t,a){var o=r.current,i=o.locals;a.html(i.$template);var c=e(a.contents());if(o.controller){i.$scope=t;var u=n(o.controller,i);o.controllerAs&&(t[o.controllerAs]=u),a.data("$ngControllerController",u),a.children().data("$ngControllerController",u)}c(t)}}}var c=n.module("ngRoute",["ng"]).provider("$route",t),u=n.$$minErr("ngRoute");c.provider("$routeParams",a),c.directive("ngView",o),c.directive("ngView",i),o.$inject=["$route","$anchorScroll","$animate"],i.$inject=["$compile","$controller","$route"]}(window,window.angular)},{}],2:[function(e,n,r){e("./angular-route"),n.exports="ngRoute"},{"./angular-route":1}],3:[function(e,n,r){window.addEventListener("load",function(){window.applicationCache.addEventListener("updateready",function(){window.location.reload()},!1)},!1)},{}],4:[function(e,n,r){"use strict";function t(e,n,r,t,a){function o(){i(),t.$on(r.BALANCE_SHEET_UPDATED,s.refresh)}function i(){s.balanceSheet=e.balanceSheet;try{s.debtsByDebtor=c(),s.debtComputationError=void 0}catch(n){a.error(n),s.debtsByDebtor=void 0,s.debtComputationError="Cannot compute debts"}}function c(){if(s.balanceSheet.isBalanced()){var e=s.balanceSheet.getNonSettledParticipations(),r=n.computeDebts(e,s.balanceSheet.currency);return n.organizeByDebtor(r)}return void 0}function u(){t.$emit(r.BALANCE_SHEET_UPDATED)}var s=this;s.init=o,s.refresh=i,s.updateSheet=u,o()}t.$inject=["balanceSheetService","debtService","events","$scope","$log"];var a=(e("lodash"),e("angular"));a.module("debtApp").controller("BalanceSheetCtrl",t)},{angular:"angular",lodash:"lodash"}],5:[function(e,n,r){"use strict";function t(e){function n(){var n,r=e.get("balanceSheetData");n=r&&r.json?JSON.parse(r.json,a):r?r:{},s.balanceSheet=new o(n)}function r(){if(!s.balanceSheet)throw new ReferenceError("No balance valid balance sheet");s.balanceSheet.throwErrorIfInvalid();var n=JSON.stringify(s.balanceSheet.exportData());e.set("balanceSheetData",{json:n})}function t(e){var n=JSON.parse(e,a),t=new o(n);t.throwErrorIfInvalid(),s.balanceSheet=t,r()}function a(e,n){return"string"==typeof n&&u.test(n)?new Date(n):n}function i(){var e=s.balanceSheet.exportData();return JSON.stringify(e)}function c(){s.balanceSheet=new o,s.save()}var u=/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,s={balanceSheet:void 0,save:r,loadFromJson:t,exportToJson:i,createNew:c,init:n};return s}t.$inject=["localStorageService"];var a=e("angular"),o=e("./balance-sheet");a.module("debtApp").factory("balanceSheetService",t)},{"./balance-sheet":6,angular:"angular"}],6:[function(e,n,r){"use strict";var t=e("lodash"),a=(e("angular"),e("simple-decimal-money")),o=e("./currency-conversion-error"),i=function(e){function n(){return t.filter(V,function(e){return!e.expense.settled})}function r(){return t.reduce(F,function(e,n){return e&&(n.settled||n.isBalanced())},!0)}function i(e){return t(H).find(function(n){return n.id==e})}function c(e,n){e=t.extend({name:"Person "+(H.length+1)},e),n=t.extend({},n),void 0===e.id&&(e.id=z,z+=1);var r=new B(e);return H.push(r),n.createParticipations===!0&&t.each(F,function(e){e.settled||(p({person:r,expense:e}),e.shareCost())}),r}function u(e){e=i(e.id),e&&(t.remove(H,function(n){return n.equals(e)}),t.forEach(e.getParticipations(),function(e){h(e)}))}function s(e){return t(F).find(function(n){return n.id==e})}function l(e,n){e=t.extend({name:"Expense "+(F.length+1),sharing:"equal",settled:!1,currency:void 0},e),n=t.extend({},n),void 0===e.id&&(e.id=z,z+=1);var r=new U(e);return F.push(r),n.createParticipations===!0&&t.each(H,function(e){p({person:e,expense:r})}),r}function f(e){e=s(e.id),e&&(t.remove(F,function(n){return n.equals(e)}),t.forEach(e.getParticipations(),function(e){h(e)}))}function d(e){var n=new R(e);return t(V).find(function(e){return n.equals(e)})}function p(e){if(d(e))throw new Error("Duplicate participation");e=t.extend({paid:0,share:0},e);var n=new R(e);return V.push(n),n.expense.shareCost(),n}function h(e){e=d(e),e&&(t.remove(V,function(n){return n.equals(e)}),e.expense.shareCost())}function v(){return J&&J.length>0}function g(){return t.cloneDeep(J)}function m(){return t.chain(b()).concat(x(),k.currency).uniq().sort().value()}function b(){return t.reduce(J,function(e,n){return e.push(n.fixed),e.push(n.variable),e},[])}function x(){return t.map(F,function(e){return e.computedCurrency()})}function $(e){y(e);var n=t.find(J,t.pick(e,"fixed","variable"));n?t.extend(n,e):J.push(e),N()}function y(e){if(!t.isString(e.fixed)||""===t.trim(e.fixed))throw new TypeError("Fixed currency symbol must be a non-empty string");if(!t.isString(e.variable)||""===t.trim(e.variable))throw new TypeError("Variable currency symbol must be a non-empty string");if(!t.isNumber(e.rate)||e.rate<1e-4)throw new RangeError("Foreign currency rate must be >= 0.0001")}function E(e){return e?t.isString(e)&&0===t.trim(e).length?void 0:t.trim(e):void 0}function S(e){return e=t.clone(e),e.fixed=E(e.fixed),e.variable=E(e.variable),e}function w(e){e&&(e=S(e),t.remove(J,t.pick(e,"fixed","variable")),N(),_())}function C(e){var n;if(!e)throw new o("Undefined or null conversion data");if(e=S(e),e.fixed==e.variable)return new a(e.value).toNumber();var r=t.find(J,{fixed:e.fixed,variable:e.variable});if(r)n=new a(r.rate,I);else{var i={variable:e.fixed,fixed:e.variable},c=t.find(J,i);c&&(n=new a(1/c.rate,I))}if(!n)throw new o("Could not find an exchange rate for conversion '"+e.fixed+"' -> '"+e.variable+"'.");return new a(100*e.value).multiply(n).divideBy(100).toNumber()}function A(e){try{return C(e)}catch(n){if(n instanceof o)return 0/0;throw n}}function P(e,n){if(!t.isArray(e))return[];var r=[];return t.each(m(),function(e){try{C({fixed:e,variable:n,value:1}),r.push(e)}catch(t){}}),r}function D(e,n){return t.difference(e,P(e,n))}function N(){var e=b();0===J.length?k.currency=void 0:(void 0===k.currency||-1===t.indexOf(e,k.currency))&&(k.currency=J[0].fixed)}function _(){var e=t.concat(b(),k.currency);t.each(F,function(n){-1===t.indexOf(e,n.currency)&&(n.currency=k.currency)})}function T(){t.each(F,function(e){try{C({fixed:e.computedCurrency(),variable:k.currency,value:1})}catch(n){throw new o("Cannot convert currency '"+e.computedCurrency()+"' of '"+e.name+"' to balance sheet's currency '"+k.currency+"'")}})}function B(e){function n(e){return h.map(e).reduce(function(e,n){return e.add(n)},new a(0)).value().toNumber()}function r(){return M.currency}function o(e){return e=e||d.computedCurrency(),n(function(n){return n.getPaid(e)})}function i(e){return e=e||d.computedCurrency(),n(function(n){return n.getShare(e)})}function c(){return 0===u()}function u(e){return e=e||d.computedCurrency(),new a(i(e)).subtract(o(e)).toNumber()}function s(){return p.value()}function l(e){return e instanceof B&&e.id===d.id}function f(){var e=t.negate(t.isFunction);return t.extend(t.pickBy(d,e),{})}var d=this;t.extend(d,e),d.computedCurrency=r,d.equals=l,d.getCost=o,d.getSumOfShares=i,d.getBalance=u,d.isBalanced=c,d.getParticipations=s,d.exportData=f;var p=t.chain(V).filter(function(e){return d.equals(e.person)}),h=p.filter(function(e){return!e.expense.settled})}function U(e){function n(e,n){var r=v.map(e).reduce(function(e,n){return e.add(n)},new a(0)).value().toNumber();return n&&n!==h.computedCurrency()?A({value:r,fixed:h.computedCurrency(),variable:n}):r}function r(){return h.currency||M.currency}function o(e){return n(function(e){return e.paid},e)}function i(e){return n(function(e){return e.share},e)}function c(){return 0===u(h.computedCurrency())}function u(e){return new a(i(e)).subtract(o(e)).toNumber()}function s(){return v.value()}function l(){"equal"===h.sharing&&f()}function f(){var e=h.getParticipations();if(0!==e.length){var n=new a(h.getCost()),r=n.divideBy(e.length),o=n.subtract(r.multiply(e.length-1));t.forEach(e,function(n,t){t<e.length-1&&(n.share=r.toNumber())}),t.last(e).share=o.toNumber()}}function d(e){return e instanceof U&&e.id===h.id}function p(){var e=t.negate(t.isFunction);return t.extend(t.pickBy(h,e))}var h=this;t.extend(h,e),h.computedCurrency=r,h.getCost=o,h.getSumOfShares=i,h.getBalance=u,h.isBalanced=c,h.getParticipations=s,h.shareCost=l,h.equals=d,h.exportData=p;var v=t.chain(V).filter(function(e){return h.equals(e.expense)})}function R(e){function n(e){return e.strictConversion?C:A}function r(e,r,o){if(!r||r===s.expense.computedCurrency())return s[e];o=t.extend({strictConversion:!1},o);var i=n(o),c=s.expense.getParticipations();if(t.last(c)===s){var u=i({value:s[e],fixed:s.expense.computedCurrency(),variable:r}),l=t.reduce(c,function(n,r){return n.add(r[e])},new a(0)).toNumber(),f=i({value:l,fixed:s.expense.computedCurrency(),variable:r}),d=t.reduce(c,function(n,t){var a=i({value:t[e],fixed:t.expense.computedCurrency(),variable:r});return n.add(a)},new a(0)),p=d.subtract(f);return new a(u).subtract(p).toNumber()}return i({value:s[e],fixed:s.expense.computedCurrency(),variable:r})}function o(e,n){return r("paid",e,n)}function i(e,n){return r("share",e,n)}function c(e){return e instanceof R&&s.expense.equals(e.expense)&&s.person.equals(e.person)}function u(){return{personId:s.person.id,expenseId:s.expense.id,paid:s.paid,share:s.share}}var s=this;if(!e||!e.person||!e.expense)throw new ReferenceError("Undefined participation");t.extend(s,e),s.getPaid=o,s.getShare=i,s.equals=c,s.exportData=u}function j(){var e=t.negate(t.isFunction),n=t.pickBy(k,e);return n.persons=t.map(H,function(e){return e.exportData()}),n.expenses=t.map(F,function(e){return e.exportData()}),n.participations=t.map(V,function(e){return e.exportData()}),n.exchangeRates=g(),n}function q(e){z=t([]).concat(e.persons).concat(e.expenses).map("id").max()+1,t.isNaN(z)&&(z=1);var n={persons:!0,expenses:!0,participations:!0,exchangeRates:!0};t.each(e.exchangeRates,function(e){$(e)}),t.extend(k,t.pickBy(e,function(e,r){return!n[r]})),t.each(e.persons,function(e){c(e)}),t.each(e.expenses,function(e){l(e)}),t.each(e.participations,function(e){var n=i(e.personId),r=s(e.expenseId);p({person:n,expense:r,paid:e.paid,share:e.share})}),L()}function O(){try{return L(),!0}catch(e){return!1}}function L(){t.each(H,function(e){if(!t.isNumber(e.id))throw new Error("Person has no id")}),t.each(F,function(e){if(!t.isNumber(e.id))throw new Error("Expense has no id")});var e={};t.each(H,function(n){e[n.id]=n}),t.each(F,function(n){e[n.id]=n}),t.each(V,function(n){if(!n.person)throw new Error("Participation has no person");if(!e[n.person.id])throw new Error("Participation person is unknown");if(!n.expense)throw new Error("Participation has no expense");if(!e[n.expense.id])throw new Error("Participation expense is unknown")})}var k=this,M=this,I=4,H=[],F=[],V=[],J=[],z=1;k.name="New sheet",k.currency=void 0,k.persons=H,k.expenses=F,k.participations=V,e&&q(e),k.getNonSettledParticipations=n,k.isBalanced=r,k.getPerson=i,k.createPerson=c,k.removePerson=u,k.getExpense=s,k.createExpense=l,k.removeExpense=f,k.getParticipation=d,k.createParticipation=p,k.removeParticipation=h,k.exportData=j,k.isValid=O,k.throwErrorIfInvalid=L,k.currenciesEnabled=v,k.getExchangeRates=g,k.getCurrencies=m,k.getExpenseCurrencies=x,k.getExchangeRateCurrencies=b,k.addOrUpdateExchangeRate=$,k.removeExchangeRate=w,k.convertCurrency=C,k.getConvertibleCurrencies=P,k.getNonConvertibleCurrencies=D,k.throwErrorIfInvalidExpenseCurrencies=T};n.exports=i},{"./currency-conversion-error":7,angular:"angular",lodash:"lodash","simple-decimal-money":"simple-decimal-money"}],7:[function(e,n,r){"use strict";function t(e){var n=Error.apply(this,arguments);this.stack=n.stack,this.message=n.message}t.prototype=Object.create(Error.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),n.exports=t},{}],8:[function(e,n,r){"use strict";e("./route-config"),e("./balance-sheet"),e("./balance-sheet-service"),e("./balance-sheet-ctrl"),e("./currency-conversion-error")},{"./balance-sheet":6,"./balance-sheet-ctrl":4,"./balance-sheet-service":5,"./currency-conversion-error":7,"./route-config":9}],9:[function(e,n,r){"use strict";function t(e){e.state("balanceSheet",{url:"/",views:{"":{templateUrl:"balance-sheet/balance-sheet.html",controller:"BalanceSheetCtrl as vm"},floatingButton:{templateUrl:"balance-sheet/floating-button.html"}}})}t.$inject=["$stateProvider"];var a=e("angular");a.module("debtApp").config(t)},{angular:"angular"}],10:[function(e,n,r){"use strict";function t(e,n,r,t,a,o){function c(){d.balanceSheet=e.balanceSheet,u(),r.$watch(function(){return e.balanceSheet.getExchangeRates()},a(u,50),!0)}function u(){d.exchangeRates=e.balanceSheet.getExchangeRates()}function s(){return t.show({templateUrl:"currencies/exchange-rate-dialog.html",controller:"ExchangeRateDialogCtrl as vm"}).then(function(e){l(e)})}function l(t){try{e.balanceSheet.addOrUpdateExchangeRate(t),r.$emit(n.BALANCE_SHEET_UPDATED),u()}catch(a){o.error(a)}}function f(t){e.balanceSheet.removeExchangeRate(t),i.remove(d.exchangeRates,t),r.$emit(n.BALANCE_SHEET_UPDATED),u()}var d=this;d.init=c,d.openExchangeRateDialog=s,d.updateExchangeRate=l,d.removeExchangeRate=f,c()}function a(e){function n(){a.quotation={}}function r(){e.hide(a.quotation)}function t(){e.cancel()}var a=this;a.ok=r,a.cancel=t,a.init=n,n()}t.$inject=["balanceSheetService","events","$scope","$mdDialog","debounce","$log"],a.$inject=["$mdDialog"];var o=e("angular"),i=e("lodash");o.module("debtApp").controller("CurrencyListCtrl",t).controller("ExchangeRateDialogCtrl",a)},{angular:"angular",lodash:"lodash"}],11:[function(e,n,r){"use strict";e("./route-config"),e("./currency-list-ctrl")},{"./currency-list-ctrl":10,"./route-config":12}],12:[function(e,n,r){"use strict";function t(e){e.state("currencies",{url:"/currencies",views:{"":{controller:"CurrencyListCtrl as vm",templateUrl:"currencies/currencies.html"},floatingButton:{controller:"CurrencyListCtrl as vm",templateUrl:"currencies/floating-button.html"}}})}t.$inject=["$stateProvider"];var a=e("angular");a.module("debtApp").config(t)},{angular:"angular"}],13:[function(e,n,r){"use strict";function t(e,n,r,t,a,i,c,u,s,l,f){function d(){l.$on(c.BALANCE_SHEET_UPDATED,n(function(){w.balanceSheetUpdated()}),r,l,!0),l.$on(c.ERROR,g),e.init(),w.balanceSheet=e.balanceSheet,v()}function p(){w.errorMessage=void 0,h(),v()}function h(){try{e.save()}catch(n){f.error(n),w.errorMessage="Cannot save: "+n.message}}function v(){var e=w.balanceSheet.getNonConvertibleCurrencies(w.balanceSheet.getExpenseCurrencies(),w.balanceSheet.currency);if(0!==e.length&&!w.errorMessage){var n=o.template("Cannot convert <%= currencyWord %> <%= currencyList %> to balance sheet's currency <%= balanceSheetCurrency %>"),r={currencyWord:1==e.length?"currency":"currencies",currencyList:"",balanceSheetCurrency:"'"+w.balanceSheet.currency+"'"};o.each(e,function(e,n){r.currencyList=r.currencyList+(n>0?", ":"")+"'"+e+"'"}),w.errorMessage=n(r)}}function g(e,n){w.errorMessage=n.message}function m(){t().then(function(n){e.balanceSheet.createPerson(n.person,n.options),w.balanceSheetUpdated(),l.$broadcast(c.BALANCE_SHEET_UPDATED)})}function b(){a().then(function(n){e.balanceSheet.createExpense(n.expense,n.options),w.balanceSheetUpdated(),l.$broadcast(c.BALANCE_SHEET_UPDATED)})}function x(){u.show(C).then(function(){e.createNew(),w.balanceSheetUpdated(),s.go("balanceSheet"),l.$broadcast(c.BALANCE_SHEET_UPDATED)})}function $(e){if(e&&e.length){if(!i.isSupported())return void(w.errorMessage="File operations not supported in this browser. Please consider a more modern browser.");var n=e[0];i.readAsText(n).then(function(e){y(e)})["catch"](function(e){f.error(e),w.errorMessage="Unable to read file"})}}function y(n){e.loadFromJson(n),w.balanceSheetUpdated(),s.go("balanceSheet"),l.$broadcast(c.BALANCE_SHEET_UPDATED)}function E(){if(!i.isSupported())return void(w.errorMessage="File operations not supported in this browser. Please consider a more modern browser.");var n=e.exportToJson();try{i.saveAsFile([n],e.balanceSheet.name+".txt")}catch(r){f.error(r),w.errorMessage="Error when saving file"}}function S(){u.show({templateUrl:"help.html",controller:["$scope","$mdDialog",function(e,n){e.close=function(){n.hide()}}]})}var w=this;w.init=d,w.createPerson=m,w.createExpense=b,w.createNewSheet=x,w.loadSheet=$,w.exportSheet=E,w.balanceSheetUpdated=p,w.showHelp=S;var C=u.confirm().title("Create new sheet").content("The current sheet will be discarded. Please consider exporting it first. Continue?").ok("Ok").cancel("Cancel");d()}t.$inject=["balanceSheetService","debounce","balanceSheetSaveInterval","openCreatePersonDialog","openCreateExpenseDialog","fileService","events","$mdDialog","$state","$scope","$log"];var a=e("angular"),o=e("lodash");a.module("debtApp").constant("balanceSheetSaveInterval",500).controller("DebtAppCtrl",t)},{angular:"angular",lodash:"lodash"}],14:[function(e,n,r){"use strict";function t(e){e.setPrefix("debtApp")}function a(e){var n=["ic_add_24px.svg","ic_attach_money_24px.svg","ic_chevron_right_24px.svg","ic_close_24px.svg","ic_delete_24px.svg","ic_face_24px.svg","ic_home_24px.svg","ic_more_vert_24px.svg","ic_shopping_basket_24px.svg","ic_warning_24px.svg"],r=l.map(n,function(e){var n=e.substr(0,e.indexOf("."));return{filePath:"resources/icons/"+e,iconName:n}});l.each(r,function(n){e.icon(n.iconName,n.filePath)})}function o(e){e.aHrefSanitizationWhitelist(/^(blob||https?):/)}function i(e,n){e.decorator("$exceptionHandler",["$delegate","$log","$injector",function(e,r,t){return function(r,a){e(r,a);var o=t.get("$rootScope");if(o.$broadcast(n.ERROR,r,a),r instanceof f){var i=t.get("$state");i.go("currencies")}}}])}function c(e,n,r){e.$state=n,e.$stateParams=r}function u(e,n){e.$mdMedia=n}t.$inject=["localStorageServiceProvider"],a.$inject=["$mdIconProvider"],o.$inject=["$compileProvider"],i.$inject=["$provide","events"],c.$inject=["$rootScope","$state","$stateParams"],u.$inject=["$rootScope","$mdMedia"],e("./appcache-reload");var s=e("angular");e("angular-material"),e("angular-route"),e("angular-ui-router"),e("angular-local-storage"),e("ng-file-upload");var l=e("lodash");s.module("debtApp",["ngMaterial","ui.router","LocalStorageModule","ngFileUpload"]).constant("events",{BALANCE_SHEET_UPDATED:"balance sheet updated",ERROR:"error"}).constant("debtCalculationInterval",500).config(t).config(a).config(o).config(i).run(c).run(u),e("./debt-app-ctrl"),e("./route-config"),e("./debts"),e("./balance-sheet"),e("./persons"),e("./expenses"),e("./utils"),e("./currencies");var f=e("./balance-sheet/currency-conversion-error")},{"./appcache-reload":3,"./balance-sheet":8,"./balance-sheet/currency-conversion-error":7,"./currencies":11,"./debt-app-ctrl":13,"./debts":17,"./expenses":22,"./persons":25,"./route-config":28,"./utils":33,angular:"angular","angular-local-storage":"angular-local-storage","angular-material":"angular-material","angular-route":2,"angular-ui-router":"angular-ui-router",lodash:"lodash","ng-file-upload":"ng-file-upload"}],15:[function(e,n,r){"use strict";function t(e){function n(n,r){void 0!==r&&(n=o.map(n,function(e){return{person:e.person,expense:e.expense,paid:e.getPaid(r,{strictConversion:!0}),share:e.getShare(r,{strictConversion:!0})}}));var t=e(n);return void 0!==r&&(t=o.map(t,function(e){return o.extend(e,{currency:r})})),t}function r(e){var n=[],r={};return o.each(e,function(e){var t,a=r[e.debtor.id];void 0===a&&(a=n.length,t={debtor:e.debtor,debts:[]},n.push(t),r[e.debtor.id]=a),t=n[a],t.debts.push(o.omit(e,"debtor"))}),o.each(n,function(e){e.debts.sort(function(e,n){return e.creditor.name.localeCompare(n.creditor.name)})}),n.sort(function(e,n){return e.debtor.name.localeCompare(n.debtor.name)}),n}return{computeDebts:n,organizeByDebtor:r}}t.$inject=["solveDebts"];var a=e("angular"),o=e("lodash");a.module("debtApp").factory("debtService",t)},{angular:"angular",lodash:"lodash"}],16:[function(e,n,r){"use strict";function t(e){function n(e){if(!e||0===e.length)return[];var n=r(e);if(t(n))return[];if(!u(n))throw new Error("Debt system is not balanced");var a=s(n),o=l(a),i=d(o);return h(i,a)}function r(e){var n={};return a.forEach(e,function(e){var r=n[e.person.id];void 0===r&&(r={person:e.person,balance:new o(0)},n[e.person.id]=r);var t=new o(e.paid),a=new o(e.share);r.balance=r.balance.add(a.subtract(t))}),a.forEach(n,function(e){e.balance=e.balance.toNumber()}),n}function t(e){return c.every(e,{balance:0})}function u(e){return 0===c.reduce(e,function(e,n){return e.add(n.balance)},new o(0)).toNumber()}function s(e){var n=[],r=[];return a.forEach(e,function(e){e.balance<=0?r.push(e):n.push(e)}),{debtors:n,creditors:r}}function l(e){var n=e.debtors.length,r=e.creditors.length,t=[];c.each(e.debtors,function(e,n){t[n]=new o(e.balance).multiply(100).toNumber()}),c.each(e.creditors,function(e,r){t[n+r]=new o(e.balance).multiply(-100).toNumber()});for(var a=f(n+r,n*r),i=0;n>i;i++)for(var u=i*r;(i+1)*r>u;u++)a[i][u]=1;for(var i=n;r+n>i;++i)for(var u=i-n;n*r>u;u+=r)a[i][u]=1;return{A:a,b:t}}function f(e,n){for(var r=[],t=0;e>t;t++){r[t]=[];for(var a=0;n>a;a++)r[t][a]=0}return r}function d(n){var r=e(n);if(0===r.numberOfSolutions)throw new Error("Debt system has no solutions");var t=r.numberOfVariables,o=r.numberOfFreeVariables;if(0===o)return r.xVector;var c=i.engines.mt19937();c.seed(20150312);var u;do{for(var s=a.copy(n.A),l=n.b,f=[],d=0;t>d;d++)f[d]=d;u=[];for(var d=0;o>d;d++){var h=i.integer(0,f.length-1)(c);u.push(f[h]),f.splice(h,1)}for(var d=0;d<s.length;d++)for(var v=0;v<u.length;v++)s[d][u[v]]=0;r=e({A:s,b:l})}while(!p(r.xVector));return r.xVector}function p(e){if(!e)return!1;for(var n=0;n<e.length;n++)if(e[n]<0)return!1;return!0}function h(e,n){for(var r=[],t=0;t<e.length;t++)if(0!==e[t]){var a=Math.floor(t/n.creditors.length),i=t-n.creditors.length*a,c=new o(e[t]).divideBy(100).toNumber(),u={debtor:n.debtors[a].person,creditor:n.creditors[i].person,amount:c};r.push(u)}return r}return n}t.$inject=["solveLinearSystem"];var a=e("angular"),o=e("simple-decimal-money"),i=e("random-js"),c=e("lodash");a.module("debtApp").factory("solveDebts",t)},{angular:"angular",lodash:"lodash","random-js":"random-js","simple-decimal-money":"simple-decimal-money"}],17:[function(e,n,r){"use strict";e("./lin-eq-solver"),e("./lin-eq-solver-factory"),e("./debt-solver"),e("./debt-service")},{"./debt-service":15,"./debt-solver":16,"./lin-eq-solver":19,"./lin-eq-solver-factory":18}],18:[function(e,n,r){"use strict";function t(){return a}var a=e("./lin-eq-solver"),o=e("angular");o.module("debtApp").factory("solveLinearSystem",t)},{"./lin-eq-solver":19,angular:"angular"}],19:[function(e,n,r){"use strict";function t(e){function n(){if(!e||!e.A||!e.b)throw new TypeError("Null matrix A or vector b in system Ax = b");if(e.A.length<1||e.A[0].length<1)throw new TypeError("Matrix A in Ax = b has no rows or no columns");if(e.A.length!=e.b.length)throw new RangeError("The dimensions of the matrix and the constant vector are incompatible")}function r(){f=i(e.A),d=o(e.b),h=f.length,v=f[0].length,b=[];for(var n=0;h>n;n++)b[n]=n;$=[];for(var n=0;h>n;n++){$[n]=0;for(var r=0;v>r;r++){var t=Math.abs(f[n][r]);t>$[n]&&($[n]=t)}}x=[];for(var r=0;v>r;r++)x[r]=r}function t(){for(var e=0,n=[];h-1>e;){for(var r=0,t=e,a=e;h>a;++a){var o=b[a],i=x[e],c=Math.abs(f[o][i]/$[o]);c>r&&(r=c,t=a)}if(0===r){var u=x[e];n[u]=!0;for(var a=e,s=u;s==u&&v-1>a;)++a,n[x[a]]||(s=x[a]);if(s!=u){x[e]=s,x[a]=u;continue}return}var l=b[e];b[e]=b[t],b[t]=l;var p=b[e],g=x[e];for(a=e+1;h>a;++a){for(var o=b[a],m=f[o][g]/f[p][g],y=e+1;v>y;++y){var E=x[y];f[o][E]=f[o][E]-m*f[p][E]}f[o][g]=0,d[o]=d[o]-m*d[p]}e++}}function c(){var e;for(e=Math.min(h,v)-1;e>0;--e){var n=b[e],r=x[e];if(0!==f[n][r])for(var t=e-1;t>-1;--t){for(var a=f[b[t]][x[e]]/f[b[e]][x[e]],o=0;v>o;++o)f[b[t]][x[o]]-=a*f[b[e]][x[o]];d[b[t]]-=a*d[b[e]]}}for(e=0;e<Math.min(h,v);++e)if(0!==f[b[e]][x[e]]){for(var i=f[b[e]][x[e]],o=0;v>o;++o)f[b[e]][o]=f[b[e]][o]/i;d[b[e]]=d[b[e]]/i}}function u(){g=0;var e,n;e:for(n=0;v>n;++n){for(e=0;h>e;++e){if(e!=n&&0!==f[b[e]][x[n]])break e;if(e==n&&1!=f[b[e]][x[n]])break e}++g}}function s(){for(var e=!0,n=g;h>n;++n)if(0!==d[b[n]]){e=!1;break}h>g&&!e?m=0:g!=v||g!=h&&!e?v>g&&(g==h||e)&&(m=Number.MAX_VALUE):m=1}function l(){if(0===m)p=void 0;else{p=a(v);for(var e=0;g>e;++e)p[x[e]]=d[b[e]]}}var f,d,p,h,v,g,m,b,x,$;return n(),r(),t(),c(),u(),s(),l(),{xVector:p,numberOfEquations:h,numberOfVariables:v,rank:g,numberOfFreeVariables:v-g,numberOfSolutions:m}}function a(e){for(var n=[],r=0;e>r;r++)n[r]=0;return n}function o(e){return e.slice()}function i(e){for(var n=[],r=0;r<e.length;r++)n[r]=e[r].slice();return n}n.exports=t},{}],20:[function(e,n,r){"use strict";function t(e){function n(){return e.show({templateUrl:"expenses/create-expense-dialog.html",controller:a,controllerAs:"vm"})}return n}function a(e){function n(){a.expense={name:void 0,sharing:"equal"},a.options={createParticipations:!0}}function r(){e.hide({expense:a.expense,options:a.options})}function t(){e.cancel()}var a=this;a.ok=r,a.cancel=t,a.init=n,n()}t.$inject=["$mdDialog"],a.$inject=["$mdDialog"];var o=e("angular");o.module("debtApp").factory("openCreateExpenseDialog",t)},{angular:"angular"}],21:[function(e,n,r){"use strict";function t(e,n,r,t,o,i,c,u,s,l){function f(){x.balanceSheet=e.balanceSheet,x.expense=x.balanceSheet.getExpense(c.id),x.isParticipant={},x.everyoneParticipates=!0,d(),s.$on(r.BALANCE_SHEET_UPDATED,function(e){e.targetScope!=s&&x.updateExpense()})}function d(){x.expense.shareCost(),x.isParticipant=p(),x.cost=x.expense.getCost(),x.sumOfShares=x.expense.getSumOfShares(),x.isBalanced=x.expense.isBalanced(),s.$emit(r.BALANCE_SHEET_UPDATED),y()}function p(){var e={};return a.forEach(x.balanceSheet.persons,function(n){e[n.id]=!1,a.forEach(x.expense.getParticipations(),function(r){r.person.equals(n)&&(e[n.id]=!0)})}),e}function h(e,n){n?x.balanceSheet.createParticipation({expense:x.expense,person:e}):x.balanceSheet.removeParticipation({expense:x.expense,person:e}),d()}function v(){i.show($).then(g)}function g(){x.balanceSheet.removeExpense(x.expense),s.$emit(r.BALANCE_SHEET_UPDATED),u.go("balanceSheet")}function m(){if(x.expense.isBalanced()){var e=n.computeDebts(x.expense.getParticipations(),x.expense.computedCurrency());return n.organizeByDebtor(e)}}function b(e){x.expense.currency=e,s.$emit(r.BALANCE_SHEET_UPDATED)}var x=this,$=i.confirm().content("Really delete this expense?").ok("Ok").cancel("Cancel"),y=t(function(){l(function(){x.debtsByDebtor=m()})},o);x.init=f,x.setParticipation=h,x.updateExpense=d,x.removeExpense=v,x.setCurrency=b,f()}t.$inject=["balanceSheetService","debtService","events","debounce","debtCalculationInterval","$mdDialog","$stateParams","$state","$scope","$timeout"];var a=(e("lodash"),e("angular"));a.module("debtApp").controller("ExpenseDetailCtrl",t)},{angular:"angular",lodash:"lodash"}],22:[function(e,n,r){"use strict";e("./route-config"),e("./expense-detail-ctrl"),e("./create-expense-dialog")},{"./create-expense-dialog":20,"./expense-detail-ctrl":21,"./route-config":23}],23:[function(e,n,r){"use strict";function t(e){e.state("expense",{url:"/expenses/:id",views:{"":{templateUrl:"expenses/expense-detail.html",controller:"ExpenseDetailCtrl as vm"},floatingButton:{templateUrl:"expenses/floating-button.html"}}})}t.$inject=["$stateProvider"];var a=e("angular");a.module("debtApp").config(t)},{angular:"angular"}],24:[function(e,n,r){"use strict";function t(e){function n(){return e.show({templateUrl:"persons/create-person-dialog.html",controller:a,controllerAs:"vm"})}return n}function a(e){function n(){a.person={name:void 0},a.options={createParticipations:!0}}function r(){e.hide({person:a.person,options:a.options})}function t(){e.cancel()}var a=this;a.ok=r,a.cancel=t,a.init=n,n()}t.$inject=["$mdDialog"],a.$inject=["$mdDialog"];var o=e("angular");o.module("debtApp").factory("openCreatePersonDialog",t)},{angular:"angular"}],25:[function(e,n,r){"use strict";e("./route-config"),
e("./person-detail-ctrl"),e("./create-person-dialog")},{"./create-person-dialog":24,"./person-detail-ctrl":26,"./route-config":27}],26:[function(e,n,r){"use strict";function t(e,n,r,t,a,i,c,u,s,l,f){function d(){E.balanceSheet=e.balanceSheet,E.person=E.balanceSheet.getPerson(c.id),p(),y=u.confirm().content("Really delete this person?").ok("Ok").cancel("Cancel"),s.$on(r.BALANCE_SHEET_UPDATED,E.refresh)}function p(){E.isParticipant=h(),E.cost=E.person.getCost(),E.sumOfShares=E.person.getSumOfShares(),E.balance=E.person.getBalance(),S()}function h(){var e={};return o.forEach(E.balanceSheet.expenses,function(n){e[n.id]=!1,o.forEach(E.person.getParticipations(),function(r){r.expense.equals(n)&&(e[n.id]=!0)})}),e}function v(e){e.shareCost(),p(),s.$emit(r.BALANCE_SHEET_UPDATED)}function g(e,n){n?E.balanceSheet.createParticipation({expense:e,person:E.person}):E.balanceSheet.removeParticipation({expense:e,person:E.person}),E.updateExpense(e)}function m(){var e={role:void 0,debts:void 0};if(!E.balanceSheet.isBalanced())return e.role="unbalanced",e;if(E.balance>0)e.role="debtor";else if(E.balance<0)e.role="creditor";else if(0===E.balance)return e.role="settled",e;var r={debtor:"creditor",creditor:"debtor"},t=n.computeDebts(E.balanceSheet.getNonSettledParticipations(),E.person.computedCurrency());return e.debts=o.chain(t).filter(function(n){return n[e.role].equals(E.person)}).map(function(n){return{person:n[r[e.role]],amount:n.amount,currency:n.currency}}).value(),e}function b(){u.show(y).then(x)}function x(){E.balanceSheet.removePerson(E.person),s.$emit(r.BALANCE_SHEET_UPDATED),i.go("balanceSheet")}function $(){s.$emit(r.BALANCE_SHEET_UPDATED)}var y,E=this,S=t(function(){l(function(){try{var e=m();E.debtRole=e.role,E.debts=e.debts,E.debtComputationError=void 0}catch(n){f.error(n),E.debtRole=void 0,E.debts=void 0,E.debtComputationError="Cannot compute debts"}})},a);E.init=d,E.refresh=p,E.updateExpense=v,E.setParticipation=g,E.removePerson=b,E.updatePerson=$,d()}t.$inject=["balanceSheetService","debtService","events","debounce","debtCalculationInterval","$state","$stateParams","$mdDialog","$scope","$timeout","$log"];var a=e("angular"),o=e("lodash");a.module("debtApp").controller("PersonDetailCtrl",t)},{angular:"angular",lodash:"lodash"}],27:[function(e,n,r){"use strict";function t(e){e.state("person",{url:"/persons/:id",views:{"":{templateUrl:"persons/person-detail.html",controller:"PersonDetailCtrl as vm"},floatingButton:{templateUrl:"persons/floating-button.html"}}})}t.$inject=["$stateProvider"];var a=e("angular");a.module("debtApp").config(t)},{angular:"angular"}],28:[function(e,n,r){"use strict";function t(e){e.otherwise("/")}t.$inject=["$urlRouterProvider"];var a=e("angular");a.module("debtApp").config(t)},{angular:"angular"}],29:[function(e,n,r){"use strict";function t(e){return function(n){return!o.isNumber(n)||isNaN(n)?n:n>0?"+"+e("number")(n,"2"):e("number")(n,"2")}}t.$inject=["$filter"];var a=e("angular"),o=e("lodash");a.module("debtApp").filter("balance",t)},{angular:"angular",lodash:"lodash"}],30:[function(e,n,r){"use strict";function t(e){function n(n,r,t,a){var o;return function(){var i=t,c=Array.prototype.slice.call(arguments);e.cancel(o),o=e(function(){o=void 0,n.apply(i,c)},r||10,a)}}return n}t.$inject=["$timeout"],angular.module("debtApp").factory("debounce",t)},{}],31:[function(e,n,r){"use strict";function t(e,n){function r(r){var t=e.defer(),a=new n.FileReader;return a.onload=function(){t.resolve(a.result)},a.onerror=function(){t.resolve(a.error)},a.readAsText(r),t.promise}function t(e,r){var t=new n.Blob(e,{});o.saveAs(t,r)}function a(){return n.FileReader&&n.Blob}return{readAsText:r,saveAsFile:t,isSupported:a}}t.$inject=["$q","$window"];var a=e("angular"),o=e("node-safe-filesaver");e("blob-polyfill"),a.module("debtApp").factory("fileService",t)},{angular:"angular","blob-polyfill":"blob-polyfill","node-safe-filesaver":"node-safe-filesaver"}],32:[function(e,n,r){"use strict";function t(e){return{restrict:"A",link:function(n,r,t){var a=t.focus||"true";e(function(){var e=n.$eval(a);e&&r[0].focus()},0)}}}t.$inject=["$timeout"];var a=e("angular");a.module("debtApp").directive("focus",t)},{angular:"angular"}],33:[function(e,n,r){"use strict";e("./money-input-directive"),e("./balance-filter"),e("./money-filter"),e("./file-service"),e("./focus-directive")},{"./balance-filter":29,"./file-service":31,"./focus-directive":32,"./money-filter":34,"./money-input-directive":35}],34:[function(e,n,r){"use strict";function t(e){return function(n){return!o.isNumber(n)||isNaN(n)?n:e("number")(n,"2")}}t.$inject=["$filter"];var a=e("angular"),o=e("lodash");a.module("debtApp").filter("money",t)},{angular:"angular",lodash:"lodash"}],35:[function(e,n,r){"use strict";function t(e){function n(e,n,o,i){function c(){n.val(i.$valid?t(i.$modelValue):i.$viewValue)}function u(){i.$render()}i.$validators.money=r,i.$parsers.push(a),i.$formatters.unshift(t),n.on("blur",u),i.$render=c}function r(e){return 0>e?!1:!0}function t(n){return void 0===n||null===n?"":e("number")(n,2)}function a(e){return new o(e).toNumber()}return{restrict:"A",require:"ngModel",link:n}}t.$inject=["$filter"];var a=e("angular"),o=e("simple-decimal-money");a.module("debtApp").directive("moneyInput",t)},{angular:"angular","simple-decimal-money":"simple-decimal-money"}],36:[function(e,n,r){"use strict";function t(){function e(e){try{e.result=e.expression()}catch(n){e.result=e.errorResult}}return{scope:{expression:"&",errorResult:"@"},template:"{{result}}",link:e}}var a=e("angular");a.module("debtApp").directive("tryCatch",t)},{angular:"angular"}]},{},[14,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]);
//# sourceMappingURL=debt.js.map
