import React from "react";
import { useNavigate } from "react-router-dom";

export const StatCard = React.memo(function StatCard(props) {
  const { label, value, icon: Icon, color = "emerald", onClick } = props;
  const nav = useNavigate();

  const colorConfig = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200/60",
      shadow: "hover:shadow-emerald-200/50",
      text: "text-emerald-700",
      gradient: "from-emerald-500 to-teal-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200/60",
      shadow: "hover:shadow-blue-200/50",
      text: "text-blue-700",
      gradient: "from-blue-500 to-cyan-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200/60",
      shadow: "hover:shadow-indigo-200/50",
      text: "text-indigo-700",
      gradient: "from-indigo-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200/60",
      shadow: "hover:shadow-amber-200/50",
      text: "text-amber-700",
      gradient: "from-amber-500 to-orange-600",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-200/60",
      shadow: "hover:shadow-violet-200/50",
      text: "text-violet-700",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200/60",
      shadow: "hover:shadow-rose-200/50",
      text: "text-rose-700",
      gradient: "from-rose-500 to-pink-600",
    },
  };

  const config = colorConfig[color] || colorConfig.emerald;
  const hasClick = !!onClick;

  return (
    <button
      onClick={() => nav("/dashboard/detail-overview")}
      role={hasClick ? "button" : undefined}
      tabIndex={hasClick ? 0 : undefined}
      onKeyDown={hasClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`
        ${config.bg} rounded-2xl p-4 sm:p-5 border ${config.border} 
        transition-all duration-300 w-full text-left select-none
        ${
          hasClick
            ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            : ""
        }
        ${config.shadow}
      `}
      style={{ minHeight: "100px" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {label}
          </p>

          <p
            className={`text-base sm:text-lg font-bold mt-1 ${config.text} truncate`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg shadow-slate-200/50 transition-transform`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
    </button>
  );
});
