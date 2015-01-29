## Описание модулей (проект karamba-core):

`/controllers/api.js` - регистрация методов JSON RPC API. Обертка - `/modules/jsonRpc.js`
Обертка для API позволяет использовать два протокола одновременно http и web sockets, по усмотрению.

В обьекте express - req, доступен обьект socket - req.ext.socket

Позволяет приняв http запрос от клиента отправить клиенту данные по сокету.


В обьекте socket, присутствует свойство socket.relationsIDs - массив храняший итендификаторы всех сокетных соединений клиента,
в случае если клиент открыл несколько вкладок в браузере. Позволяет пушить данные на все открытые пользователем копии приложения.


Изменен механизм сессий, теперь express.session = socket.user.session, сессии хранятся в памяти, при разрыве сокетного соединения записываются в mongodb, при соединении извлекаются из mongodb в память. Позволяет использовать единую сессию как при http запросах так и при web socket запросах.


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

## todo list irc bot:

На frontend:

    1. столбчатая диаграмма активности пользователей, топ 10 (реалтайм)

    2. график активности за месяц, по дням (реалтайм)

    3. поиск по логам, выбор лога по дате-времени (под запрос)
