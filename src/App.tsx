import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Home, Admin, DigestArchive, DigestView, About } from "./views";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/digests" element={<DigestArchive />} />
          <Route path="/digests/:id" element={<DigestView />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
