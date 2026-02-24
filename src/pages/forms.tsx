import { useState } from "react";

export default function Formulario() {
  const [form, setForm] = useState({
    idade: "",
    peso: "",
    altura: "",
    dias: "",
    objetivo: "",
    nivel: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Treino gerado com sucesso! (mock)");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-red-600/30">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Gerar Meu Plano Personalizado
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Responda abaixo para receber seu treino estratégico de 90 dias
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            name="idade"
            placeholder="Idade"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          />

          <input
            name="peso"
            placeholder="Peso (kg)"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          />

          <input
            name="altura"
            placeholder="Altura (cm)"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          />

          <input
            name="dias"
            placeholder="Dias por semana"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          />

          <select
            name="objetivo"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          >
            <option value="">Objetivo</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="definicao">Definição</option>
            <option value="recomposicao">Recomposição</option>
          </select>

          <select
            name="nivel"
            onChange={handleChange}
            className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-red-600 transition"
          >
            <option value="">Nível</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>

          <button
            type="submit"
            className="mt-4 bg-red-600 hover:bg-red-700 transition p-4 rounded-lg font-bold text-white text-lg shadow-lg"
          >
            GERAR MEU TREINO
          </button>
        </form>

      </div>
    </div>
  );
}