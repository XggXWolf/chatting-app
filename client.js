const socket = io();

const editProfilePic = document.getElementById("edit-button");
const usernameInput = document.getElementById("username");
const joinButton = document.getElementById("join-button");
const profilePicInput = document.getElementById('profilePicInput');
const joinOverlay = document.getElementById('joinOverlay')
const smallProfilePic = document.getElementById('profilePicSmall')

let profilePic = "";

editProfilePic.addEventListener("click", () => {
    profilePicInput.click();
});

smallProfilePic.addEventListener("click", () => {
    joinOverlay.style.display = "flex";
});

profilePicInput.addEventListener('change', (event) => {
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

messageInput.addEventListener("keydown", (event) => {
    if(event.key == 'Enter'){
        event.preventDefault();
        const message = messageInput.value;
        socket.emit("sendMessage", message);
        messageInput.value = '';
    }
});

const imageSend = document.getElementById("addImgButton");
const imageInput = document.getElementById("imageInput")

imageSend.addEventListener("click", () =>{
    imageInput.click();
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();

            img.onload = () => {
                
                const maxImgSize = 512;
                let finalWidth = maxImgSize;
                let finalHeight = maxImgSize;



                if(img.width > maxImgSize || img.height > maxImgSize){
                    const aspectRatio = img.width / img.height;

                    finalWidth = img.width > img.height ? maxImgSize : maxImgSize * aspectRatio;
                    finalHeight = img.height > img.width ? maxImgSize : maxImgSize / aspectRatio;
                } else {
                    finalWidth = img.width;
                    finalHeight = img.height;
                }

                const canvas = document.createElement('canvas');
                canvas.width = finalWidth;
                canvas.height = finalHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

                const resizedBase64 = canvas.toDataURL('image/png');

                socket.emit("sendImage", resizedBase64);

            }
            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }
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

    imageContainer.appendChild(profilePic);
    imageContainer.appendChild(imageElement);

    document.querySelector(".messages").appendChild(imageContainer);
}

const savedProfilePic = localStorage.getItem("profilePic");
const savedUsername = localStorage.getItem("username");

if (savedUsername) {
    socket.emit("changeUsername", savedUsername);
    usernameInput.value = savedUsername;
} else {
    joinOverlay.style.display = "flex";
}
if (savedProfilePic) {
    smallProfilePic.src = savedProfilePic;
    document.querySelector(".profile-pic").src = savedProfilePic;
    profilePic = savedProfilePic;
    socket.emit("changeProfilePic", savedProfilePic)
}
