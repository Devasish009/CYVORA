import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { 
  FolderGit2, 
  RefreshCw, 
  Share2, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Code2, 
  GitBranch, 
  Clock,
  Plus,
  Trash2,
  Inbox,
  Wrench,
  Upload,
  FileArchive,
  Check
} from 'lucide-react';

export default function ProjectOverviewView({ onStartAnalysis }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Project ZIP Upload Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProjects();
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err.message || "Failed to load projects from backend database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        if (!customName) {
          setCustomName(file.name.replace('.zip', ''));
        }
      } else {
        alert("Please select a valid .zip file archive.");
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        if (!customName) {
          setCustomName(file.name.replace('.zip', ''));
        }
      } else {
        alert("Please drop a valid .zip file archive.");
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select or drop a .zip project file.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (customName) {
        formData.append("name", customName);
      }

      const res = await apiService.uploadProjectZip(formData);
      if (res.success) {
        setShowModal(false);
        setSelectedFile(null);
        setCustomName('');
        fetchProjects();
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to remove this project?")) return;
    try {
      await apiService.deleteProject(projectId);
      fetchProjects();
    } catch (err) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">Project Health & Topology</h2>
          <p className="text-xs text-slate-400 mt-1">Universal Multi-Language ZIP Upload & AST Intelligence Scanner.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Project ZIP</span>
          </button>
          <button 
            onClick={fetchProjects}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Projects List or Empty State */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading projects from backend database...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel text-center space-y-4 shadow-xl">
          <FileArchive className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-white">No uploaded projects found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload a <strong>.zip</strong> archive of any software codebase (Python, TypeScript, JavaScript, Go, Java, C++, Rust, PHP, Ruby, etc.) to enable autonomous AI repair.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload ZIP Archive</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shrink-0">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-heading font-extrabold text-white">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        HEALTH SCORE: {proj.health_score || 94}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span>{proj.project_path}</span>
                      <span className="text-slate-500 font-sans">ID: {proj.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 capitalize">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" /> {proj.language || 'Universal'}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold capitalize">
                    {proj.framework || 'Standard'}
                  </span>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                    title="Remove Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload ZIP Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                Upload Project ZIP Archive
              </h3>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                Universal Support
              </span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Box */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : selectedFile 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                }`}
              >
                <input 
                  type="file" 
                  accept=".zip"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-200">{selectedFile.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileArchive className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs font-bold text-slate-300">Drag & drop project .zip file here</div>
                    <div className="text-[11px] text-slate-500">or click to browse from your device</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name (Optional)</label>
                <input 
                  type="text" 
                  value={customName} 
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. My Microservice" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
                <span className="font-bold text-slate-300">Universal Language Auto-Detection:</span>
                <p>CYVORA automatically extracts the ZIP, identifies all programming languages (Python, JS, TS, Go, Java, C++, Rust, PHP, Ruby, etc.), and builds the AST topology map.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
