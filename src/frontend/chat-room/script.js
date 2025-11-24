const params   = new URLSearchParams(window.location.search);
const EVENT_ID = Number(params.get("eventId")) || 1; 
class EventChat {
    constructor() {
        this.currentUser = localStorage.getItem("username") || "You";
        this.messages = [];
        this.typingTimer = null;
        this.isTyping = false;
        
        this.initializeElements();
        //this.loadSampleMessages();
        this.loadMessagesFromBackend();
        this.attachEventListeners();
        this.scrollToBottom();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.typingUser = document.getElementById('typingUser');
        this.onlineCount = document.getElementById('onlineCount');
    }

    attachEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        // Typing indicator
        this.messageInput.addEventListener('input', () => this.handleTyping());        
    }
    // NEW: load messages from backend instead of only sample ones
async loadMessagesFromBackend() {
    try {
        const res = await fetch(`/api/chat/${EVENT_ID}`);
        if (!res.ok) {
            console.error("Chat GET failed with status", res.status);
            return;
        }

        const data = await res.json(); // expecting array of { username, text, timestamp }

        // Clear existing messages in UI + local array
        this.chatMessages.innerHTML = "";
        this.messages = [];

        data.forEach(msg => {
            const ts = msg.timestamp ? new Date(msg.timestamp) : new Date();
            const isOwn = (msg.username === this.currentUser);
            this.addMessageToChat(msg.username, msg.text, ts, isOwn);
        });

        this.scrollToBottom();
    } catch (err) {
        console.error("Error loading chat messages:", err);
        // If backend isn't ready yet, you can fall back to sample:
        // this.loadSampleMessages();
    }
}


    // loadSampleMessages() {
    //     const sampleMessages = [
    //         {
    //             username: 'Event Organizer',
    //             text: 'Welcome everyone to the AI & Machine Learning Workshop 2025!',
    //             timestamp: new Date(Date.now() - 3600000),
    //             isOwn: false
    //         },
    //         {
    //             username: 'Student1',
    //             text: 'So excited for this event! Who else is coming?',
    //             timestamp: new Date(Date.now() - 3000000),
    //             isOwn: false
    //         },
    //         {
    //             username: 'You',
    //             text: 'I\'m driving in from New York!',
    //             timestamp: new Date(Date.now() - 2400000),
    //             isOwn: true
    //         },
    //         {
    //             username: 'Student2',
    //             text: 'Guest lecturer is Tony Stark. 🤪',
    //             timestamp: new Date(Date.now() - 1800000),
    //             isOwn: false
    //         },
    //         {
    //             username: 'You',
    //             text: ' Can\'t wait to be there!',
    //             timestamp: new Date(Date.now() - 1200000),
    //             isOwn: true
    //         },
    //         {
    //             username: 'Event Organizer',
    //             text: 'Event starts at 2 PM! Make sure to have your tickets ready.',
    //             timestamp: new Date(Date.now() - 600000),
    //             isOwn: false
    //         }
    //     ];
    //     sampleMessages.forEach(msg => this.addMessageToChat(msg.username, msg.text, msg.timestamp, msg.isOwn));
    // }

    async sendMessage() {
    const messageText = this.messageInput.value.trim();
    if (messageText === '') return;

    const now = new Date();

    // 1) Immediately show message in UI (same as before)
    this.addMessageToChat(this.currentUser, messageText, now, true);
    this.messageInput.value = '';
    this.stopTyping();
    this.scrollToBottom();

    // 2) NEW: save message to backend
    try {
        await fetch(`/api/chat/${EVENT_ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.currentUser,        // who sent it
                text: messageText,                 // message content
                timestamp: now.toISOString()       // so backend can store time
            })
        });
    } catch (err) {
        console.error("Failed to save chat message:", err);
        // Optional: show a little warning somewhere
    }
}

    // sendMessage() {
    //     const messageText = this.messageInput.value.trim();
        
    //     if (messageText === '') return;
    //     this.addMessageToChat(this.currentUser, messageText, new Date(), true);
    //     this.messageInput.value = '';
    //     this.stopTyping();
    //     this.scrollToBottom();
    // }

    addMessageToChat(username, text, timestamp, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own-message' : ''}`;
        
        const formattedTime = this.formatTime(timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="username">${username}</span>
                    <span class="timestamp">${formattedTime}</span>
                </div>
                <div class="message-text">${this.escapeHtml(text)}</div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.messages.push({ username, text, timestamp, isOwn });
    }

    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        
        return messageTime.toLocaleDateString() + ' ' + messageTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    handleTyping() {
    if (!this.isTyping) {
        this.isTyping = true;
        this.showTypingIndicator(this.currentUser);  // ✅ use actual username
    }

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
        this.stopTyping();
    }, 1000);
}


    // handleTyping() {
    //     if (!this.isTyping) {
    //         this.isTyping = true;
    //         this.showTypingIndicator('You');
    //     }

    //     clearTimeout(this.typingTimer);
    //     this.typingTimer = setTimeout(() => {
    //         this.stopTyping();
    //     }, 1000);
    // }

    showTypingIndicator(username) {
        this.typingUser.textContent = username;
        this.typingIndicator.style.display = 'block';
    }

    stopTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EventChat();
    
    const homeButton = document.querySelector('.homeButton');
    const logoutButton = document.querySelector('.logoutButton');

    // Home functionality
    document.querySelector('.homeButton').addEventListener('click', function() {    
        window.location.href = '../main/main.html';        
    });

    // Logout functionality
    document.querySelector('.logoutButton').addEventListener('click', function() {
    if(confirm('Are you sure you want to log out?')) {
        window.location.href = '../main/main.html';
        }
    });


});