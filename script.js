// This code runs on every YouTube video page

// Get the video ID from the URL
function getVideoId() {
    const url = window.location.href;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }
  
  // Create a chat button
  function addChatButton() {
    // Don't add button twice
    if (document.getElementById('my-chat-button')) return;
    
    const button = document.createElement('button');
    button.id = 'my-chat-button';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      Chat about this video
    `;
    button.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Add hover effects
    button.onmouseenter = function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    };
    
    button.onmouseleave = function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    };
    
    button.onclick = function() {
      toggleChatBox();
    };

    document.body.appendChild(button);
  }
  
  // Create a modern chat box
  function createChatBox() {
    const chatBox = document.createElement('div');
    chatBox.id = 'my-chat-box';
    chatBox.style.cssText = `
      position: fixed;
      top: 160px;
      right: 20px;
      width: 380px;
      height: 500px;
      background: white;
      border: none;
      border-radius: 20px;
      z-index: 9999;
      display: none;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;
    
    const videoId = getVideoId();
    chatBox.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        font-weight: 600;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          Video Chat
        </div>
        <button onclick="toggleChatBox()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
      
      <div style="
        height: 320px;
        padding: 20px;
        overflow-y: auto;
        background: #f8f9fa;
      " id="chat-messages">
        <div style="
          background: white;
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 4px solid #667eea;
        ">
          <div style="
            color: #667eea;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          ">AI Assistant</div>
          <div style="
            color: #2c3e50;
            font-size: 15px;
            line-height: 1.5;
          ">Hi! I'm here to help you discuss this video. Ask me anything about the content, concepts, or context!</div>
        </div>
      </div>
      
      <div style="
        padding: 20px;
        background: white;
        border-top: 1px solid #e9ecef;
      ">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="chat-input" placeholder="Ask about this video..." style="
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.3s ease;
            font-family: inherit;
          ">
          <button onclick="sendMessageFromButton()" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatBox);
    
    // Add focus effect to input
    const input = chatBox.querySelector('#chat-input');
    input.addEventListener('focus', function() {
      this.style.borderColor = '#667eea';
    });
    
    input.addEventListener('blur', function() {
      this.style.borderColor = '#e9ecef';
    });
    
    return chatBox;
  }
  
  // Toggle chat box visibility
  function toggleChatBox() {
    let chatBox = document.getElementById('my-chat-box');
    
    if (!chatBox) {
      chatBox = createChatBox();
      
      // Add enter key listener to input
      const input = chatBox.querySelector('#chat-input');
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage(input.value);
          input.value = '';
        }
      });
    }
    
    // Toggle visibility with animation
    if (chatBox.style.display === 'none') {
      chatBox.style.display = 'block';
      chatBox.style.opacity = '0';
      chatBox.style.transform = 'translateY(20px)';
      setTimeout(() => {
        chatBox.style.transition = 'all 0.3s ease';
        chatBox.style.opacity = '1';
        chatBox.style.transform = 'translateY(0)';
      }, 10);
    } else {
      chatBox.style.opacity = '0';
      chatBox.style.transform = 'translateY(20px)';
      setTimeout(() => {
        chatBox.style.display = 'none';
      }, 300);
    }
  }
  
  // Send message from button click
  function sendMessageFromButton() {
    const input = document.getElementById('chat-input');
    if (input && input.value.trim()) {
      sendMessage(input.value);
      input.value = '';
    }
  }
  
  // Enhanced message handler with better UI
  async function sendMessage(message) {
    if (!message.trim()) return;
    
    const messagesDiv = document.getElementById('chat-messages');
    
    // Add user message with modern styling
    const userMsg = document.createElement('div');
    userMsg.style.cssText = `
      margin-bottom: 15px;
      display: flex;
      justify-content: flex-end;
    `;
    userMsg.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 18px 18px 5px 18px;
        max-width: 80%;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      ">${message}</div>
    `;
    messagesDiv.appendChild(userMsg);
    
    // Add typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.style.cssText = `
      margin-bottom: 15px;
      display: flex;
      justify-content: flex-start;
    `;
    typingMsg.innerHTML = `
      <div style="
        background: white;
        padding: 15px;
        border-radius: 18px 18px 18px 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        border-left: 4px solid #667eea;
        max-width: 80%;
      ">
        <div style="
          color: #667eea;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        ">AI Assistant</div>
        <div style="
          color: #6c757d;
          font-size: 14px;
          display: flex;
          align-items: center;
        ">
          <div style="
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #667eea;
            margin-right: 4px;
            animation: typing 1.4s infinite ease-in-out;
          "></div>
          <div style="
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #667eea;
            margin-right: 4px;
            animation: typing 1.4s infinite ease-in-out 0.2s;
          "></div>
          <div style="
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #667eea;
            animation: typing 1.4s infinite ease-in-out 0.4s;
          "></div>
          <span style="margin-left: 8px;">Thinking...</span>
        </div>
      </div>
    `;
    messagesDiv.appendChild(typingMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Add typing animation styles
    if (!document.getElementById('typing-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'typing-animation-styles';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    try {
      // Call your Python API
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: getVideoId(),
          message: message
        })
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      typingMsg.remove();
      
      // Add bot response with enhanced styling
      const botMsg = document.createElement('div');
      botMsg.style.cssText = `
        margin-bottom: 15px;
        display: flex;
        justify-content: flex-start;
      `;
      
      const responseText = data.response || ('Sorry, there was an error: ' + (data.error || 'Unknown error'));
      
      botMsg.innerHTML = `
        <div style="
          background: white;
          padding: 15px;
          border-radius: 18px 18px 18px 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 4px solid #667eea;
          max-width: 80%;
        ">
          <div style="
            color: #667eea;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">AI Assistant</div>
          <div style="
            color: #2c3e50;
            font-size: 15px;
            line-height: 1.5;
            word-wrap: break-word;
          ">${responseText}</div>
        </div>
      `;
      
      messagesDiv.appendChild(botMsg);
      
    } catch (error) {
      // Remove typing indicator
      typingMsg.remove();
      
      // Add error message with consistent styling
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        margin-bottom: 15px;
        display: flex;
        justify-content: flex-start;
      `;
      errorMsg.innerHTML = `
        <div style="
          background: #fff5f5;
          padding: 15px;
          border-radius: 18px 18px 18px 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 4px solid #e53e3e;
          max-width: 80%;
        ">
          <div style="
            color: #e53e3e;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">Connection Error</div>
          <div style="
            color: #c53030;
            font-size: 15px;
            line-height: 1.5;
          ">Connection error. Make sure your Python server is running on localhost:5000</div>
        </div>
      `;
      messagesDiv.appendChild(errorMsg);
    }
    
    // Scroll to bottom with smooth animation
    messagesDiv.scrollTo({
      top: messagesDiv.scrollHeight,
      behavior: 'smooth'
    });
  }
  
  // Add the button when page loads
  const videoId = getVideoId();
  if (videoId) {
    console.log("Found video:", videoId);
    addChatButton();
  }