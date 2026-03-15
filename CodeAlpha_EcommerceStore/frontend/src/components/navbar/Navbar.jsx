import { useState, useEffect, Activity } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getCartCount, clearCart } from "../../redux/slices/cartSlice";
import { logout } from "../../redux/slices/authSlice";

const Navbar = () => {
  const navLinks = [
    { id: 1, name: "Home", path: "/" },
    { id: 2, name: "Shop", path: "/all-products" },
    { id: 4, name: "Orders", path: "/myorders" },
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const itemCount = useSelector(getCartCount);
  const { user } = useSelector((state) => state.auth);

  const [activeLink, setActiveLink] = useState("/");
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(search)}`);
      setIsMobileMenuOpen(false);
    }
  };
  useEffect(() => {
    if (!search.trim()) return;
    navigate(`/all-products?search=${encodeURIComponent(search)}`);
  }, [search, navigate]);

  return (
    <nav>
      <div className="shadow-xl w-full px-4 py-2 flex justify-between">
        <Link
          to="/"
          onClick={() => {
            setActiveLink("/");
            setSearch("");
          }}
          className="text-4xl font-semibold text-slate-700"
        >
          <span className="text-blue-600">e</span>store
          <span className="text-blue-600">.</span>
        </Link>

        <div className="hidden md:flex gap-6">
          <div className="flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => {
                  setActiveLink(link.path);
                  if (link.path === "/") {
                    setSearch("");
                  }
                }}
                className={`
        font-medium relative transition-transform duration-300 ease-in-out
        ${
          activeLink === link.path
            ? "text-gray-900 scale-105 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-blue-500 after:rounded-full"
            : "text-gray-600 hover:text-gray-900 hover:scale-105 hover:after:absolute hover:after:-bottom-1 hover:after:left-0 hover:after:w-full hover:after:h-1 hover:after:bg-blue-500 hover:after:rounded-full"
        }
      `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex gap-6 items-center">
            <Link
              to="/cart"
              className="
      relative text-xl font-semibold text-slate-600 flex items-center gap-2
      transition-transform duration-300 ease-in-out hover:scale-105
      after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-1 after:bg-blue-500 after:rounded-full
      hover:after:w-full
    "
            >
              <ShoppingCart size={20} />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2.5 left-3 text-sm text-white bg-slate-600 w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="bg-slate-100 text-md px-4 py-3 flex items-center rounded-full gap-2">
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>

            {user ? (
              <div className="flex gap-3 items-center">
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(clearCart());
                    navigate("/login");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 transition rounded-2xl"
                >
                  <LogOut />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 transition rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-7 py-1.5 transition rounded-2xl"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <div
        className={`transform transition-all duration-800 ease-in
      ${
        isMobileMenuOpen
          ? "opacity-100 translate-y-0 max-h-screen"
          : "opacity-0 -translate-y-5 max-h-0 overflow-hidden"
      }`}
      >
        <Activity mode={isMobileMenuOpen ? "visible" : "hidden"}>
          <div className="md:hidden mt-4 p-4 border-t border-gray-200">
            <div className="bg-slate-100 text-md mb-4 px-4 py-3 flex items-center gap-2 rounded-full">
              <Search size={18} className="text-slate-600" />
              <input
                className="bg-transparent w-full outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => {
                    setActiveLink(link.path);
                    setIsMobileMenuOpen(false);
                    if (link.path === "/") {
                      setSearch("");
                    }
                  }}
                  className={`font-medium px-3 py-2 transition-colors rounded-lg ${
                    activeLink === link.path
                      ? "bg-blue-50 text-gray-900 border-l-4 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to={"/cart"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-gray-600 hover:bg-gray-50 font-medium px-3 py-2 flex items-center gap-3 rounded-lg"
              >
                <ShoppingCart size={20} />
                Cart
                {itemCount > 0 && (
                  <button className="absolute -top-0 left-7 text-xs text-white bg-slate-600 size-3.5 rounded-full">
                    {itemCount}
                  </button>
                )}
              </Link>
            </div>
            {user ? (
              <div className="flex gap-3 items-center justify-center">
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(clearCart());
                    navigate("/login");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition rounded-2xl"
                >
                  <LogOut />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-1.5 transition rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </Activity>
      </div>
    </nav>
  );
};
export default Navbar;
