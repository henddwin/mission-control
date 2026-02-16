"use client";

import { useEffect, useState } from "react";
import { supabase, CRMContact } from "@/lib/supabase";
import { Loader2, Search, Users, Mail, Building2, MapPin, ExternalLink, Phone, Calendar, TrendingUp, Tag, MessageSquare, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUSES = ['new', 'contacted', 'connected', 'conversation', 'qualified', 'proposal', 'client', 'lost', 'nurture'] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-gray-500' },
  contacted: { label: 'Contacted', color: 'bg-blue-500' },
  connected: { label: 'Connected', color: 'bg-cyan-500' },
  conversation: { label: 'Conversation', color: 'bg-purple-500' },
  qualified: { label: 'Qualified', color: 'bg-yellow-500' },
  proposal: { label: 'Proposal', color: 'bg-orange-500' },
  client: { label: 'Client', color: 'bg-green-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
  nurture: { label: 'Nurture', color: 'bg-pink-500' },
};

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EaRV5UH8IcvQ4g3S10U_gR2SMzaxP4aYqoh1rU0bHvs/edit";

type SortBy = 'score' | 'name' | 'last_contacted' | 'status' | 'updated';

export default function CRMPage() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [sortBy, setSortBy] = useState<SortBy>('score');

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      contacts.flatMap(c => c.tags || [])
    )
  ).sort();

  const filtered = contacts.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterTags.length > 0) {
      const hasAllTags = filterTags.every(tag => (c.tags || []).includes(tag));
      if (!hasAllTags) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.lead_score || 0) - (a.lead_score || 0);
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'last_contacted':
        const aDate = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
        const bDate = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
        return bDate - aDate;
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default:
        return 0;
    }
  });

  const statusCounts = STATUSES.map(s => ({
    status: s,
    count: contacts.filter(c => c.status === s).length,
  }));

  const tierCounts = {
    A: contacts.filter(c => (c.tags || []).includes('tier_A')).length,
    B: contacts.filter(c => (c.tags || []).includes('tier_B')).length,
    C: contacts.filter(c => (c.tags || []).includes('tier_C')).length,
    D: contacts.filter(c => (c.tags || []).includes('tier_D')).length,
  };

  const repliedCount = contacts.filter(c => (c.tags || []).includes('replied')).length;
  const withEmail = contacts.filter(c => c.email).length;

  const toggleTag = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="virgil-label text-[#8A8A8A] mb-2">CRM</h1>
          <p className="text-sm text-[#8A8A8A]">
            {contacts.length} leads from LinkedIn
          </p>
        </div>
        <a
          href={GOOGLE_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#8A8A8A] hover:text-[#E8DCC8] hover:border-[#E8DCC8]/30 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Sheet
        </a>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#8A8A8A]" />
            <div className="mono-small">TOTAL</div>
          </div>
          <div className="text-2xl font-bold text-[#E8DCC8]">{contacts.length}</div>
        </div>
        
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-[#4ADE80]" />
            <div className="mono-small">REPLIED</div>
          </div>
          <div className="text-2xl font-bold text-[#4ADE80]">{repliedCount}</div>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-[#C4785B]" />
            <div className="mono-small">EMAILS</div>
          </div>
          <div className="text-2xl font-bold text-[#C4785B]">{withEmail}</div>
        </div>

        <div className="premium-card p-4">
          <div className="mono-small mb-1">TIER A</div>
          <div className="text-2xl font-bold text-[#FFD700]">{tierCounts.A}</div>
        </div>

        <div className="premium-card p-4">
          <div className="mono-small mb-1">TIER B</div>
          <div className="text-2xl font-bold text-[#C0C0C0]">{tierCounts.B}</div>
        </div>

        <div className="premium-card p-4">
          <div className="mono-small mb-1">TIER C/D</div>
          <div className="text-2xl font-bold text-[#CD7F32]">{tierCounts.C + tierCounts.D}</div>
        </div>
      </div>

      {/* Pipeline Bar */}
      <div className="premium-card p-4">
        <div className="mono-small mb-3">PIPELINE BREAKDOWN</div>
        <div className="flex flex-wrap gap-2">
          {statusCounts.filter(s => s.count > 0).map(({ status, count }) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? null : status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                filterStatus === status
                  ? `${STATUS_CONFIG[status].color} text-white`
                  : 'bg-[#1a1a1a] text-[#8A8A8A] hover:bg-[#222222]'
              )}
            >
              <span className="font-mono">{STATUS_CONFIG[status].label}</span>
              <span className="ml-2 opacity-70">({count})</span>
            </button>
          ))}
          {filterStatus && (
            <button
              onClick={() => setFilterStatus(null)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[#111111] text-[#8A8A8A] hover:text-[#E8DCC8]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="premium-card p-4">
          <div className="mono-small mb-3">FILTER BY TAGS</div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const isActive = filterTags.includes(tag);
              const tagColor = tag.startsWith('tier_') 
                ? (tag === 'tier_A' ? 'bg-yellow-500' : tag === 'tier_B' ? 'bg-gray-400' : 'bg-orange-400')
                : tag === 'replied' ? 'bg-green-500'
                : tag === 'dm1_sent' ? 'bg-blue-500'
                : tag === 'has_email' ? 'bg-purple-500'
                : 'bg-pink-500';

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    isActive
                      ? `${tagColor} text-white`
                      : 'bg-[#1a1a1a] text-[#8A8A8A] hover:bg-[#222222]'
                  )}
                >
                  {tag.replace('_', ' ').toUpperCase()}
                </button>
              );
            })}
            {filterTags.length > 0 && (
              <button
                onClick={() => setFilterTags([])}
                className="px-3 py-1 rounded-full text-xs bg-[#111111] text-[#8A8A8A] hover:text-[#E8DCC8]"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search + Sort + View */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#E8DCC8]/50"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] focus:outline-none focus:border-[#E8DCC8]"
        >
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
          <option value="last_contacted">Sort by Last Contact</option>
          <option value="status">Sort by Status</option>
          <option value="updated">Sort by Updated</option>
        </select>

        <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-2 text-xs font-mono", viewMode === 'list' ? 'bg-[#E8DCC8] text-[#0A0A0A]' : 'bg-[#111111] text-[#8A8A8A]')}
          >LIST</button>
          <button
            onClick={() => setViewMode('board')}
            className={cn("px-3 py-2 text-xs font-mono", viewMode === 'board' ? 'bg-[#E8DCC8] text-[#0A0A0A]' : 'bg-[#111111] text-[#8A8A8A]')}
          >BOARD</button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {sorted.length === 0 ? (
            <div className="premium-card p-12 text-center text-[#8A8A8A]">No leads match your filters</div>
          ) : (
            sorted.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="premium-card p-4 cursor-pointer hover:border-[#E8DCC8]/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with Score */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm font-bold text-[#E8DCC8]">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </div>
                    {contact.lead_score > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E8DCC8] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold">
                        {contact.lead_score}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#F5F5F3] font-medium">
                        {contact.first_name} {contact.last_name}
                      </span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] text-white font-mono uppercase",
                        STATUS_CONFIG[contact.status]?.color || 'bg-gray-500'
                      )}>
                        {STATUS_CONFIG[contact.status]?.label || contact.status}
                      </span>
                      {(contact.tags || []).slice(0, 3).map(tag => {
                        const tagColor = tag.startsWith('tier_') 
                          ? (tag === 'tier_A' ? 'bg-yellow-500/20 text-yellow-200' : tag === 'tier_B' ? 'bg-gray-400/20 text-gray-200' : 'bg-orange-400/20 text-orange-200')
                          : tag === 'replied' ? 'bg-green-500/20 text-green-200'
                          : tag === 'dm1_sent' ? 'bg-blue-500/20 text-blue-200'
                          : 'bg-purple-500/20 text-purple-200';
                        return (
                          <span key={tag} className={cn("px-2 py-0.5 rounded text-[10px] font-mono", tagColor)}>
                            {tag.replace('_', ' ').toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8A8A8A] mt-1 flex-wrap">
                      {contact.title && <span className="truncate max-w-[200px]">{contact.title}</span>}
                      {contact.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {contact.company}
                        </span>
                      )}
                      {contact.location && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <MapPin className="w-3 h-3" />
                          {contact.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {contact.email && <Mail className="w-4 h-4 text-[#4ADE80]" />}
                    {contact.linkedin_url && <ExternalLink className="w-4 h-4 text-[#0077B5]" />}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {sorted.length > 0 && (
            <div className="flex items-center justify-center pt-4">
              <div className="px-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
                <span className="mono-small">{sorted.length} LEADS</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STATUSES.filter(s => statusCounts.find(sc => sc.status === s && sc.count > 0)).map(status => {
              const items = sorted.filter(c => c.status === status);
              if (items.length === 0) return null;
              
              return (
                <div key={status} className="w-72 flex-shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[status].color)} />
                      <h3 className="mono-small text-[#F5F5F3]">{STATUS_CONFIG[status].label}</h3>
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-xs text-[#8A8A8A]">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {items.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className="premium-card p-3 cursor-pointer hover:border-[#E8DCC8]/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#F5F5F3] truncate">
                              {contact.first_name} {contact.last_name}
                            </div>
                            {contact.company && (
                              <div className="text-xs text-[#8A8A8A] mt-1 truncate">{contact.company}</div>
                            )}
                            {contact.title && (
                              <div className="text-xs text-[#8A8A8A] truncate">{contact.title}</div>
                            )}
                          </div>
                          {contact.lead_score > 0 && (
                            <div className="w-7 h-7 rounded-full bg-[#E8DCC8] text-[#0A0A0A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {contact.lead_score}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {contact.email && <Mail className="w-3 h-3 text-[#4ADE80]" />}
                          {contact.linkedin_url && <ExternalLink className="w-3 h-3 text-[#0077B5]" />}
                          {(contact.tags || []).slice(0, 2).map(tag => {
                            const tagColor = tag.startsWith('tier_') 
                              ? (tag === 'tier_A' ? 'bg-yellow-500' : 'bg-gray-400')
                              : 'bg-blue-500';
                            return (
                              <span key={tag} className={cn("px-1.5 py-0.5 rounded text-[9px] text-white font-mono", tagColor)}>
                                {tag.split('_')[1] || tag.slice(0, 3).toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="glass-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-2xl font-bold text-[#E8DCC8]">
                    {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
                  </div>
                  {selectedContact.lead_score > 0 && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#E8DCC8] text-[#0A0A0A] flex items-center justify-center text-sm font-bold border-2 border-[#0A0A0A]">
                      {selectedContact.lead_score}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#F5F5F3]">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn(
                      "inline-flex px-3 py-1 rounded text-xs text-white font-mono uppercase",
                      STATUS_CONFIG[selectedContact.status]?.color || 'bg-gray-500'
                    )}>
                      {STATUS_CONFIG[selectedContact.status]?.label}
                    </span>
                    {(selectedContact.tags || []).map(tag => {
                      const tagColor = tag.startsWith('tier_') 
                        ? (tag === 'tier_A' ? 'bg-yellow-500' : tag === 'tier_B' ? 'bg-gray-400' : 'bg-orange-400')
                        : tag === 'replied' ? 'bg-green-500'
                        : tag === 'dm1_sent' ? 'bg-blue-500'
                        : 'bg-purple-500';
                      return (
                        <span key={tag} className={cn("px-2 py-1 rounded text-xs text-white font-mono", tagColor)}>
                          {tag.replace('_', ' ').toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="text-[#8A8A8A] hover:text-[#F5F5F3] text-2xl">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedContact.title && (
                <div className="premium-card p-3">
                  <div className="mono-small mb-1">TITLE</div>
                  <div className="text-sm text-[#F5F5F3]">{selectedContact.title}</div>
                </div>
              )}
              {selectedContact.company && (
                <div className="premium-card p-3">
                  <div className="mono-small mb-1">COMPANY</div>
                  <div className="text-sm text-[#F5F5F3]">{selectedContact.company}</div>
                </div>
              )}
              {selectedContact.location && (
                <div className="premium-card p-3">
                  <div className="mono-small mb-1">LOCATION</div>
                  <div className="text-sm text-[#F5F5F3]">{selectedContact.location}</div>
                </div>
              )}
              {selectedContact.email && (
                <div className="premium-card p-3">
                  <div className="mono-small mb-1">EMAIL</div>
                  <a href={`mailto:${selectedContact.email}`} className="text-sm text-[#4ADE80] font-mono hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
              )}
              {selectedContact.linkedin_url && (
                <div className="premium-card p-3">
                  <div className="mono-small mb-1">LINKEDIN</div>
                  <a href={selectedContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0077B5] hover:underline flex items-center gap-1">
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="premium-card p-4 mb-4">
              <div className="mono-small mb-3">TIMELINE</div>
              <div className="space-y-2 text-sm">
                {selectedContact.last_contacted_at && (
                  <div className="flex items-center gap-2 text-[#8A8A8A]">
                    <Calendar className="w-4 h-4" />
                    Last contacted: {new Date(selectedContact.last_contacted_at).toLocaleDateString()}
                  </div>
                )}
                {selectedContact.last_response_at && (
                  <div className="flex items-center gap-2 text-[#4ADE80]">
                    <MessageSquare className="w-4 h-4" />
                    Last response: {new Date(selectedContact.last_response_at).toLocaleDateString()}
                  </div>
                )}
                {selectedContact.next_followup_at && (
                  <div className="flex items-center gap-2 text-[#E8DCC8]">
                    <TrendingUp className="w-4 h-4" />
                    Next follow-up: {new Date(selectedContact.next_followup_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedContact.notes && (
              <div className="premium-card p-4">
                <div className="mono-small mb-3">NOTES</div>
                <div className="text-sm text-[#8A8A8A] whitespace-pre-wrap bg-[#0A0A0A] rounded-lg p-3 border border-[rgba(255,255,255,0.06)]">
                  {selectedContact.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
