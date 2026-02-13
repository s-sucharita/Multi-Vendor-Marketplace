import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/vendor/leaves");
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const requestLeave = async () => {
    try {
      await API.post("/vendor/leaves", { startDate: start, endDate: end, reason });
      setStart("");
      setEnd("");
      setReason("");
      fetchLeaves();
      alert("Leave requested");
    } catch (e) {
      console.error(e);
      alert("Failed to request leave");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-4">Leave Management</h2>
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="font-semibold mb-2">Request Time Off</h3>
          <div className="flex gap-4 mb-2">
            <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="border p-2" />
            <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="border p-2" />
          </div>
          <textarea
            placeholder="Reason"
            value={reason}
            onChange={e=>setReason(e.target.value)}
            className="w-full border p-2 mb-2"
          />
          <button onClick={requestLeave} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Submit
          </button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">My Requests</h3>
          {leaves.length === 0 ? (
            <p>No leave requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {leaves.map(l => (
                <li key={l._id} className="bg-white p-4 rounded shadow">
                  <p>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                  <p>Status: {l.status}</p>
                  <p>{l.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
