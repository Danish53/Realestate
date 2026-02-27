// utils/chatStorage.js
export const CHAT_STORAGE_KEY = 'chat_history';
export const CHAT_EXPIRY_KEY = 'chat_expiry';
// const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour
const EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

// Chat history save karein with expiry
export const saveChatHistory = (messages) => {
  try {
    // Sirf last 50 messages save karein (performance ke liye)
    const messagesToSave = messages.slice(-50);
    const expiryTime = Date.now() + EXPIRY_TIME;
    
    // Dono data ko ek object mein save karein
    const dataToSave = {
      messages: messagesToSave,
      expiry: expiryTime,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(CHAT_EXPIRY_KEY, expiryTime.toString());
    
    console.log(`Chat saved. Expires: ${new Date(expiryTime).toLocaleString()}`);
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

// Chat history load karein with expiry check
export const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!saved) return [];
    
    const data = JSON.parse(saved);
    const currentTime = Date.now();
    
    // Check if expired
    if (data.expiry && currentTime > data.expiry) {
      console.log('Chat history expired, clearing...');
      clearChatHistory();
      return [];
    }
    
    // Ensure messages have correct format
    return data.messages.map(msg => ({
      ...msg,
      id: msg.id || Date.now() + Math.random()
    }));
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

// Clear chat history
export const clearChatHistory = () => {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  localStorage.removeItem(CHAT_EXPIRY_KEY);
};

// Get expiry info (optional - for showing timer in UI)
export const getChatExpiryInfo = () => {
  try {
    const expiry = localStorage.getItem(CHAT_EXPIRY_KEY);
    if (!expiry) return null;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const timeLeft = expiryTime - currentTime;
    
    if (timeLeft <= 0) {
      clearChatHistory();
      return null;
    }
    
    // Format time left
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
      expiryTime,
      timeLeft,
      formatted: `${hours}h ${minutes}m remaining`
    };
  } catch (error) {
    return null;
  }
};

// Manual expiry set karne ke liye (agar alag time chahiye)
export const setCustomExpiry = (hours) => {
  const customTime = hours * 60 * 60 * 1000;
  const expiryTime = Date.now() + customTime;
  localStorage.setItem(CHAT_EXPIRY_KEY, expiryTime.toString());
  return expiryTime;
};