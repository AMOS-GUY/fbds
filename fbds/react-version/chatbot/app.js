import { useEffect, useRef, useState } from 'react';
import './Chat.css';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Get bot response based on user input
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
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
        "What do you call a bear with no teeth? A gummy bear!",
        "Why don't eggs tell jokes? They'd crack each other up!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    else if (message.match(/smart|intelligent|clever/)) {
      return "Thanks! I try my best to be helpful. You're pretty smart yourself!";
    }
    else if (message.match(/love you|i love you/)) {
      return "Aww, thank you! I love helping you! 💖";
    }
    else if (message.match(/sad|depressed|unhappy/)) {
      return "I'm sorry you're feeling down. Remember that tough times don't last, but tough people do! 💪";
    }
    else if (message.match(/happy|excited|great/)) {
      return "That's wonderful to hear! Keep spreading that positive energy! 🎉";
    }
    else {
      return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        setMessages(parsedMessages);
      } else {
        // Add welcome message
        setMessages([
          {
            id: Date.now(),
            text: "Hello! I'm your AI assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } else {
      // Add welcome message
      setMessages([
        {
          id: Date.now(),
          text: "Hello! I'm your AI assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
    }
    inputRef.current?.focus();
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      // Only save last 100 messages
      const messagesToSave = messages.slice(-100);
      localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      // Shake animation for empty input
      inputRef.current?.classList.add('shake');
      setTimeout(() => {
        inputRef.current?.classList.remove('shake');
      }, 300);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([
        {
          id: Date.now(),
          text: "Chat history cleared! How can I help you today?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
      localStorage.removeItem('chatMessages');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="bot-avatar">
            <img src="../media/robot.png" alt="Bot" className="avatar-image" />
          </div>
          <div className="header-info">
            <h2>AI Chatbot Assistant</h2>
            <div className="status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="clear-button" title="Clear chat">
          🗑️
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`message-wrapper ${message.sender}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="message-container">
              {message.sender === 'bot' && (
                <img src="../media/robot.png" alt="Bot" className="message-avatar" />
              )}
              <div className={`message-bubble ${message.sender}`}>
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
              {message.sender === 'user' && (
                <img src="../media/user.png" alt="User" className="message-avatar" />
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message-container">
              <img src="../media/robot.png" alt="Bot" className="message-avatar" />
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          rows="1"
          className="message-input"
        />
        <button 
          onClick={sendMessage} 
          className="send-button"
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;