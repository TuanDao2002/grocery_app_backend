const { connectedUsers } = require("../utils");

const notifySocket = (io, payload) => {
    for (let socket of Object.values(connectedUsers)) {
        io.to(socket.id).emit("notification", payload);
    }
};

module.exports = notifySocket;
