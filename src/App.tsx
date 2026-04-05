import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Home, EventDetail, Venues, Admin, DigestArchive, DigestView, About } from "./views";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/digests" element={<DigestArchive />} />
          <Route path="/digests/:id" element={<DigestView />} />
          <Route path="/about" element={<About />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
