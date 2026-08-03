import { FolderOpen } from "lucide-react";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no records to display at this time.",
  action = null,
  className = "",
}) {
  return (
    <div className={`py-12 px-4 text-center max-w-sm mx-auto space-y-3 ${className}`}>
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {description && <p className="text-xs text-slate-500 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
