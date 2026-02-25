import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare, Send, Inbox, User, Clock,
  Trash2, Trash, ArrowLeft, CornerUpLeft, Plus,
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const Avatar = ({ name, size = 9 }) => (
  <div className={`h-${size} w-${size} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
    {name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
  </div>
);

const fmtDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString();
};

/* ─── Main component ──────────────────────────────────────────────────────── */
const Messages = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── state ──
  const [inbox, setInbox]             = useState([]);
  const [sent, setSent]               = useState([]);
  const [contacts, setContacts]       = useState([]);   // admins (for member) | members (for admin)
  const [activeTab, setActiveTab]     = useState('inbox');
  const [loading, setLoading]         = useState(true);
  const [thread, setThread]           = useState(null);  // { partner, messages[] }
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody]     = useState('');
  const [sending, setSending]         = useState(false);
  const [compose, setCompose]         = useState({ open: false, recipientId: '', body: '' });
  const [composeSending, setComposeSending] = useState(false);
  const [toast, setToast]             = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const threadBottomRef = useRef(null);

  /* ── data fetching ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inboxRes, sentRes, contactsRes] = await Promise.all([
        axiosInstance.get('/messages/inbox'),
        axiosInstance.get('/messages/sent'),
        isAdmin
          ? axiosInstance.get('/messages/members')
          : axiosInstance.get('/messages/admins'),
      ]);
      setInbox(inboxRes.data.messages || []);
      setSent(sentRes.data.messages || []);
      setContacts(isAdmin
        ? (contactsRes.data.members || [])
        : (contactsRes.data.admins  || []));
    } catch {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── open conversation thread ── */
  const openThread = async (partnerId, partnerName) => {
    setThreadLoading(true);
    setThread({ partner: { _id: partnerId, name: partnerName }, messages: [] });
    setReplyBody('');
    try {
      const { data } = await axiosInstance.get(`/messages/conversation/${partnerId}`);
      setThread({ partner: { _id: partnerId, name: partnerName }, messages: data.messages || [] });
      // mark as read
      await axiosInstance.patch('/messages/read-all').catch(() => {});
      setInbox(prev => prev.map(m =>
        (m.sender?._id === partnerId || m.recipient?._id === partnerId) ? { ...m, read: true } : m
      ));
    } catch {
      showToast('Failed to load conversation', 'error');
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  /* ── reply inside thread ── */
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !thread) return;
    setSending(true);
    try {
      const { data } = await axiosInstance.post('/messages', {
        recipientId: thread.partner._id,
        body: replyBody,
      });
      setThread(prev => ({ ...prev, messages: [...prev.messages, data.message] }));
      setReplyBody('');
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send', 'error');
    } finally {
      setSending(false);
    }
  };

  /* ── compose new ── */
  const handleCompose = async (e) => {
    e.preventDefault();
    if (!compose.recipientId || !compose.body.trim()) return;
    setComposeSending(true);
    try {
      await axiosInstance.post('/messages', { recipientId: compose.recipientId, body: compose.body });
      setCompose({ open: false, recipientId: '', body: '' });
      showToast('Message sent!');
      await fetchAll();
      setActiveTab('sent');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send', 'error');
    } finally {
      setComposeSending(false);
    }
  };

  /* ── delete single ── */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/messages/${id}`);
      setInbox(prev => prev.filter(m => m._id !== id));
      setSent(prev => prev.filter(m => m._id !== id));
      showToast('Deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  /* ── clear all ── */
  const handleClearAll = async () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    setClearingAll(true); setConfirmClear(false);
    try {
      await axiosInstance.delete(`/messages/clear?type=${activeTab}`);
      if (activeTab === 'inbox') setInbox([]); else setSent([]);
      showToast(`${activeTab === 'inbox' ? 'Inbox' : 'Sent'} cleared`);
    } catch {
      showToast('Failed to clear', 'error');
    } finally { setClearingAll(false); }
  };

  /* ── derived ── */
  const unread = inbox.filter(m => !m.read).length;
  const activeMessages = activeTab === 'inbox' ? inbox : sent;

  /* ─────────────────── Thread view ─────────────────────────────────────── */
  if (thread) {
    return (
      <div className="flex flex-col h-[calc(100vh-9rem)]">
        {/* Thread header */}
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <button
            onClick={() => setThread(null)}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Avatar name={thread.partner.name} size={8} />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{thread.partner.name}</p>
            <p className="text-xs text-neutral-400">Conversation</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
          {threadLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            </div>
          ) : thread.messages.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-8">No messages yet. Say hello! 👋</p>
          ) : (
            thread.messages.map((m) => {
              const isMine = m.sender?._id === user._id || m.sender === user._id;
              return (
                <div key={m._id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMine && <Avatar name={thread.partner.name} size={8} />}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-sm'
                  }`}>
                    <p>{m.body}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-neutral-400'}`}>
                      {fmtDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={threadBottomRef} />
        </div>

        {/* Reply box */}
        <form onSubmit={handleReply} className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
          <textarea
            rows={2}
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder={`Reply to ${thread.partner.name}...`}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
            className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !replyBody.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors self-end"
          >
            {sending
              ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="h-4 w-4" />
            }
            Send
          </button>
        </form>
      </div>
    );
  }

  /* ─────────────────── Main inbox/sent view ────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
            <MessageSquare className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Messages</h1>
            {unread > 0 && <p className="text-sm text-violet-600 font-medium">{unread} unread</p>}
          </div>
        </div>
        <button
          onClick={() => setCompose(c => ({ ...c, open: !c.open }))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Compose
        </button>
      </div>

      {/* Compose */}
      {compose.open && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">New Message</h2>
          <form onSubmit={handleCompose} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">To</label>
              <select
                required
                value={compose.recipientId}
                onChange={e => setCompose(c => ({ ...c, recipientId: e.target.value }))}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select recipient...</option>
                {contacts.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({isAdmin ? 'Member' : 'Admin'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Message</label>
              <textarea
                required rows={4} value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))}
                placeholder="Type your message..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={composeSending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                <Send className="h-4 w-4" />{composeSending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={() => setCompose(c => ({ ...c, open: false }))}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs + Clear All */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox },
            { id: 'sent',  label: 'Sent',  icon: Send },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setConfirmClear(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'inbox' && unread > 0 && (
                <span className="h-5 min-w-[20px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeMessages.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearingAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
              ${confirmClear
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-rose-400 hover:text-rose-600'
              }`}
          >
            <Trash className="h-4 w-4" />
            {clearingAll ? 'Clearing...' : confirmClear ? 'Confirm clear?' : `Clear ${activeTab === 'inbox' ? 'Inbox' : 'Sent'}`}
          </button>
        )}
      </div>

      {/* Message list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      ) : activeMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <MessageSquare className="h-7 w-7 text-neutral-300 dark:text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-400">No messages in {activeTab}</p>
          {activeTab === 'sent' && (
            <p className="text-xs text-neutral-400 mt-1">Messages you send appear here</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {activeMessages.map((m) => {
            const other    = activeTab === 'inbox' ? m.sender : m.recipient;
            const isUnread = activeTab === 'inbox' && !m.read;
            return (
              <div
                key={m._id}
                onClick={() => openThread(other?._id, other?.name)}
                className={`card group flex items-start gap-4 p-4 cursor-pointer transition-all hover:shadow-card-hover
                  ${isUnread ? 'border-l-2 border-primary-500' : ''}`}
              >
                <Avatar name={other?.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm ${isUnread ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-600 dark:text-neutral-300'}`}>
                      {other?.name}
                      <span className="ml-1.5 text-[11px] font-normal text-neutral-400 capitalize">({other?.role})</span>
                    </p>
                    <span className="shrink-0 flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />{fmtDate(m.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 line-clamp-1 ${isUnread ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}`}>
                    {m.body}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isUnread && <div className="h-2 w-2 rounded-full bg-primary-600" />}
                  <button
                    title="Open conversation"
                    onClick={e => { e.stopPropagation(); openThread(other?._id, other?.name); }}
                    className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 transition-all"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Delete message"
                    onClick={e => handleDelete(m._id, e)}
                    className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
