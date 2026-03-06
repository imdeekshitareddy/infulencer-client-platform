import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const suggestions = [
  
  "How do promotions work?",
  "How can brands contact me?",
  "How many influencers are in the fashion?",
];

const AIChatbot = () => {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [hovered, setHovered] = useState(false);
  const chatEndRef = useRef(null);

  // Hide label after scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowLabel(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide label after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);
  
  // Auto scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);
  
  const typeMessage = (text) => {
    const words = text.split(" ");
    let current = "";
    let index = 0;

    const interval = setInterval(() => {

        current += words[index] + " ";

        setChat(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
            role: "ai",
            text: current
        };
        return updated;
        });

        index++;

        if (index === words.length) {
        clearInterval(interval);
        }

    }, 90); // typing speed

    };
  const sendMessage = async (text) => {

    const userMsg = text || message;
    if (!userMsg.trim()) return;

    setChat(prev => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setTyping(true);

    try {

      const res = await axios.post(
        "http://localhost:5000/ai/chat",
        { message: userMsg }
      );

      setChat(prev => [
        ...prev,
        { role: "ai", text: "" }
        ]);

typeMessage(res.data.reply);

    } catch (err) {
      console.log(err);
    }

    setTyping(false);

  };

  return (
    <>
      {/* Floating button + label */}
      {!open && (
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none">

          <div
  className={`bg-white px-4 py-2 rounded-full shadow-lg text-sm transition-all duration-300 pointer-events-none ${
    hovered || showLabel
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-2"
  }`}
>
  Chat with us 👋
</div>
          <div
  onClick={() => setOpen(true)}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  className="bg-indigo-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-xl cursor-pointer hover:bg-indigo-700 transition pointer-events-auto"
>
            💬
          </div>

        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">

            <div>
              <div className="font-semibold">Hi there 👋</div>
              <div className="text-xs opacity-80">
                Ask anything about CollabSphere
              </div>
            </div>

            <button onClick={() => setOpen(false)}>✕</button>

          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">

            {chat.length === 0 && (
              <div className="space-y-2">

                <div className="bg-gray-200 p-3 rounded-xl text-sm">
                  Welcome 👋 Ask me anything about influencers or promotions!
                </div>

                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="block bg-white border px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}

              </div>
            )}

            {chat.map((c, i) => (
              <div
                key={i}
                className={`flex ${
                  c.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div className="flex items-end gap-2">

                  {c.role === "ai" && (
                    <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-full text-xs">
                      🤖
                    </div>
                  )}

                  <div
                    className={`max-w-[220px] px-3 py-2 rounded-xl text-sm ${
                      c.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <ReactMarkdown>{c.text}</ReactMarkdown>
                  </div>

                  {c.role === "user" && (
                    <div className="w-7 h-7 bg-gray-400 text-white flex items-center justify-center rounded-full text-xs">
                      👤
                    </div>
                  )}

                </div>

              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-2">

                <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-full text-xs">
                  🤖
                </div>

                <div className="bg-gray-200 px-3 py-2 rounded-xl flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-150">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </div>

              </div>
            )}

            <div ref={chatEndRef}></div>

          </div>

          {/* Input */}
          <div className="flex border-t p-2 bg-white">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="flex-1 px-2 py-2 outline-none text-sm"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={() => sendMessage()}
              className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700"
            >
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default AIChatbot;