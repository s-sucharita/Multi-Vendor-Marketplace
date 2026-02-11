export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-600">Grabbit</h1>

      <div className="space-x-6">
        <a href="#" className="hover:text-indigo-600">Home</a>
        <a href="#" className="hover:text-indigo-600">Products</a>
        <a href="#" className="hover:text-indigo-600">Login</a>
        <a href="#" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Register
        </a>
      </div>
    </nav>
  )
}
