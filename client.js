

const socket = io("http://192.168.1.103:3000");

socket.on("welcome", (message) => {
    console.log(message);
});