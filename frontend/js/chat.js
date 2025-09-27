// JansevaMap - Chat Widget JavaScript
class ChatWidget {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.chatHistory = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChatHistory();
    }

    bindEvents() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        // Send button click
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Enter key press
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Input change for status
            chatInput.addEventListener('input', () => {
                this.updateChatStatus('Typing...');
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-message');
                if (chatInput) {
                    chatInput.value = message;
                    this.sendMessage();
                }
            });
        });
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        chatInput.value = '';
        this.updateChatStatus('AI is thinking...');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to chatbot backend
            const response = await fetch('http://localhost:5000/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sender: 'user'
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.hideTypingIndicator();
                this.addMessage(data.response, 'bot');
                this.updateChatStatus('Ready');
            } else {
                throw new Error('Failed to get response from chatbot');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            
            // Fallback to local responses if chatbot is not available
            const response = this.getLocalResponse(message);
            this.addMessage(response, 'bot');
            this.updateChatStatus('Ready (Offline Mode)');
        }
    }

    getLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('file complaint') || lowerMessage.includes('how to complain')) {
            return `To file a complaint:
1. Go to the Map page and click "Report Issue"
2. Select the issue type from the dropdown
3. Describe the problem in detail
4. Click on the map to select the exact location
5. Enter your contact number
6. Click "Submit Complaint"

You'll receive a unique complaint ID to track progress.`;
        }
        
        if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
            return `To check your complaint status:
1. Visit the Map page and look for "Recent Complaints"
2. Find your complaint using the complaint ID
3. Check the status - it will show as Pending, Processing, or Resolved

You can also contact our support team with your complaint ID for detailed updates.`;
        }
        
        if (lowerMessage.includes('types') || lowerMessage.includes('what can')) {
            return `You can report these types of issues:
• Road Issues (potholes, broken roads, traffic problems)
• Water Supply (no water, contaminated water, pipe leaks)
• Electricity (power cuts, faulty street lights, electrical hazards)
• Sanitation (garbage collection, drainage problems, public toilets)
• Other (any civic issue not covered above)

Each issue type is handled by the appropriate department for faster resolution.`;
        }
        
        if (lowerMessage.includes('time') || lowerMessage.includes('how long')) {
            return `Typical resolution times:
• Electricity Issues: 1-2 days
• Water Supply: 1-3 days
• Road Issues: 3-7 days
• Sanitation: 2-5 days
• Other Issues: 5-10 days

These are approximate times and may vary based on complexity and department workload.`;
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return `Hello! I'm your AI assistant for JansevaMap. How can I help you today?`;
        }
        
        if (lowerMessage.includes('thank')) {
            return `You're welcome! I'm glad I could help. Feel free to ask if you have any other questions.`;
        }
        
        return `I'm here to help you with JansevaMap! You can ask me about:
• How to file a complaint
• Checking complaint status
• Types of issues you can report
• Resolution timelines
• General information about the system

What would you like to know?`;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Format message content
        if (sender === 'bot') {
            messageContent.innerHTML = this.formatBotMessage(content);
        } else {
            messageContent.textContent = content;
        }

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message in history
        this.messages.push({
            content: content,
            sender: sender,
            timestamp: new Date().toISOString()
        });
    }

    formatBotMessage(content) {
        // Convert line breaks to <br> tags
        let formatted = content.replace(/\n/g, '<br>');
        
        // Convert URLs to clickable links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateChatStatus(status) {
        const statusElement = document.getElementById('chat-status');
        if (!statusElement) return;

        statusElement.textContent = status;
        
        // Add visual indicator for different statuses
        statusElement.className = 'chat-status';
        if (status.includes('thinking') || status.includes('Typing')) {
            statusElement.classList.add('status-thinking');
        } else if (status.includes('error')) {
            statusElement.classList.add('status-error');
        } else if (status.includes('Ready')) {
            statusElement.classList.add('status-ready');
        }
    }

    loadChatHistory() {
        // Load chat history from localStorage
        const savedHistory = localStorage.getItem('janseva-chat-history');
        if (savedHistory) {
            try {
                this.chatHistory = JSON.parse(savedHistory);
                // Display recent messages (last 5)
                const recentMessages = this.chatHistory.slice(-5);
                recentMessages.forEach(msg => {
                    this.addMessage(msg.content, msg.sender);
                });
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        }
    }

    saveChatHistory() {
        // Save chat history to localStorage
        localStorage.setItem('janseva-chat-history', JSON.stringify(this.messages));
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});

// Add CSS for typing indicator
const chatStyle = document.createElement('style');
chatStyle.textContent = `
    .typing-indicator .message-content {
        background: white;
        border: 1px solid #e1e5e9;
        padding: 1rem;
    }
    
    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #667eea;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .chat-status.status-thinking {
        color: #17a2b8;
    }
    
    .chat-status.status-error {
        color: #dc3545;
    }
    
    .chat-status.status-ready {
        color: #28a745;
    }
`;
document.head.appendChild(chatStyle);