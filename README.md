## Chat Room in Cocos Game Program (crossing Platform)




**1. Download**
Install node.js, npm.

**2. Add app.js**
```js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const sio = require('socket.io')(http);
const _ = require('underscore');

//設置跨域訪問
app.all('*', function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
     res.header("X-Powered-By",' 3.2.1')
     res.header("Content-Type", "application/json;charset=utf-8");
     next();
 });

//綁定窗口
app.get('/',(req,res)=>{
     res.send('<h1>Hello world</h1>');
 });
 
 http.listen(3000, ()=>{
     console.log('listening on http://127.0.0.1:3000');
 });
```

**3. Command Line**
```bash 
cd C:\GitHub\CocosChatRoom\Server

npm init

package name: (server) package
version: (1.0.0)
description: Chat Room in Cocos Game Program (crossing Platform)
entry point: (app.js)
test command:
git repository: https://git@github.com/mopack/CocosChatRoom.git
keywords: CocosChatRoom
author: Mopack
license: (ISC)

npm install express --save
npm install socket.io --save
npm install underscore --save

node app
```

Open Webpage http://127.0.0.1:3000, Success if you see "Hello world".


