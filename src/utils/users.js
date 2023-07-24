const { addMember, removeMember } = require('./rooms.js');

const users = [];

const addUser = ({ id, username, room }) => {
    // Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }
    
    // Clean the data
    username = username.trim();
    room = room.trim();

    // Update member count of room
    addMember(room);

    // Check for existing users
    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    });

    // Check if username is in use
    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user and return user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id);

    if(index === -1) {
        return {
            error: 'User not found'
        };
    } else {
        // Update member count of room
        removeMember(users[index].room);

        // Delete user, then return deleted user
        return users.splice(index, 1)[0];
    }
}

const getUser = id => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = room => {
    if(!room) return [];
    room = room.trim();
    return users.filter(user => user.room === room);
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}