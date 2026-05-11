import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Formulario from "./pages/forms";
import AcessoPage from "./pages/acesso";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/acesso" element={<AcessoPage />} />
        <Route path="/formulario" element={<Formulario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
