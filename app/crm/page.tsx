"use client";

import { useEffect, useState } from "react";
import { supabase, CRMContact, CRMActivity, CRMDeal } from "@/lib/supabase";
import { 
  Loader2, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Phone, 
  Mail, 
  Plus,
  Linkedin,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  MessageSquare,
  FileText
} from "lucide-react";

const STATUSES = ['new', 'contacted', 'connected', 'conversation', 'qualified', 'proposal', 'client', 'lost', 'nurture'] as const;

const STATUS_CONFIG: Record<typeof STATUSES[number], { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-purple-500' },
  connected: { label: 'Connected', color: 'bg-indigo-500' },
  conversation: { label: 'Conversation', color: 'bg-cyan-500' },
  qualified: { label: 'Qualified', color: 'bg-green-500' },
  proposal: { label: 'Proposal', color: 'bg-yellow-500' },
  client: { label: 'Client', color: 'bg-emerald-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
  nurture: { label: 'Nurture', color: 'bg-orange-500' },
};

type ViewMode = 'list' | 'board';

export default function CRMPage() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [contactActivities, setContactActivities] = useState<CRMActivity[]>([]);
  const [contactDeals, setContactDeals] = useState<CRMDeal[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadContactDetails(selectedContact.id);
    }
  }, [selectedContact]);

  async function loadData() {
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      const { data: dealsData, error: dealsError } = await supabase
        .from('crm_deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadContactDetails(contactId: string) {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setContactActivities(activitiesData || []);

      const { data: dealsData, error: dealsError } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;
      setContactDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading contact details:', error);
    }
  }

  const filteredContacts = contacts.filter(contact => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        contact.first_name.toLowerCase().includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (filterStatus && contact.status !== filterStatus) return false;
    if (filterSource && contact.source !== filterSource) return false;
    return true;
  });

  const contactsByStatus = STATUSES.map(status => ({
    status,
    contacts: filteredContacts.filter(c => c.status === status),
  }));

  // Calculate stats
  const totalContacts = contacts.length;
  const statusCounts = STATUSES.reduce((acc, status) => {
    acc[status] = contacts.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);
  
  const totalPipelineValue = deals
    .filter(d => !['closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);
  
  const needsFollowup = contacts.filter(c => {
    if (!c.next_followup_at) return false;
    return new Date(c.next_followup_at) < new Date();
  }).length;

  const newThisWeek = contacts.filter(c => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(c.created_at) > weekAgo;
  }).length;

  const uniqueSources = Array.from(new Set(contacts.map(c => c.source).filter(Boolean)));

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
      <div>
        <h1 className="virgil-label text-[#8A8A8A] mb-2">CRM</h1>
        <p className="text-sm text-[#8A8A8A]">
          Contact relationship management and pipeline
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="premium-card p-4">
          <div className="mono-small mb-1">TOTAL CONTACTS</div>
          <div className="text-2xl font-bold text-[#E8DCC8]">{totalContacts}</div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">PIPELINE VALUE</div>
          <div className="text-2xl font-bold text-[#4ADE80]">
            €{(totalPipelineValue / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">NEEDS FOLLOW-UP</div>
          <div className="text-2xl font-bold text-[#F59E0B]">{needsFollowup}</div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">NEW THIS WEEK</div>
          <div className="text-2xl font-bold text-[#C4785B]">{newThisWeek}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#E8DCC8]"
            />
          </div>
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] focus:outline-none focus:border-[#E8DCC8]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
            ))}
          </select>
          <select
            value={filterSource || ''}
            onChange={(e) => setFilterSource(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] focus:outline-none focus:border-[#E8DCC8]"
          >
            <option value="">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-[#E8DCC8] text-[#0A0A0A]' 
                : 'bg-[#111111] text-[#8A8A8A] hover:text-[#F5F5F3]'
            }`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'board' 
                ? 'bg-[#E8DCC8] text-[#0A0A0A]' 
                : 'bg-[#111111] text-[#8A8A8A] hover:text-[#F5F5F3]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8DCC8] text-[#0A0A0A] font-medium text-sm hover:bg-[#d4cbb8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">NAME</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">COMPANY</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">TITLE</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">STATUS</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">LEAD SCORE</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">LAST CONTACT</th>
                  <th className="text-left p-4 mono-small text-[#8A8A8A]">SOURCE</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-[#8A8A8A]">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-[#F5F5F3]">
                          {contact.first_name} {contact.last_name}
                        </div>
                        {contact.email && (
                          <div className="text-xs text-[#8A8A8A] mt-1">{contact.email}</div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[#F5F5F3]">
                        {contact.company || '—'}
                      </td>
                      <td className="p-4 text-sm text-[#8A8A8A]">
                        {contact.title || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs text-white ${STATUS_CONFIG[contact.status].color}`}>
                          {STATUS_CONFIG[contact.status].label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#E8DCC8]"
                              style={{ width: `${contact.lead_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#8A8A8A] w-8">{contact.lead_score}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#8A8A8A]">
                        {contact.last_contacted_at 
                          ? new Date(contact.last_contacted_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-[#8A8A8A]">
                          {contact.source || '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {contactsByStatus.map(({ status, contacts: statusContacts }) => (
              <div key={status} className="w-80 flex-shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="mono-small text-[#F5F5F3]">
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-xs text-[#8A8A8A]">
                    {statusContacts.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusContacts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111] p-8 text-center text-sm text-[#8A8A8A]">
                      No contacts
                    </div>
                  ) : (
                    statusContacts.map(contact => {
                      const contactDealsValue = deals
                        .filter(d => d.contact_id === contact.id && !['closed_lost'].includes(d.stage))
                        .reduce((sum, d) => sum + (d.value || 0), 0);
                      
                      return (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedContact(contact)}
                          className="premium-card p-4 cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-[#F5F5F3]">
                              {contact.first_name} {contact.last_name}
                            </h4>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-xs text-[#E8DCC8]">
                              {contact.lead_score}
                            </span>
                          </div>
                          {contact.company && (
                            <div className="text-xs text-[#8A8A8A] mb-2">{contact.company}</div>
                          )}
                          {contact.title && (
                            <div className="text-xs text-[#8A8A8A] mb-2">{contact.title}</div>
                          )}
                          {contactDealsValue > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#4ADE80] mt-2">
                              <DollarSign className="w-3 h-3" />
                              €{(contactDealsValue / 1000).toFixed(1)}K
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-xs text-[#8A8A8A]">
                            {contact.email && <Mail className="w-3 h-3" />}
                            {contact.phone && <Phone className="w-3 h-3" />}
                            {contact.linkedin_url && <Linkedin className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="glass-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#F5F5F3] mb-2">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </h2>
                  {selectedContact.company && (
                    <div className="text-[#8A8A8A] mb-2">{selectedContact.company}</div>
                  )}
                  {selectedContact.title && (
                    <div className="text-sm text-[#8A8A8A]">{selectedContact.title}</div>
                  )}
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`inline-flex px-3 py-1 rounded text-sm text-white ${STATUS_CONFIG[selectedContact.status].color}`}>
                      {STATUS_CONFIG[selectedContact.status].label}
                    </span>
                    <span className="text-sm text-[#8A8A8A]">
                      Score: {selectedContact.lead_score}/100
                    </span>
                    {selectedContact.ai_readiness && (
                      <span className="text-sm text-[#8A8A8A]">
                        AI Readiness: {selectedContact.ai_readiness}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-[#8A8A8A] hover:text-[#F5F5F3] text-3xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedContact.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                    <Mail className="w-5 h-5 text-[#8A8A8A]" />
                    <div>
                      <div className="mono-small mb-1">EMAIL</div>
                      <a href={`mailto:${selectedContact.email}`} className="text-sm text-[#E8DCC8] hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                    <Phone className="w-5 h-5 text-[#8A8A8A]" />
                    <div>
                      <div className="mono-small mb-1">PHONE</div>
                      <a href={`tel:${selectedContact.phone}`} className="text-sm text-[#E8DCC8] hover:underline">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.linkedin_url && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                    <Linkedin className="w-5 h-5 text-[#8A8A8A]" />
                    <div>
                      <div className="mono-small mb-1">LINKEDIN</div>
                      <a href={selectedContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#E8DCC8] hover:underline">
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.location && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                    <Calendar className="w-5 h-5 text-[#8A8A8A]" />
                    <div>
                      <div className="mono-small mb-1">LOCATION</div>
                      <div className="text-sm text-[#F5F5F3]">{selectedContact.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] text-sm text-[#F5F5F3] hover:bg-[#2a2a2a] transition-colors">
                  <Phone className="w-4 h-4" />
                  Log Call
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] text-sm text-[#F5F5F3] hover:bg-[#2a2a2a] transition-colors">
                  <Mail className="w-4 h-4" />
                  Send Email Draft
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] text-sm text-[#F5F5F3] hover:bg-[#2a2a2a] transition-colors">
                  <FileText className="w-4 h-4" />
                  Add Note
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] text-sm text-[#F5F5F3] hover:bg-[#2a2a2a] transition-colors">
                  <Calendar className="w-4 h-4" />
                  Schedule Follow-up
                </button>
              </div>

              {/* Deals */}
              {contactDeals.length > 0 && (
                <div>
                  <h3 className="virgil-label text-[#F5F5F3] mb-3">DEALS</h3>
                  <div className="space-y-3">
                    {contactDeals.map(deal => (
                      <div key={deal.id} className="p-4 rounded-lg bg-[#1a1a1a]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-[#F5F5F3]">{deal.title}</h4>
                          <span className="text-sm font-bold text-[#4ADE80]">
                            €{(deal.value || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
                          <span>Stage: {deal.stage}</span>
                          <span>Probability: {deal.probability}%</span>
                          {deal.expected_close_date && (
                            <span>Close: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div>
                <h3 className="virgil-label text-[#F5F5F3] mb-3">ACTIVITY TIMELINE</h3>
                {contactActivities.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#8A8A8A]">
                    No activity recorded
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contactActivities.map(activity => (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          {activity.type === 'email' && <Mail className="w-4 h-4 text-[#8A8A8A]" />}
                          {activity.type === 'call' && <Phone className="w-4 h-4 text-[#8A8A8A]" />}
                          {activity.type === 'linkedin_dm' && <Linkedin className="w-4 h-4 text-[#8A8A8A]" />}
                          {activity.type === 'meeting' && <Calendar className="w-4 h-4 text-[#8A8A8A]" />}
                          {activity.type === 'note' && <FileText className="w-4 h-4 text-[#8A8A8A]" />}
                          {activity.type === 'connection_request' && <MessageSquare className="w-4 h-4 text-[#8A8A8A]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-[#F5F5F3]">
                              {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-[#8A8A8A]">
                              {new Date(activity.created_at).toLocaleString()}
                            </span>
                          </div>
                          {activity.subject && (
                            <div className="text-sm text-[#F5F5F3] mb-1">{activity.subject}</div>
                          )}
                          {activity.content && (
                            <div className="text-sm text-[#8A8A8A]">{activity.content}</div>
                          )}
                          {activity.direction && (
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs mt-2 ${
                              activity.direction === 'outbound' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {activity.direction}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedContact.notes && (
                <div>
                  <h3 className="virgil-label text-[#F5F5F3] mb-3">NOTES</h3>
                  <div className="p-4 rounded-lg bg-[#1a1a1a] text-sm text-[#F5F5F3] whitespace-pre-wrap">
                    {selectedContact.notes}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedContact.tags && selectedContact.tags.length > 0 && (
                <div>
                  <h3 className="virgil-label text-[#F5F5F3] mb-3">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-[#1a1a1a] text-xs text-[#8A8A8A]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
