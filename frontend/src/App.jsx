import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket", "polling"],
});

function App() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("General");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [typing, setTyping] = useState("");

  const typingTimeout = useRef(null);
  const usernameRef = useRef("");

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // JOIN

  const joinRoom = () => {
    if (username.trim() === "") {
      alert("Please enter username");
      return;
    }

    socket.emit("join_room", room);
    setJoined(true);
  };

  // SEND MESSAGE

  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("send_message", {
      room,
      author: username,
      message,
    });

    setMessage("");
  };

  // SOCKET EVENTS

  useEffect(() => {

    const receiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const receiveTyping = (data) => {

      if (data.author === usernameRef.current) return;

      setTyping(`${data.author} is typing...`);

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(() => {
        setTyping("");
      }, 5000);

    };

    socket.on("receive_message", receiveMessage);
    socket.on("typing", receiveTyping);

    return () => {
      socket.off("receive_message", receiveMessage);
      socket.off("typing", receiveTyping);
    };

  }, []);

  // JOIN PAGE

  if (!joined) {

    return (
      <div className="join">

        <h2>Socket Chat</h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        >
          <option>General</option>
          <option>Tech Support</option>
        </select>

        <button onClick={joinRoom}>
          Join
        </button>

      </div>
    );
  }

  // CHAT PAGE

  return (

    <div className="chat">

      <h2>{room} Channel</h2>


      <div className="messages">

       {messages.map((msg, index) => {

  const ownMessage = msg.author === username;

  return (

    <div
      key={index}
      className={ownMessage ? "message own" : "message other"}
    >

      {!ownMessage && (
        <strong>{msg.author}</strong>
      )}

      <p>{msg.message}</p>

    </div>

  );

})}

      </div>

      <div
  className="typing"
  style={{
    height: "22px",
    color: "#777",
    fontStyle: "italic",
    fontSize: "14px",
    marginBottom: "8px",
  }}
>
  {typing}
</div>


      <input
        type="text"
        placeholder="Type message..."
        value={message}
        onChange={(e) => {

          const value = e.target.value;

          setMessage(value);

          if (value.trim() !== "") {

            socket.emit("typing", {
              room,
              author: username,
            });

          }

        }}
      />

      <button onClick={sendMessage}>
        Send
      </button>

    </div>

  );
}

export default App;