import { useState } from "react";
import { X, Send } from "lucide-react";
import { sendMessageToAI } from "../../api/userApi";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages([...messages, { from: "user", text: userMessage }]);
    setInput("");

    try {
      const data = await sendMessageToAI([
        ...messages,
        { from: "user", text: userMessage },
      ]);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply || "No response from AI" },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
    }
  };

  return (
    <>
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center 
              bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl 
              rounded-full px-4 py-3 cursor-pointer transform transition 
              hover:scale-105 hover:shadow-2xl
              w-14 md:w-72"
        >
          <Send size={20} className="text-white" />
          <input
            type="text"
            placeholder="Ask me anything..."
            className="hidden md:flex flex-1 outline-none bg-transparent text-white placeholder-white ml-3 text-base"
            readOnly
          />
        </div>
      )}

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[420px] bg-white rounded-xl shadow-2xl flex flex-col animate-slideUp">
          <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-t-xl">
            <span className="font-semibold">Support Chat</span>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.from === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 outline-none text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-br-xl flex items-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideUp {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default ChatBot;
