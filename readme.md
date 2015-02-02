## Описание модулей (проект karamba-core):

`/controllers/api.js` - регистрация методов JSON RPC API. Обертка - `/modules/jsonRpc.js`
Обертка для API позволяет использовать два протокола одновременно http и web sockets, по усмотрению.

В обьекте express - req, доступен обьект socket - req.ext.socket

Позволяет приняв http запрос от клиента отправить клиенту данные по сокету.


В обьекте socket, присутствует свойство socket.relationsIDs - массив храняший итендификаторы всех сокетных соединений клиента,
в случае если клиент открыл несколько вкладок в браузере. Позволяет пушить данные на все открытые пользователем копии приложения.


Изменен механизм сессий, теперь express.session = socket.user.session, сессии хранятся в памяти, при разрыве сокетного соединения записываются в mongodb, при соединении извлекаются из mongodb в память. Позволяет использовать единую сессию как при http запросах так и при web socket запросах.


Существует возможность делать Angular контроллеры доступными с бекенда предоставляя доступ к методам в Scope, 
превращая таким образом всю клиентскую часть приложения в API:

Пример:
```javascript
                user.socket.emit('runScopeMethod', {
                    controllerName: 'navbarController',
                    methodName: 'setOnlineCount',
                    argument: {"foo": 123}
                });
```

Пример как сделать доступным angular коннтроллер  для бекенда:
```javascript
	app.controller('channelController', function($scope, $stateParams, $jsonrpc) {
    	publicControllers['channelController'] = $scope;
	});
```

Клиентская обертка для JSON RPC API: `/public/angular_modules/jsonrpc.js`

оформлена в виде сервиса для angular.js, позволяет использовать JSON RPC по протоколам как http так и web socket в нативном, удобном виде. 

Пример:
```javascript
    $jsonrpc.API.call('getLastIRCLog', {"foo":"bar"}, function(response, rpcObject, xhr) {
		//http ajax запрос
    });

    $jsonrpc.API.emit('setIRCChannel', {"foo":"bar"}, function(response, rpcObject, emit) {
		//web socket запрос
    });
```

При вызове $jsonrpc.API.emit если socket не существует то будет осуществлен запрос по протоколу http

***


