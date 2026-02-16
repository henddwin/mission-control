"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase, CRMContact } from "@/lib/supabase";
import {
  Loader2, Search, Users, Mail, Building2, MapPin, ExternalLink,
  Calendar, TrendingUp, MessageSquare, Star, X, ChevronDown,
  ArrowUpDown, Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Status config ─── */
const STATUSES = ['conversation', 'contacted', 'connected', 'new', 'qualified', 'proposal', 'client', 'lost', 'nurture'] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:          { label: 'New',          color: 'bg-gray-500',   bg: 'bg-gray-500/15 text-gray-300' },
  contacted:    { label: 'DM Sent',      color: 'bg-blue-500',   bg: 'bg-blue-500/15 text-blue-300' },
  connected:    { label: 'Connected',    color: 'bg-cyan-500',   bg: 'bg-cyan-500/15 text-cyan-300' },
  conversation: { label: 'Replied',      color: 'bg-green-500',  bg: 'bg-green-500/15 text-green-300' },
  qualified:    { label: 'Qualified',    color: 'bg-yellow-500', bg: 'bg-yellow-500/15 text-yellow-300' },
  proposal:     { label: 'Proposal',     color: 'bg-orange-500', bg: 'bg-orange-500/15 text-orange-300' },
  client:       { label: 'Client',       color: 'bg-emerald-500',bg: 'bg-emerald-500/15 text-emerald-300' },
  lost:         { label: 'Lost',         color: 'bg-red-500',    bg: 'bg-red-500/15 text-red-300' },
  nurture:      { label: 'Nurture',      color: 'bg-pink-500',   bg: 'bg-pink-500/15 text-pink-300' },
};

/* ─── Tier config ─── */
const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  tier_A: { label: 'Tier A', color: 'text-yellow-400', bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  tier_B: { label: 'Tier B', color: 'text-slate-300',  bg: 'bg-slate-400/15 text-slate-300 border-slate-400/30' },
  tier_C: { label: 'Tier C', color: 'text-orange-400', bg: 'bg-orange-400/15 text-orange-300 border-orange-400/30' },
  tier_D: { label: 'Tier D', color: 'text-stone-500',  bg: 'bg-stone-500/15 text-stone-400 border-stone-500/30' },
};

