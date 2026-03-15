import { NavLink } from "react-router-dom";
import { Plus, ListFilter, ClipboardCheck } from "lucide-react";

const AdminSidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer 
     ${
       isActive
         ? "bg-blue-100 border-r-4 border-blue-500 text-blue-600"
         : "text-gray-700 hover:bg-blue-100"
     }`;

  return (
    <div className="w-64 border-r-2 border-gray-500 p-4 mt-5 flex flex-col gap-3">
      <NavLink to="/admin/all-products" className={linkClass}>
        <ListFilter size={20} /> Product List
      </NavLink>

      <NavLink to="/admin/add-product" className={linkClass}>
        <Plus size={20} /> Add Product
      </NavLink>

      <NavLink to="/admin/all-orders" className={linkClass}>
        <ClipboardCheck size={20} /> Orders
      </NavLink>
    </div>
  );
};

export default AdminSidebar;
