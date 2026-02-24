import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Formulario from "./pages/forms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/formulario" element={<Formulario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;