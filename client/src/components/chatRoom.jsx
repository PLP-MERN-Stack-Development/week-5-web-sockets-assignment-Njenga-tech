import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatRoom() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Listen for messages
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing
    socket.on("typing", (user) => {
      setTyping(`${user} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    // Cleanup
    return () => {
      socket.off("receive_message");
      socket.off("typing");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { user: username || "Guest", message });
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username || "Guest");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">💬 Chat Room</h2>

      <input
        className="border p-2 mb-3 w-full"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className="h-60 overflow-y-auto border p-3 mb-2 bg-gray-50 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {typing && <p className="text-sm text-gray-500">{typing}</p>}

      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
