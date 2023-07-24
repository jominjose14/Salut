const socket = io();

// Constants
const timeConfig = {
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
}

// Util
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

function closeModal(closeBtn) {
    closeBtn.parentElement.close();
}

function updateRoomDialog(room, users) {
    const $dialog = document.getElementById('room-dialog');
    $dialog.querySelector('.room-name').innerText = room;
    $usersList = $dialog.querySelector('.users');
    $usersList.innerHTML = '';
    users.forEach(user => {
        const $user = document.createElement('div');
        $user.innerText = user.username;
        $usersList.appendChild($user);
    });
}

// Socket IO event handlers
socket.on('message', (payload) => {
    let { author, text: message, createdAt: timestamp } = payload;

    const $newMessage = document.getElementById('message-template').content.cloneNode(true);
    const $author = $newMessage.querySelector('.author');
    const $time = $newMessage.querySelector('.time');
    const $content = $newMessage.querySelector('.content');

    $author.innerText = author;
    $time.innerText = new Date(timestamp).toLocaleString('en-US', timeConfig);

    if(message.startsWith('https://') && !message.includes(' ')) {
        const $anchor = document.createElement('a');
        $anchor.setAttribute('href', message);
        $anchor.setAttribute('target', '_blank');
        $anchor.innerText = 'My Location';
        $content.appendChild($anchor);
    } else {
        $content.innerText = message;
    }

    const $messages = document.querySelector('.messages');
    $messages.appendChild($newMessage);
    scrollToBottom($messages);
});

socket.on('notif', (payload) => {
    const notif = payload.text;
    const $dialog = document.getElementById('notif-dialog');
    $dialog.innerText = notif;
    $dialog.showModal();
    setTimeout(() => {
        $dialog.close();
    }, 3000);
});

socket.on('roomData', ({ room, users }) => {
    updateRoomDialog(room, users);
});

// Button click handlers
function sendMyMessage(event, btn) {
    event.preventDefault();
    btn.setAttribute('disabled', 'true');

    const $textArea = document.getElementById('myMessage');
    const message = $textArea.value.trim();
    $textArea.value = '';
    $textArea.focus();

    if(!message) {
        btn.removeAttribute('disabled');
        return;
    }

    socket.emit('sendMessage', message, ack => {
        if(ack.error) {
            btn.removeAttribute('disabled');
            return console.error(ack.error);
        }

        btn.removeAttribute('disabled');
        console.log(ack.message);
    });
}

function sendMyLocation(event, btn) {
    event.preventDefault();
    btn.setAttribute('disabled', 'true');
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported on your browser');
    }

    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ack => {
            btn.removeAttribute('disabled');
            console.log(ack.message);
        });
    });
}

function openRoom() {
    const $roomDialog = document.getElementById('room-dialog');
    $roomDialog.showModal();
}

function logout() {
    location.href = '/';
}

function joinRoom() {
    const queryParams = new URLSearchParams(window.location.search);
    const username = queryParams.get('username');
    const room = queryParams.get('room');

    socket.emit('join', { username, room }, error => {
        if(error) {
            alert(error);
            location.href = '/';
        }
    });

    document.querySelector('.nav .username').innerText = `Logged in as ${username}`;

    const $firstMessage = document.querySelector('.messages > .message');
    const $author = $firstMessage.querySelector('.author');
    const $time = $firstMessage.querySelector('.time');
    const $content = $firstMessage.querySelector('.content');

    $author.innerText = 'Salut';
    $time.innerText = new Date().toLocaleString('en-US', timeConfig);
    $content.innerText = `Welcome to room ${room}`;
}

// Join correct room
window.addEventListener('DOMContentLoaded', () => {
    joinRoom();
});