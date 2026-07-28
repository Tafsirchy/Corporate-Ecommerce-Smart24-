export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <p className="text-muted-foreground mb-8">Welcome to the Smart24 Admin Panel. Use the sidebar to manage your store.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground font-medium">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground font-medium">Total Products</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground font-medium">Total Categories</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground font-medium">Total Brands</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
