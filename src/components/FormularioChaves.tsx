import React, { useEffect, useState } from "react";

const API_URL =
  "https://sothink.com.br/centenario26/api/v2/nippon";

const TABELA = "chaves";

interface FormularioChavesProps {
  onClose: () => void;
}

interface ImagemChave {
  id: number;
  imagem: string;
}

export default function FormularioChaves({
  onClose,
}: FormularioChavesProps) {
  const [imagens, setImagens] = useState<ImagemChave[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // =====================================================
  // LISTAR TODAS AS IMAGENS
  // =====================================================

  const carregarImagens = async () => {
    try {
      setCarregando(true);

      const res = await fetch(`${API_URL}/list-images`);

      const data = await res.json();

      console.log("LISTAGEM CHAVES:", data);

      if (data.sucesso) {
        setImagens(data.dados || []);
      } else {
        console.error("Erro ao listar:", data.erro);
        setImagens([]);
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
      setImagens([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  // =====================================================
  // ADICIONAR NOVA IMAGEM
  // =====================================================

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arquivo) {
      alert("Selecione uma imagem!");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("tabela", TABELA);

    // AGORA É SOMENTE "imagem"
    // NÃO EXISTE MAIS image_1, image_2, image_3...
    formData.append("imagem", arquivo);

    try {
      const res = await fetch(`${API_URL}/images`, {
        method: "POST",
        body: formData,
      });

      const texto = await res.text();

      console.log("UPLOAD CHAVE:", texto);

      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error("API retornou resposta inválida.");
      }

      if (data.sucesso) {
        alert("Imagem adicionada com sucesso!");

        setArquivo(null);

        const input = document.getElementById(
          "fileInputChaves"
        ) as HTMLInputElement | null;

        if (input) {
          input.value = "";
        }

        // BUSCA NOVAMENTE TODAS DO BANCO
        await carregarImagens();
      } else {
        alert("Erro: " + (data.erro || "Erro ao adicionar imagem."));
      }
    } catch (error) {
      console.error(error);

      alert("Erro ao enviar imagem.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETAR IMAGEM
  // =====================================================

  const handleDeletar = async (id: number) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja deletar esta imagem?"
    );

    if (!confirmar) return;

    const formData = new FormData();

    formData.append("tabela", TABELA);
    formData.append("id", id.toString());

    try {
      const res = await fetch(`${API_URL}/delete-images`, {
        method: "POST",
        body: formData,
      });

      const texto = await res.text();

      console.log("DELETAR CHAVE:", texto);

      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error("API retornou resposta inválida.");
      }

      if (data.sucesso) {
        await carregarImagens();
      } else {
        alert("Erro ao deletar: " + (data.erro || "Erro desconhecido."));
      }
    } catch (error) {
      console.error(error);

      alert("Erro ao deletar imagem.");
    }
  };

  // =====================================================
  // URL DA IMAGEM
  // =====================================================

  const montarUrlImagem = (imagem: string) => {
    if (
      imagem.startsWith("http://") ||
      imagem.startsWith("https://")
    ) {
      return imagem;
    }

    return `https://sothink.com.br/centenario26/${imagem.replace(
      /^\/+/,
      ""
    )}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 relative max-h-[95vh] overflow-y-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gerenciar Chaves
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* FORMULÁRIO PARA ADICIONAR */}

        <form
          onSubmit={handleUpload}
          className="flex flex-col sm:flex-row gap-4 mb-8 items-center border-b pb-6"
        >
          <input
            id="fileInputChaves"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) =>
              setArquivo(
                e.target.files && e.target.files.length > 0
                  ? e.target.files[0]
                  : null
              )
            }
            className="
              block
              w-full
              text-sm
              text-gray-500

              file:mr-4
              file:py-2
              file:px-4
              file:rounded-md
              file:border-0
              file:text-sm
              file:font-semibold
              file:bg-blue-50
              file:text-blue-700

              hover:file:bg-blue-100
              cursor-pointer
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-bold
              py-2
              px-6
              rounded-md
              disabled:opacity-50
              whitespace-nowrap
            "
          >
            {loading ? "Enviando..." : "Adicionar"}
          </button>
        </form>

        {/* CARREGANDO */}

        {carregando && (
          <div className="py-10 text-center text-gray-500">
            Carregando imagens...
          </div>
        )}

        {/* LISTA DAS IMAGENS */}

        {!carregando && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagens.map((item) => (
              <div
                key={item.id}
                className="
                  relative
                  group
                  rounded-lg
                  overflow-hidden
                  border
                  shadow-sm
                  aspect-[9/16]
                  bg-gray-100
                "
              >
                <img
                  src={montarUrlImagem(item.imagem)}
                  alt={`Chave ${item.id}`}
                  className="w-full h-full object-cover"
                />

                {/* OVERLAY */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-black/40
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    flex
                    items-center
                    justify-center
                  "
                >
                  <button
                    type="button"
                    onClick={() => handleDeletar(item.id)}
                    className="
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      font-bold
                      py-2
                      px-4
                      rounded
                    "
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}

            {imagens.length === 0 && (
              <p className="text-gray-500 col-span-2 md:col-span-4">
                Nenhuma imagem nas chaves ainda.
              </p>
            )}
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="
              bg-stone-950
              hover:bg-stone-900
              text-white
              px-6
              py-2.5
              rounded-xl
              text-xs
              font-bold
              transition
              cursor-pointer
            "
          >
            Concluir e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}