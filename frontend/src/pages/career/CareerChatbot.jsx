import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { careerChat } from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import './Chatbot.css';

const STARTER_QUESTIONS = [
  'What skills should I learn for my career goal?',
  'How do I prepare for technical interviews?',
  'Help me improve my resume',
  'What salary can I expect in my field?',
];

export default function CareerChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm **CareerBot**, your AI career advisor. I can help you with career guidance, interview prep, resume tips, and skill development. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { data } = await careerChat({ message: msg, history: messages.slice(-8) });
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error('Failed to get response. Try again.');
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="chatbot-page animate-fade-in">
      <div className="page-header">
        <h1><Bot size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> AI Career Chatbot</h1>
        <p>Get personalized career advice powered by Google Gemini AI</p>
      </div>

      <div className="chatbot-container">
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-bubble">
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar"><Bot size={16} /></div>
              <div className="message-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="starter-questions">
            {STARTER_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="starter-btn">
                <Sparkles size={14} />{q}
              </button>
            ))}
          </div>
        )}

        <div className="chatbot-input-area">
          <input
            id="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything about your career..."
            className="form-input"
            disabled={loading}
          />
          <button id="chatbot-send" onClick={() => sendMessage()} className="btn btn-primary" disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
