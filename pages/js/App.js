var meuApp = angular.module("meuApp", ['ngRoute','ngFileUpload', 'ngSanitize', 'ui.select', 'chart.js', 'ui.bootstrap']);
var oAuth, Usuario;

try {
	oAuth = JSON.parse(localStorage.getItem('oAuth'));
	Usuario = JSON.parse(localStorage.getItem('Usuario'));
} catch(e) {
	localStorage.clear();
	oAuth = JSON.parse(localStorage.getItem('oAuth'));
	Usuario = JSON.parse(localStorage.getItem('Usuario'));
}

if(oAuth && oAuth.user && (!oAuth.user.usuario_usuario_perfil || oAuth.user.usuario_usuario_perfil[0].Id_UsuarioAplicacao !== 1)) {
  localStorage.removeItem('Usuario');
  localStorage.removeItem('oAuth');
  window.location.href = '/';
}

meuApp.factory("API", function($http, $rootScope){
	var api = {
		message: function(message) {
			$.notify({
				message: message,
				icon: 'fa fa-check-circle',
			},{
				type: 'success',
				icon: 'glyphicon glyphicon-star',
				z_index: 999999,
				placement: {
					from: 'top',
					align: 'right'
				},
			});
		},
		error: function(error) {
			$.notify({
				message: error,
			},{
				type: 'danger',
				z_index: 999999,
				placement: {
					from: 'top',
					align: 'right'
				},
			});
		},
		alertar : function (msg) {
			$.notify({
				message: msg,
				icon: 'fa fa-check-circle',
			},{
				type:'success',
				//icon: 'glyphicon glyphicon-star',
				delay: 1000,
				// animate: {
				// 	enter: 'animated zoomInDown',
				// 	exit: 'animated zoomOutUp'
				// },
				placement: {
					from: "top",
					align: "right"
				}
			});
		},
		alertar_erro :  function (msg) {
			$.notify({
				message: msg,
				//icon: 'glyphicon glyphicon-alert',
			},{
				type:'danger',
				//delay: 91500,
				// animate: {
				// 	enter: 'animated zoomInDown',
				// 	exit: 'animated zoomOutUp'
				// },
				placement: {
					from: "top",
					align: "right"
				}});
		},
		call : function (chamada, metodo,parametros, noAlertError ) {
			$rootScope.Erros = {};
			Utils.IconeLoaderOn();
			$rootScope.resp = {};
			var nomeChamada = chamada.split('?')[0].toString().replace('search','') ||'';
			$rootScope.nomeChamada = nomeChamada;

			return $http({
				url: WS.WEBAPI+chamada,
				method: (metodo||'POST'),
				data: (parametros||null),
				headers: {
					Authorization: oAuth.token_type+' '+oAuth.access_token,
				},
			}).then(function (r) {
				$rootScope.resp = r.data;

				if (r.status != 200) {
					$rootScope.resp = { error: true, message: r.statusText };
				}

				else if(chamada == 'clientecampanhacartaobasicdata' ){
					$rootScope.resp = { error: false, message: JSON.stringify(r.data, null, "\t") };
				}

				else if(r.data.error == undefined ){
					$rootScope.resp = { error: true, message: JSON.stringify(r.data, null, "\t") };
				}

				else if ( Array.isArray(r.data[nomeChamada]) && r.data[nomeChamada].length == 0 && r.data[nomeChamada] != undefined) {
					$rootScope.resp = { error: true, message: "Not found" };
				}
				else if ( typeof r.data[nomeChamada] !== 'undefined' && typeof r.data[nomeChamada].data !== 'undefined' && Array.isArray(r.data[nomeChamada].data) && r.data[nomeChamada].data.length == 0 && r.data[nomeChamada].data != undefined) {
					$rootScope.resp = { error: true, message: "Not found" };
				}

				else if ( Array.isArray( r.data[nomeChamada] ) && r.data[nomeChamada].per_page != undefined ) {
					$rootScope.resp = r.data[nomeChamada];
				}

				if (  typeof r.data[nomeChamada] !== 'undefined' && typeof r.data[nomeChamada].per_page !== 'undefined' ) {
					$rootScope.paginacao = r.data[nomeChamada];
				}

				if ($rootScope.resp.error && !noAlertError) {
					var jsonPost = JSON.stringify({"text":'Verificar: ('+chamada+') '+$rootScope.resp.message.toString()});
					if (chamada.indexOf('clientecampanhacartaosearch') == -1 && chamada.indexOf('resgatecarrinhoget') == -1 &&  chamada.indexOf('regulamentodisplay') == -1 )
					{
						api.alertar_erro( $rootScope.resp.message );
					}

					if($rootScope.resp.error=="info") {
						if(typeof $scope !== 'undefined')
						$scope.errorInfoMessage = $rootScope.resp.message;
					}
				}

				if ($rootScope.resp.error && $rootScope.resp.message != undefined) {
				}

				Utils.IconeLoadeOff()

				return $rootScope.resp;

			}, function (error) {

				$rootScope.Erros = error.data;
				//debugger

				$rootScope.resp = { error: true, message: error.statusText };
				if (error.status == 400 ) {
					let msgs = ""
					for (var key in error.data) {
						msgs += '<span class="glyphicon glyphicon-alert text-danger"></span> ' + error.data[key] + '<br>' //+ ' ('+key+')\n\t';
					}

					$rootScope.resp = { error: true, message: msgs };
				}
				if (error.status == 500) {
					$rootScope.resp = { error: true, message: 'Erro: 500 - Internal Server Error ('+chamada+')'  };
				}
				if (error == -1) {
					$rootScope.resp = { error: true, message: 'Erro: 503 - Internal Server Error ('+chamada+')'  };
				}
				Utils.IconeLoadeOff()

				var error_message = $rootScope.resp.message;

				if(error.data.errors !== null && Object.keys(error.data.errors).length) {
					error_message = error.data.errors[Object.keys(error.data.errors)[0]];
				} else if(error.data.message) {
					error_message = error.data.message;
				}

				api.alertar_erro( error_message );

				var stringError = 'Verificar error: '+ error.status + ' - (' + chamada +') em - '+ window.location.href;
				var jsonPost = JSON.stringify({"text":stringError});


				return $rootScope.resp;
			});
		},

	}

	return {
		solicitar : api.call,
		get : function(chamada, opts, noAlertError){
			return api.call(chamada, 'GET', opts, noAlertError);
		},
		post : function(chamada,opts, noAlertError){
			return api.call(chamada, 'POST', opts, noAlertError);
		},
		get_params_url: function (param, url) {
			var url = new URL(url||window.location.href);
			return url.searchParams.get(param);
		},
		b64EncodeUnicode : function (str) {
			return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
				function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1);
				})).replace('==','');
		},
		b64DecodeUnicode : function (str) {
			return decodeURIComponent(atob(str).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
		},
		message: api.message,
		error: api.error,
		alertar: api.alertar,
		alertar_erro: api.alertar_erro,
		formatarPontosParaAPI : function(v){
			if (v) {
				v = v.toString();
				while(v.includes('.'))
				{
					v = v.replace('.', '');
				}
				return v.replace(',','.');
			}
			return v;
		}
	};

})
.directive("search", function($http, $rootScope, API){

	return {
		scope: {
			search: '='
		},
		link: function (scope, el, attrs) {

			var timeSeach;
			var urlString ="";

			el.bind('keyup', function (event) {

				if (event.target.value != '') {
					urlString = scope.search.endpoint+'?s='+event.target.value
				}

				else {
					urlString = scope.search.endpoint+'?page=1&per_page=10';
				}

				stopMySeach();
				$rootScope.paginacao ={} ;
				mySeach(scope, urlString)

			});

			function mySeach(scope, urlString ){

				timeSeach = setTimeout(function(){

					API.get(urlString).then(function(data){

						if (data.message) {
							return;
						}

						if ( !angular.isArray(data[scope.search.endpoint]) && data[scope.search.endpoint].data == undefined ) {

							if ( [ data[scope.search.endpoint] ].length == 0 ) {
								API.alertar_erro('Nenhum resultado encontrado...');
								return
							}

							$rootScope[scope.search.table] = [ data[scope.search.endpoint] ];

						}
						else if ( angular.isArray(data[scope.search.endpoint]) && data[scope.search.endpoint].data == undefined ) {
							if ( data[scope.search.endpoint].length == 0 ) {
								API.alertar_erro('Nenhum resultado encontrado...');
								return
							}


							$rootScope[scope.search.table] = data[scope.search.endpoint];
						}
						else if ( !angular.isArray(data[scope.search.endpoint]) && data[scope.search.endpoint].data != undefined ) {
							if ( data[scope.search.endpoint].data.length == 0 ) {
								API.alertar_erro('Nenhum resultado encontrado...');
								return
							}


							$rootScope[scope.search.table] = data[scope.search.endpoint].data;

						}

					})


				}, 400)
			}

			function stopMySeach(){
				clearTimeout(timeSeach);
			}
		}
	}
})
.directive("loadPaginacao", function($rootScope) {
	return {
		restrict : "C",
		template : '<div ng-show="paginacao.total>0" class="row paginacao" style="background-color: #f5f5f5;padding: 10px;"><div class="col-sm-3 col-xs-4"><div class="form-inline"><div class="input-group"><span class="input-group-addon" style="background: transparent; border: none;font-size: 85%;">Por página</span><select ng-disabled="paginacao.to==paginacao.total" ng-change="porPagina(paginacao.per_page)" ng-model="paginacao.per_page" class="form-control input-sm" id="sel2" style="min-width: 70px;"><option ng-selected=" paginacao.per_page==5" value="5">5</option><option ng-selected=" paginacao.per_page==10" value="10">10</option><option ng-selected=" paginacao.per_page==50" value="50">50</option><option ng-selected=" paginacao.per_page==100" value="100">100</option><option ng-selected=" paginacao.per_page==1000" value="1000">1000</option></select></div></div></div><div class="col-sm-9 "><div class="form-inline pull-right"><div class="pull-left" style="padding: 4px;"><span class="form-campo1 small"> {{ paginacao.total }} itens</span></div><button type="button" class="btn btn-xs btn-default input-sm pull-left" ng-disabled="paginacao.current_page==1" ng-click="proximaPagina(1)"><i class="fa fa-angle-double-left" aria-hidden="true"></i></button><button type="button" class="btn btn-xs btn-default input-sm pull-left" ng-disabled="paginacao.current_page==1" ng-click="proximaPagina(paginacao.current_page - 1)"><i class="fa fa-angle-left" aria-hidden="true"></i></button><span class="pull-left" style="padding: 4px;"><span class="form-campo4 small " > {{ paginacao.current_page }} </span><span class="small "> de </span><span class="form-campo4 small " > {{ paginacao.last_page }} </span></span><button type="button" class="btn btn-xs btn-default input-sm pull-left" ng-disabled="paginacao.to==paginacao.total" ng-click="proximaPagina(paginacao.current_page + 1)"><i class="fa fa-angle-right" aria-hidden="true"></i></button><button type="button" class="btn btn-xs btn-default input-sm pull-left" ng-disabled="paginacao.to==paginacao.total" ng-click="proximaPagina(paginacao.last_page)"><i class="fa fa-angle-double-right" aria-hidden="true"></i></button></div></div></div>',
		controller : function ($rootScope, $element, $attrs, API) {
			$rootScope.carregarPaginacao = function(url){

				if (typeof $rootScope.paginacao !== 'undefined' && typeof $rootScope.paginacao.current_page !== 'undefined'  ) {

					if (typeof $rootScope.retornoPaginacao === 'undefined') {
						console.error('definir nome de variavel no controller "retornoPaginacao" para paginacao');
					}
					$rootScope.paginacao.url_chamada = $rootScope.paginacao.path.toString().replace(WS.WEBAPI, "")+'?page='+$rootScope.paginacao.current_page+'&per_page='+$rootScope.paginacao.per_page;
				}

				if (url) {
					API.solicitar($rootScope.paginacao.url_chamada, ($rootScope.methodPaginacao||'GET'), ($rootScope.parametrosPaginacao||null)).then(function (data) {
						if (!data.error) {
							$rootScope[$rootScope.retornoPaginacao] = data[$rootScope.nomeChamada].data;
						}
					});
				}


			};


			$rootScope.proximaPagina = function(num_pagina){

				if ($rootScope.paginacao.current_page == undefined) {
					API.alertar_erro('Página não encontrada')
					return
				}
				if (num_pagina) {
					$rootScope.paginacao.current_page = num_pagina;
				}
				$rootScope.carregarPaginacao( true );
			}

			$rootScope.porPagina = function(limit_pagina){
				$rootScope.paginacao.per_page = limit_pagina;
				$rootScope.carregarPaginacao( true);
			}


			setTimeout(function() {
				$rootScope.carregarPaginacao();
			}, 2000);


		}
	}
})
.directive('file', function () {
	return {
		scope: {
			file: '='
		},
		link: function (scope, el, attrs) {
			el.bind('change', function (event) {
				var file = event.target.files[0];
				scope.file = file ? file : undefined;
				scope.$apply();
			});
		}
	};
}).filter('formatarPontos', function() {
	return function(input) {

		if (input) {
			input = input.toString() || '';

			while(input.includes(','))
			{
				input = input.replace(',', '.');
			}

			return input;
		}

		return input;
	};
})
