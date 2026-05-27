// client/src/pages/admin/ImoveisAdminPage.tsx
import { useState }                          from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imoveisAPI, type Imovel }           from "../../services/api";
import toast                                 from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff, Search, X } from "lucide-react";

const CATS = [
  { value: "lancamento", label: "Lançamento",  cls: "text-[#c9a84c] bg-[#c9a84c]/10"       },
  { value: "pronto",     label: "Pronto",      cls: "text-emerald-400 bg-emerald-500/10"    },
  { value: "terceiros",  label: "Terceiros",   cls: "text-blue-400 bg-blue-500/10"          },
  { value: "locacao",    label: "Locação",     cls: "text-purple-400 bg-purple-500/10"      },
];
const TIPOS = ["apartamento","casa","cobertura","sala_comercial","terreno","galpao"];
const TIPO_LABEL: Record<string,string> = { apartamento:"Apartamento", casa:"Casa", cobertura:"Cobertura", sala_comercial:"Sala Comercial", terreno:"Terreno", galpao:"Galpão" };
const STATUS = ["disponivel","reservado","vendido","locado"];
const STATUS_LABEL: Record<string,string> = { disponivel:"Disponível", reservado:"Reservado", vendido:"Vendido", locado:"Locado" };

const EMPTY: Partial<Imovel> = {
  titulo:"", descricao:"", categoria:"pronto", tipo:"apartamento", status:"disponivel",
  endereco:"", bairro:"", cidade:"Balneário Camboriú", estado:"SC",
  destaque: false, publicado: false,
};

