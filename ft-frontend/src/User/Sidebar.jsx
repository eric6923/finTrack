import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Control from "../assets/control.png";
import Logo from "../assets/logo-2.png";
import User from "../assets/User.png";
import Folder from "../assets/Folder.png";
import Chart from "../assets/Chart.png";
import Setting from "../assets/Setting.png";
import { LogOut } from "lucide-react";

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isActive, setIsActive] = useState(false); // State for user status
  const navigate = useNavigate();
  const location = useLocation();

  const Menus = [
    { title: "Transactions", src: User, path: "/transactions" },
    { title: "Paylater", src: Folder, path: "/paylater" },
    { title: "Reports", src: Chart, path: "/reports" },
    { title: "Control Panel", src: Setting, path: "/controlpannel" },
  ];

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      // Fetch active/inactive status
      fetchUserStatus(JSON.parse(storedUserInfo).id);
    }
    const storedSidebarState = localStorage.getItem("sidebarOpen");
    if (storedSidebarState !== null) {
      setOpen(JSON.parse(storedSidebarState));
    } else {
      setOpen(true);
    }
  }, []);

  const fetchUserStatus = async (id) => {
    try {
      const response = await axios.get(
        `https://ftbackend.vercel.app/api/admin/users/${id}/status`
      );
      setIsActive(response.data.isActive); // Assume API returns { isActive: true/false }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  const toggleUserStatus = async () => {
    try {
      const apiUrl = `https://ftbackend.vercel.app/api/admin/users/${userInfo.id}/${
        isActive ? "inactivate" : "activate"
      }`;
      await axios.post(apiUrl);
      setIsActive((prev) => !prev); // Toggle the status locally
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleSidebarToggle = () => {
    const newState = !open;
    setOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/user/logout");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`${
          open ? "w-56" : "w-14"
        } bg-[#0A64BC] h-full p-3 pt-6 relative duration-300 flex flex-col justify-between`}
      >
        <div>
          {/* Control Button */}
          <img
            src={Control}
            className={`absolute cursor-pointer -right-3 top-6 w-5 border-black border-2 rounded-full ${
              !open && "rotate-180"
            } z-20`}
            onClick={handleSidebarToggle}
          />

          {/* Logo Section */}
          <div className="flex gap-x-2 items-center w-12 max-h-16">
            <img
              src={Logo}
              className={`cursor-pointer duration-500 ${
                open && "rotate-[360deg]"
              }`}
            />
            <h1
              className={`text-white origin-left font-medium text-2xl duration-200 ${
                !open && "scale-0"
              }`}
            >
              FinTrack
            </h1>
          </div>

          {/* User Info Box */}
          {userInfo ? (
            <div
              className={`mt-4 flex items-center bg-white p-3 rounded-lg shadow-md ${
                !open && "hidden"
              }`}
            >
              <div className="MuiAvatar-root MuiAvatar-square bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                {userInfo.name.charAt(0)}
              </div>
              <div className="ml-3 flex flex-col">
  <p className="text-lg font-semibold">{userInfo.userName}</p>
  <span
    onClick={toggleUserStatus}
    className={` text-sm cursor-pointer ${
      isActive ? "text-red-500" : "text-green-500"
    }`}
  >
    {isActive ? "Inactive" : "Active"}
  </span>
  
</div>

            </div>
          ) : (
            <div className="mt-4 text-gray-500">No user info found</div>
          )}

          {/* Menu Items */}
          <ul className="pt-6">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-md p-1 cursor-pointer text-gray-300 text-xs items-center gap-x-2 
                mt-1 border border-white ${
                  location.pathname === Menu.path
                    ? "bg-gray-800"
                    : "hover:bg-[#074b91] focus:bg-[#074b91]"
                }`}
              >
                <Link
                  to={Menu.path}
                  className="flex items-center gap-x-2 w-full"
                >
                  <img src={Menu.src} alt={Menu.title} className="scale-110" />
                  <span
                    className={`${
                      !open && "hidden"
                    } origin-left duration-200 truncate`}
                  >
                    {Menu.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`mt-auto mb-4 flex items-center rounded-md p-2 cursor-pointer text-gray-300 text-xs gap-x-2 
          border border-white hover:bg-[#074b91] focus:bg-[#074b91] transition-colors duration-200`}
        >
          <LogOut size={16} className="scale-110" />
          <span className={`${!open && "hidden"} origin-left duration-200`}>
            Logout
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 bg-gray-100">{children}</div>
    </div>
  );
};

export default Sidebar;
