const socket = io();

// Socket IO event handlers
socket.on('availableRoomsChanged', rooms => {
    populateRoomList(rooms);
})

// Features
async function loadRooms() {
    $roomsList = document.querySelector('body > .rooms > .list');
    $roomsList.innerHTML = 'Loading';
    
    const stream = await fetch('/rooms');
    const rooms = await stream.json();

    populateRoomList(rooms);
}

// Util
function populateRoomList(rooms) {
    if(rooms.length == 0) {
        $roomsList.innerHTML = 'No rooms available';
        return;
    }

    $roomsList = document.querySelector('body > .rooms > .list');
    $roomsList.innerHTML = '';
    rooms.forEach(room => {
        const $room = document.createElement('button');
        $room.onclick = () => populateRoomName(room);
        $room.innerText = room;
        $roomsList.appendChild($room);
    });
}

function populateRoomName(room) {
    const $textInput = document.querySelector('.join-form > input[name="room"]');
    $textInput.value = room;
}

// Main
window.addEventListener('DOMContentLoaded', () => {
    loadRooms();
});