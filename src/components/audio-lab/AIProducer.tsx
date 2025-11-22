'use client';

import { useState, useRef, useEffect } from 'react';
import { useAudioStore } from '@/lib/audio-store';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: AIAction;
}

interface AIAction {
  type: 'add_effect' | 'adjust_volume' | 'mix_tracks' | 'separate_stems' | 'master_track';
  track?: string;
  effect?: string;
  params?: Record<string, any>;
  message: string;
}

export default function AIProducer() {
  const { tracks, addEffect } = useAudioStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hey! I'm your AI producer. I can help you mix your tracks, add effects, and make your music sound amazing. What would you like to do?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await processAICommand(input, tracks);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        action: aiResponse.action,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Execute the action if provided
      if (aiResponse.action) {
        await executeAIAction(aiResponse.action);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processAICommand = async (command: string, availableTracks: any[]): Promise<{ message: string; action?: AIAction }> => {
    // Simulate AI processing - in real app, this would call OpenAI/Claude API
    const lowerCommand = command.toLowerCase();
    
    // Add reverb
    if (lowerCommand.includes('reverb') || lowerCommand.includes('echo')) {
      const trackName = lowerCommand.includes('vocal') ? 'Vocals' : 
                       lowerCommand.includes('beat') ? 'Beat' : 'Vocals';
      
      return {
        message: `✅ Added reverb to your ${trackName.toLowerCase()}! This will give it more space and depth.`,
        action: {
          type: 'add_effect',
          track: trackName,
          effect: 'reverb',
          params: { wet: 0.3, decay: 2.0 },
          message: `Added reverb to ${trackName}`
        }
      };
    }

    // Adjust volume
    if (lowerCommand.includes('louder') || lowerCommand.includes('volume up')) {
      return {
        message: "✅ Increased the volume! Your track should sound more prominent now.",
        action: {
          type: 'adjust_volume',
          track: 'Vocals',
          params: { volume: 1.2 },
          message: "Increased volume"
        }
      };
    }

    if (lowerCommand.includes('quieter') || lowerCommand.includes('volume down')) {
      return {
        message: "✅ Decreased the volume for better balance.",
        action: {
          type: 'adjust_volume',
          track: 'Vocals',
          params: { volume: 0.8 },
          message: "Decreased volume"
        }
      };
    }

    // EQ suggestions
    if (lowerCommand.includes('eq') || lowerCommand.includes('equalizer') || lowerCommand.includes('bass') || lowerCommand.includes('treble')) {
      return {
        message: "✅ Applied EQ to enhance your track! Boosted the frequencies that matter most.",
        action: {
          type: 'add_effect',
          track: 'Vocals',
          effect: 'eq',
          params: { low: 2, mid: 1, high: 3 },
          message: "Applied EQ"
        }
      };
    }

    // Compression
    if (lowerCommand.includes('compress') || lowerCommand.includes('punch') || lowerCommand.includes('tight')) {
      return {
        message: "✅ Added compression to make your vocals more consistent and punchy!",
        action: {
          type: 'add_effect',
          track: 'Vocals',
          effect: 'compression',
          params: { threshold: -18, ratio: 4 },
          message: "Added compression"
        }
      };
    }

    // Mix tracks
    if (lowerCommand.includes('mix') || lowerCommand.includes('blend')) {
      return {
        message: "✅ Mixed your tracks together! Balanced the levels for a cohesive sound.",
        action: {
          type: 'mix_tracks',
          message: "Mixed tracks"
        }
      };
    }

    // Stem separation
    if (lowerCommand.includes('separate') || lowerCommand.includes('isolate') || lowerCommand.includes('stems')) {
      return {
        message: "🔄 I'll separate the stems for you! This might take a moment...",
        action: {
          type: 'separate_stems',
          message: "Separating stems"
        }
      };
    }

    // Master track
    if (lowerCommand.includes('master') || lowerCommand.includes('final') || lowerCommand.includes('polish')) {
      return {
        message: "✨ Mastering your track! Adding the final polish with compression, EQ, and limiting.",
        action: {
          type: 'master_track',
          message: "Mastering track"
        }
      };
    }

    // Default helpful response
    const suggestions = [
      "Try asking me to 'add reverb to vocals' or 'make it louder'",
      "I can help you 'mix the tracks' or 'add compression'",
      "Want to 'separate the stems' or 'master the track'?",
      "Ask me to 'boost the bass' or 'add some echo'"
    ];

    return {
      message: `I can help you with that! Here are some things you can try:\n\n${suggestions.join('\n')}\n\nWhat would you like to do with your ${availableTracks.length} track(s)?`
    };
  };

  const executeAIAction = async (action: AIAction) => {
    const track = tracks.find(t => t.name === action.track);
    if (!track) return;

    switch (action.type) {
      case 'add_effect':
        if (action.effect && action.params) {
          const effect = {
            id: Date.now().toString(),
            type: action.effect as any,
            params: action.params,
            enabled: true,
          };
          addEffect(track.id, effect);
        }
        break;

      case 'adjust_volume':
        // This would be handled by the audio engine
        console.log('Adjusting volume:', action.params);
        break;

      case 'mix_tracks':
        console.log('Mixing tracks');
        break;

      case 'separate_stems':
        console.log('Separating stems');
        break;

      case 'master_track':
        console.log('Mastering track');
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickCommands = [
    "Add reverb to vocals",
    "Make it louder",
    "Mix the tracks",
    "Add compression",
    "Master the song"
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-700">
        <div className="p-2 bg-purple-600 rounded-full">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Producer</h3>
          <p className="text-sm text-gray-400">Your mixing assistant</p>
        </div>
        <div className="ml-auto">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && (
                  <Bot className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.action && (
                    <div className="mt-2 text-xs opacity-75">
                      Action: {message.action.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <Loader className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      {messages.length <= 2 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Quick commands:</p>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((command) => (
              <button
                key={command}
                onClick={() => setInput(command)}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me to add effects, mix tracks, or adjust levels..."
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}