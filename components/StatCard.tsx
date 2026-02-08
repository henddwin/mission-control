"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  gradient?: "cream" | "terracotta" | "success" | "warning";
}

const gradientClasses = {
  cream: "gradient-cream border-[#E8DCC8]/20",
  terracotta: "gradient-terracotta border-[#C4785B]/20",
  success: "gradient-success border-[#4ADE80]/20",
  warning: "from-[#F59E0B]/10 to-transparent border-[#F59E0B]/20",
};

export function StatCard({ label, value, trend, trendValue, gradient = "cream" }: StatCardProps) {
  return (
    <div className={cn(
      "premium-card p-6 relative overflow-hidden",
      gradientClasses[gradient]
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className={cn(
          "w-full h-full",
          gradient === "cream" && "bg-gradient-to-br from-[#E8DCC8]/5 to-transparent",
          gradient === "terracotta" && "bg-gradient-to-br from-[#C4785B]/5 to-transparent",
          gradient === "success" && "bg-gradient-to-br from-[#4ADE80]/5 to-transparent",
          gradient === "warning" && "bg-gradient-to-br from-[#F59E0B]/5 to-transparent"
        )} />
      </div>

      <div className="relative">
        {/* Value */}
        <div className="text-4xl md:text-5xl font-bold text-[#F5F5F3] mb-3 tracking-tight">
          {value}
        </div>

        {/* Label */}
        <div className="mono-small mb-2">
          {label}
        </div>

        {/* Trend */}
        {trend && trendValue && (
          <div className="flex items-center gap-1.5">
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#4ADE80]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
            )}
            <span className={cn(
              "text-xs font-mono",
              trend === "up" ? "text-[#4ADE80]" : "text-[#EF4444]"
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
