"use client";

import { useEffect, useState } from "react";
import { supabase, ContentPipeline, PipelineEvent } from "@/lib/supabase";
import { Loader2, Filter, Calendar, TrendingUp, AlertCircle, FileText, Linkedin, Twitter, Mic } from "lucide-react";

const STATUSES = ['idea', 'researching', 'draft', 'review', 'revision', 'approved', 'published', 'promoted'] as const;
const CONTENT_TYPES = ['blog_post', 'linkedin_post', 'tweet_thread', 'podcast_summary'] as const;

const CONTENT_TYPE_CONFIG = {
  blog_post: { label: 'Blog Post', color: 'bg-blue-500', icon: FileText },
  linkedin_post: { label: 'LinkedIn', color: 'bg-purple-500', icon: Linkedin },
  tweet_thread: { label: 'Tweet Thread', color: 'bg-green-500', icon: Twitter },
  podcast_summary: { label: 'Podcast', color: 'bg-orange-500', icon: Mic },
};

const STATUS_LABELS: Record<typeof STATUSES[number], string> = {
  idea: 'Idea',
  researching: 'Researching',
  draft: 'Draft',
  review: 'Review',
  revision: 'Revision',
  approved: 'Approved',
  published: 'Published',
  promoted: 'Promoted',
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentPipeline[]>([]);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentPipeline | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      // Load pipeline items
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('content_pipeline')
        .select('*')
        .order('updated_at', { ascending: false });

      if (pipelineError) throw pipelineError;
      setItems(pipelineData || []);

      // Load recent events with joined title
      const { data: eventsData, error: eventsError } = await supabase
        .from('pipeline_events')
        .select(`
          *,
          content_pipeline!pipeline_id (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;
      
      // Flatten the joined data
      const flatEvents = (eventsData || []).map(event => ({
        ...event,
        title: event.content_pipeline?.title || 'Unknown',
      }));
      
      setEvents(flatEvents);
    } catch (error) {
      console.error('Error loading content pipeline:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item => {
    if (filterType && item.content_type !== filterType) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  const itemsByStatus = STATUSES.map(status => ({
    status,
    items: filteredItems.filter(item => item.status === status),
  }));

  // Calculate stats
  const totalItems = items.length;
  const statusCounts = STATUSES.map(status => ({
    status,
    count: items.filter(item => item.status === status).length,
  }));
  const todayPublished = items.filter(item => {
    if (item.status !== 'published') return false;
    const today = new Date().toDateString();
    return new Date(item.updated_at).toDateString() === today;
  }).length;
  const avgQuality = items.filter(i => i.quality_score).length > 0
    ? Math.round(items.reduce((sum, i) => sum + (i.quality_score || 0), 0) / items.filter(i => i.quality_score).length)
    : 0;
  const needsAttention = items.filter(item => item.status === 'review').length;

  const getTimeInStatus = (item: ContentPipeline) => {
    const statusTime = new Date(item.updated_at);
    const now = new Date();
    const diffMs = now.getTime() - statusTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return '<1h';
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
      <div>
        <h1 className="virgil-label text-[#8A8A8A] mb-2">CONTENT PIPELINE</h1>
        <p className="text-sm text-[#8A8A8A]">
          AI-powered content creation workflow
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="premium-card p-4">
          <div className="mono-small mb-1">TOTAL ITEMS</div>
          <div className="text-2xl font-bold text-[#E8DCC8]">{totalItems}</div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">TODAY&apos;S OUTPUT</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{todayPublished}</div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">AVG QUALITY</div>
          <div className="text-2xl font-bold text-[#C4785B]">
            {avgQuality > 0 ? `${avgQuality}/100` : '—'}
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="mono-small mb-1">NEEDS REVIEW</div>
          <div className="text-2xl font-bold text-[#F59E0B]">{needsAttention}</div>
        </div>
        <div className="premium-card p-4 col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="mono-small mb-2">BY STATUS</div>
          <div className="flex flex-wrap gap-2">
            {statusCounts.filter(s => s.count > 0).map(({ status, count }) => (
              <span
                key={status}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-[#1a1a1a] text-[#8A8A8A]"
              >
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8A8A8A]" />
          <span className="mono-small">FILTERS:</span>
        </div>
        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] focus:outline-none focus:border-[#E8DCC8]"
        >
          <option value="">All Types</option>
          {CONTENT_TYPES.map(type => (
            <option key={type} value={type}>{CONTENT_TYPE_CONFIG[type].label}</option>
          ))}
        </select>
        <select
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || null)}
          className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)] text-sm text-[#F5F5F3] focus:outline-none focus:border-[#E8DCC8]"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {itemsByStatus.map(({ status, items: statusItems }) => (
            <div key={status} className="w-80 flex-shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="mono-small text-[#F5F5F3]">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-xs text-[#8A8A8A]">
                  {statusItems.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111] p-8 text-center text-sm text-[#8A8A8A]">
                    No items
                  </div>
                ) : (
                  statusItems.map(item => {
                    const config = CONTENT_TYPE_CONFIG[item.content_type as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.blog_post;
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="premium-card p-4 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                          <span className="text-xs text-[#8A8A8A]">
                            {getTimeInStatus(item)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-[#F5F5F3] mb-2 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#8A8A8A]">
                          {item.word_count && (
                            <span>{item.word_count} words</span>
                          )}
                          {item.quality_score && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {item.quality_score}/100
                            </span>
                          )}
                        </div>
                        {item.source_type && (
                          <div className="mt-2 text-xs text-[#8A8A8A]">
                            Source: {item.source_type}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="premium-card p-6">
        <h3 className="virgil-label text-[#F5F5F3] mb-4">RECENT ACTIVITY</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#8A8A8A]">
              No recent activity
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <div className="text-lg">
                  {event.action.includes('created') && '🔍'}
                  {event.action.includes('updated') && '✏️'}
                  {event.action.includes('published') && '🚀'}
                  {event.action.includes('review') && '👀'}
                  {!event.action.includes('created') && !event.action.includes('updated') && !event.action.includes('published') && !event.action.includes('review') && '📝'}
                </div>
                <div className="flex-1">
                  <div className="text-[#F5F5F3]">
                    <span className="font-medium text-[#E8DCC8]">{event.agent}</span>
                    {' '}{event.action}{' '}
                    {event.title && (
                      <span className="font-medium">&quot;{event.title}&quot;</span>
                    )}
                  </div>
                  {event.details && (
                    <div className="text-[#8A8A8A] text-xs mt-1">
                      {typeof event.details === 'string' ? event.details : JSON.stringify(event.details)}
                    </div>
                  )}
                  <div className="text-[#8A8A8A] text-xs mt-1">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="glass-strong w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${(CONTENT_TYPE_CONFIG[selectedItem.content_type as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.blog_post).color}`}>
                    {(CONTENT_TYPE_CONFIG[selectedItem.content_type as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.blog_post).label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#F5F5F3]">{selectedItem.title}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#8A8A8A] hover:text-[#F5F5F3] text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="mono-small mb-1">STATUS</div>
                  <div className="text-[#F5F5F3]">{STATUS_LABELS[selectedItem.status]}</div>
                </div>
                <div>
                  <div className="mono-small mb-1">TIME IN STATUS</div>
                  <div className="text-[#F5F5F3]">{getTimeInStatus(selectedItem)}</div>
                </div>
                {selectedItem.word_count && (
                  <div>
                    <div className="mono-small mb-1">WORD COUNT</div>
                    <div className="text-[#F5F5F3]">{selectedItem.word_count}</div>
                  </div>
                )}
                {selectedItem.quality_score && (
                  <div>
                    <div className="mono-small mb-1">QUALITY SCORE</div>
                    <div className="text-[#F5F5F3]">{selectedItem.quality_score}/100</div>
                  </div>
                )}
              </div>

              {selectedItem.outline && (
                <div>
                  <div className="mono-small mb-2">OUTLINE</div>
                  <div className="rounded-lg bg-[#1a1a1a] p-4 text-sm text-[#F5F5F3] whitespace-pre-wrap">
                    {selectedItem.outline}
                  </div>
                </div>
              )}

              {selectedItem.draft && (
                <div>
                  <div className="mono-small mb-2">DRAFT</div>
                  <div className="rounded-lg bg-[#1a1a1a] p-4 text-sm text-[#F5F5F3] whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedItem.draft}
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
