const socket = io("http://192.168.1.103:3000");

const editProfilePic = document.getElementById("edit-button");
const usernameInput = document.getElementById("username");
const joinButton = document.getElementById("join-button");
const fileInput = document.getElementById('fileInput');
const joinOverlay = document.getElementById('joinOverlay')
const smallProfilePic = document.getElementById('profilePicSmall')

let profilePic = "";

editProfilePic.addEventListener("click", () => {
    fileInput.click();
});

smallProfilePic.addEventListener("click", () => {
    joinOverlay.style.display = "flex";
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();

            img.onload = () => {

                const canvas = document.createElement('canvas');
                const size = 128;
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);

                const resizedBase64 = canvas.toDataURL('image/png');

                document.querySelector(".profile-pic").src = resizedBase64;
                socket.emit("changeProfilePic", resizedBase64);
                profilePic = resizedBase64;
                localStorage.setItem("profilePic", profilePic);
            }
            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }
});

joinButton.addEventListener('click', (event) => {
    const username = usernameInput.value;
    socket.emit("changeUsername", username);
    localStorage.setItem("username", username);
    smallProfilePic.src = profilePic;
    joinOverlay.style.display = "none";
});


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
    postMessage({ username: chatMessage.username, text: chatMessage.message, profilePic: chatMessage.profilePic });
});

socket.on("newImage", (imageMessage) => {
    console.log("New image message received:", imageMessage);
    postImage({ src: imageMessage.image, profilePic: imageMessage.profilePic });
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

const savedProfilePic = localStorage.getItem("profilePic");
const savedUsername = localStorage.getItem("username");

if (savedUsername) {
    socket.emit("changeUsername", savedUsername);
} else {
    joinOverlay.style.display = "flex";
}
if (savedProfilePic) {
    smallProfilePic.src = savedProfilePic;
    socket.emit("changeProfilePic", savedProfilePic)
}
