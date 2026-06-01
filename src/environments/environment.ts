
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api/' 
 // apiUrl: 'https://api.nexsuz.com/api/',

}; 

export const echo = new Echo({
    broadcaster: 'pusher',
    key: 'e0cd7653f3ae9bbbd459', // Replace with actual Pusher key
    cluster: 'ap1', // Ensure this matches your Pusher dashboard settings
    forceTLS: true,
    enabledTransports: ['ws', 'wss'], // Allows WebSockets
    auth: {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
    },
    client: Pusher, // Ensure Laravel Echo uses the correct Pusher client
});
