const rooms = {};

const getRooms = () => {
    const validRooms = [];
    
    for(const room of Object.keys(rooms)) {
        if(rooms[room] > 0) {
            validRooms.push(room);
        }
    }

    return validRooms;
}

const isNewRoom = room => {
    if(!room) return false;
    room = room.trim();
    return !(room in rooms) || room in rooms && rooms[room] === 0;
}

const isLastMember = room => {
    if(!room) return false;
    room = room.trim();
    return rooms[room] === 1;
}

const addMember = room => {
    if(room in rooms) {
        rooms[room]++;
    } else {
        rooms[room] = 1;
    }
}

const removeMember = room => {
    if(rooms[room] <= 1) {
        rooms[room] = 0;
    } else {
        rooms[room]--;
    }
}

module.exports = {
    getRooms,
    isNewRoom,
    isLastMember,
    addMember,
    removeMember
}