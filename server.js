// const express = require("express");
// const app = express();
// const server = require("http").Server(app);
// const { v4: uuidv4 } = require("uuid");
// const io = require("socket.io")(server);

// app.set("view engine", "ejs");
// app.use(express.static("public"));

// app.get("/", (req, res) => {
//     res.redirect(`/${uuidv4()}`)
// });
// app.get("/:room", (req, res) => {
//     res.render("room", { roomId: req.params.room})
// })

// io.on("connection" , socket => {
//     socket.on("join-room" , (roomId , userId)=>{
//         console.log(roomId, userId);
//         socket.join(roomId);
//         socket.to(roomId).broadcast.emit("user-connected", userId);
//     })
// })
// server.listen(process.env.PORT || 3030);

const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`)
});
app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room})
})

io.on("connection", socket => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        // Check if the room exists before broadcasting
        if (io.sockets.adapter.rooms.has(roomId)) {
            // Use io.to(roomId) instead of socket.to(roomId)
            io.to(roomId).emit("user-connected", userId);
        } else {
            console.log(`Room ${roomId} does not exist`);
        }

        // Listen for socket disconnection
        socket.on("disconnect", () => {
            console.log(`User ${userId} disconnected`);
            // Emit a signal to remove the disconnected user's video from the grid
            io.to(roomId).emit("user-disconnected", userId);
        });
    });
});


server.listen(process.env.PORT || 5000);
