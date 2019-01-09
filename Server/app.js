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


// ***** ChatRoom Functions *****

//保存使用者的陣列
var userList = {};
//接收用戶端的連接
sio.on('connection',socket=>{
    //註冊
    socket.on('register',registerObj=>{
        User.findOrCreate({where: {account: registerObj.name}, defaults: {password:registerObj.password}})
        .spread((user, created) => {
            // console.log(user.get({
            //     plain: true
            // }))
            // console.log(created)
            socket.uid = user.get('uid');
            if(created){
                //發送當前使用者清單資訊
                socket.emit('registerInfo','註冊成功');
            }
            else{
                //發送當前使用者清單資訊
                socket.emit('registerInfo','用戶名已經存在');
            }
        })
    });


    //登錄    
    socket.on('login',(user)=>{
        console.log('login');
        console.log(user);

        User.findOne({where: {account: user.name,password:user.password}}).then(user=>{
            console.log(user);
            if(user){
                socket.uid = user.get('uid');
            }
            else{
                //發送當前使用者清單資訊
                socket.emit('loginInfo','登錄失敗');
                return;
            }
        });

        user.id = socket.id;
        if(!userList[user.channel]){
            userList[user.channel]=[];
        }
        userList[user.channel].push(user);
        socket.join(user.channel);
        socket.channel = user.channel;
        //群發用戶列表
        sio.to(user.channel).emit('userList',userList[user.channel]);
        //發送當前使用者清單資訊
        socket.emit('userInfo',user);
        //除自己外廣播使用者登錄資訊
        socket.broadcast.to(user.channel).emit('loginInfo',user.name+"上線了。");
    });
    //用戶端斷開
    socket.on('disconnect',()=>{
        //查出當前離開的用戶
        //console.log(socket.channel);
        if(socket.channel){
            socket.leave(socket.channel,()=>{
                //使用者離開頻道的回檔
            })
        }

        let user = _.findWhere(userList[socket.channel],{id:socket.id});
        if(user){
            //剔除當前離線用戶
            userList[socket.channel] = _.without(userList[socket.channel],user);
            //發送當前使用者清單資訊
            sio.to(socket.channel).emit('userList',userList[socket.channel]);
            //除自己外廣播使用者斷線資訊
            socket.broadcast.to(user.channel).emit('loginInfo',user.name+"下線了。");
            
            //刪除當前的頻道
            if(userList[socket.channel].length==0){
                delete userList[socket.channel];
                delete socket.channel;
            }
        }
    });

    //群發事件
    socket.on('toAll',function(msgObj){
        Message.create({
            fromuid:socket.uid,
            message:msgObj.msg,
        }).then(value=>{
            console.log(`插入資料 ${value}`);
        });

        console.log(`++++++++++++++${msgObj.from.channel}+++++++++++++++`);
        socket.broadcast.to(msgObj.from.channel).emit('toAll',msgObj);
    });
    //單發事件
    socket.on('toOne',function(msgObj){
        let toSocket = _.findWhere(sio.sockets.sockets,{id:msgObj.to});
        toSocket.emit('toOne', msgObj);
    });

    // 心跳包     
    socket.on('game_ping',function(data){
        socket.emit('game_pong');
    });
});
