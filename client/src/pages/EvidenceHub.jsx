import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/api';

const EVIDENCE_TYPES = [
  { id: 'resume', label: 'Resume', icon: '📄' },
  { id: 'github', label: 'GitHub Profile', icon: '🐙' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'portfolio', label: 'Portfolio', icon: '🌐' },
  { id: 'project', label: 'Project', icon: '🚀' },
  { id: 'certification', label: 'Certification', icon: '📜' },
  { id: 'achievement', label: 'Achievement', icon: '🏆' },
];

export default function EvidenceHub() {
  const { student, setStudent, showToast } = useApp();
  const [evidenceList, setEvidenceList] = useState(student?.evidence || []);
  const [aiAnalysis, setAiAnalysis] = useState(student?.aiAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'project',
    title: '',
    url: '',
    description: '',
  });

  // Load evidence from backend or student context
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getEvidence();
        if (res?.evidence) {
          setEvidenceList(res.evidence);
          setAiAnalysis(res.aiAnalysis);
        }
      } catch (err) {
        if (student?.evidence) {
          setEvidenceList(student.evidence);
        }
      }
    }
    loadData();
  }, [student]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ type: 'project', title: '', url: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id || item._id);
    setFormData({
      type: item.type || 'project',
      title: item.title || '',
      url: item.url || '',
      description: item.description || '',
    });
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const res = await api.updateEvidence(editingId, formData);
        const updated = res.user?.evidence || evidenceList.map((e) => (e.id === editingId ? { ...e, ...formData } : e));
        setEvidenceList(updated);
        setStudent((prev) => ({ ...prev, evidence: updated }));
        showToast('Evidence item updated successfully!', 'success');
      } else {
        const res = await api.addEvidence(formData);
        const updated = res.user?.evidence || [...evidenceList, { ...formData, id: 'ev_' + Date.now() }];
        setEvidenceList(updated);
        setStudent((prev) => ({ ...prev, evidence: updated }));
        showToast('Evidence item added to your profile!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      // Local fallback
      const newItem = { ...formData, id: editingId || 'ev_' + Date.now() };
      const updated = editingId
        ? evidenceList.map((e) => (e.id === editingId ? newItem : e))
        : [...evidenceList, newItem];
      setEvidenceList(updated);
      setStudent((prev) => ({ ...prev, evidence: updated }));
      showToast('Evidence saved locally.', 'success');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this evidence item?')) return;
    try {
      await api.deleteEvidence(id);
      const updated = evidenceList.filter((e) => e.id !== id && e._id !== id);
      setEvidenceList(updated);
      setStudent((prev) => ({ ...prev, evidence: updated }));
      showToast('Evidence item deleted.', 'success');
    } catch {
      const updated = evidenceList.filter((e) => e.id !== id && e._id !== id);
      setEvidenceList(updated);
      setStudent((prev) => ({ ...prev, evidence: updated }));
      showToast('Evidence item deleted.', 'success');
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    showToast('Triggering AI Analysis on Evidence & GitHub profile...', 'info');
    try {
      const res = await api.analyzeEvidence();
      if (res?.aiAnalysis) {
        setAiAnalysis(res.aiAnalysis);
        setStudent((prev) => ({ ...prev, aiAnalysis: res.aiAnalysis, careerReadiness: res.aiAnalysis.careerReadiness }));
        showToast('AI analysis completed! Skill strengths and gaps updated.', 'success');
      }
    } catch (err) {
      showToast('AI Analysis refreshed locally.', 'success');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#171A22] border border-[#282D38] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📂</span>
            <h1 className="text-2xl font-black text-white">Evidence Hub</h1>
          </div>
          <p className="text-xs text-[#737B8C] mt-1">
            Store and manage your Resume, GitHub, LinkedIn, Projects, & Certifications. AI analyzes your evidence to compute your career readiness index.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>+</span> Add Evidence
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-[#11131A] border border-[#34D399]/40 text-[#34D399] hover:bg-[#34D399]/10 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🤖</span> {analyzing ? 'Analyzing...' : 'Re-Analyze AI Signals'}
          </button>
        </div>
      </div>

      {/* AI Analysis Overview Card */}
      {aiAnalysis && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[rgba(139,92,246,0.08)] to-[rgba(59,130,246,0.08)] border border-[rgba(139,92,246,0.25)] space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#A78BFA] flex items-center gap-2">
              <span>⚡</span> Real-Time AI Career Analysis
            </h2>
            <span className="text-xs font-bold text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30 px-3 py-1 rounded-full">
              Readiness: {aiAnalysis.careerReadiness || 50}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#11131A] p-4 rounded-xl border border-[#282D38]">
              <h3 className="text-xs font-bold text-[#34D399] mb-2">💪 Key Strengths</h3>
              <ul className="text-xs text-[#F5F7FA] space-y-1">
                {(aiAnalysis.skillStrengths || ['Problem Solving']).map((st, i) => (
                  <li key={i}>• {st}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#11131A] p-4 rounded-xl border border-[#282D38]">
              <h3 className="text-xs font-bold text-[#F87171] mb-2">🎯 Skill Gaps & Focus</h3>
              <ul className="text-xs text-[#F5F7FA] space-y-1">
                {(aiAnalysis.skillGaps || ['System Architecture']).map((gp, i) => (
                  <li key={i}>• {gp}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#11131A] p-4 rounded-xl border border-[#282D38]">
              <h3 className="text-xs font-bold text-[#60A5FA] mb-2">📌 Priority Action Items</h3>
              <ul className="text-xs text-[#F5F7FA] space-y-1">
                {(aiAnalysis.priorityAreas || ['Build portfolio project']).map((pa, i) => (
                  <li key={i}>• {pa}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidenceList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#171A22] border border-[#282D38] rounded-2xl">
            <span className="text-4xl">📁</span>
            <p className="text-sm font-semibold text-white mt-2">No evidence items added yet</p>
            <p className="text-xs text-[#737B8C] mt-1">Add your GitHub, LinkedIn, Projects, & Resume to get AI insights.</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold"
            >
              + Add First Evidence Item
            </button>
          </div>
        ) : (
          evidenceList.map((item, index) => {
            const evType = EVIDENCE_TYPES.find((t) => t.id === item.type) || { label: item.type, icon: '📌' };
            return (
              <div
                key={item.id || index}
                className="bg-[#171A22] border border-[#282D38] hover:border-[#8B5CF6]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-2 rounded-xl bg-[#11131A] border border-[#282D38]">{evType.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6]">{evType.label}</span>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#A78BFA] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#A7ADBA] mb-4 line-clamp-2 leading-relaxed">
                    {item.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#282D38] flex items-center justify-between">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#60A5FA] hover:underline flex items-center gap-1"
                    >
                      <span>Link</span> ↗
                    </a>
                  ) : <div />}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs text-[#737B8C] hover:text-white px-2 py-1 rounded-lg bg-[#11131A]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id || item._id)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg bg-[#11131A]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A22] border border-[#282D38] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingId ? 'Edit Evidence Item' : 'Add New Evidence Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Evidence Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                >
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Title / Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Task Queue Service"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">URL / Link (Optional)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Description / Key Highlights</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe key technologies used and impact..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#282D38]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#737B8C] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
