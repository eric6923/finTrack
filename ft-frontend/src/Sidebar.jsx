import { useState } from "react"; 
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  const Menus = [
    { title: "Prospects", src: "User", path: "/" },
    { title: "Transactions", src: "Folder", path: "/transactions" },
    { title: "Pricing", src: "Chart", path: "/pricing" },
    { title: "Settings", src: "Setting", path: "/settings" },
  ];

  const userInfo = {
    name: "John Doe",
    phone: "9940062385",
  };

  const location = useLocation(); // Hook to get current route

  return (
    <div className="flex">
      <div
        className={`${
          open ? "w-56" : "w-14"
        } bg-black h-screen p-3 pt-6 relative duration-300 flex flex-col justify-between`}
      >
        <div>
          {/* Control Button */}
          <img
            src="./src/assets/control.png"
            className={`absolute cursor-pointer -right-3 top-6 w-5 border-black
             border-2 rounded-full ${!open && "rotate-180"} z-20`}
            onClick={() => setOpen(!open)}
          />

          {/* Logo Section */}
          <div className="flex gap-x-2 items-center">
            <img
              src="./src/assets/logo.png"
              className={`cursor-pointer duration-500 ${
                open && "rotate-[360deg]"
              }`}
            />
            <h1
              className={`text-white origin-left font-medium text-base duration-200 ${
                !open && "scale-0"
              }`}
            >
              FinTrack
            </h1>
          </div>

          {/* User Info Box */}
          <div
            className={`mt-4 flex items-center bg-gray-800 text-white p-3 rounded-lg shadow-md ${
              !open && "hidden"
            }`}
          >
            {/* Avatar */}
            <div className="MuiAvatar-root MuiAvatar-square bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              {userInfo.name.charAt(0)}
            </div>

            {/* User Info */}
            <div className="ml-3 flex flex-col">
              <p className="text-sm font-semibold">{userInfo.name}</p>
              <p className="text-xs text-gray-300">{userInfo.phone}</p>
            </div>
          </div>

          {/* Menu Items */}
          <ul className="pt-6">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-md p-1 cursor-pointer text-gray-300 text-xs items-center gap-x-2 
                mt-1 ${
                  location.pathname === Menu.path 
                    ? "bg-gray-800" // Active state
                    : "hover:bg-gray-800"
                }`}
              >
                <Link
                  to={Menu.path}
                  className="flex items-center gap-x-2 w-full"
                >
                  <img src={`./src/assets/${Menu.src}.png`} alt={Menu.title} />
                  <span
                    className={`${!open && "hidden"} origin-left duration-200`}
                  >
                    {Menu.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Section */}
        <div className="mt-1">
          <li
            className="flex rounded-md p-1 cursor-pointer hover:bg-gray-800 text-gray-300 text-xs items-center gap-x-2"
          >
            <img
              src="./src/assets/logou.png"
              alt="Logout"
              className="w-4 h-4"
            />
            <span className={`${!open && "hidden"} origin-left duration-200`}>
              Logout
            </span>
          </li>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
