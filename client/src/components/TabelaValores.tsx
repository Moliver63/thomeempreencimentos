// client/src/components/TabelaValores.tsx
// Tabela digital de valores gerada a partir de PDF ou preenchimento manual
import { useState, useRef } from "react";
import { Upload, Loader, FileText, Download, Printer, Plus, Trash2, X } from "lucide-react";
import { api } from "../services/api";

interface ItemTabela {
  id:         string;
  descricao:  string;
  unidade:    string;
  quantidade: number;
  valor_unit: number;
  total:      number;
}

interface TabelaData {
  titulo:       string;
  empreend:     string;
  endereco:     string;
  construtora:  string;
  data:         string;
  itens:        ItemTabela[];
  observacoes:  string;
  total_geral:  number;
}

function newItem(): ItemTabela {
  return {
    id:         Date.now().toString(),
    descricao:  "",
    unidade:    "un",
    quantidade: 1,
    valor_unit: 0,
    total:      0,
  };
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function TabelaValores({ imovelTitulo, imovelEndereco }: { imovelTitulo?: string; imovelEndereco?: string }) {
  const [tab,      setTab]      = useState<"tabela"|"preview">("tabela");
  const [loading,  setLoading]  = useState(false);
  const [pdfUrl,   setPdfUrl]   = useState("");
  const fileRef                 = useRef<HTMLInputElement>(null);

  const [tabela, setTabela] = useState<TabelaData>({
    titulo:      "Memorial Descritivo e Tabela de Acabamentos",
    empreend:    imovelTitulo || "",
    endereco:    imovelEndereco || "",
    construtora: "Thome Empreendimentos",
    data:        new Date().toLocaleDateString("pt-BR"),
    itens:       [
      { id: "1", descricao: "Piso porcelanato 60x60cm", unidade: "m2", quantidade: 0, valor_unit: 0, total: 0 },
      { id: "2", descricao: "Revestimento ceramico banheiro", unidade: "m2", quantidade: 0, valor_unit: 0, total: 0 },
      { id: "3", descricao: "Esquadria aluminio anodizado", unidade: "un", quantidade: 0, valor_unit: 0, total: 0 },
      { id: "4", descricao: "Porta madeira macica", unidade: "un", quantidade: 0, valor_unit: 0, total: 0 },
      { id: "5", descricao: "Instalacao eletrica completa", unidade: "vb", quantidade: 1, valor_unit: 0, total: 0 },
      { id: "6", descricao: "Instalacao hidraulica completa", unidade: "vb", quantidade: 1, valor_unit: 0, total: 0 },
    ],
    observacoes:  "",
    total_geral:  0,
  });

  const updateItem = (id: string, field: keyof ItemTabela, value: any) => {
    setTabela(prev => {
      const itens = prev.itens.map(it => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "quantidade" || field === "valor_unit") {
          updated.total = Number(updated.quantidade) * Number(updated.valor_unit);
        }
        return updated;
      });
      const total_geral = itens.reduce((s, it) => s + (it.total || 0), 0);
      return { ...prev, itens, total_geral };
    });
  };

  const addItem = () => setTabela(prev => ({
    ...prev,
    itens: [...prev.itens, newItem()],
  }));

  const removeItem = (id: string) => setTabela(prev => {
    const itens = prev.itens.filter(it => it.id !== id);
    const total_geral = itens.reduce((s, it) => s + (it.total || 0), 0);
    return { ...prev, itens, total_geral };
  });

  const setField = (field: keyof TabelaData, value: any) =>
    setTabela(prev => ({ ...prev, [field]: value }));

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Faz upload do PDF para o Cloudinary
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const { data } = await api.post("/upload", {
            image: reader.result,
            folder: "thome-docs",
            resource_type: "raw",
          });
          if (data.success) {
            setPdfUrl(data.url);
            // Atualiza o título com o nome do arquivo
            setField("titulo", file.name.replace(".pdf", "").replace(/-|_/g, " "));
          }
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const inputCls = "bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded w-full";
  const thCls    = "text-left text-white/40 text-[10px] tracking-widest uppercase px-3 py-2.5 font-normal border-b border-white/5";
  const tdCls    = "px-2 py-1.5";

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#c9a84c] text-[10px] tracking-[0.4em] uppercase">Tabela de Valores</p>
          <p className="text-white/40 text-xs mt-0.5">Memorial descritivo e acabamentos</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab("tabela")}
            className={"px-4 py-2 text-xs rounded border transition-all " +
              (tab === "tabela" ? "border-[#c9a84c] bg-[#c9a84c] text-black font-bold" : "border-white/10 text-white/50 hover:border-[#c9a84c]/40")}>
            Editar
          </button>
          <button type="button" onClick={() => setTab("preview")}
            className={"px-4 py-2 text-xs rounded border transition-all " +
              (tab === "preview" ? "border-[#c9a84c] bg-[#c9a84c] text-black font-bold" : "border-white/10 text-white/50 hover:border-[#c9a84c]/40")}>
            Preview
          </button>
          <button type="button" onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded border border-white/10 text-white/50 hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-all">
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>

      {/* Upload PDF */}
      <div className="flex items-center gap-3 p-3 bg-white/3 rounded border border-white/5">
        <FileText size={16} className="text-[#c9a84c] shrink-0" />
        <div className="flex-1 min-w-0">
          {pdfUrl
            ? <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-[#c9a84c] text-xs hover:underline truncate block">PDF anexado — clique para ver</a>
            : <p className="text-white/30 text-xs">Nenhum PDF anexado. Suba o memorial original como referencia.</p>
          }
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black text-xs rounded transition-colors disabled:opacity-50 whitespace-nowrap">
          {loading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
          {loading ? "Enviando..." : "Upload PDF"}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
      </div>

      {/* ABA EDITAR */}
      {tab === "tabela" && (
        <div className="space-y-4">
          {/* Dados do cabeçalho */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/40 text-[10px] tracking-widest uppercase mb-1">Titulo do documento</label>
              <input value={tabela.titulo} onChange={e => setField("titulo", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] tracking-widest uppercase mb-1">Empreendimento</label>
              <input value={tabela.empreend} onChange={e => setField("empreend", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] tracking-widest uppercase mb-1">Endereco</label>
              <input value={tabela.endereco} onChange={e => setField("endereco", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] tracking-widest uppercase mb-1">Data</label>
              <input value={tabela.data} onChange={e => setField("data", e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Tabela de itens */}
          <div className="bg-white/3 rounded border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls} style={{ width: "38%" }}>Descricao</th>
                    <th className={thCls} style={{ width: "8%" }}>Unid.</th>
                    <th className={thCls} style={{ width: "12%" }}>Qtd.</th>
                    <th className={thCls} style={{ width: "18%" }}>Valor Unit.</th>
                    <th className={thCls} style={{ width: "18%" }}>Total</th>
                    <th className={thCls} style={{ width: "6%" }}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tabela.itens.map(it => (
                    <tr key={it.id}>
                      <td className={tdCls}>
                        <input value={it.descricao}
                          onChange={e => updateItem(it.id, "descricao", e.target.value)}
                          placeholder="Descricao do item"
                          className="w-full bg-transparent border-0 text-white text-sm focus:outline-none focus:bg-white/5 px-2 py-1 rounded" />
                      </td>
                      <td className={tdCls}>
                        <select value={it.unidade}
                          onChange={e => updateItem(it.id, "unidade", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none">
                          {["m2","m","un","vb","kg","cx","gl","pt","pto"].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className={tdCls}>
                        <input type="number" min="0" value={it.quantidade || ""}
                          onChange={e => updateItem(it.id, "quantidade", Number(e.target.value))}
                          className="w-full bg-transparent border-0 text-white text-sm text-right focus:outline-none focus:bg-white/5 px-2 py-1 rounded" />
                      </td>
                      <td className={tdCls}>
                        <input type="number" min="0" step="0.01" value={it.valor_unit || ""}
                          onChange={e => updateItem(it.id, "valor_unit", Number(e.target.value))}
                          className="w-full bg-transparent border-0 text-white text-sm text-right focus:outline-none focus:bg-white/5 px-2 py-1 rounded" />
                      </td>
                      <td className={tdCls + " text-right text-[#c9a84c] text-sm font-medium"}>
                        {formatBRL(it.total)}
                      </td>
                      <td className={tdCls + " text-center"}>
                        <button type="button" onClick={() => removeItem(it.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#c9a84c]/30">
                    <td colSpan={4} className="px-3 py-3 text-white/60 text-sm text-right font-medium">
                      Total Geral
                    </td>
                    <td className="px-3 py-3 text-right text-[#c9a84c] font-bold text-base">
                      {formatBRL(tabela.total_geral)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <button type="button" onClick={addItem}
            className="flex items-center gap-2 text-[#c9a84c]/70 hover:text-[#c9a84c] text-xs tracking-widest uppercase transition-colors">
            <Plus size={13} /> Adicionar item
          </button>

          <div>
            <label className="block text-white/40 text-[10px] tracking-widest uppercase mb-1">Observacoes</label>
            <textarea value={tabela.observacoes}
              onChange={e => setField("observacoes", e.target.value)}
              rows={3} placeholder="Observacoes sobre os acabamentos..."
              className={inputCls + " resize-none"} />
          </div>
        </div>
      )}

      {/* ABA PREVIEW — documento final com logo */}
      {tab === "preview" && (
        <div className="bg-white rounded-lg overflow-hidden" id="tabela-preview">
          <style>{`
            @media print {
              body > * { display: none !important; }
              #tabela-preview { display: block !important; }
              .no-print { display: none !important; }
            }
          `}</style>

          {/* Cabeçalho com logo */}
          <div style={{ background: "#0a0a0a", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img src="/logo_full.png" alt="Thome" style={{ height: "56px", width: "auto", objectFit: "contain" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#c9a84c", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", margin: 0 }}>
                {tabela.construtora}
              </p>
              <p style={{ color: "#ffffff80", fontSize: "11px", margin: "4px 0 0" }}>
                Balneario Camboriu, SC
              </p>
            </div>
          </div>

          {/* Faixa dourada */}
          <div style={{ background: "#c9a84c", height: "3px" }} />

          {/* Corpo */}
          <div style={{ padding: "32px", background: "#fff" }}>
            {/* Título */}
            <div style={{ borderBottom: "2px solid #c9a84c", paddingBottom: "16px", marginBottom: "24px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#0a0a0a", margin: "0 0 4px" }}>
                {tabela.titulo}
              </h1>
              <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
                {tabela.empreend} {tabela.endereco ? `— ${tabela.endereco}` : ""}
              </p>
            </div>

            {/* Meta info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
              {[
                ["Empreendimento", tabela.empreend],
                ["Construtora",    tabela.construtora],
                ["Data",           tabela.data],
              ].map(([k, v]) => v && (
                <div key={k} style={{ background: "#f8f7f2", padding: "12px", borderRadius: "6px", borderLeft: "3px solid #c9a84c" }}>
                  <p style={{ color: "#999", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>{k}</p>
                  <p style={{ color: "#0a0a0a", fontSize: "13px", fontWeight: 500, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Tabela */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "8px" }}>
              <thead>
                <tr style={{ background: "#0a0a0a" }}>
                  {["#","Descricao","Unid.","Qtd.","Valor Unit.","Total"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 12px",
                      color: "#c9a84c",
                      fontWeight: 600,
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                      textAlign: i >= 3 ? "right" : "left",
                      borderBottom: "2px solid #c9a84c",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabela.itens.filter(it => it.descricao).map((it, idx) => (
                  <tr key={it.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8f7f2" }}>
                    <td style={{ padding: "9px 12px", color: "#999", fontSize: "11px", borderBottom: "1px solid #eee" }}>{idx + 1}</td>
                    <td style={{ padding: "9px 12px", color: "#222", borderBottom: "1px solid #eee" }}>{it.descricao}</td>
                    <td style={{ padding: "9px 12px", color: "#666", textAlign: "center", borderBottom: "1px solid #eee" }}>{it.unidade}</td>
                    <td style={{ padding: "9px 12px", color: "#333", textAlign: "right", borderBottom: "1px solid #eee" }}>{it.quantidade}</td>
                    <td style={{ padding: "9px 12px", color: "#333", textAlign: "right", borderBottom: "1px solid #eee" }}>{formatBRL(it.valor_unit)}</td>
                    <td style={{ padding: "9px 12px", color: "#0a0a0a", fontWeight: 600, textAlign: "right", borderBottom: "1px solid #eee" }}>{formatBRL(it.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#0a0a0a" }}>
                  <td colSpan={5} style={{ padding: "12px", color: "#c9a84c", fontWeight: 600, textAlign: "right", fontSize: "14px" }}>
                    Total Geral
                  </td>
                  <td style={{ padding: "12px", color: "#c9a84c", fontWeight: 700, textAlign: "right", fontSize: "16px" }}>
                    {formatBRL(tabela.total_geral)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {tabela.observacoes && (
              <div style={{ marginTop: "24px", padding: "16px", background: "#f8f7f2", borderLeft: "3px solid #c9a84c", borderRadius: "0 6px 6px 0" }}>
                <p style={{ color: "#999", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Observacoes</p>
                <p style={{ color: "#333", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{tabela.observacoes}</p>
              </div>
            )}

            {pdfUrl && (
              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <a href={pdfUrl} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c9a84c", fontSize: "12px", textDecoration: "none" }}>
                  <span>📄</span> Ver memorial descritivo completo (PDF)
                </a>
              </div>
            )}

            {/* Rodapé */}
            <div style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "#bbb", fontSize: "11px", margin: 0 }}>
                Documento gerado em {tabela.data} — Thome Empreendimentos
              </p>
              <img src="/logo_symbol.png" alt="" style={{ height: "28px", opacity: 0.3 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
