import { Card } from "@/components/ui/Card";

export function KpiCard({ title, value, icon: Icon, trend, color = "teal" }) {
  const colorMap = {
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <Card className="p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </h3>
        {trend && (
          <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span>↑ {trend}</span>
            <span className="text-slate-400 font-normal">vs last week</span>
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
          colorMap[color] || colorMap.teal
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  );
}
