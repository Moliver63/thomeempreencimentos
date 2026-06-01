// client/src/pages/admin/ImoveisAdminPage.tsx
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imoveisAPI, api, type Imovel } from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  Search, X, Upload, Image as ImageIcon, Loader, FileText
} from "lucide-react";

const CATS = [
  { value: "lancamento", label: "Lancamento", cls: "text-[#c9a84c] bg-[#c9a84c]/10" },
  { value: "pronto",     label: "Pronto",     cls: "text-emerald-400 bg-emerald-500/10" },
  { value: "terceiros",  label: "Terceiros",  cls: "text-blue-400 bg-blue-500/10" },
  { value: "locacao",    label: "Locacao",    cls: "text-purple-400 bg-purple-500/10" },
];
const TIPOS = ["apartamento","casa","cobertura","sala_comercial","terreno","galpao"];
const TIPO_LABEL: Record<string,string> = {
  apartamento:"Apartamento", casa:"Casa", cobertura:"Cobertura",
  sala_comercial:"Sala Comercial", terreno:"Terreno", galpao:"Galpao"
};
const STATUS = ["disponivel","reservado","vendido","locado"];
const STATUS_LABEL: Record<string,string> = {
  disponivel:"Disponivel", reservado:"Reservado", vendido:"Vendido", locado:"Locado"
};

