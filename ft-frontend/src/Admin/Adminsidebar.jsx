import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Adminsidebar = () => {
  const [open, setOpen] = useState(true);

  const Menus = [
    { title: "Prospects", src: "User", path: "/Adminprospects" },
    { title: "Requests", src: "Folder", path: "/requests" },
  ];

  const userInfo = {
    name: "Admin",
    phone: "9940062385",
  };

  const location = useLocation(); // Hook to get current route

  // Hardcoded zoom level
  const zoomLevel = 1.4; // Equivalent to clicking "Zoom In" 4 times

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Container */}
      <div
        className={`${
          open ? "w-64" : "w-20"
        } bg-black h-full p-4 pt-6 relative duration-300 flex flex-col justify-between`}
        style={{
          transform: `scale(${zoomLevel})`, // Apply zoom scaling
          transformOrigin: "left top", // Ensure scaling aligns from the top-left corner
        }}
      >
        <div>
          {/* Control Button */}
          <img
            src="./src/assets/control.png"
            className={`absolute cursor-pointer -right-4 top-6 w-6 border-black
             border-2 rounded-full ${!open && "rotate-180"} z-20`}
            onClick={() => setOpen(!open)}
          />

          {/* Logo Section */}
          <div className="flex gap-x-3 items-center">
            <img
              src="./src/assets/logo.png"
              className={`cursor-pointer duration-500 scale-110 ${
                open && "rotate-[360deg]"
              }`}
            />
            <h1
              className={`text-white origin-left font-semibold text-lg duration-200 ${
                !open && "scale-0"
              }`}
            >
              FinTrack
            </h1>
          </div>

          {/* User Info Box */}
          <div
            className={`mt-6 flex items-center bg-gray-800 text-white p-4 rounded-lg shadow-md ${
              !open && "hidden"
            }`}
          >
            {/* Avatar */}
            <div className="MuiAvatar-root MuiAvatar-square bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg">
              {userInfo.name.charAt(0)}
            </div>

            {/* User Info */}
            <div className="ml-4 flex flex-col">
              <p className="text-sm font-semibold truncate">
                {userInfo.name}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {userInfo.phone}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <ul className="pt-8">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-lg p-2 cursor-pointer text-gray-300 text-sm items-center gap-x-3 
                mt-2 truncate ${
                  location.pathname === Menu.path
                    ? "bg-gray-800" // Active state
                    : "hover:bg-gray-800"
                }`}
              >
                <Link
                  to={Menu.path}
                  className="flex items-center gap-x-3 w-full"
                >
                  <img
                    src={`./src/assets/${Menu.src}.png`}
                    alt={Menu.title}
                    className="scale-110"
                  />
                  <span
                    className={`${!open && "hidden"} origin-left duration-200 truncate`}
                  >
                    {Menu.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Adminsidebar;
