import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const Menus = [
    { title: "Transactions", src: "User", path: "/transactions" },
    { title: "Paylater", src: "Folder", path: "/paylater" },
    { title: "Reports", src: "Chart", path: "/reports" },
    { title: "Control Panel", src: "Setting", path: "/controlpannel" },
  ];

  const location = useLocation();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`${
          open ? "w-56" : "w-14"
        } bg-black h-full p-3 pt-6 relative duration-300 flex flex-col justify-between`}
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

          {/* Menu Items */}
          <ul className="pt-6">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-md p-1 cursor-pointer text-gray-300 text-xs items-center gap-x-2 
                mt-1 ${
                  location.pathname === Menu.path
                    ? "bg-gray-800"
                    : "hover:bg-gray-800"
                }`}
              >
                <Link to={Menu.path} className="flex items-center gap-x-2 w-full">
                  <img
                    src={`./src/assets/${Menu.src}.png`}
                    alt={Menu.title}
                    className="scale-110"
                  />
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 bg-gray-100">{children}</div>
    </div>
  );
};

export default Sidebar;
