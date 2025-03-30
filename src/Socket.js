export const initSocket = async () => {
  const socket = io(process.env.REACT_APP_BACKEND_URL, {
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket']
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      resolve(socket);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      reject(new Error('Failed to connect to server'));
    });
  });
};
