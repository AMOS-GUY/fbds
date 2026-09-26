// Chatbot state
let chatHistory = [];
let isTyping = false;

// DOM elements
const chatDisplay = document.querySelector('.chat-display-js');
const userInput = document.querySelector('.message-input-js');
const sendButton = document.querySelector('.send-button-js');

// Smart responses for the chatbot
const botResponses = {
  greetings: ['Hello!', 'Hi there!', 'Hey! How can I help you?', 'Greetings!'],
  help: ['I can help you with information, answer questions, or just chat!', 'What would you like to know?', 'Feel free to ask me anything!'],
  weather: ['I wish I could check the weather, but I need location access for that!', 'Try checking a weather website for accurate forecasts!'],
  time: [`The current time is ${new Date().toLocaleTimeString()}`, `It's ${new Date().toLocaleTimeString()} right now!`],
  date: [`Today's date is ${new Date().toLocaleDateString()}`, `It's ${new Date().toLocaleDateString()}`],
  thanks: ['You\'re welcome!', 'Happy to help!', 'Anytime!', 'Glad I could assist!'],
  goodbye: ['Goodbye! Have a great day!', 'See you later!', 'Take care!', 'Bye! Come back anytime!'],
  default: ['Interesting! Tell me more.', 'I see. What else would you like to know?', 'That\'s cool! Anything else?', 'How can I assist you further?']
};

// Smart response generator
function getBotResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  // Check for different message types
  if (message.match(/hi|hello|hey|greetings|sup|howdy/)) {
    return botResponses.greetings[Math.floor(Math.random() * botResponses.greetings.length)];
  }
  else if (message.match(/help|what can you do|capabilities|features/)) {
    return botResponses.help[Math.floor(Math.random() * botResponses.help.length)];
  }
  else if (message.match(/weather|temperature|rain|sunny|cloudy/)) {
    return botResponses.weather[Math.floor(Math.random() * botResponses.weather.length)];
  }
  else if (message.match(/time|clock|what time|current time/)) {
    return botResponses.time[Math.floor(Math.random() * botResponses.time.length)];
  }
  else if (message.match(/date|today|what day|current date/)) {
    return botResponses.date[Math.floor(Math.random() * botResponses.date.length)];
  }
  else if (message.match(/thank|thanks|appreciate|grateful/)) {
    return botResponses.thanks[Math.floor(Math.random() * botResponses.thanks.length)];
  }
  else if (message.match(/bye|goodbye|see you|farewell|cya/)) {
    return botResponses.goodbye[Math.floor(Math.random() * botResponses.goodbye.length)];
  }
  else if (message.match(/how are you|how do you do|how's it going/)) {
    return "I'm doing great, thanks for asking! How are you?";
  }
  else if (message.match(/name|who are you|what are you/)) {
    return "I'm your friendly AI chatbot assistant! You can call me ChatBot.";
  }
  else if (message.match(/age|how old/)) {
    return "I'm as old as the internet itself! But this version was just created for you.";
  }
  else if (message.match(/love|like|favorite/)) {
    return "I love helping people like you! What's not to love? 😊";
  }
  else if (message.match(/joke|funny|laugh/)) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What do you call a fake noodle? An impasta!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "What do you call a bear with no teeth? A gummy bear!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  else if (message.match(/smart|intelligent|clever/)) {
    return "Thanks! I try my best to be helpful. You're pretty smart yourself!";
  }
  else {
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  }
}

// Add message to chat display
function addMessageToChat(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `user-message ${sender}`;
  messageDiv.style.animation = 'slideIn 0.3s ease';
  
  const imageSrc = sender === 'user' ? '../media/user.png' : '../media/robot.png';
  const imageAlt = sender === 'user' ? 'User' : 'Robot';
  
  messageDiv.innerHTML = `
    ${sender === 'user' ? `<div class="message-bubble">${escapeHtml(message)}</div>
    <img src="${imageSrc}" alt="${imageAlt}" class="sender-image" />` : 
    `<img src="${imageSrc}" alt="${imageAlt}" class="sender-image" />
    <div class="message-bubble">${escapeHtml(message)}</div>`}
  `;
  
  chatDisplay.appendChild(messageDiv);
  scrollToBottom();
  
  // Save to history
  chatHistory.push({ message, sender, timestamp: new Date() });
}

// Show typing indicator
function showTypingIndicator() {
  if (isTyping) return;
  isTyping = true;
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'user-message bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <img src="../media/robot.png" alt="Robot" class="sender-image" />
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  chatDisplay.appendChild(typingDiv);
  scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
  isTyping = false;
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Send user message and get bot response
async function sendMessage() {
  const message = userInput.value.trim();
  
  if (message === '') {
    // Shake animation for empty message
    userInput.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      userInput.style.animation = '';
    }, 300);
    return;
  }
  
  // Add user message to chat
  addMessageToChat(message, 'user');
  
  // Clear input
  userInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Simulate bot thinking time (random between 0.5-1.5 seconds)
  const thinkingTime = Math.random() * 1000 + 500;
  
  setTimeout(() => {
    // Get bot response
    const botResponse = getBotResponse(message);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add bot response to chat
    addMessageToChat(botResponse, 'bot');
    
    // Save to localStorage (optional)
    saveChatHistory();
  }, thinkingTime);
}

// Save chat history to localStorage
function saveChatHistory() {
  try {
    // Only save last 50 messages to avoid storage limits
    const historyToSave = chatHistory.slice(-50);
    localStorage.setItem('chatHistory', JSON.stringify(historyToSave));
  } catch (error) {
    console.log('Failed to save chat history:', error);
  }
}

// Load chat history from localStorage
function loadChatHistory() {
  try {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      // Clear welcome message
      chatDisplay.innerHTML = '';
      // Load last 30 messages
      history.slice(-30).forEach(chat => {
        addMessageToChat(chat.message, chat.sender);
      });
    }
  } catch (error) {
    console.log('Failed to load chat history:', error);
  }
}

// Clear chat history
function clearChatHistory() {
  if (confirm('Are you sure you want to clear chat history?')) {
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    chatDisplay.innerHTML = `
      <div class="welcome-message">
        <div class="user-message bot-message">
          <img src="../media/robot.png" alt="Robot" class="sender-image" />
          <div class="message-bubble">Chat history cleared! How can I help you today?</div>
        </div>
      </div>
    `;
  }
}

// Send message on Enter key
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Add CSS animation for shake
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Initialize chat
function initChat() {
  // Focus on input field
  userInput.focus();
  
  // Optional: Load previous chat history
  // loadChatHistory();
  
  // Add clear button to header (optional)
  const header = document.querySelector('.chat-header');
  if (header && !document.querySelector('.clear-button')) {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.className = 'clear-button';
    clearButton.style.cssText = `
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.8rem;
    `;
    clearButton.onclick = clearChatHistory;
    header.appendChild(clearButton);
  }
}

// Start the chat application
initChat();