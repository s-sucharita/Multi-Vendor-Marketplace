import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {

  const [summary,setSummary]=useState(null);
  const [realtime,setRealtime]=useState(null);
  const [vendors,setVendors]=useState([]);

  useEffect(()=>{
    load();
  },[]);

  const load = async()=>{
    const s = await API.get("/admin/reports/marketplace");
    const r = await API.get("/admin/reports/realtime");
    const v = await API.get("/admin/vendors");

    setSummary(s.data.summary);
    setRealtime(r.data);
    setVendors(v.data);
  };

  return (
    <>
      <Navbar/>

      <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card title="Orders Today" value={realtime?.ordersToday}/>
        <Card title="Products Today" value={realtime?.productsToday}/>
        <Card title="Activities Today" value={realtime?.activitiesToday}/>
        <Card title="Active Vendors" value={summary?.activeVendors}/>

      </div>

      <div className="p-8">

        <h2 className="text-xl font-bold mb-4">Vendor Productivity</h2>

        <table className="w-full bg-white shadow rounded">

          <thead>
            <tr className="border-b">
              <th>Name</th>
              <th>Status</th>
              <th>Rating</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map(v=>(
              <tr key={v._id} className="border-b text-center">
                <td>{v.name}</td>
                <td>{v.status}</td>
                <td>{v.averageRating || 0} ⭐</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </>
  );
}

function Card({title,value}){
  return(
    <div className="bg-white shadow p-6 rounded text-center">
      <h3>{title}</h3>
      <p className="text-3xl font-bold">{value||0}</p>
    </div>
  );
}