const SPECIAL_TAGS: Record<string, { label: string; bg: string }> = {
  dm1_sent:  { label: 'DM Sent',  bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  replied:   { label: 'Replied',  bg: 'bg-green-500/15 text-green-300 border-green-500/30' },
  has_email: { label: 'Has Email',bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
};

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EaRV5UH8IcvQ4g3S10U_gR2SMzaxP4aYqoh1rU0bHvs/edit";

type SortBy = 'score' | 'name' | 'last_contacted' | 'company' | 'updated';
type FilterMode = 'include' | 'exclude';

export default function CRMPage() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterTiers, setFilterTiers] = useState<string[]>([]);
  const [filterSpecialTags, setFilterSpecialTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 120000);
    return () => clearInterval(interval);
  }, []);

  // Close company dropdown on outside click
  useEffect(() => {
    const handler = () => setShowCompanyDropdown(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  async function loadContacts() {
    try {
      // Supabase default limit is 1000 — fetch all with pagination
      let allData: CRMContact[] = [];
      let from = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from('crm_contacts')
          .select('*')
          .range(from, from + batchSize - 1)
          .order('lead_score', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = [...allData, ...data];
        if (data.length < batchSize) break;
        from += batchSize;
      }

      setContacts(allData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Computed stats ─── */
  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    STATUSES.forEach(s => { statusCounts[s] = 0; });
    
    const tierCounts: Record<string, number> = { tier_A: 0, tier_B: 0, tier_C: 0, tier_D: 0 };
    let withEmail = 0;
    let replied = 0;
    let dmSent = 0;

    contacts.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      const tags = c.tags || [];
      if (tags.includes('tier_A')) tierCounts.tier_A++;
      if (tags.includes('tier_B')) tierCounts.tier_B++;
      if (tags.includes('tier_C')) tierCounts.tier_C++;
      if (tags.includes('tier_D')) tierCounts.tier_D++;
      if (c.email) withEmail++;
      if (tags.includes('replied')) replied++;
      if (tags.includes('dm1_sent')) dmSent++;
    });

    return { statusCounts, tierCounts, withEmail, replied, dmSent };
  }, [contacts]);

  /* ─── All companies ─── */
  const allCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.company) counts[c.company] = (counts[c.company] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  const topCompanies = allCompanies.filter(([_, count]) => count >= 2).slice(0, 30);

  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return allCompanies.slice(0, 50);
    const q = companySearch.toLowerCase();
    return allCompanies.filter(([name]) => name.toLowerCase().includes(q)).slice(0, 50);
  }, [allCompanies, companySearch]);

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    return contacts.filter(c => {
      // Status filter (OR logic — show if matches ANY selected status)
      if (filterStatuses.length > 0 && !filterStatuses.includes(c.status)) return false;
      
      // Tier filter (OR logic)
      if (filterTiers.length > 0) {
        const tags = c.tags || [];
        if (!filterTiers.some(tier => tags.includes(tier))) return false;
      }

      // Special tag filter (AND logic — must have ALL selected)
      if (filterSpecialTags.length > 0) {
        const tags = c.tags || [];
        if (!filterSpecialTags.every(tag => tags.includes(tag))) return false;
      }

      // Exclude tags (NOT logic)
      if (excludeTags.length > 0) {
        const tags = c.tags || [];
        if (excludeTags.some(tag => tags.includes(tag))) return false;
      }

      // Company filter
      if (filterCompany) {
        if (!c.company || c.company.toLowerCase() !== filterCompany.toLowerCase()) return false;
      }

      // Text search
      if (search) {
        const q = search.toLowerCase();
        const match = (
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          (c.company || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.notes || '').toLowerCase().includes(q)
        );
        if (!match) return false;
      }

      return true;
    });
  }, [contacts, filterStatuses, filterTiers, filterSpecialTags, excludeTags, filterCompany, search]);

  /* ─── Sorting ─── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score': return (b.lead_score || 0) - (a.lead_score || 0);
        case 'name': return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'company': return (a.company || 'zzz').localeCompare(b.company || 'zzz');
        case 'last_contacted':
          return (b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0) - 
                 (a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0);
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default: return 0;
      }
    });
  }, [filtered, sortBy]);

  /* ─── Helpers ─── */
  const toggleInArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const activeFilterCount = filterStatuses.length + filterTiers.length + filterSpecialTags.length + excludeTags.length + (filterCompany ? 1 : 0);

  const clearAllFilters = () => {
    setFilterStatuses([]);
    setFilterTiers([]);
    setFilterSpecialTags([]);
    setExcludeTags([]);
    setFilterCompany('');
  };

  const tierForContact = (c: CRMContact) => {
    const tags = c.tags || [];
    if (tags.includes('tier_A')) return 'A';
    if (tags.includes('tier_B')) return 'B';
    if (tags.includes('tier_C')) return 'C';
    if (tags.includes('tier_D')) return 'D';
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-20 md:mb-0">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="virgil-label text-[#8A8A8A] mb-1">CRM</h1>
          <p className="text-xs text-[#8A8A8A]">
            {contacts.length} contacts synced from LinkedIn
          </p>
        </div>
        <a
          href={GOOGLE_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-xs text-[#8A8A8A] hover:text-[#E8DCC8] hover:border-[#E8DCC8]/30 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Sheet
        </a>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <StatCard label="TOTAL" value={contacts.length} />
        <StatCard label="TIER A" value={stats.tierCounts.tier_A} valueColor="text-yellow-400" onClick={() => setFilterTiers(toggleInArray(filterTiers, 'tier_A'))} active={filterTiers.includes('tier_A')} />
        <StatCard label="TIER B" value={stats.tierCounts.tier_B} valueColor="text-slate-300" onClick={() => setFilterTiers(toggleInArray(filterTiers, 'tier_B'))} active={filterTiers.includes('tier_B')} />
        <StatCard label="TIER C" value={stats.tierCounts.tier_C} valueColor="text-orange-400" onClick={() => setFilterTiers(toggleInArray(filterTiers, 'tier_C'))} active={filterTiers.includes('tier_C')} />
        <StatCard label="TIER D" value={stats.tierCounts.tier_D} valueColor="text-stone-500" onClick={() => setFilterTiers(toggleInArray(filterTiers, 'tier_D'))} active={filterTiers.includes('tier_D')} />
        <StatCard label="DM SENT" value={stats.dmSent} valueColor="text-blue-400" onClick={() => setFilterSpecialTags(toggleInArray(filterSpecialTags, 'dm1_sent'))} active={filterSpecialTags.includes('dm1_sent')} />
        <StatCard label="REPLIED" value={stats.replied} valueColor="text-green-400" onClick={() => setFilterSpecialTags(toggleInArray(filterSpecialTags, 'replied'))} active={filterSpecialTags.includes('replied')} />
      </div>

      {/* ─── Pipeline + Filters ─── */}
      <div className="premium-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="mono-small">STATUS</div>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-[10px] text-[#E8DCC8] hover:underline">
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>
        
        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {STATUSES.map(s => {
            const count = stats.statusCounts[s] || 0;
            if (count === 0) return null;
            const active = filterStatuses.includes(s);
            return (
              <button
                key={s}
                onClick={() => setFilterStatuses(toggleInArray(filterStatuses, s))}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                  active
                    ? `${STATUS_CONFIG[s].color} text-white border-transparent`
                    : 'bg-[#1a1a1a] text-[#8A8A8A] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                )}
              >
                {STATUS_CONFIG[s].label} <span className="opacity-60 ml-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tier pills */}
        <div className="mono-small mb-2">TIERS</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(TIER_CONFIG).map(([key, cfg]) => {
            const count = stats.tierCounts[key] || 0;
            const active = filterTiers.includes(key);
            return (
              <button
                key={key}
                onClick={() => setFilterTiers(toggleInArray(filterTiers, key))}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                  active ? `${cfg.bg} border-current` : 'bg-[#1a1a1a] text-[#8A8A8A] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                )}
              >
                {cfg.label} <span className="opacity-60 ml-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Special tags */}
        <div className="mono-small mb-2">TAGS</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(SPECIAL_TAGS).map(([key, cfg]) => {
            const active = filterSpecialTags.includes(key);
            const excluded = excludeTags.includes(key);
            const count = key === 'has_email' ? stats.withEmail : key === 'replied' ? stats.replied : stats.dmSent;
            return (
              <div key={key} className="flex items-center gap-0.5">
                <button
                  onClick={() => {
                    if (excluded) setExcludeTags(excludeTags.filter(t => t !== key));
                    setFilterSpecialTags(toggleInArray(filterSpecialTags, key));
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-l-md text-xs font-medium transition-all border border-r-0",
                    active ? `${cfg.bg} border-current` : 'bg-[#1a1a1a] text-[#8A8A8A] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                  )}
                >
                  {cfg.label} <span className="opacity-60 ml-1">{count}</span>
                </button>
                <button
                  onClick={() => {
                    if (active) setFilterSpecialTags(filterSpecialTags.filter(t => t !== key));
                    setExcludeTags(toggleInArray(excludeTags, key));
                  }}
                  className={cn(
                    "px-1.5 py-1 rounded-r-md text-xs font-medium transition-all border",
                    excluded ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-[#1a1a1a] text-[#555] border-[rgba(255,255,255,0.06)] hover:text-red-400 hover:border-red-500/30'
                  )}
                  title={`Exclude ${cfg.label}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Company filter */}
        <div className="mono-small mb-2">COMPANY</div>
        {/* Top company pills */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {topCompanies.slice(0, 20).map(([company, count]) => (
            <button
              key={company}
              onClick={() => setFilterCompany(filterCompany === company ? '' : company)}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all border",
                filterCompany === company
                  ? 'bg-[#E8DCC8]/15 text-[#E8DCC8] border-[#E8DCC8]/30'
                  : 'bg-[#1a1a1a] text-[#666] border-[rgba(255,255,255,0.06)] hover:text-[#999]'
              )}
            >
              {company} <span className="opacity-50">{count}</span>
            </button>
          ))}
        </div>
        {/* Searchable company dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555]" />
              <input
                type="text"
                placeholder="Search all companies..."
                value={companySearch}
                onChange={(e) => { setCompanySearch(e.target.value); setShowCompanyDropdown(true); }}
                onFocus={() => setShowCompanyDropdown(true)}
                className="w-full pl-7 pr-3 py-1 rounded-md bg-[#0e0e0e] border border-[rgba(255,255,255,0.08)] text-[11px] text-[#F5F5F3] placeholder:text-[#444] focus:outline-none focus:border-[#E8DCC8]/40"
              />
            </div>
            {filterCompany && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#E8DCC8]/15 text-[#E8DCC8] text-xs border border-[#E8DCC8]/30">
                {filterCompany}
                <button onClick={() => setFilterCompany('')} className="hover:text-white">✕</button>
              </span>
            )}
          </div>
          {showCompanyDropdown && companySearch && (
            <div
              className="absolute mt-1 left-0 w-full max-w-xs rounded-lg max-h-52 overflow-y-auto"
              style={{ zIndex: 9999, backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}
            >
              {filteredCompanies.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: 12, color: '#555', backgroundColor: '#141414' }}>No companies match</div>
              ) : (
                filteredCompanies.map(([company, count]) => (
                  <button
                    key={company}
                    onClick={() => { setFilterCompany(company); setCompanySearch(''); setShowCompanyDropdown(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 12,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: filterCompany === company ? '#1e1e1a' : '#141414',
                      color: filterCompany === company ? '#E8DCC8' : '#aaa',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1c1c1c'; e.currentTarget.style.color = '#E8DCC8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = filterCompany === company ? '#1e1e1a' : '#141414'; e.currentTarget.style.color = filterCompany === company ? '#E8DCC8' : '#aaa'; }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company}</span>
                    <span style={{ color: '#555', marginLeft: 8, flexShrink: 0 }}>{count}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Search + Sort + View ─── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search name, company, title, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] placeholder:text-[#555] focus:outline-none focus:border-[#E8DCC8]/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-xs text-[#F5F5F3] focus:outline-none"
        >
          <option value="score">Score ↓</option>
          <option value="name">Name A-Z</option>
          <option value="company">Company</option>
          <option value="last_contacted">Last Contact</option>
          <option value="updated">Updated</option>
        </select>
        <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
          <button onClick={() => setViewMode('list')} className={cn("px-3 py-2 text-xs font-mono", viewMode === 'list' ? 'bg-[#E8DCC8] text-[#0A0A0A]' : 'bg-[#111111] text-[#8A8A8A]')}>
            LIST
          </button>
          <button onClick={() => setViewMode('board')} className={cn("px-3 py-2 text-xs font-mono", viewMode === 'board' ? 'bg-[#E8DCC8] text-[#0A0A0A]' : 'bg-[#111111] text-[#8A8A8A]')}>
            BOARD
          </button>
        </div>
      </div>

      {/* ─── Results count ─── */}
      <div className="text-xs text-[#666]">
        Showing {sorted.length} of {contacts.length} contacts
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
      </div>

      {/* ─── List View ─── */}
      {viewMode === 'list' && (
        <div className="space-y-1.5">
          {sorted.length === 0 ? (
            <div className="premium-card p-12 text-center text-[#8A8A8A]">No contacts match your filters</div>
          ) : (
            sorted.map(contact => {
              const tier = tierForContact(contact);
              const tags = contact.tags || [];
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="premium-card p-3 cursor-pointer hover:border-[#E8DCC8]/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar + Score */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                        tier === 'A' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                        tier === 'B' ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30' :
                        'bg-[#1a1a1a] text-[#E8DCC8] border border-[rgba(255,255,255,0.06)]'
                      )}>
                        {contact.first_name?.[0]}{contact.last_name?.[0]}
                      </div>
                      {(contact.lead_score || 0) > 0 && (
                        <div className={cn(
                          "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                          (contact.lead_score || 0) >= 50 ? 'bg-yellow-500 text-black' :
                          (contact.lead_score || 0) >= 30 ? 'bg-slate-400 text-black' :
                          'bg-[#333] text-[#999]'
                        )}>
                          {contact.lead_score}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm text-[#F5F5F3] font-medium">{contact.first_name} {contact.last_name}</span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono uppercase", STATUS_CONFIG[contact.status]?.bg || 'bg-gray-500/15 text-gray-300')}>
                          {STATUS_CONFIG[contact.status]?.label || contact.status}
                        </span>
                        {tier && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-mono border", TIER_CONFIG[`tier_${tier}`]?.bg)}>
                            {tier}
                          </span>
                        )}
                        {tags.includes('dm1_sent') && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/15 text-blue-300">DM</span>
                        )}
                        {tags.includes('replied') && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-green-500/15 text-green-300">💬</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#666] mt-0.5">
                        {contact.title && <span className="truncate max-w-[180px]">{contact.title}</span>}
                        {contact.company && (
                          <span className="flex items-center gap-0.5 text-[#888]">
                            <Building2 className="w-2.5 h-2.5" />{contact.company}
                          </span>
                        )}
                        {contact.location && (
                          <span className="hidden sm:flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{contact.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {contact.email && <Mail className="w-3.5 h-3.5 text-purple-400" />}
                      {contact.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── Board View ─── */}
      {viewMode === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STATUSES.map(status => {
              const items = sorted.filter(c => c.status === status);
              if (items.length === 0) return null;
              return (
                <div key={status} className="w-64 flex-shrink-0">
                  <div className="mb-2 flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[status].color)} />
                    <span className="mono-small">{STATUS_CONFIG[status].label}</span>
                    <span className="text-[10px] text-[#555]">{items.length}</span>
                  </div>
                  <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                    {items.map(contact => {
                      const tier = tierForContact(contact);
                      return (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedContact(contact)}
                          className="premium-card p-2.5 cursor-pointer hover:border-[#E8DCC8]/20"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-[#F5F5F3] truncate">
                                {contact.first_name} {contact.last_name}
                              </div>
                              {contact.company && <div className="text-[10px] text-[#888] truncate">{contact.company}</div>}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {tier && (
                                <span className={cn("w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold", TIER_CONFIG[`tier_${tier}`]?.bg)}>
                                  {tier}
                                </span>
                              )}
                              {(contact.lead_score || 0) > 0 && (
                                <span className="text-[10px] font-mono text-[#888]">{contact.lead_score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedContact(null)}>
          <div className="glass-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, valueColor, onClick, active }: {
  label: string; value: number; valueColor?: string; onClick?: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "premium-card p-3 text-left transition-all",
        onClick && "cursor-pointer hover:border-[#E8DCC8]/20",
        active && "border-[#E8DCC8]/40 bg-[#E8DCC8]/5"
      )}
    >
      <div className="mono-small text-[10px] mb-0.5">{label}</div>
      <div className={cn("text-xl font-bold", valueColor || 'text-[#E8DCC8]')}>{value}</div>
    </button>
  );
}

/* ─── Contact Detail ─── */
function ContactDetail({ contact, onClose }: { contact: CRMContact; onClose: () => void }) {
  const tier = (() => {
    const tags = contact.tags || [];
    if (tags.includes('tier_A')) return 'A';
    if (tags.includes('tier_B')) return 'B';
    if (tags.includes('tier_C')) return 'C';
    if (tags.includes('tier_D')) return 'D';
    return null;
  })();

  const tags = contact.tags || [];

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold",
              tier === 'A' ? 'bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30' :
              tier === 'B' ? 'bg-slate-400/10 text-slate-300 border-2 border-slate-400/30' :
              'bg-[#1a1a1a] text-[#E8DCC8] border-2 border-[rgba(255,255,255,0.06)]'
            )}>
              {contact.first_name?.[0]}{contact.last_name?.[0]}
            </div>
            {(contact.lead_score || 0) > 0 && (
              <div className={cn(
                "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-[#0A0A0A]",
                (contact.lead_score || 0) >= 50 ? 'bg-yellow-500 text-black' :
                (contact.lead_score || 0) >= 30 ? 'bg-slate-400 text-black' :
                'bg-[#333] text-[#999]'
              )}>
                {contact.lead_score}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F5F5F3]">{contact.first_name} {contact.last_name}</h2>
            {contact.title && <p className="text-sm text-[#8A8A8A]">{contact.title}</p>}
            {contact.company && <p className="text-sm text-[#E8DCC8]">{contact.company}</p>}
          </div>
        </div>
        <button onClick={onClose} className="text-[#555] hover:text-[#F5F5F3] text-xl p-1">✕</button>
      </div>

      {/* Status + Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <span className={cn("px-2.5 py-1 rounded-md text-xs font-mono uppercase", STATUS_CONFIG[contact.status]?.bg)}>
          {STATUS_CONFIG[contact.status]?.label}
        </span>
        {tier && (
          <span className={cn("px-2.5 py-1 rounded-md text-xs font-mono border", TIER_CONFIG[`tier_${tier}`]?.bg)}>
            Tier {tier}
          </span>
        )}
        {tags.includes('dm1_sent') && <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-blue-500/15 text-blue-300">DM Sent</span>}
        {tags.includes('replied') && <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-green-500/15 text-green-300">Replied ✓</span>}
        {tags.includes('has_email') && <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/15 text-purple-300">Has Email</span>}
      </div>

      {/* Contact info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {contact.location && (
          <div className="premium-card p-3">
            <div className="mono-small text-[10px] mb-1">LOCATION</div>
            <div className="text-sm text-[#F5F5F3] flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#666]" />{contact.location}</div>
          </div>
        )}
        {contact.email && (
          <div className="premium-card p-3">
            <div className="mono-small text-[10px] mb-1">EMAIL</div>
            <a href={`mailto:${contact.email}`} className="text-sm text-purple-400 font-mono hover:underline">{contact.email}</a>
          </div>
        )}
        {contact.linkedin_url && (
          <div className="premium-card p-3">
            <div className="mono-small text-[10px] mb-1">LINKEDIN</div>
            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0077B5] hover:underline flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5" /> View Profile
            </a>
          </div>
        )}
        {contact.source && (
          <div className="premium-card p-3">
            <div className="mono-small text-[10px] mb-1">SOURCE</div>
            <div className="text-sm text-[#F5F5F3] capitalize">{contact.source}</div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {(contact.last_contacted_at || contact.last_response_at || contact.next_followup_at) && (
        <div className="premium-card p-4 mb-5">
          <div className="mono-small text-[10px] mb-3">TIMELINE</div>
          <div className="space-y-2">
            {contact.last_contacted_at && (
              <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-[#666]">Last contacted</span>
                <span className="text-[#F5F5F3]">{new Date(contact.last_contacted_at).toLocaleDateString('nl-BE')}</span>
              </div>
            )}
            {contact.last_response_at && (
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-[#666]">Last response</span>
                <span className="text-green-400">{new Date(contact.last_response_at).toLocaleDateString('nl-BE')}</span>
              </div>
            )}
            {contact.next_followup_at && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-[#E8DCC8]" />
                <span className="text-[#666]">Next follow-up</span>
                <span className="text-[#E8DCC8]">{new Date(contact.next_followup_at).toLocaleDateString('nl-BE')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
        <div className="premium-card p-4">
          <div className="mono-small text-[10px] mb-3">NOTES</div>
          <div className="text-sm text-[#999] whitespace-pre-wrap leading-relaxed bg-[#0A0A0A] rounded-lg p-3 border border-[rgba(255,255,255,0.04)]">
            {contact.notes}
          </div>
        </div>
      )}
    </>
  );
}
