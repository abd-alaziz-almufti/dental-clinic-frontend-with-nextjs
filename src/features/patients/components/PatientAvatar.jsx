export function PatientAvatar({ name = "", size = "md" }) {
  const getInitials = (str) => {
    if (!str) return "P";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return str.charAt(0).toUpperCase();
  };

  const colors = [
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-amber-100 text-amber-700 border-amber-200",
  ];

  const charCode = name.charCodeAt(0) || 0;
  const colorClass = colors[charCode % colors.length];

  const sizes = {
    sm: "w-8 h-8 text-xs font-semibold border",
    md: "w-10 h-10 text-sm font-bold border",
    lg: "w-16 h-16 text-xl font-bold border-2",
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 uppercase shadow-xs ${
        sizes[size] || sizes.md
      } ${colorClass}`}
    >
      {getInitials(name)}
    </div>
  );
}
