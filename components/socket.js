// socket.js
import { io } from 'socket.io-client';
import { API_BASE_URL } from './config';

// Asegúrate de usar la IP correcta si corres desde un celular físico
//const socket = io('http://192.168.0.38:3000'); // Cambia localhost por tu IP si usás un dispositivo real

const socket = io(`${API_BASE_URL}`); 
export default socket;
