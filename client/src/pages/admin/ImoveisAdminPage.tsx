// client/src/pages/admin/ImoveisAdminPage.tsx
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imoveisAPI, type Imovel } from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  Search, X, Upload, Image, Link as LinkIcon
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
function GaleriaInput({ fotos, onChange }: { fotos: string[]; onChange: (v: string[]) => void }) {
  const [novaUrl, setNovaUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    if (!novaUrl.trim()) return;
    onChange([...fotos, novaUrl.trim()]);
    setNovaUrl("");
  };

  const addFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const novasFotos = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
            reader.readAsDataURL(file);
          })
      )
    );

    onChange([...fotos, ...novasFotos]);
    e.target.value = "";
  };

  const remove = (i: number) => onChange(fotos.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">
        Galeria de Fotos ({fotos.length} foto{fotos.length !== 1 ? "s" : ""})
      </label>

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {fotos.map((f, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={f} alt={`Foto ${i+1}`}
                className="w-full h-full object-cover rounded border border-white/10"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <button type="button" onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-red-500/80 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 bg-[#c9a84c] text-black text-[8px] px-1.5 py-0.5 rounded font-bold">Capa</span>}
            </div>
          ))}
        </div>
      )}

      {/* Adicionar fotos */}
      <div className="flex gap-2">
        <input
          type="url"
          value={novaUrl}
          onChange={e => setNovaUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())}
          placeholder="https://... URL da foto"
          className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded"
        />
        <button type="button" onClick={addUrl}
          className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] text-xs rounded transition-colors">
          + URL
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#c9a84c] hover:border-[#c9a84c]/40 text-xs rounded transition-colors">
          <Upload size={13} /> Multi fotos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} className="hidden" />
      </div>
      <p className="text-white/25 text-[10px] mt-1">Você pode selecionar várias fotos de uma vez. A primeira foto da galeria vira a capa automática do imóvel quando não houver capa principal definida.</p>
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

  const [fotos, setFotos] = useState<string[]>(
    isEdit ? (imovel.galeria?.map((foto: any) => foto.url).filter(Boolean) ?? []) : []
  );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imagemCapa = form.imagem_capa || fotos[0] || null;
    mut.mutate({
      ...form,
      imagem_capa:     imagemCapa,
      galeria:         fotos,
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
                    Use URLs de servicos como <strong className="text-white/60">Imgur</strong>, <strong className="text-white/60">Cloudinary</strong> ou <strong className="text-white/60">Google Drive</strong> para hospedar as fotos. Ou faca upload direto do seu computador (imagem sera convertida para base64).
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
                <F
                  name="tabela_precos_url"
                  label="Tabela de Precos"
                  placeholder="https://... PDF, imagem ou link externo"
                />
                <div className="bg-white/3 rounded border border-white/5 p-4 space-y-2">
                  <p className="text-white/30 text-xs">Deixe em branco os valores que nao se aplicam. Para imoveis de locacao, preencha apenas o Valor Locacao.</p>
                  <p className="text-white/30 text-xs">A tabela de precos pode ser um PDF, uma imagem ou um link externo. Ela sera exibida na pagina publica do empreendimento.</p>
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