function toEmpty(imovel?: Imovel) {
  if (!imovel) return {
    titulo:"", descricao:"", categoria:"pronto", tipo:"apartamento", status:"disponivel",
    endereco:"", bairro:"", cidade:"Balneario Camboriu", estado:"SC", cep:"",
    area_total:"", area_privativa:"", quartos:"", suites:"", banheiros:"",
    vagas:"", pavimentos:"", valor_venda:"", valor_locacao:"",
    valor_condominio:"", valor_iptu:"", construtora_parceira:"",
    contato_parceiro:"", imagem_capa:"", pdf_url:"",
    destaque: false, publicado: false,
  };
  return {
    ...imovel,
    area_total:           imovel.area_total           ?? "",
    area_privativa:       imovel.area_privativa        ?? "",
    quartos:              imovel.quartos               ?? "",
    suites:               imovel.suites                ?? "",
    banheiros:            imovel.banheiros             ?? "",
    vagas:                imovel.vagas                 ?? "",
    pavimentos:           imovel.pavimentos            ?? "",
    valor_venda:          imovel.valor_venda           ?? "",
    valor_locacao:        imovel.valor_locacao         ?? "",
    valor_condominio:     imovel.valor_condominio      ?? "",
    valor_iptu:           imovel.valor_iptu            ?? "",
    imagem_capa:          imovel.imagem_capa           ?? "",
    construtora_parceira: imovel.construtora_parceira  ?? "",
    contato_parceiro:     imovel.contato_parceiro      ?? "",
    pdf_url:              (imovel as any).pdf_url      ?? "",
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function doUpload(base64: string, resourceType = "image"): Promise<string> {
  const folder = resourceType === "raw" ? "thome-docs" : "thome-imoveis";
  const { data } = await api.post("/upload", { image: base64, folder, resource_type: resourceType });
  if (!data.success) throw new Error(data.error || "Erro no upload");
  return data.url;
}

// ─── FOTO CAPA ────────────────────────────────────────────────────────────────
function CapaInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await doUpload(await fileToBase64(file));
      onChange(url);
      toast.success("Foto de capa enviada!");
    } catch (err: any) {
      toast.error(err.message || "Erro no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">
        Foto de Capa Principal
      </label>
      {value && (
        <div className="relative mb-3 group">
          <img src={value} alt="Capa" className="w-full h-44 object-cover rounded-lg border border-white/10" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button type="button" onClick={() => onChange("")}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1">
              <X size={11} /> Remover
            </button>
          </div>
          <span className="absolute top-2 left-2 bg-[#c9a84c] text-black text-[9px] px-2 py-0.5 rounded font-bold">CAPA</span>
        </div>
      )}
      <div className="flex gap-2">
        <input type="url" value={value.startsWith("data:") ? "" : value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... cole URL da imagem"
          className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black text-xs rounded transition-colors disabled:opacity-50 whitespace-nowrap">
          {uploading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Enviando..." : "Upload"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

// ─── GALERIA ──────────────────────────────────────────────────────────────────
function GaleriaInput({ fotos, setFotos }: { fotos: string[]; setFotos: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setFotos(prev => [...prev, url]);
    setUrlInput("");
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let count = 0;
    for (const file of files) {
      try {
        const url = await doUpload(await fileToBase64(file));
        setFotos(prev => [...prev, url]);
        count++;
      } catch (err: any) {
        toast.error(`Erro: ${file.name}`);
      }
    }
    if (count > 0) toast.success(`${count} foto(s) enviada(s)!`);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">
        Galeria ({fotos.length} foto{fotos.length !== 1 ? "s" : ""})
      </label>
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {fotos.map((f, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={f} alt="" className="w-full h-full object-cover rounded-lg border border-white/10" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                {i !== 0 && (
                  <button type="button" onClick={() => setFotos(prev => { const n=[...prev]; [n[0],n[i]]=[n[i],n[0]]; return n; })}
                    className="bg-[#c9a84c] text-black text-[9px] px-2 py-1 rounded font-bold">Capa</button>
                )}
                <button type="button" onClick={() => setFotos(prev => prev.filter((_,idx) => idx !== i))}
                  className="bg-red-500 text-white p-1 rounded"><X size={10} /></button>
              </div>
              {i === 0 && <span className="absolute top-1 left-1 bg-[#c9a84c] text-black text-[8px] px-1.5 py-0.5 rounded font-bold">CAPA</span>}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="https://... URL (Enter para adicionar)"
          className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
        <button type="button" onClick={addUrl}
          className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] text-sm rounded">+</button>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black text-xs rounded disabled:opacity-50 whitespace-nowrap">
          {uploading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Enviando..." : "Multiplas"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>
    </div>
  );
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
function PdfInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("PDF muito grande. Max 20MB."); return; }
    setUploading(true);
    try {
      const url = await doUpload(await fileToBase64(file), "raw");
      onChange(url);
      toast.success("PDF enviado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro no upload do PDF");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">
        Memorial Descritivo / Planta (PDF)
      </label>
      {value && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-white/5 rounded border border-white/10">
          <FileText size={18} className="text-[#c9a84c] shrink-0" />
          <a href={value} target="_blank" rel="noreferrer"
            className="text-[#c9a84c] text-sm hover:underline flex-1 truncate">Ver PDF anexado</a>
          <button type="button" onClick={() => onChange("")}
            className="text-white/30 hover:text-red-400 shrink-0"><X size={14} /></button>
        </div>
      )}
      <div className="flex gap-2">
        <input type="url" value={value.startsWith("data:") ? "" : value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... URL do PDF"
          className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] text-xs rounded disabled:opacity-50 whitespace-nowrap">
          {uploading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Enviando..." : "Upload PDF"}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </div>
      <p className="text-white/25 text-[10px] mt-1">Aceita PDF. Max 20MB.</p>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function ImovelModal({ imovel, onClose }: { imovel?: Imovel; onClose: () => void }) {
  const qc     = useQueryClient();
  const isEdit = !!imovel;
  const [form, setForm] = useState<Record<string,any>>(() => toEmpty(imovel));
  const [fotos, setFotos] = useState<string[]>([]);
  const [aba,   setAba  ] = useState<"info"|"fotos"|"valores"|"publicacao">("info");

  // Usa useCallback para evitar recriação do handler a cada render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  }, []);

  const mut = useMutation({
    mutationFn: (data: any) => isEdit ? imoveisAPI.atualizar(imovel!.id, data) : imoveisAPI.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-imoveis"] });
      toast.success(isEdit ? "Imovel atualizado!" : "Imovel cadastrado!");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Erro ao salvar"),
  });

  const n = (v: any) => v === "" || v === null || v === undefined ? null : Number(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      imagem_capa:      form.imagem_capa || fotos[0] || null,
      area_total:       n(form.area_total),
      area_privativa:   n(form.area_privativa),
      quartos:          n(form.quartos),
      suites:           n(form.suites),
      banheiros:        n(form.banheiros),
      vagas:            n(form.vagas),
      pavimentos:       n(form.pavimentos),
      valor_venda:      n(form.valor_venda),
      valor_locacao:    n(form.valor_locacao),
      valor_condominio: n(form.valor_condominio),
      valor_iptu:       n(form.valor_iptu),
    });
  };

  const inputCls = "w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded";
  const labelCls = "block text-white/40 text-xs tracking-widest uppercase mb-1.5";

  const abas = [
    { id: "info",       label: "Dados"      },
    { id: "fotos",      label: "Fotos"      },
    { id: "valores",    label: "Valores"    },
    { id: "publicacao", label: "Publicacao" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-[#111] border border-white/10 rounded-lg w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white text-xl font-light">{isEdit ? "Editar Imovel" : "Novo Imovel"}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex border-b border-white/5">
          {abas.map(a => (
            <button key={a.id} type="button" onClick={() => setAba(a.id as any)}
              className={"px-5 py-3 text-xs tracking-widest uppercase transition-colors " +
                (aba === a.id ? "text-[#c9a84c] border-b-2 border-[#c9a84c]" : "text-white/40 hover:text-white/70")}>
              {a.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            {aba === "info" && <>
              <div>
                <label className={labelCls}>Titulo *</label>
                <input name="titulo" type="text" required value={form.titulo ?? ""} onChange={handleChange}
                  placeholder="Ex: Residencial Torre Di Bueno" className={inputCls} autoComplete="off" />
              </div>
              <div>
                <label className={labelCls}>Descricao *</label>
                <textarea name="descricao" required value={form.descricao ?? ""} onChange={handleChange}
                  rows={4} placeholder="Descreva o imovel..." className={inputCls + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select name="categoria" value={form.categoria ?? ""} onChange={handleChange}
                    className={"bg-[#1a1a1a] " + inputCls}>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select name="tipo" value={form.tipo ?? ""} onChange={handleChange}
                    className={"bg-[#1a1a1a] " + inputCls}>
                    {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Status</label>
                  <select name="status" value={form.status ?? ""} onChange={handleChange}
                    className={"bg-[#1a1a1a] " + inputCls}>
                    {STATUS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Bairro</label>
                  <input name="bairro" type="text" value={form.bairro ?? ""} onChange={handleChange}
                    placeholder="Ex: Centro" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Endereco *</label>
                <input name="endereco" type="text" required value={form.endereco ?? ""} onChange={handleChange}
                  placeholder="Ex: Rua 3122, 75" className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Cidade</label>
                  <input name="cidade" type="text" value={form.cidade ?? ""} onChange={handleChange}
                    placeholder="Balneario Camboriu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <input name="estado" type="text" value={form.estado ?? ""} onChange={handleChange}
                    placeholder="SC" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>CEP</label>
                  <input name="cep" type="text" value={form.cep ?? ""} onChange={handleChange}
                    placeholder="88330-000" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Quartos</label>
                  <input name="quartos" type="number" min="0" value={form.quartos ?? ""} onChange={handleChange} placeholder="3" className={inputCls} /></div>
                <div><label className={labelCls}>Suites</label>
                  <input name="suites" type="number" min="0" value={form.suites ?? ""} onChange={handleChange} placeholder="1" className={inputCls} /></div>
                <div><label className={labelCls}>Banheiros</label>
                  <input name="banheiros" type="number" min="0" value={form.banheiros ?? ""} onChange={handleChange} placeholder="2" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Vagas</label>
                  <input name="vagas" type="number" min="0" value={form.vagas ?? ""} onChange={handleChange} placeholder="2" className={inputCls} /></div>
                <div><label className={labelCls}>Pavimentos</label>
                  <input name="pavimentos" type="number" min="0" value={form.pavimentos ?? ""} onChange={handleChange} placeholder="10" className={inputCls} /></div>
                <div><label className={labelCls}>Area Priv. m2</label>
                  <input name="area_privativa" type="number" min="0" value={form.area_privativa ?? ""} onChange={handleChange} placeholder="85" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Area Total m2</label>
                <input name="area_total" type="number" min="0" value={form.area_total ?? ""} onChange={handleChange} placeholder="120" className={inputCls} /></div>
              {form.categoria === "terceiros" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/5 rounded border border-blue-500/10">
                  <div><label className={labelCls}>Construtora Parceira</label>
                    <input name="construtora_parceira" type="text" value={form.construtora_parceira ?? ""} onChange={handleChange} className={inputCls} /></div>
                  <div><label className={labelCls}>Contato Parceiro</label>
                    <input name="contato_parceiro" type="text" value={form.contato_parceiro ?? ""} onChange={handleChange} className={inputCls} /></div>
                </div>
              )}
            </>}

            {aba === "fotos" && (
              <div className="space-y-6">
                <CapaInput value={form.imagem_capa ?? ""}
                  onChange={v => setForm(prev => ({ ...prev, imagem_capa: v }))} />
                <div className="border-t border-white/5 pt-6">
                  <GaleriaInput fotos={fotos} setFotos={setFotos} />
                </div>
                <div className="border-t border-white/5 pt-6">
                  <PdfInput value={form.pdf_url ?? ""}
                    onChange={v => setForm(prev => ({ ...prev, pdf_url: v }))} />
                </div>
              </div>
            )}

            {aba === "valores" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Valor Venda R$</label>
                    <input name="valor_venda" type="number" min="0" value={form.valor_venda ?? ""} onChange={handleChange} placeholder="1200000" className={inputCls} /></div>
                  <div><label className={labelCls}>Valor Locacao R$/mes</label>
                    <input name="valor_locacao" type="number" min="0" value={form.valor_locacao ?? ""} onChange={handleChange} placeholder="5000" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Condominio R$/mes</label>
                    <input name="valor_condominio" type="number" min="0" value={form.valor_condominio ?? ""} onChange={handleChange} placeholder="800" className={inputCls} /></div>
                  <div><label className={labelCls}>IPTU R$/ano</label>
                    <input name="valor_iptu" type="number" min="0" value={form.valor_iptu ?? ""} onChange={handleChange} placeholder="3600" className={inputCls} /></div>
                </div>
              </>
            )}

            {aba === "publicacao" && (
              <>
                <div className="space-y-3">
                  <label className="flex items-start gap-4 p-4 bg-white/3 rounded border border-white/5 cursor-pointer hover:border-[#c9a84c]/20 transition-colors">
                    <input type="checkbox" name="publicado" checked={!!form.publicado} onChange={handleChange}
                      className="accent-[#c9a84c] w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Publicado no site</p>
                      <p className="text-white/40 text-xs mt-0.5">Aparece na listagem publica</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 p-4 bg-white/3 rounded border border-white/5 cursor-pointer hover:border-[#c9a84c]/20 transition-colors">
                    <input type="checkbox" name="destaque" checked={!!form.destaque} onChange={handleChange}
                      className="accent-[#c9a84c] w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Imovel em destaque</p>
                      <p className="text-white/40 text-xs mt-0.5">Aparece na pagina inicial</p>
                    </div>
                  </label>
                </div>
                <div className="bg-[#0d0d0d] rounded border border-white/5 p-4">
                  <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Resumo</p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ["Titulo",    form.titulo    || "—"],
                      ["Categoria", form.categoria || "—"],
                      ["Foto capa", form.imagem_capa ? "Configurada" : "Sem foto"],
                      ["Galeria",   fotos.length + " foto(s)"],
                      ["PDF",       form.pdf_url ? "Anexado" : "Nenhum"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-white/40">{k}</span>
                        <span className={k === "Foto capa" && !form.imagem_capa ? "text-yellow-400" :
                          k === "PDF" && form.pdf_url ? "text-emerald-400" : "text-white"}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center px-6 pb-6 pt-4 border-t border-white/5">
            <div className="flex gap-1.5">
              {abas.map(a => (
                <button key={a.id} type="button" onClick={() => setAba(a.id as any)}
                  className={"w-2 h-2 rounded-full transition-colors " + (aba === a.id ? "bg-[#c9a84c]" : "bg-white/20")} />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-6 py-2.5 border border-white/10 text-white/60 text-sm rounded hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              {aba !== "publicacao" ? (
                <button type="button" onClick={() => {
                  const order = ["info","fotos","valores","publicacao"];
                  setAba(order[order.indexOf(aba) + 1] as any);
                }} className="px-6 py-2.5 bg-white/10 text-white text-sm rounded hover:bg-white/20 transition-colors">
                  Proximo
                </button>
              ) : (
                <button type="submit" disabled={mut.isPending}
                  className="px-6 py-2.5 bg-[#c9a84c] text-black font-semibold text-sm rounded hover:bg-[#dbb85e] transition-colors disabled:opacity-50">
                  {mut.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export function ImoveisAdminPage() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState<"new"|"edit"|null>(null);
  const [editItem, setEditItem] = useState<Imovel | undefined>();
  const [filtro,   setFiltro]   = useState("todos");
  const [busca,    setBusca]    = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-imoveis"],
    queryFn:  () => imoveisAPI.adminTodos().then(r => r.data.data),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, campo }: any) => imoveisAPI.toggle(id, campo),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin-imoveis"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => imoveisAPI.excluir(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-imoveis"] }); toast.success("Excluido!"); },
  });

  const filtered = (data || [])
    .filter((i: Imovel) => filtro === "todos" || i.categoria === filtro)
    .filter((i: Imovel) => !busca || i.titulo.toLowerCase().includes(busca.toLowerCase()) || i.cidade.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Gestao</p>
          <h1 className="text-white text-3xl font-thin">Imoveis</h1>
        </div>
        <button onClick={() => { setEditItem(undefined); setModal("new"); }}
          className="flex items-center gap-2 bg-[#c9a84c] text-black font-semibold text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#dbb85e] transition-colors rounded">
          <Plus size={15} /> Novo Imovel
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..."
            className="w-full bg-white/5 border border-white/10 text-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos",...CATS.map(c => c.value)].map(c => (
            <button key={c} onClick={() => setFiltro(c)}
              className={"text-xs tracking-widest uppercase px-4 py-2 rounded border transition-all " +
                (filtro === c ? "border-[#c9a84c] bg-[#c9a84c] text-black" : "border-white/10 text-white/50 hover:border-[#c9a84c]/40")}>
              {c === "todos" ? "Todos" : CATS.find(x => x.value === c)?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Imovel","Cat","Tipo","Valor","Status","Pub","Dest","Acoes"].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && <tr><td colSpan={8} className="text-center py-12 text-white/30">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-white/30">Nenhum imovel.</td></tr>}
              {filtered.map((im: Imovel) => {
                const cat   = CATS.find(c => c.value === im.categoria);
                const valor = im.valor_venda ? "R$ " + Number(im.valor_venda).toLocaleString("pt-BR")
                  : im.valor_locacao ? "R$ " + Number(im.valor_locacao).toLocaleString("pt-BR") + "/mes" : "—";
                return (
                  <tr key={im.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {im.imagem_capa
                          ? <img src={im.imagem_capa} alt="" className="w-12 h-12 object-cover rounded border border-white/10 shrink-0" />
                          : <div className="w-12 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center shrink-0"><ImageIcon size={16} className="text-white/20" /></div>
                        }
                        <div>
                          <p className="text-white text-sm font-light">{im.titulo}</p>
                          <p className="text-white/40 text-xs">{im.cidade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-full " + (cat?.cls || "")}>{cat?.label}</span></td>
                    <td className="px-4 py-3 text-white/60 text-sm">{TIPO_LABEL[im.tipo]}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{valor}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{STATUS_LABEL[im.status]}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMut.mutate({ id: im.id, campo: "publicado" })}
                        className={"p-1.5 rounded " + (im.publicado ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/30 hover:bg-white/5")}>
                        {im.publicado ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMut.mutate({ id: im.id, campo: "destaque" })}
                        className={"p-1.5 rounded " + (im.destaque ? "text-[#c9a84c] hover:bg-[#c9a84c]/10" : "text-white/30 hover:bg-white/5")}>
                        {im.destaque ? <Star size={16} /> : <StarOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditItem(im); setModal("edit"); }}
                          className="p-1.5 text-white/40 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm("Excluir?")) deleteMut.mutate(im.id); }}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ImovelModal
          imovel={modal === "edit" ? editItem : undefined}
          onClose={() => { setModal(null); setEditItem(undefined); }}
        />
      )}
    </div>
  );
}
