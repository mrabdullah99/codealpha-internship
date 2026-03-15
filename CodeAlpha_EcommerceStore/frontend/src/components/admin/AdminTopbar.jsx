import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const AdminTopbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="shadow-xl w-full px-6 py-4 flex justify-between">
      <Link to="/" className="text-4xl font-semibold text-slate-700">
        <span className="text-blue-600">e</span>store
        <span className="text-blue-600">.</span>
      </Link>
      <button
        onClick={() => {
          dispatch(logout());
          navigate("/login");
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-1.5 transition rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminTopbar;
