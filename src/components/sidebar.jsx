import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  ChevronDown,
  LayoutDashboard,
  Building,
  UserPlus,
  Clipboard,
  Boxes,
  FileText,
  Database,
  MessageCircleHeart,
  Book,
  CreditCard,
  UserPen,
  LogOut,
} from "lucide-react";
import api from "../api/client";

// Map icon
const iconMap = {
  dashboard: LayoutDashboard,
  university: Building,
  userPlus: UserPlus,
  clipboard: Clipboard,
  boxes: Boxes,
  filetext: FileText,
  db: Database,
  messagecircleheart: MessageCircleHeart,
  book: Book,
  billing: CreditCard,
  userPen: UserPen,
};

const Sidebar = ({
  navItems,
  isCollapsed = false,
  sidebarOpen,
  isMobile,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const nav = useNavigate();

  useEffect(() => {
    const initialOpen = {};
    navItems.forEach((item) => {
      if (item.items?.length > 0) {
        const isActive = item.items.some(
          (sub) => location.pathname === sub.url
        );
        if (isActive) initialOpen[item.title] = true;
      }
    });
    setOpenMenus(initialOpen);
  }, [location.pathname, navItems]);

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = async () => {
    try {
      await api.post("auth/logout");
      nav("/login");
    } catch (error) {}
  };
  const renderNavItems = (items) =>
    items.map((item) => {
      const Icon = iconMap[item.icon] || UserPen;
      const hasChildren = item.items?.length > 0;
      const isMenuOpen = !!openMenus[item.title];
      const isActive =
        location.pathname === item.url ||
        (item.items && item.items.some((sub) => location.pathname === sub.url));

      return (
        <div key={item.title} className="w-full">
          {hasChildren ? (
            <>
              <button
                onClick={() => toggleMenu(item.title)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              {!isCollapsed && isMenuOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                  {renderNavItems(item.items)}
                </div>
              )}
            </>
          ) : (
            <Link
              to={item.url}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && item.title}
            </Link>
          )}
        </div>
      );
    });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen border-r bg-white shadow-md transition-all duration-300
        ${isCollapsed ? "w-0 md:w-16" : "w-64"}
        ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}
      `}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 ">
          {!isCollapsed && <h2 className="text-lg font-bold">Java Cell</h2>}
          {/* <button
            onClick={onToggleCollapse}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {renderNavItems(navItems)}
          <button className="p-3 flex spaxe-x-4" onClick={handleLogout}>
            <LogOut className="mr-2" size={16} />{" "}
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
