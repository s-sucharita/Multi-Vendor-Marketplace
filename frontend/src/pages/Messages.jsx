import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/user/messages")
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg._id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{msg.subject || "(no subject)"}</p>
                  <p className="text-sm text-gray-600">
                    {msg.sender._id === JSON.parse(localStorage.getItem("user"))._id
                      ? `To ${msg.recipient.name}`
                      : `From ${msg.sender.name}`}
                  </p>
                </div>
                <Link
                  to={`/message/${msg._id}`}
                  className="text-indigo-600 hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
