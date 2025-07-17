import { useEffect, useState } from "react";
import { socket } from "./socket";
import chatRoom from "./components/chatRoom";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  // Step 1: Prompt username once and store in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (!stored) {
      const username = prompt("Enter your username");
      localStorage.setItem("username", username || "Guest");
    }
  }, []);

  // Step 2: Receive messages and typing notifications
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000); // Clear typing after 2s
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
    };
  }, []);

  // Step 3: Emit new message to server
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", {
        text: message,
        sender: localStorage.getItem("username"),
        timestamp: new Date(),
      });
      setMessage("");
    }
  };

  // Step 4: Emit typing signal
  const handleTyping = () => {
    socket.emit("typing", localStorage.getItem("username"));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1>💬 Real-Time Chat App</h1>

      {/* Typing Notification */}
      {typingUser && <p style={{ color: "gray" }}><em>{typingUser} is typing...</em></p>}

      {/* Messages List */}
      <div style={{
        height: "300px",
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        background: "#f9f9f9"
      }}>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}</strong> ({new Date(msg.timestamp).toLocaleTimeString()}): {msg.text}
          </p>
        ))}
      </div>

      {/* Message Input */}
      <input
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type your message..."
        style={{
          width: "70%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      />
      <button
        onClick={sendMessage}
        style={{
          padding: "10px 20px",
          marginLeft: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
