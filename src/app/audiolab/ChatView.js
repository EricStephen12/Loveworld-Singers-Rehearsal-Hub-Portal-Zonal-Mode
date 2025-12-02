import React from 'react';

const ChatView = ({ 
  goBackFromChat,
  messages,
  messagesEndRef,
  isRecording,
  recordingDuration,
  playingVoiceNote,
  voiceNoteProgress,
  handleVoiceNotePlay,
  newMessage,
  setNewMessage,
  sendMessage,
  startRecording,
  stopRecording
}) => {
  return (
    <div className="chat-page">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={goBackFromChat}>
          ←
        </button>
        <h2 className="chat-title">Live Chat</h2>
        <button className="chat-menu-btn">
          ⋯
        </button>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.type === 'self' ? 'chat-message-self' : 'chat-message-other'}`}>
            {message.type === 'other' && (
              <div className={`chat-avatar ${message.avatar}`}></div>
            )}
            <div className="chat-message-content">
              <div className="chat-message-info">
                <span className="chat-sender">{message.sender}</span>
                <span className="chat-time">{message.time}</span>
              </div>
              {message.messageType === 'text' && (
                <div className={`chat-bubble ${message.type === 'self' ? 'chat-bubble-self' : 'chat-bubble-other'}`}>
                  {message.text}
                </div>
              )}
              {message.messageType === 'voice' && (
                <div className="chat-bubble chat-bubble-voice">
                  <button
                    className="voice-play-btn"
                    onClick={() => handleVoiceNotePlay(message.id)}
                  >
                    {playingVoiceNote === message.id ? '⏸' : '▶'}
                  </button>
                  <div className="voice-waveform">
                    {[16, 24, 20, 16, 12, 16, 20, 24, 20, 16, 12, 16, 20, 16, 12, 16, 20, 24, 20, 16].map((height, index) => (
                      <div
                        key={index}
                        className={`wave-bar ${playingVoiceNote === message.id ? 'wave-bar-playing' : ''}`}
                        style={{
                          height: `${height}px`,
                          opacity: playingVoiceNote === message.id && (voiceNoteProgress / 100) * 20 > index ? 1 : 0.5,
                          animationDelay: `${index * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="voice-duration">
                    {playingVoiceNote === message.id
                      ? `0:${Math.floor((voiceNoteProgress / 100) * 7).toString().padStart(2, '0')}`
                      : '0:07'
                    }
                  </span>
                </div>
              )}
              {message.messageType === 'typing' && (
                <div className="chat-bubble chat-bubble-typing">
                  <span className="typing-text">Typing</span>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </div>
            {message.type === 'self' && (
              <div className={`chat-avatar ${message.avatar}`}></div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Recording... {recordingDuration.toFixed(1)}s</span>
          </div>
        )}
        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-send-btn" onClick={sendMessage}>
            📤
          </button>
          {!isRecording && (
            <button className="voice-record-btn" onClick={startRecording}>
              🎤
            </button>
          )}
          {isRecording && (
            <button className="voice-stop-btn" onClick={stopRecording}>
              {isRecording ? '⏹' : '🎤'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
