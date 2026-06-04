import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Trash2, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(() => {
    const savedChat = localStorage.getItem("chatHistory");
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const bottomRef = useRef(null);

  // new message is automatically saved.
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  //   Scroll to bottom when chat updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);

  // copy function start

  const copyToClipboard = async (text, index) => {
    await navigator.clipboard.writeText(text);

    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // copy function end

  const sendMessage = async (customMessage) => {
    const text = customMessage || message;

    if (!text.trim()) return;

    setChat((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://chatbot-backend-633j.onrender.com/chat",
        {
          message: text,
          chat,
        },
      );

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.reply,
        },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Something went wrong 😔",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[95vh] md:h-[85vh] backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}

        <div className="flex items-start sm:items-center gap-3 px-4 md:px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="w-12 h-12 rounded-full bg-linear-to-r from-violet-500 to-pink-500 flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold bg-linear-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent ">
                Nagraj AI ✨
              </h1>

              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Your Personal Coding Assistant
              </p>
            </div>
            {/* Clear Chat button start*/}
            <button
              onClick={() => {
                setChat([]);
                localStorage.removeItem("chatHistory");
              }}
              className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-sm bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
            {/* Clear Chat button end*/}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-5">
          {chat.length === 0 && (
            <div className="text-center mt-8 md:mt-20 px-2">
              <h2 className="text-3xl md:text-5xl font-black  mb-4 bg-linear-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome to Nagraj AI ✨
              </h2>

              <p className="text-base md:text-lg text-slate-300 max-w-md mx-auto">
                Your personal AI assistant for coding, learning, debugging, and
                exploring ideas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
                {[
                  "🚀 Explain React Hooks",
                  "⚡ Build Express API",
                  "🎨 Learn Tailwind CSS",
                  "🐛 Debug my code",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMessage(prompt);
                      setTimeout(() => sendMessage(prompt), 100);
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 text-left text-white transition-all hover:scale-105"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[90%] ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.sender === "user" ? "bg-indigo-500" : "bg-purple-500"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User size={18} className="text-white" />
                  ) : (
                    <Bot size={18} className="text-white" />
                  )}
                </div>

                {/* Message */}
                <div className="relative">
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => copyToClipboard(msg.text, i)}
                      className="absolute -top-2 -right-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-all z-10"
                    >
                      {copiedIndex === i ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-white" />
                      )}
                    </button>
                  )}

                  <div
                    className={`px-5 py-3 rounded-2xl break-words overflow-hidden ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");

                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-black/40 px-1 py-0.5 rounded">
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>

              <div className="bg-white/15 backdrop-blur-md text-white px-5 py-4 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>

                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></div>

                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-3"
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className={`p-3 rounded-xl transition-all ${
                message.trim()
                  ? "bg-linear-to-r from-violet-500 to-pink-500 hover:scale-105 cursor-pointer"
                  : "bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
