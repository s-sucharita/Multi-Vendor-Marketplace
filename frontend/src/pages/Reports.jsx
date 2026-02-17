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

const user = JSON.parse(localStorage.getItem("user") || "null");
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
 if (user) {
    fetchReport();
  }
}, [user]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-gray-800">{isAdmin ? "📊 Marketplace Report" : "📈 Sales Report"}</h2>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >View Dashboard</button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>
            <div className="flex flex-wrap gap-6 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Start Date</label>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">End Date</label>
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-indigo-600" />
              </div>
              {!isAdmin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Metrics</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(metrics).map(k => (
                      <label key={k} className="inline-flex items-center bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={metrics[k]}
                          onChange={e => setMetrics({ ...metrics, [k]: e.target.checked })}
                          className="mr-2 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{k}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={fetchReport} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                Refresh
              </button>
            </div>
          </div>

          {report ? (
            <div className="space-y-8">
              {isAdmin ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <h3 className="text-2xl font-bold">Vendor Performance Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Vendor Name</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Total Orders</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.values(report).length > 0 ? (
                          Object.values(report).map((r, idx) => (
                            <tr key={r.vendor} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 font-medium text-gray-800">{r.vendor}</td>
                              <td className="px-6 py-4 text-right text-gray-600">{r.totalOrders}</td>
                              <td className="px-6 py-4 text-right font-semibold text-green-600">₹{r.revenue.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No vendor data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  {report.totalOrders !== undefined && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <p className="text-gray-600 text-sm font-semibold mb-2">📦 Total Orders</p>
                        <p className="text-4xl font-bold text-green-600">{report.totalOrders}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <p className="text-gray-600 text-sm font-semibold mb-2">📅 Sales Days</p>
                        <p className="text-4xl font-bold text-blue-600">{Object.keys(report.salesByDate || {}).length}</p>
                      </div>
                    </div>
                  )}

                  {report.ordersByStatus && Object.keys(report.ordersByStatus).length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                        <h4 className="text-2xl font-bold">Orders by Status</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b-2 border-gray-300">
                            <tr>
                              <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                              <th className="px-6 py-4 text-right font-semibold text-gray-700">Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(report.ordersByStatus).map(([status, count], idx) => (
                              <tr key={status} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 font-medium"><span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: status === 'Delivered' ? '#d1fae5' : status === 'Shipped' ? '#dbeafe' : status === 'Processing' ? '#fef3c7' : '#f3f4f6', color: status === 'Delivered' ? '#065f46' : status === 'Shipped' ? '#0c4a6e' : status === 'Processing' ? '#92400e' : '#374151' }}>{status}</span></td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-800">{count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {report.salesByDate && Object.keys(report.salesByDate).length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                        <h4 className="text-2xl font-bold">Sales by Date</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b-2 border-gray-300">
                            <tr>
                              <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                              <th className="px-6 py-4 text-right font-semibold text-gray-700">Orders</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(report.salesByDate).map(([date, count], idx) => (
                              <tr key={date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 font-medium text-gray-800">{date}</td>
                                <td className="px-6 py-4 text-right font-semibold text-purple-600">{count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {report.productAnalytics && Object.keys(report.productAnalytics).length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6">
                        <h4 className="text-2xl font-bold">Product Analytics</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b-2 border-gray-300">
                            <tr>
                              <th className="px-6 py-4 text-left font-semibold text-gray-700">Product Name</th>
                              <th className="px-6 py-4 text-right font-semibold text-gray-700">Sold</th>
                              <th className="px-6 py-4 text-right font-semibold text-gray-700">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(report.productAnalytics).map(([prod, data], idx) => (
                              <tr key={prod} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 font-medium text-gray-800">{prod}</td>
                                <td className="px-6 py-4 text-right text-gray-600">{data.sold}</td>
                                <td className="px-6 py-4 text-right font-semibold text-cyan-600">₹{data.revenue.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-lg text-gray-500">⏳ Loading report data...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
