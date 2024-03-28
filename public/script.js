const socket = io(); // Connect to the server-side Socket.IO instance
const myPeer = new Peer(undefined, { host: '/', port: '3001' }); // Initialize a Peer object with no specific ID and connect it to our server
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement('video');
myVideo.muted = true;
const calls = {}; // Object to store active call objects

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });
        // Store the call object
        calls[call.peer] = call;
    });

    socket.on("user-connected", userId => {
        connectToNewUser(userId, stream);
    });

    socket.on("user-disconnected", userId => {
        if (calls[userId]) {
            calls[userId].close();
            delete calls[userId];
        }
    });

    // Display all active calls on the screen
    Object.values(calls).forEach(call => {
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });
    });
});

myPeer.on('open', id => {
    socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    // Store the call object
    calls[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
