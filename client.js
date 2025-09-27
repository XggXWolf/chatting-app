const socket = io("http://192.168.1.103:3000");
const messageSend = document.getElementById("send-button");
const messageInput = document.getElementById("messageInput");

messageSend.addEventListener("click", (event) => {
    event.preventDefault();
    const message = messageInput.value;
    socket.emit("sendMessage", message);
    messageInput.value = "";
});


socket.on("welcome", (message) => {
    console.log(message);
});

socket.on("newMessage", (chatMessage) => {
    console.log("New chat message received:", chatMessage);
    postMessage({username: chatMessage.username, text: chatMessage.message, profilePic: chatMessage.profilePic});
});

socket.on("newImage", (imageMessage) => {
    console.log("New image message received:", imageMessage);
    postImage({src: imageMessage.image, profilePic: imageMessage.profilePic});
});

function postMessage(message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");


    const profilePic = document.createElement("img");
    profilePic.src = message.profilePic;
    profilePic.alt = "Profile Picture";
    profilePic.classList.add("profile-pic-small");

    const messageContent = document.createElement("div");
    messageContent.classList.add("context");
    const messageWithUsername = `${message.username}: ${message.text}`;
    messageContent.textContent = messageWithUsername;

    messageContainer.appendChild(profilePic);
    messageContainer.appendChild(messageContent);

    document.querySelector(".messages").appendChild(messageContainer);
}

function postImage(image) {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("message");

    const profilePic = document.createElement("img");
    profilePic.src = image.profilePic;
    profilePic.alt = "Profile Picture";
    profilePic.classList.add("profile-pic-small");


    const imageElement = document.createElement("img");
    imageElement.src = image.src;
    imageElement.alt = "Image Message";
    imageElement.classList.add("message-image");

    imageContainer.appendChild(imageElement);
    document.querySelector(".messages").appendChild(imageContainer);
}
