import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function MessageDetails() {
  const { id } = useParams();
  const [msg, setMsg] = useState(null);
  const [reply, setReply] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/user/messages/${id}`)
      .then(res => setMsg(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const sendReply = async () => {
    if (!reply) return;
    try {
      await API.post(`/user/messages/${id}/reply`, { message: reply });
      alert("Reply sent");
      setReply("");
      // refresh
      const res = await API.get(`/users/messages/${id}`);
      setMsg(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  if (!msg)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading message...</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-2">{msg.subject || "Message"}</h2>
        <p className="text-sm text-gray-600 mb-4">
          From: {msg.sender.name} | To: {msg.recipient.name}
        </p>
        <div className="bg-white p-4 rounded shadow mb-4">
          <p>{msg.message}</p>
        </div>
        {msg.replies && msg.replies.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="font-semibold">Replies</h3>
            {msg.replies.map((r, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-700">
                  <strong>{r.sender.name || "You"}:</strong> {r.message}
                </p>
              </div>
            ))}
          </div>
        )}
        <div>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Type your reply..."
          />
          <button
            onClick={sendReply}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Send Reply
          </button>
        </div>
      </div>
    </>
  );
}
