// client/src/pages/admin/LeadsAdminPage.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsAPI, type Lead }                   from "../../services/api";
import { MessageSquare, Phone, Mail, ChevronDown } from "lucide-react";

const STATUS_OPTS = [
  { value: "novo",        label: "Novo",        color: "text-blue-400    bg-blue-500/10    border-blue-500/20"    },
  { value: "contatado",   label: "Contatado",   color: "text-yellow-400  bg-yellow-500/10  border-yellow-500/20"  },
  { value: "qualificado", label: "Qualificado", color: "text-[#c9a84c]   bg-[#c9a84c]/10   border-[#c9a84c]/20"   },
  { value: "convertido",  label: "Convertido",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "perdido",     label: "Perdido",     color: "text-red-400     bg-red-500/10     border-red-500/20"     },
];

function StatusBadge({ status, id }: { status: string; id: number }) {
  const qc  = useQueryClient();
  const cfg = STATUS_OPTS.find(s => s.value === status) || STATUS_OPTS[0];
  const mut = useMutation({
    mutationFn: (s: string) => leadsAPI.atualizarStatus(id, s as Lead["status"]),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });
  return (
    <div className="relative group">
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border cursor-pointer ${cfg.color}`}>
        {cfg.label} <ChevronDown size={10} />
      </span>
      <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded shadow-xl z-10 hidden group-hover:block min-w-32">
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => mut.mutate(o.value)}
            className={`block w-full text-left px-3 py-2 text-xs hover:bg-white/5 ${o.color.split(" ")[0]}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LeadsAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn:  () => leadsAPI.listar().then(r => r.data.data),
  });

  const novos      = (data||[]).filter((l: Lead) => l.status === "novo").length;
  const convertidos= (data||[]).filter((l: Lead) => l.status === "convertido").length;
  const total      = (data||[]).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">CRM</p>
        <h1 className="text-white text-3xl font-thin">Leads</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: total,       color: "text-white"         },
          { label: "Novos",       value: novos,       color: "text-blue-400"      },
          { label: "Convertidos", value: convertidos, color: "text-emerald-400"   },
          { label: "Taxa",        value: total ? `${Math.round(convertidos/total*100)}%` : "0%", color: "text-[#c9a84c]" },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/5 rounded-lg p-5 text-center">
            <p className={`text-2xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Contato","Telefone","Mensagem","Status","Data"].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && <tr><td colSpan={5} className="text-center py-10 text-white/30">Carregando...</td></tr>}
              {!isLoading && (!data||data.length===0) && (
                <tr><td colSpan={5} className="text-center py-16 text-white/30">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  Nenhum lead ainda.
                </td></tr>
              )}
              {(data||[]).map((l: Lead) => (
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{l.nome}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1"><Mail size={10} /> {l.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${l.telefone}`} className="flex items-center gap-1 text-white/60 text-sm hover:text-[#c9a84c] transition-colors">
                      <Phone size={12} /> {l.telefone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs max-w-48 truncate">{l.mensagem || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} id={l.id} /></td>
                  <td className="px-4 py-3 text-white/30 text-xs">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
