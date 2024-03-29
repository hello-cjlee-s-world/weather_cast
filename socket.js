const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cookie = require('cookie-signature');
const ColorHash = require('color-hash').default; // 책과 다름. 사용법이 달라진 듯 함 .default가 붙어야 한다.

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const room = io.of('/room');

    io.use((socket, next) => {
        //cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
        sessionMiddleware(socket.request, socket.request.res, next);
    })

    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        });
    });

    // chat.on('connection', (socket) => {
    //     console.log('chat 네임스페이스에 접속');
    //     const req = socket.request;
    //     // 책이랑 다름 req.session.color가 안잡혀서 새로 넣어줌
    //     if(!req.session.color) {
    //         const colorHash = new ColorHash();
    //         req.session.color = colorHash.hex(req.sessionID);
    //     }
    //     const { headers: {referer} } = req
    //     const roomId = referer
    //     .split('/')[referer.split('/').length -1]
    //     .replace(/\?.+/,'');       
    //     socket.join(roomId);
    //     socket.to(roomId).emit('join', {
    //         user: 'system',
    //         chat: `${req.session.color}님이 입장하셨습니다.`
    //     })

    //     socket.on('disconnect', () => {
    //         socket.leave(roomId);
    //         const currentRoom = socket.adapter.rooms[roomId];
    //         const userCount = currentRoom ? currentRoom.length : 0;
    //         if(userCount == 0){ // 접속자가 0명이면 방 삭제
    //             //console.log(req.signedCookies);
    //             // const signedCookie = req.signedCookies['connect.sid'];
    //             // const connectSID = cookie.sign(signedCookie, process.env.COOKIE_SECRET);
    //             // axios.delete(`http://localhost:8005/room/${roomId}`, {
    //             //     headers: {
    //             //         Cookie: `connect.sid=s%3A${connectSID}`
    //             //     }
    //             // })
    //             axios.delete(`http://localhost:8005/room/${roomId}`)
    //                 .then(() => {
    //                     console.log('방 제거 요청 성공');
    //                 })
    //                 .catch((error) => {
    //                     console.error(error);
    //                 });
    //         } else {        
    //             socket.to(roomId).emit('exit', {
    //                 user: 'system',
    //                 chat: `${req.session.color}님이 퇴장하셨습니다.`
    //             })
    //         }
    //         console.log('chat 네임스페이스 접속 해제');
    //     });
    // });
}