import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FormularioChavesProps {
  onClose: () => void;
}

export default function FormularioChaves({ onClose }: FormularioChavesProps) {
  const CAMPOS = [
    {
      id: 1,
      titulo: "Ouro Masculino",
      campo: "image_1",
    },
    {
      id: 2,
      titulo: "Prata Masculino",
      campo: "image_2",
    },
    {
      id: 3,
      titulo: "Bronze Masculino",
      campo: "image_3",
    },
    {
      id: 4,
      titulo: "Ouro Feminino",
      campo: "image_4",
    },
    {
      id: 5,
      titulo: "Prata Feminino",
      campo: "image_5",
    },
  ];
  // Estado para controlar o loading e status de cada um dos 5 inputs individualmente
  const [inputs, setInputs] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      loading: false,
      status: "idle" as "idle" | "success" | "error",
      urlSalva: "",
    }))
  );

  useEffect(() => {
    carregarImagens();
  }, []);

  const carregarImagens = async () => {
    const res = await fetch(
      "https://sothink.com.br/centenario26/api/v2/nippon/list-images"
    );

    const data = await res.json();

    const registro = data[0];

    if (!registro) return;

    setInputs((prev) =>
      prev.map((item) => ({
        ...item,
        urlSalva: registro[`image_${item.id}`] || "",
      }))
    );
  };

  const handleUploadImagem = async (index: number, file: File | null) => {
    if (!file) return;

    // Atualiza o estado daquele input específico para "loading"
    atualizarEstadoInput(index, { loading: true, status: "idle" });

    const formData = new FormData();
    formData.append("tabela", "chaves");
    formData.append(`image_${index + 1}`, file);

    try {
      // Substitua pelo endpoint correto da sua API PHP que processa o upload
      const response = await fetch(
        "https://sothink.com.br/centenario26/api/v2/nippon/images",
        {
          method: "POST",
          body: formData,
        }
      );

      const resTexto = await response.text();
      console.log(`[Upload Imagem ${index + 1}]:`, resTexto);

      if (!response.ok) throw new Error("Erro no servidor");

      const resJson = JSON.parse(resTexto);

      if (resJson.sucesso) {
        atualizarEstadoInput(index, {
          loading: false,
          status: "success",
          urlSalva: resJson.url_imagem || "", // URL retornada pela sua API PHP
        });
      } else {
        throw new Error(resJson.erro || "Falha ao salvar");
      }
    } catch (error) {
      console.error(error);
      atualizarEstadoInput(index, { loading: false, status: "error" });
    }
  };

  const atualizarEstadoInput = (
    index: number,
    novosValores: Partial<(typeof inputs)[0]>
  ) => {
    setInputs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...novosValores } : item))
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold font-display text-stone-950">
              Upload de Chaves do Torneio
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Cada campo realiza 1 insert individual diretamente no banco de
              dados.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Grid com os 5 Inputs */}
        <div className="space-y-4">
          {inputs.map((input, index) => (
            <div
              key={input.id}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-stone-800">
                  {
                    [
                      "Ouro Masculino",
                      "Prata Masculino",
                      "Bronze Masculino",
                      "Ouro Feminino",
                      "Prata Feminino",
                    ][index]
                  }
                </span>
                {input?.urlSalva ? (
                  <img
                    src={`https://sothink.com.br/centenario26/${input.urlSalva}`}
                    className="w-40 h-24 object-cover rounded-lg border"
                    alt={`Imagem ${input.id}`}
                  />
                ) : (
                  <div className="w-40 h-24 rounded-lg border bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Status indicator do input atual */}
                {input.loading && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </div>
                )}
                {input.status === "success" && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvo!</span>
                  </div>
                )}
                {input.status === "error" && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Erro ao enviar</span>
                  </div>
                )}

                {/* Input customizado estilo botão */}
                <label className="flex items-center gap-2 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Selecionar Foto</span>
                  <input
                    type="file"
                    name={`image_${index + 1}`}
                    accept="image/*"
                    className="hidden"
                    disabled={input.loading}
                    onChange={(e) =>
                      handleUploadImagem(index, e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
            </div>
          ))}
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
