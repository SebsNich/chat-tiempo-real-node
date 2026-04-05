document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000'); 

    // Seleccionar elementos
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages'); 
    const userList = document.getElementById('users');
    
    let username = '';

    // Manejar ingreso del usuario
    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        username = usernameInput.value.trim();

        if(username) {
            // Avisar a backend
            socket.emit('join', username);
            
            // Ocultar el form de nombre
            usernameForm.classList.add('hidden');
            usernameForm.classList.remove('flex');
            
            // Mostramos el form de chat (como flex)
            messageForm.classList.remove('hidden');
            messageForm.classList.add('flex');
            
            // poner el cursor automáticamente en la caja de chat
            messageInput.focus();
        }
    });

    // Enviar mensaje
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgText = messageInput.value.trim();
        
        if(msgText) {
            // Se envia envolviendolo con el nombre del usuario
            const messageData = { user: username, text: msgText };
            socket.emit('message', messageData); 
            messageInput.value = ''; 
        }
    });

    // Recibir un mensaje de chat
    socket.on('chatMessage', (data) => {
        const messageElement = document.createElement('div');
        
        // Verificar si el mensaje es del usuario actual o de otra persona diferente
        const isMe = data.user === username;

        messageElement.className = `p-3 rounded-lg w-fit max-w-[80%] shadow-md border ${
            isMe 
            ? 'bg-violet-600/20 border-violet-500/30 text-white self-end ml-auto' // Mensaje del usuario actual (derecha, fondo violeta)
            : 'bg-zinc-800 border-zinc-700 text-zinc-200' // Mensaje de otros (izquierda, fondo oscuro)
        }`;
        
        messageElement.innerHTML = `
            <span class="block text-xs font-bold ${isMe ? 'text-violet-400' : 'text-zinc-400'} mb-1">${data.user}</span>
            <span>${data.text}</span>
        `;
        
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight; // Auto-scroll
    });

    // Actualizar lista de usuarios
    socket.on('userList', (users) => {
        userList.innerHTML = ''; 
        users.forEach((user) => {
            const userElement = document.createElement('li');
            userElement.className = "p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 flex items-center gap-2 border border-zinc-800/50";
            
            // Poner un puntito verde para indicar que está "Online"
            userElement.innerHTML = `<i class="fa-solid fa-circle text-[10px] text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></i> ${user}`;
            userList.appendChild(userElement);
        });
    });

    function showSystemNotification(text) {
        const notifElement = document.createElement('div');
        notifElement.className = "text-center text-xs text-zinc-500 italic my-2";
        notifElement.textContent = text;
        messages.appendChild(notifElement);
        messages.scrollTop = messages.scrollHeight;
    }

    socket.on('userJoined', (user) => {
        showSystemNotification(`${user} se ha unido a la sala`);
    });

    socket.on('userLeft', (user) => {
        showSystemNotification(`${user} ha abandonado la sala`);
    });

    // Logs de conexión básicos
    socket.on('connect', () => console.log('Conectado al servidor'));
    socket.on('disconnect', () => console.log('Desconectado'));
    socket.on('connect_error', (error) => console.log('Error de conexión', error));
});