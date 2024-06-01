function initializeChat() {
    let username = prompt("Please enter your name");
    console.log(username);

    var title_h = document.getElementById('title');
    title_h.innerHTML = `User ${username}`;

    var chatbox = document.getElementById('chatbox');
    var msg_input = document.getElementById('msg');
    var send_btn = document.getElementById('send');
    var clear_btn = document.getElementById('clear_chat');
    var online_div = document.getElementById('onlineusers');

    let mywebsocket = new WebSocket('ws://localhost:8090');

    console.log(mywebsocket);

    mywebsocket.onopen = function () {
        console.log('connection opened', this);
        let message_obj = {
            username: username,
            login: true
        };
        this.send(JSON.stringify(message_obj));
    };

    mywebsocket.onmessage = function (event) {
        console.log(event.data);
        let msg_content = JSON.parse(event.data);
        if (msg_content.type === 'login') {
            chatbox.innerHTML += `<div class="chat-message login"><div class="message">${msg_content.message}</div></div>`;
        } else if (msg_content.type === 'logout') {
            chatbox.innerHTML += `<div class="chat-message logout"><div class="message">${msg_content.message}</div></div>`;
        } else if (msg_content.type === 'chat') {
            chatbox.innerHTML += `<div class="chat-message server"><div class="message">${msg_content.message}</div></div>`;
        }
        chatbox.scrollTop = chatbox.scrollHeight;

        online_div.innerHTML = '';
        msg_content.online.forEach((element) => {
            online_div.innerHTML += `<li class="list-group-item"><span class="status"></span>${element}</li>`;
        });
    };

    mywebsocket.onerror = function () {
        chatbox.innerHTML += '<div class="chat-message error"><div class="message" style="color: red">Error connecting to server</div></div>';
    };

    send_btn.addEventListener('click', function () {
        let msg_val = msg_input.value;
        let message_obj = {
            body: `${username}: ${msg_val}`
        };
        mywebsocket.send(JSON.stringify(message_obj));
        chatbox.innerHTML += `<div class="chat-message user"><div class="message">Me: ${msg_val}</div></div>`;
        chatbox.scrollTop = chatbox.scrollHeight;
        msg_input.value = '';
    });

    clear_btn.addEventListener('click', function () {
        chatbox.innerHTML = '';
    });

    mywebsocket.onclose = function () {};
}