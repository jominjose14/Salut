const Filter = require('bad-words');
const { enclose } = require('./enclose.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
const { getRooms, isNewRoom, isLastMember } = require('./rooms.js');

const adminName = 'Salut';

const onJoin = (io, socket, sentUserDetails, callback) => {
    try {
        const isNewRoomFlag = isNewRoom(sentUserDetails.room);
        const { error, user } = addUser({ id: socket.id, ...sentUserDetails });

        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        // Notify other roommates about new member
        socket.broadcast.to(user.room).emit('notif', enclose(user.username, `${user.username} has joined the room`));
        
        // Update room data for every roommate
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        
        // Share availability of new room 
        if(isNewRoomFlag) {
            io.emit('availableRoomsChanged', getRooms());
        }

        callback();
    } catch(e) {
        console.error(e);
        return callback('Server error');
    }
}

const onSendMessage = (io, socket, message, callback) => {
    try {
        const user = getUser(socket.id);

        ack = {};
        const filter = new Filter();

        if(filter.isProfane(message)) {
            ack.error = 'Profanity is not allowed';
            return callback(ack);
        }

        io.to(user.room).emit('message', enclose(user.username, message));
        ack.message = 'Accepted';
        callback(ack);
    } catch(e) {
        console.error(e);
        return callback({ error: 'Server error' });
    }
}

const onSendLocation = (io, socket, location, callback) => {
    try {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', enclose(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        ack = { message: 'Accepted' };
        callback(ack);
    } catch(e) {
        console.error(e);
        return callback({ error: 'Server error' });
    }
}

const onDisconnect = (io, socket) => {
    try {
        const userToBeDeleted = getUser(socket.id);
        if(!userToBeDeleted) return;
        const isRoomDiscarded = isLastMember(userToBeDeleted.room);

        const user = removeUser(socket.id);
        if(!user) return;

        // Notify roommates that user left
        io.to(user.room).emit('notif', enclose(adminName, `${user.username} has left the room`));
        
        // Update roomData for all roommates
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        // Update room availability on join pages
        if(isRoomDiscarded) {
            io.emit('availableRoomsChanged', getRooms());
        }
    } catch(e) {
        console.error(e);
    }
}

module.exports = {
    onJoin,
    onSendMessage,
    onSendLocation,
    onDisconnect
}