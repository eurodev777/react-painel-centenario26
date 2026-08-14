import React, { useState, useEffect } from "react";

const API_URL = "https://sothink.com.br/centenario26/api/v2/nipponimages"; // MUDE AQUI

interface ImagemGaleria {
  id: number;
  imagem: string;
}

export default function GalleryAdmin({ onClose }) {
  const [imagens, setImagens] = useState<ImagemGaleria[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarImagens = () => {
    fetch(`${API_URL}/listar`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) setImagens(data.dados);
      });
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) return alert("Selecione uma imagem!");

    setLoading(true);
    const formData = new FormData();
    formData.append("tabela", "galeria");
    formData.append("imagem", arquivo);

    try {
      const res = await fetch(`${API_URL}/inserir`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.sucesso) {
        alert("Imagem adicionada com sucesso!");
        setArquivo(null);
        (document.getElementById("fileInput") as HTMLInputElement).value = "";
        carregarImagens(); // Atualiza a lista
      } else {
        alert("Erro: " + data.erro);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta imagem?")) return;

    const formData = new FormData();
    formData.append("tabela", "galeria");
    formData.append("id", id.toString());

    try {
      const res = await fetch(`${API_URL}/deletar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.sucesso) {
        carregarImagens(); // Atualiza a lista
      } else {
        alert("Erro ao deletar: " + data.erro);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    /* 1. OVERLAY FIXO (Fundo escuro e centralizador) */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 relative max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Gerenciar Galeria
        </h2>

        {/* Formulário de Upload */}
        <form
          onSubmit={handleUpload}
          className="flex gap-4 mb-8 items-center border-b pb-6"
        >
          <input
            id="fileInput"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) =>
              setArquivo(e.target.files ? e.target.files[0] : null)
            }
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Adicionar"}
          </button>
        </form>

        {/* Lista para Deletar / Visualizar Admin */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagens.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-lg overflow-hidden border shadow-sm aspect-[9/16]"
            >
              <img
                src={`http://sothink.com.br/centenario26/${item.imagem}`}
                alt="Galeria Admin"
                className="w-full h-full object-cover"
              />
              {/* Overlay com botão de deletar que aparece no Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeletar(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
          {imagens.length === 0 && (
            <p className="text-gray-500 col-span-4">
              Nenhuma imagem na galeria ainda.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-stone-950 hover:bg-stone-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Concluir e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
