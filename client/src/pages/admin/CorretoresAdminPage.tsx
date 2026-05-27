// client/src/pages/admin/CorretoresAdminPage.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosAPI, type Corretor }            from "../../services/api";
import toast                                     from "react-hot-toast";
import { UserCheck, UserX, Shield, Trash2, Users } from "lucide-react";

export function CorretoresAdminPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-corretores"],
    queryFn:  () => usuariosAPI.corretores().then(r => r.data.data),
  });

  const toggleAtivo = useMutation({
    mutationFn: (id: number) => usuariosAPI.toggleAtivo(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-corretores"] }); toast.success("Status atualizado!"); },
  });

  const promover = useMutation({
    mutationFn: ({ id, role }: any) => usuariosAPI.mudarRole(id, role),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-corretores"] }); toast.success("Role atualizado!"); },
  });

  const excluir = useMutation({
    mutationFn: (id: number) => usuariosAPI.excluir(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin-corretores"] }); toast.success("Removido!"); },
  });

  const ativos   = (data||[]).filter((c: Corretor) => c.ativo).length;
  const inativos = (data||[]).filter((c: Corretor) => !c.ativo).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Gestão</p>
        <h1 className="text-white text-3xl font-thin">Corretores</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",     value: (data||[]).length, color: "text-white"       },
          { label: "Ativos",    value: ativos,            color: "text-emerald-400" },
          { label: "Pendentes", value: inativos,          color: "text-yellow-400"  },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/5 rounded-lg p-5 text-center">
            <p className={`text-2xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-white font-light">Lista de Corretores</h2>
          <p className="text-white/30 text-xs mt-1">Corretores que solicitaram acesso</p>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading && <p className="text-white/30 text-sm p-6">Carregando...</p>}
          {!isLoading && (!data || data.length === 0) && (
            <div className="flex flex-col items-center py-16 text-white/20">
              <Users size={40} className="mb-3" />
              <p>Nenhum corretor cadastrado</p>
            </div>
          )}
          {(data||[]).map((c: Corretor) => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
              {c.avatar_url
                ? <img src={c.avatar_url} className="w-10 h-10 rounded-full" alt={c.nome} />
                : <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] font-bold">
                    {c.nome[0]}
                  </div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-light">{c.nome}</p>
                  {c.role === "admin" && (
                    <span className="text-[9px] tracking-widest uppercase bg-[#c9a84c]/10 text-[#c9a84c] px-2 py-0.5 rounded-full border border-[#c9a84c]/20">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs">{c.email}</p>
                {c.creci && <p className="text-white/30 text-xs">CRECI: {c.creci}</p>}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border ${
                c.ativo
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
              }`}>
                {c.ativo ? "Ativo" : "Pendente"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleAtivo.mutate(c.id)} title={c.ativo ? "Desativar" : "Ativar"}
                  className={`p-2 rounded transition-colors ${c.ativo ? "text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10" : "text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10"}`}>
                  {c.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                </button>
                {c.role !== "admin" && (
                  <button onClick={() => { if (confirm(`Promover ${c.nome} a admin?`)) promover.mutate({ id: c.id, role: "admin" }); }}
                    title="Promover a Admin"
                    className="p-2 rounded text-white/40 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors">
                    <Shield size={15} />
                  </button>
                )}
                <button onClick={() => { if (confirm(`Excluir ${c.nome}?`)) excluir.mutate(c.id); }}
                  className="p-2 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
