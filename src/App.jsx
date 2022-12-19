import { Routes, Route, Navigate } from "react-router-dom";
import { Header, Sidebar } from "./components";
import { Home, Create, Listed, Collection } from "./pages";

export default function App() {
  return (
    <>
      <Header />
      <Sidebar />
      <div className="flex flex-col md:flex-row">
        <div className="w-48 hidden lg:block shrink-0" />
        <div className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/listed" element={<Listed />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </>
  )
}
