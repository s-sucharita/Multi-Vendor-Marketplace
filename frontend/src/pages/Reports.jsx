import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [metrics, setMetrics] = useState({
    totalOrders: true,
    ordersByStatus: true,
    salesByDate: true,
    productAnalytics: true
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const fetchReport = async () => {
    try {
      if (isAdmin) {
        const q = [];
        if (start) q.push(`startDate=${start}`);
        if (end) q.push(`endDate=${end}`);
        const res = await API.get(`/admin/reports/marketplace?${q.join("&")}`);
        setReport(res.data);
      } else {
        const q = [];
        if (start) q.push(`startDate=${start}`);
        if (end) q.push(`endDate=${end}`);
        const metricList = Object.entries(metrics)
          .filter(([k,v])=>v)
          .map(([k])=>k)
          .join(",");
        if(metricList) q.push(`metrics=${metricList}`);
        const res = await API.get(`/vendor/reports/detailed?${q.join("&")}`);
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load report");
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-4">{isAdmin ? "Marketplace" : "Sales"} Report</h2>
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block text-sm">Start</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border p-2" />
          </div>
          <div>
            <label className="block text-sm">End</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border p-2" />
          </div>
          {!isAdmin && (
            <div className="flex flex-col">
              <span className="text-sm">Metrics</span>
              {Object.keys(metrics).map(k => (
                <label key={k} className="inline-flex items-center mr-3">
                  <input
                    type="checkbox"
                    checked={metrics[k]}
                    onChange={e => setMetrics({ ...metrics, [k]: e.target.checked })}
                    className="mr-1"
                  />
                  {k}
                </label>
              ))}
            </div>
          )}
          <button onClick={fetchReport} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Refresh
          </button>
        </div>
        <pre className="bg-white p-4 rounded shadow overflow-auto">
          {report ? JSON.stringify(report, null, 2) : "Loading..."}
        </pre>
      </div>
    </>
  );
}
