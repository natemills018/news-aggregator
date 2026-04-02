import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Home, EventDetail, Venues, Admin } from "./views";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
