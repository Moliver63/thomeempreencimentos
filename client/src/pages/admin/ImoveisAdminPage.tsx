// client/src/pages/admin/ImoveisAdminPage.tsx
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imoveisAPI, uploadAPI, type GaleriaImagem, type Imovel } from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  Search, X, Upload, Image, Link as LinkIcon, ArrowUp,
  ArrowDown, Check, Loader2, FileText, ExternalLink
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

const EMPTY = {
  titulo:"", descricao:"", categoria:"pronto", tipo:"apartamento", status:"disponivel",
  endereco:"", bairro:"", cidade:"Balneario Camboriu", estado:"SC", cep:"",
  area_total:"", area_privativa:"", quartos:"", suites:"", banheiros:"", vagas:"", pavimentos:"",
  valor_venda:"", valor_locacao:"", valor_condominio:"", valor_iptu:"",
  construtora_parceira:"", contato_parceiro:"", imagem_capa:"", tabela_precos_url:"",
  destaque: false, publicado: false,
};

type GalleryDraft = {
  url: string;
  alt: string;
  ordem: number;
  capa: boolean;
};

function normalizeGalleryDrafts(items: Array<Partial<GaleriaImagem> | GalleryDraft | null | undefined>): GalleryDraft[] {
  const cleaned = items
    .map((item, index) => {
      const url = String(item?.url || "").trim();
      if (!url) return null;

      return {
        url,
        alt: String(item?.alt || "").trim(),
        ordem: typeof item?.ordem === "number" ? item.ordem : index,
        capa: Boolean(item?.capa),
      } satisfies GalleryDraft;
    })
    .filter((item): item is GalleryDraft => Boolean(item))
    .sort((a, b) => a.ordem - b.ordem);

  const capaIndex = cleaned.findIndex((item) => item.capa);

  return cleaned.map((item, index) => ({
    ...item,
    ordem: index,
    capa: capaIndex >= 0 ? index === capaIndex : index === 0,
  }));
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

// â”€â”€â”€ IMAGE UPLOAD HELPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Converte arquivo para base64 (para preview) ou usa URL externa
function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<"url"|"preview">(value ? "url" : "url");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">{label}</label>

      {/* Preview da imagem atual */}
      {value && (
        <div className="relative mb-3 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded border border-white/10"
            onError={e => { (e.target as HTMLImageElement).src = ""; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {/* URL externa */}
        <div className="flex-1">
          <div className="relative">
            <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="url"
              value={value.startsWith("data:") ? "" : value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://... URL da imagem"
              className="w-full bg-white/5 border border-white/10 text-white pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded"
            />
          </div>
        </div>

        {/* Upload local */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] hover:border-[#c9a84c]/40 text-xs rounded transition-colors"
        >
          <Upload size={13} /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <p className="text-white/25 text-[10px] mt-1">Cole uma URL ou faÃ§a upload de um arquivo local</p>
    </div>
  );
}

// â”€â”€â”€ GALERIA MULTIPLA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GaleriaInput({ fotos, onChange }: { fotos: GalleryDraft[]; onChange: (v: GalleryDraft[]) => void }) {
  const [novaUrl, setNovaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const syncFotos = (items: GalleryDraft[]) => onChange(normalizeGalleryDrafts(items));

  const addUrl = () => {
    const url = novaUrl.trim();
    if (!url) return;

    syncFotos([
      ...fotos,
      { url, alt: "", ordem: fotos.length, capa: fotos.length === 0 },
    ]);
    setNovaUrl("");
  };

  const addFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const base64Images = await Promise.all(files.map(fileToDataUrl));
      let urls = [...base64Images];

      try {
        const response = await uploadAPI.multiple(base64Images, "thome-imoveis/galeria");
        const resultados = response.data.data || [];

        if (resultados.length > 0) {
          urls = resultados.map((item, index) => (item.success && item.url ? item.url : base64Images[index]));
        }

        if (resultados.some((item) => item.success && item.url)) {
          toast.success(`${files.length} foto(s) enviada(s) para a galeria.`);
        } else {
          toast.error("Upload externo indisponivel. As fotos foram mantidas em base64 neste cadastro.");
        }
      } catch {
        toast.error("Upload externo indisponivel. As fotos foram mantidas em base64 neste cadastro.");
      }

      syncFotos([
        ...fotos,
        ...urls.map((url, index) => ({
          url,
          alt: files[index]?.name?.replace(/\.[^.]+$/, "") || "",
          ordem: fotos.length + index,
          capa: false,
        })),
      ]);
    } catch {
      toast.error("Nao foi possivel processar as imagens selecionadas.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const updateFoto = (index: number, patch: Partial<GalleryDraft>) => {
    syncFotos(
      fotos.map((foto, currentIndex) =>
        currentIndex === index ? { ...foto, ...patch } : foto
      )
    );
  };

  const moveFoto = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= fotos.length) return;

    const novasFotos = [...fotos];
    const [item] = novasFotos.splice(index, 1);
    novasFotos.splice(nextIndex, 0, item);
    syncFotos(novasFotos);
  };

  const removeFoto = (index: number) => {
    syncFotos(fotos.filter((_, currentIndex) => currentIndex !== index));
  };

  const definirCapa = (index: number) => {
    syncFotos(
      fotos.map((foto, currentIndex) => ({
        ...foto,
        capa: currentIndex === index,
      }))
    );
  };

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">
        Galeria de Fotos ({fotos.length} foto{fotos.length !== 1 ? "s" : ""})
      </label>

      <div className="flex flex-col gap-2 md:flex-row md:items-center mb-4">
        <input
          type="url"
          value={novaUrl}
          onChange={e => setNovaUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())}
          placeholder="https://... URL da foto"
          className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addUrl}
            className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] text-xs rounded transition-colors"
          >
            + URL
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] hover:border-[#c9a84c]/40 text-xs rounded transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {uploading ? "Enviando..." : "Upload"}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} className="hidden" />
      </div>

      {fotos.length === 0 ? (
        <div className="rounded border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
          <p className="text-white/45 text-sm">Nenhuma foto adicionada ainda.</p>
          <p className="text-white/25 text-xs mt-1">Envie imagens do computador ou cole URLs. Depois voce pode editar legenda, definir capa e reordenar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fotos.map((foto, index) => (
            <div key={`${foto.url}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative w-full lg:w-48 shrink-0 overflow-hidden rounded border border-white/10 bg-black/30">
                  <img
                    src={foto.url}
                    alt={foto.alt || `Foto ${index + 1}`}
                    className="h-40 w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <span className="rounded bg-black/65 px-2 py-1 text-[10px] uppercase tracking-widest text-white/80">
                      {index + 1}
                    </span>
                    {foto.capa && (
                      <span className="rounded bg-[#c9a84c] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
                        Capa da galeria
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-white/40 text-[11px] tracking-widest uppercase mb-1.5">Legenda da foto</label>
                    <input
                      type="text"
                      value={foto.alt}
                      onChange={e => updateFoto(index, { alt: e.target.value })}
                      placeholder={`Ex: ${foto.alt || `Vista da fachada - Foto ${index + 1}`}`}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-white/25 text-[11px] tracking-widest uppercase mb-1.5">URL da imagem</label>
                    <input
                      type="text"
                      value={foto.url}
                      onChange={e => updateFoto(index, { url: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 text-white/60 px-3 py-2.5 text-xs focus:outline-none focus:border-[#c9a84c]/40 rounded"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => definirCapa(index)}
                      className={`inline-flex items-center gap-1.5 rounded border px-3 py-2 text-[11px] tracking-widest uppercase transition-colors ${
                        foto.capa
                          ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                          : "border-white/10 text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                      }`}
                    >
                      <Check size={12} /> {foto.capa ? "Capa ativa" : "Definir capa"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFoto(index, -1)}
                      disabled={index === 0}
                      className="inline-flex items-center gap-1.5 rounded border border-white/10 px-3 py-2 text-[11px] tracking-widest uppercase text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] disabled:opacity-30"
                    >
                      <ArrowUp size={12} /> Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFoto(index, 1)}
                      disabled={index === fotos.length - 1}
                      className="inline-flex items-center gap-1.5 rounded border border-white/10 px-3 py-2 text-[11px] tracking-widest uppercase text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] disabled:opacity-30"
                    >
                      <ArrowDown size={12} /> Descer
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="inline-flex items-center gap-1.5 rounded border border-red-500/20 px-3 py-2 text-[11px] tracking-widest uppercase text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} /> Excluir foto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-white/25 text-[10px] mt-3">A imagem de capa principal continua opcional. Se ela ficar vazia, o sistema usara a foto marcada como capa da galeria na pagina publica.</p>
    </div>
  );
}

// â”€â”€â”€ MODAL PRINCIPAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ImovelModal({ imovel, onClose }: { imovel?: Imovel; onClose: () => void }) {
  const qc     = useQueryClient();
  const isEdit = !!imovel;
  const [form, setForm]   = useState<any>(isEdit ? {
    ...imovel,
    area_total:       imovel.area_total       ?? "",
    area_privativa:   imovel.area_privativa   ?? "",
    quartos:          imovel.quartos          ?? "",
    suites:           imovel.suites           ?? "",
    banheiros:        imovel.banheiros        ?? "",
    vagas:            imovel.vagas            ?? "",
    pavimentos:       imovel.pavimentos       ?? "",
    valor_venda:      imovel.valor_venda      ?? "",
    valor_locacao:    imovel.valor_locacao    ?? "",
    valor_condominio: imovel.valor_condominio ?? "",
    valor_iptu:       imovel.valor_iptu       ?? "",
    imagem_capa:      imovel.imagem_capa      ?? "",
    tabela_precos_url: imovel.tabela_precos_url ?? "",
    construtora_parceira: imovel.construtora_parceira ?? "",
    contato_parceiro:     imovel.contato_parceiro     ?? "",
  } : { ...EMPTY });

  const [fotos, setFotos] = useState<GalleryDraft[]>(
    () => isEdit ? normalizeGalleryDrafts(imovel.galeria ?? []) : []
  );
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [aba,   setAba]   = useState<"info"|"midia"|"valores"|"publicacao">("info");

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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF valido.");
      e.target.value = "";
      return;
    }

    setPdfUploading(true);

    try {
      const dataUrl = await fileToDataUrl(file);

      try {
        const response = await uploadAPI.arquivo(dataUrl, "thome-imoveis/tabelas-precos", file.name);
        setForm((f: any) => ({ ...f, tabela_precos_url: response.data.url }));
        toast.success("PDF da tabela de precos enviado com sucesso.");
      } catch {
        setForm((f: any) => ({ ...f, tabela_precos_url: dataUrl }));
        toast.error("Upload externo indisponivel. O PDF foi mantido em base64 neste cadastro.");
      }
    } catch {
      toast.error("Nao foi possivel ler o PDF selecionado.");
    } finally {
      setPdfUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const galeriaPayload = normalizeGalleryDrafts(fotos).map((foto, index) => ({
      url: foto.url,
      alt: foto.alt || `${form.titulo || "Imovel"} - Foto ${index + 1}`,
      ordem: index,
      capa: foto.capa,
    }));
    const imagemCapa = form.imagem_capa || galeriaPayload.find((foto) => foto.capa)?.url || galeriaPayload[0]?.url || null;

    mut.mutate({
      ...form,
      imagem_capa:     imagemCapa,
      galeria:         galeriaPayload,
      area_total:      n(form.area_total),
      area_privativa:  n(form.area_privativa),
      quartos:         n(form.quartos),
      suites:          n(form.suites),
      banheiros:       n(form.banheiros),
      vagas:           n(form.vagas),
      pavimentos:      n(form.pavimentos),
      valor_venda:     n(form.valor_venda),
      valor_locacao:   n(form.valor_locacao),
      valor_condominio: n(form.valor_condominio),
      valor_iptu:      n(form.valor_iptu),
    });
  };

  const F = ({ name, label, type = "text", req = false, placeholder = "" }: any) => (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">{label}{req && " *"}</label>
      <input name={name} type={type} required={req} placeholder={placeholder}
        value={form[name] ?? ""}
        onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
    </div>
  );

  const S = ({ name, label, opts }: any) => (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">{label}</label>
      <select value={form[name] ?? ""}
        onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded">
        {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  const abas = [
    { id: "info",       label: "Informacoes" },
    { id: "midia",      label: "Fotos"       },
    { id: "valores",    label: "Valores"     },
    { id: "publicacao", label: "Publicacao"  },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-[#111] border border-white/10 rounded-lg w-full max-w-3xl my-8">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white text-xl font-light">{isEdit ? "Editar Imovel" : "Novo Imovel"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-white/5">
          {abas.map(a => (
            <button key={a.id} type="button" onClick={() => setAba(a.id as any)}
              className={`px-5 py-3 text-xs tracking-widest uppercase transition-colors ${
                aba === a.id
                  ? "text-[#c9a84c] border-b-2 border-[#c9a84c]"
                  : "text-white/40 hover:text-white/70"
              }`}>
              {a.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            {/* ABA: INFORMACOES */}
            {aba === "info" && (
              <>
                <F name="titulo"   label="Titulo"   req placeholder="Ex: Residencial Torre Di Bueno" />
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descricao *</label>
                  <textarea value={form.descricao ?? ""}
                    onChange={e => setForm((f: any) => ({ ...f, descricao: e.target.value }))}
                    required rows={4} placeholder="Descreva o imovel..."
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <S name="categoria" label="Categoria" opts={CATS.map(c => ({ v: c.value, l: c.label }))} />
                  <S name="tipo"      label="Tipo"      opts={TIPOS.map(t => ({ v: t, l: TIPO_LABEL[t] }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <S name="status" label="Status" opts={STATUS.map(s => ({ v: s, l: STATUS_LABEL[s] }))} />
                  <F name="bairro" label="Bairro" placeholder="Ex: Centro" />
                </div>
                <F name="endereco" label="Endereco" req placeholder="Ex: Rua 3122, 75" />
                <div className="grid grid-cols-3 gap-4">
                  <F name="cidade" label="Cidade" placeholder="Balneario Camboriu" />
                  <F name="estado" label="Estado" placeholder="SC" />
                  <F name="cep"    label="CEP"    placeholder="88330-000" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <F name="quartos"   label="Quartos"   type="number" placeholder="3" />
                  <F name="suites"    label="Suites"    type="number" placeholder="1" />
                  <F name="banheiros" label="Banheiros" type="number" placeholder="2" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <F name="vagas"          label="Vagas"           type="number" placeholder="2" />
                  <F name="pavimentos"     label="Pavimentos"      type="number" placeholder="27" />
                  <F name="area_privativa" label="Area Privativa m2" type="number" placeholder="85" />
                </div>
                <F name="area_total" label="Area Total m2" type="number" placeholder="120" />
                {form.categoria === "terceiros" && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/3 rounded border border-white/5">
                    <F name="construtora_parceira" label="Construtora Parceira" placeholder="Nome da construtora" />
                    <F name="contato_parceiro"     label="Contato Parceiro"    placeholder="(47) 9999-0000" />
                  </div>
                )}
              </>
            )}

            {/* ABA: FOTOS E MIDIA */}
            {aba === "midia" && (
              <div className="space-y-6">
                <ImageInput
                  label="Imagem de Capa Principal"
                  value={form.imagem_capa ?? ""}
                  onChange={v => setForm((f: any) => ({ ...f, imagem_capa: v }))}
                />
                <div className="border-t border-white/5 pt-6">
                  <GaleriaInput fotos={fotos} onChange={setFotos} />
                </div>
                <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded p-4">
                  <p className="text-[#c9a84c] text-xs font-medium mb-1">Dica sobre imagens</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Envie varias fotos do computador, ajuste a legenda de cada uma, escolha a capa da galeria e reorganize a ordem com os botoes de subir e descer. Quando o upload externo nao estiver disponivel, o sistema mantem a imagem em base64 neste cadastro para nao bloquear a edicao.
                  </p>
                </div>
              </div>
            )}

            {/* ABA: VALORES */}
            {aba === "valores" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <F name="valor_venda"     label="Valor de Venda R$"   type="number" placeholder="1200000" />
                  <F name="valor_locacao"   label="Valor Locacao R$/mes" type="number" placeholder="5000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F name="valor_condominio" label="Condominio R$/mes"  type="number" placeholder="800" />
                  <F name="valor_iptu"       label="IPTU R$/ano"        type="number" placeholder="3600" />
                </div>
                <div className="space-y-3">
                  <F
                    name="tabela_precos_url"
                    label="Tabela de Precos"
                    placeholder="https://... PDF, imagem ou link externo"
                  />

                  <div className="rounded border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-white text-sm font-medium flex items-center gap-2"><FileText size={15} className="text-[#c9a84c]" /> Upload de PDF</p>
                        <p className="text-white/40 text-xs mt-1">Envie a tabela de precos em PDF para preencher automaticamente o link do empreendimento.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => pdfRef.current?.click()}
                          disabled={pdfUploading}
                          className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs tracking-widest uppercase text-white/70 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] disabled:opacity-60"
                        >
                          {pdfUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {pdfUploading ? "Enviando..." : "Upload PDF"}
                        </button>
                        <input ref={pdfRef} type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} className="hidden" />
                        {form.tabela_precos_url && (
                          <>
                            <button
                              type="button"
                              onClick={() => window.open(form.tabela_precos_url, "_blank", "noopener,noreferrer")}
                              className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs tracking-widest uppercase text-white/70 hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                            >
                              <ExternalLink size={13} /> Abrir
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm((f: any) => ({ ...f, tabela_precos_url: "" }))}
                              className="inline-flex items-center gap-2 rounded border border-red-500/20 px-3 py-2 text-xs tracking-widest uppercase text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 size={13} /> Remover
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {form.tabela_precos_url && (
                      <p className="mt-3 break-all text-[11px] text-emerald-400">Arquivo vinculado: {form.tabela_precos_url}</p>
                    )}
                  </div>
                </div>
                <div className="bg-white/3 rounded border border-white/5 p-4 space-y-2">
                  <p className="text-white/30 text-xs">Deixe em branco os valores que nao se aplicam. Para imoveis de locacao, preencha apenas o Valor Locacao.</p>
                  <p className="text-white/30 text-xs">A tabela de precos pode ser um PDF enviado pelo painel, uma imagem ou um link externo. Ela sera exibida na pagina publica do empreendimento.</p>
                </div>
              </>
            )}

            {/* ABA: PUBLICACAO */}
            {aba === "publicacao" && (
              <>
                <div className="space-y-4">
                  {[
                    { key: "publicado", label: "Publicado no site", desc: "O imovel aparece na listagem publica" },
                    { key: "destaque",  label: "Imovel em destaque", desc: "Aparece na secao de destaques da pagina inicial" },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start gap-4 p-4 bg-white/3 rounded border border-white/5 cursor-pointer hover:border-[#c9a84c]/20 transition-colors">
                      <input type="checkbox" checked={!!form[key]}
                        onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.checked }))}
                        className="accent-[#c9a84c] w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Resumo */}
                <div className="bg-[#0d0d0d] rounded border border-white/5 p-4 mt-4">
                  <p className="text-white/40 text-xs tracking-widest uppercase mb-3">Resumo do imovel</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Titulo</span>
                      <span className="text-white truncate max-w-48">{form.titulo || "â€”"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Categoria</span>
                      <span className="text-white">{form.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Cidade</span>
                      <span className="text-white">{form.cidade || "â€”"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Imagem capa</span>
                      <span className={form.imagem_capa ? "text-emerald-400" : "text-yellow-400"}>
                        {form.imagem_capa ? "Configurada" : "Sem imagem"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Fotos galeria</span>
                      <span className="text-white">{fotos.length} foto(s)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 pb-6 pt-4 border-t border-white/5">
            <div className="flex gap-2">
              {abas.map((a, i) => (
                <button key={a.id} type="button"
                  onClick={() => setAba(a.id as any)}
                  className={`w-2 h-2 rounded-full transition-colors ${aba === a.id ? "bg-[#c9a84c]" : "bg-white/20"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-6 py-2.5 border border-white/10 text-white/60 text-sm rounded hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              {aba !== "publicacao" ? (
                <button type="button"
                  onClick={() => {
                    const order = ["info","midia","valores","publicacao"];
                    const next = order[order.indexOf(aba) + 1];
                    if (next) setAba(next as any);
                  }}
                  className="px-6 py-2.5 bg-white/10 text-white text-sm rounded hover:bg-white/20 transition-colors">
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

// â”€â”€â”€ PÃGINA PRINCIPAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    .filter((i: Imovel) => !busca ||
      i.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      i.cidade.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Gestao</p>
          <h1 className="text-white text-3xl font-thin">Imoveis</h1>
        </div>
        <button onClick={() => setModal("new")}
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
          {["todos", ...CATS.map(c => c.value)].map(c => (
            <button key={c} onClick={() => setFiltro(c)}
              className={`text-xs tracking-widest uppercase px-4 py-2 rounded border transition-all ${
                filtro === c ? "border-[#c9a84c] bg-[#c9a84c] text-black" : "border-white/10 text-white/50 hover:border-[#c9a84c]/40"
              }`}>
              {c === "todos" ? "Todos" : CATS.find(cat => cat.value === c)?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Imovel","Categoria","Tipo","Valor","Status","Foto","Pub","Dest","Acoes"].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && <tr><td colSpan={9} className="text-center py-12 text-white/30">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-white/30">Nenhum imovel encontrado.</td></tr>
              )}
              {filtered.map((im: Imovel) => {
                const cat   = CATS.find(c => c.value === im.categoria);
                const valor = im.valor_venda
                  ? "R$ " + Number(im.valor_venda).toLocaleString("pt-BR")
                  : im.valor_locacao
                  ? "R$ " + Number(im.valor_locacao).toLocaleString("pt-BR") + "/mes"
                  : "â€”";
                return (
                  <tr key={im.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {im.imagem_capa ? (
                          <img src={im.imagem_capa} alt="" className="w-10 h-10 object-cover rounded border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center shrink-0">
                            <Image size={14} className="text-white/20" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-light">{im.titulo}</p>
                          <p className="text-white/40 text-xs">{im.cidade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"text-xs px-2 py-1 rounded-full " + (cat?.cls || "")}>{cat?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{TIPO_LABEL[im.tipo]}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{valor}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{STATUS_LABEL[im.status]}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${im.imagem_capa ? "text-emerald-400 bg-emerald-500/10" : "text-white/20 bg-white/5"}`}>
                        {im.imagem_capa ? "Sim" : "Nao"}
                      </span>
                    </td>
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
                          className="p-1.5 text-white/40 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (confirm("Excluir?")) deleteMut.mutate(im.id); }}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded">
                          <Trash2 size={14} />
                        </button>
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
