import { Server } from "socket.io";
import  http from "http";
import { profile } from "console";


const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});


const users = {};
let userCount = 1;


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    let username = `User${userCount++}`;
    users[socket.id] = {
        username: username,
        profilePic: "images/blank-profile-picture-973460_960_720.webp"
    };

    socket.on("changeUsername", (newUsername) => {
        if(!isBase64Image(newUsername)) return;
        if (newUsername && newUsername.trim() !== "") {
            users[socket.id].username = newUsername.trim().substring(0, 20);
            console.log(`User ${socket.id} changed username to ${newUsername}`);
        }
    });

    socket.on("changeProfilePic", (newProfilePic) => {
        if (newProfilePic && newProfilePic.trim() !== "") {
            users[socket.id].profilePic = newProfilePic.trim();
            console.log(`User ${socket.id} changed profile picture to ${newProfilePic}`);
        }   
    });

    socket.on("sendMessage", (message) => {
        if (message && message.trim() !== "") {
            const user = users[socket.id];
            const chatMessage = {
                socketid : socket.id,
                username: user.username,
                profilePic: user.profilePic,
                message: message.trim()
            };
            console.log("New chat message:", chatMessage);

            io.emit("newMessage", chatMessage);
        }
    });

    socket.on("sendImage", (imageData) => {
        if (imageData && imageData.trim() !== "" && isBase64Image(imageData)) {
            const user = users[socket.id];
            const imageMessage = { 
                socketid: socket.id,
                username: user.username,
                profilePic: user.profilePic,
                image: imageData.trim()
            };
            console.log("New image message:", imageMessage);

            io.emit("newImage", imageMessage);
        }
    });

    socket.emit("welcome", "Welcome to the chat app!");
});

httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Server is running on port 3000");
});


function isBase64Image(str) {
  return /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/]+=*$/.test(str);
}