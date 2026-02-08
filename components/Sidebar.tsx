"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  Users, 
  CheckSquare, 
  MessageCircle, 
  BarChart3, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Activity", href: "/", icon: Activity },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Debates", href: "/debates", icon: MessageCircle },
  { name: "Standup", href: "/standup", icon: BarChart3 },
  { name: "Logs", href: "/logs", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden md:flex flex-col bg-[#0A0A0A] border-r border-[rgba(255,255,255,0.06)] transition-all duration-300 ease-out relative z-50"
        style={{ width: isExpanded ? "240px" : "64px" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[rgba(255,255,255,0.06)] relative">
          {!isExpanded ? (
            <div className="text-[#E8DCC8] font-bold text-xl font-mono">MC</div>
          ) : (
            <div className="absolute left-0 right-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="text-[#E8DCC8] font-bold text-sm font-mono tracking-widest">
                  MISSION
                </div>
                <div className="text-[#8A8A8A] font-bold text-xs font-mono tracking-widest">
                  CONTROL
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center h-12 rounded-lg transition-all duration-200",
                    "hover:bg-[rgba(255,255,255,0.03)]",
                    isActive && "bg-[rgba(232,220,200,0.05)]"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E8DCC8] rounded-r" />
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    isExpanded ? "w-14" : "w-full"
                  )}>
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        isActive ? "text-[#E8DCC8]" : "text-[#8A8A8A] group-hover:text-[#F5F5F3]"
                      )}
                    />
                  </div>
                  
                  {/* Label */}
                  {isExpanded && (
                    <div className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isActive ? "text-[#F5F5F3]" : "text-[#8A8A8A]"
                    )}>
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Avatar */}
        <div className="h-20 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-center">
          {!isExpanded ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8DCC8] to-[#C4785B] flex items-center justify-center text-[#0A0A0A] font-bold text-sm">
              H
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8DCC8] to-[#C4785B] flex items-center justify-center text-[#0A0A0A] font-bold text-sm flex-shrink-0">
                H
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#F5F5F3] truncate">Hendrik</div>
                <div className="text-xs text-[#8A8A8A] truncate">Admin</div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical "MISSION CONTROL" text when expanded (Virgil style) */}
        {isExpanded && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="font-mono text-xs text-[#333333] tracking-widest opacity-30"
                 style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
              "MISSION CONTROL"
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.06)] safe-area-inset-bottom">
        <div className="grid grid-cols-6 h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-[#E8DCC8]" : "text-[#8A8A8A]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-mono uppercase tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
