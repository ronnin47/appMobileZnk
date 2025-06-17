// socket.js
import { io } from 'socket.io-client';

// Asegúrate de usar la IP correcta si corres desde un celular físico
const socket = io('http://192.168.0.38:3000'); // Cambia localhost por tu IP si usás un dispositivo real

export default socket;