function ImovelModal({ imovel, onClose }: { imovel?: Imovel; onClose: () => void }) {
  const qc     = useQueryClient();
  const isEdit = !!imovel;
  const [form, setForm] = useState<any>(isEdit ? { ...imovel } : { ...EMPTY });

  const mut = useMutation({
    mutationFn: (data: any) => isEdit ? imoveisAPI.atualizar(imovel!.id, data) : imoveisAPI.criar(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-imoveis"] }); toast.success(isEdit ? "Atualizado!" : "Cadastrado!"); onClose(); },
    onError:    (e: any) => toast.error(e.response?.data?.error || "Erro ao salvar"),
  });

  const n = (v: any) => v === "" || v === null || v === undefined ? null : Number(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      area_total: n(form.area_total), area_privativa: n(form.area_privativa),
      quartos: n(form.quartos), suites: n(form.suites), banheiros: n(form.banheiros),
      vagas: n(form.vagas), pavimentos: n(form.pavimentos),
      valor_venda: n(form.valor_venda), valor_locacao: n(form.valor_locacao),
      valor_condominio: n(form.valor_condominio),
    });
  };

  const F = ({ name, label, type = "text", req = false }: any) => (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">{label}{req && " *"}</label>
      <input name={name} type={type} required={req}
        value={form[name] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
    </div>
  );

  const S = ({ name, label, opts }: any) => (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">{label}</label>
      <select value={form[name] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded">
        {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-[#111] border border-white/10 rounded-lg w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white text-xl font-light">{isEdit ? "Editar Imóvel" : "Novo Imóvel"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Informações Básicas</p>
            <div className="space-y-4">
              <F name="titulo"   label="Título"   req />
              <div>
                <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descrição *</label>
                <textarea value={form.descricao ?? ""} onChange={e => setForm((f: any) => ({ ...f, descricao: e.target.value }))}
                  required rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <S name="categoria" label="Categoria" opts={CATS.map(c => ({ v: c.value, l: c.label }))} />
                <S name="tipo"      label="Tipo"      opts={TIPOS.map(t => ({ v: t, l: TIPO_LABEL[t] }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <S name="status" label="Status" opts={STATUS.map(s => ({ v: s, l: STATUS_LABEL[s] }))} />
                <F name="bairro" label="Bairro" />
              </div>
              <F name="endereco" label="Endereço" req />
              <div className="grid grid-cols-3 gap-4">
                <F name="cidade" label="Cidade" /><F name="estado" label="Estado" /><F name="cep" label="CEP" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Características</p>
            <div className="grid grid-cols-3 gap-4">
              <F name="area_total"     label="Área Total (m²)"    type="number" />
              <F name="area_privativa" label="Área Privativa (m²)" type="number" />
              <F name="quartos"        label="Quartos"             type="number" />
              <F name="suites"         label="Suítes"              type="number" />
              <F name="banheiros"      label="Banheiros"           type="number" />
              <F name="vagas"          label="Vagas"               type="number" />
            </div>
          </div>

          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Valores</p>
            <div className="grid grid-cols-2 gap-4">
              <F name="valor_venda"     label="Valor Venda (R$)"   type="number" />
              <F name="valor_locacao"   label="Valor Locação (R$)" type="number" />
              <F name="valor_condominio" label="Condomínio (R$)"   type="number" />
            </div>
          </div>

          {form.categoria === "terceiros" && (
            <div>
              <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Parceiro</p>
              <div className="grid grid-cols-2 gap-4">
                <F name="construtora_parceira" label="Construtora" />
                <F name="contato_parceiro"     label="Contato"     />
              </div>
            </div>
          )}

          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Publicação</p>
            <div className="flex gap-6">
              {[{ key: "publicado", label: "Publicado no site" }, { key: "destaque", label: "Destaque" }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form[key]}
                    onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.checked }))}
                    className="accent-[#c9a84c] w-4 h-4" />
                  <span className="text-white/60 text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border border-white/10 text-white/60 text-sm rounded hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={mut.isPending}
              className="px-6 py-2.5 bg-[#c9a84c] text-black font-semibold text-sm rounded hover:bg-[#dbb85e] transition-colors disabled:opacity-50">
              {mut.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-imoveis"] }); toast.success("Excluído!"); },
  });

  const filtered = (data || [])
    .filter((i: Imovel) => filtro === "todos" || i.categoria === filtro)
    .filter((i: Imovel) => !busca || i.titulo.toLowerCase().includes(busca.toLowerCase()) || i.cidade.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Gestão</p>
          <h1 className="text-white text-3xl font-thin">Imóveis</h1>
        </div>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-[#c9a84c] text-black font-semibold text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#dbb85e] transition-colors rounded">
          <Plus size={15} /> Novo Imóvel
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar imóvel..."
            className="w-full bg-white/5 border border-white/10 text-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 rounded" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos", ...CATS.map(c => c.value)].map(c => (
            <button key={c} onClick={() => setFiltro(c)}
              className={`text-xs tracking-widest uppercase px-4 py-2 rounded border transition-all ${
                filtro === c
                  ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                  : "border-white/10 text-white/50 hover:border-[#c9a84c]/40"
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
                {["Imóvel","Categoria","Tipo","Valor","Status","Pub.","Dest.","Ações"].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && <tr><td colSpan={8} className="text-center py-12 text-white/30">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-white/30">Nenhum imóvel encontrado.</td></tr>}
              {filtered.map((im: Imovel) => {
                const cat   = CATS.find(c => c.value === im.categoria);
                const valor = im.valor_venda
                  ? `R$ ${Number(im.valor_venda).toLocaleString("pt-BR")}`
                  : im.valor_locacao
                  ? `R$ ${Number(im.valor_locacao).toLocaleString("pt-BR")}/mês`
                  : "—";
                return (
                  <tr key={im.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-light">{im.titulo}</p>
                      <p className="text-white/40 text-xs">{im.cidade}, {im.estado}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${cat?.cls}`}>{cat?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{TIPO_LABEL[im.tipo]}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{valor}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{STATUS_LABEL[im.status]}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMut.mutate({ id: im.id, campo: "publicado" })}
                        className={`p-1.5 rounded ${im.publicado ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/30 hover:bg-white/5"}`}>
                        {im.publicado ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMut.mutate({ id: im.id, campo: "destaque" })}
                        className={`p-1.5 rounded ${im.destaque ? "text-[#c9a84c] hover:bg-[#c9a84c]/10" : "text-white/30 hover:bg-white/5"}`}>
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
