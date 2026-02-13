import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLeaves = async () => {
    try {
      let url = "/admin/leaves";
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await API.get(url);
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const review = async (id, status) => {
    try {
      await API.put(`/admin/leaves/${id}`, { status });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-4">Support Team Leave Requests</h2>
        <div className="mb-4">
          <label className="mr-2">Filter:</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border p-1">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <ul className="space-y-3">
          {leaves.map(l=> (
            <li key={l._id} className="bg-white p-4 rounded shadow">
              <p>{l.user.name} ({l.user.role})</p>
              <p>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
              <p>Status: {l.status}</p>
              <p>{l.reason}</p>
              {l.status==='pending' && (
                <div className="mt-2 flex gap-2">
                  <button onClick={()=>review(l._id,'approved')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                  <button onClick={()=>review(l._id,'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
