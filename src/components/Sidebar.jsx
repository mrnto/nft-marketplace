import { Link, useLocation } from "react-router-dom"
import { sidebarItems } from "./sidebarItems";

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <div
      className="hidden bg-zinc-900 lg:flex h-screen flex-col
        justify-between w-48 fixed left-0 top-0 bottom-0 pt-24"
    >
      <ul className="space-y-8">
        {sidebarItems.map((item, idx) => (
          <li
            key={idx}
            className="relative"
          >
            {location.pathname === item.to ? (
              <div className="absolute -left-1 top-0 bg-fuchsia-600 w-2 h-8 rounded-full" />
            ) : null}
            <Link
              to={item.to}
              className={`pl-4 flex items-center capitalize
                ${location.pathname === item.to ? 'text-white' : 'text-zinc-500'}`
              }
            >
              <span className={`bg-zinc-800 w-8 h-8 grid place-items-center mr-2 rounded-md
                ${location.pathname === item.to ? 'bg-fuchsia-600' : 'bg-zinc-800'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {item.image()}
                </svg>
              </span>
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
