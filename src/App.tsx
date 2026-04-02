import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Home, EventDetail } from "./views";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
