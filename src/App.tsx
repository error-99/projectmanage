/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  MessageSquare,
  Link as LinkIcon,
  Trash2,
  Edit3,
  Check,
  X,
  User,
  MoreVertical,
  ArrowRight,
  Database,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isToday, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Project {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
  network: string;
  status: 'active' | 'ended' | 'upcoming';
  project_status: 'pending' | 'in_progress' | 'completed';
  category: string;
  start_date: string;
  end_date: string;
  links: { name: string; url: string }[];
  telegram_posts: string[];
}

interface Task {
  id: string;
  task_name: string;
  link: string;
  is_daily: boolean;
}

interface Log {
  id: string;
  taskId: string;
  date: string;
  status: 'done' | 'not_done';
  gmail: string;
  profile: string;
}

interface Note {
  id: string;
  title: string;
  note: string;
  date: string;
}

interface Profile {
  id: string;
  gmail: string;
  profile_name: string;
}

interface AppData {
  projects: Project[];
  profiles: Profile[];
  tasks: Record<string, Task[]>;
  logs: Log[];
  notes: Record<string, Note[]>;
  categories: string[];
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profiles', label: 'Profiles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 bg-white border-r border-zinc-200 flex flex-col h-screen sticky top-0">
      <div className="p-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-zinc-300 ring-4 ring-zinc-50">
            <Database className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tighter">AIRDROP<span className="text-zinc-400">QUEST</span></h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-zinc-950 text-white font-black shadow-xl shadow-zinc-200" 
                  : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? "text-white" : "text-zinc-400")} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-10 border-t border-zinc-100">
        <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-zinc-950 uppercase tracking-[0.2em]">JSON STORAGE</p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">Data is stored in server-side JSON file.</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppData>({
    projects: [],
    profiles: [],
    tasks: {},
    logs: [],
    notes: {},
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Fetch Data from Server
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Data to Server
  const saveData = async (newData: AppData) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Data to Server
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        saveData(data);
      }, 500); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  const addProject = (p: Project) => {
    setData(prev => ({ ...prev, projects: [...prev.projects, p] }));
  };

  const updateProject = (p: Project) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === p.id ? p : proj)
    }));
  };

  const deleteProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addProfile = (p: Profile) => {
    setData(prev => ({ ...prev, profiles: [...prev.profiles, p] }));
  };

  const updateProfile = (p: Profile) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(prof => prof.id === p.id ? p : prof)
    }));
  };

  const deleteProfile = (id: string) => {
    setData(prev => ({ ...prev, profiles: prev.profiles.filter(p => p.id !== id) }));
  };

  const addTask = (projectId: string, t: Task) => {
    setData(prev => {
      const projectTasks = prev.tasks[projectId] || [];
      return {
        ...prev,
        tasks: { ...prev.tasks, [projectId]: [...projectTasks, t] }
      };
    });
  };

  const toggleLog = (taskId: string, profile: Profile) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setData(prev => {
      const existingLogIndex = prev.logs.findIndex(l => l.taskId === taskId && l.gmail === profile.gmail && l.date === today);
      const newLogs = [...prev.logs];
      if (existingLogIndex > -1) {
        newLogs.splice(existingLogIndex, 1);
      } else {
        newLogs.push({
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          date: today,
          status: 'done',
          gmail: profile.gmail,
          profile: profile.profile_name
        });
      }
      return { ...prev, logs: newLogs };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-950 rounded-full animate-spin" />
          <p className="text-zinc-950 font-black tracking-tighter text-lg">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-950 flex flex-col md:flex-row font-sans selection:bg-zinc-950 selection:text-white">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 flex justify-around p-4">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'profiles', icon: Users },
          { id: 'settings', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all",
              activeTab === item.id ? "bg-zinc-950 text-white" : "text-zinc-400"
            )}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-4xl font-black text-zinc-950 tracking-tighter leading-none mb-2">DASHBOARD</h2>
                  <p className="text-zinc-500 text-base font-medium tracking-tight">Active quests and farming progress.</p>
                </div>
                <button 
                  onClick={() => setShowAddProject(true)}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-zinc-200"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  NEW PROJECT
                </button>
              </div>

              {data.projects.length === 0 ? (
                <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-16 text-center shadow-sm">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <LayoutDashboard className="text-zinc-200 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-950 mb-2 tracking-tighter">NO PROJECTS FOUND</h3>
                  <p className="text-zinc-400 mb-8 max-w-xs mx-auto text-base font-medium leading-relaxed">Your quest list is empty.</p>
                  <button 
                    onClick={() => setShowAddProject(true)}
                    className="text-zinc-950 font-black hover:underline flex items-center gap-2 mx-auto text-lg tracking-tight"
                  >
                    CREATE PROJECT <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.projects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={() => setSelectedProjectId(project.id)} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profiles' && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-4xl font-black text-zinc-950 tracking-tighter leading-none mb-2">PROFILES</h2>
                  <p className="text-zinc-500 text-base font-medium tracking-tight">{data.profiles.length} farming accounts.</p>
                </div>
                <button 
                  onClick={() => setShowAddProfile(true)}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-zinc-200"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  ADD PROFILE
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.profiles.map((profile) => (
                  <div key={profile.id} className="bg-white border border-zinc-200 p-5 rounded-2xl hover:shadow-xl transition-all group border-b-4 border-b-zinc-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-zinc-950 transition-all shadow-inner">
                        <User className="text-zinc-300 group-hover:text-white w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-zinc-950 truncate text-base tracking-tighter uppercase">{profile.profile_name}</h4>
                        <p className="text-[10px] text-zinc-400 truncate font-bold">{profile.gmail}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-50">
                      <button 
                        onClick={() => {
                          setEditingProfileId(profile.id);
                          setShowEditProfile(true);
                        }}
                        className="text-zinc-300 hover:text-zinc-950 p-2 transition-colors bg-zinc-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProfile(profile.id)}
                        className="text-zinc-300 hover:text-red-500 p-2 transition-colors bg-zinc-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-black text-zinc-950 tracking-tighter leading-none mb-10">SETTINGS</h2>
              
              <div className="space-y-6">
                <div className="bg-white border-2 border-zinc-100 p-8 rounded-[2rem] shadow-sm">
                  <h3 className="text-xl font-black text-zinc-950 mb-2 tracking-tighter">DATA PERSISTENCE</h3>
                  <p className="text-zinc-500 mb-6 text-base font-medium leading-relaxed">Your data is stored in a JSON file on the server.</p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg shadow-zinc-200"
                    >
                      SYNC DATA
                    </button>
                    <button 
                      className="bg-zinc-50 hover:bg-zinc-100 text-zinc-950 px-6 py-3 rounded-xl font-black border border-zinc-200 transition-all"
                    >
                      EXPORT JSON
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-8 rounded-[2rem] text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-zinc-500" />
                    <h3 className="text-xl font-black tracking-tighter uppercase">SERVER-SIDE JSON</h3>
                  </div>
                  <p className="text-zinc-400 text-base leading-relaxed font-medium">
                    Data persists even if browser history is cleared. 
                    Stored in <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-sm">data.json</code>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      {showAddProject && (
        <ProjectModal 
          categories={data.categories}
          onClose={() => setShowAddProject(false)} 
          onSave={addProject}
          title="NEW PROJECT"
        />
      )}

      {showEditProject && editingProjectId && (
        <ProjectModal 
          categories={data.categories}
          project={data.projects.find(p => p.id === editingProjectId)}
          onClose={() => {
            setShowEditProject(false);
            setEditingProjectId(null);
          }} 
          onSave={updateProject}
          title="EDIT PROJECT"
        />
      )}

      {showAddProfile && (
        <ProfileModal 
          onClose={() => setShowAddProfile(false)} 
          onSave={addProfile}
          title="ADD PROFILE"
        />
      )}

      {showEditProfile && editingProfileId && (
        <ProfileModal 
          profile={data.profiles.find(p => p.id === editingProfileId)}
          onClose={() => {
            setShowEditProfile(false);
            setEditingProfileId(null);
          }} 
          onSave={updateProfile}
          title="EDIT PROFILE"
        />
      )}

      {selectedProjectId && (
        <ProjectDetailsModal 
          project={data.projects.find(p => p.id === selectedProjectId)!} 
          onClose={() => setSelectedProjectId(null)}
          profiles={data.profiles}
          tasks={data.tasks[selectedProjectId] || []}
          logs={data.logs}
          onToggleLog={toggleLog}
          onAddTask={(t) => addTask(selectedProjectId, t)}
          onEditProject={() => {
            setEditingProjectId(selectedProjectId);
            setShowEditProject(true);
          }}
          onDeleteProject={() => {
            deleteProject(selectedProjectId);
            setSelectedProjectId(null);
          }}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    ended: 'bg-rose-50 text-rose-600 border-rose-100',
    upcoming: 'bg-sky-50 text-sky-600 border-sky-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group border-b-4 border-b-zinc-100"
    >
      <div className="h-40 relative overflow-hidden">
        <img 
          src={project.image || 'https://picsum.photos/seed/crypto/800/400'} 
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md", statusColors[project.status])}>
            {project.status}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-black text-zinc-950 group-hover:text-zinc-600 transition-colors leading-tight tracking-tighter uppercase truncate pr-2">{project.name}</h3>
          <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-950 shrink-0" />
        </div>
        <p className="text-zinc-500 text-sm line-clamp-2 mb-6 font-medium">
          {project.description}
        </p>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-50 pt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-black uppercase tracking-tight">Ends {format(parseISO(project.end_date), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-black uppercase tracking-widest text-zinc-950">{project.category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectModal = ({ 
  onClose, 
  onSave, 
  categories, 
  project, 
  title 
}: { 
  onClose: () => void; 
  onSave: (p: Project) => void; 
  categories: string[]; 
  project?: Project;
  title: string;
}) => {
  const [formData, setFormData] = useState<Project>(project || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    description: '',
    type: 'testnet',
    network: 'Ethereum',
    category: categories[0] || 'DeFi',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    image: '',
    status: 'active',
    project_status: 'pending',
    links: [],
    telegram_posts: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { name: '', url: '' }]
    }));
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const addTelegramPost = () => {
    setFormData(prev => ({
      ...prev,
      telegram_posts: [...prev.telegram_posts, '']
    }));
  };

  const updateTelegramPost = (index: number, value: string) => {
    setFormData(prev => {
      const newPosts = [...prev.telegram_posts];
      newPosts[index] = value;
      return { ...prev, telegram_posts: newPosts };
    });
  };

  const removeTelegramPost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      telegram_posts: prev.telegram_posts.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-zinc-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Project Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
                placeholder="e.g. ZK-SYNC"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</label>
              <input 
                type="text" 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
                placeholder="e.g. Testnet"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Network</label>
              <input 
                type="text" 
                value={formData.network}
                onChange={e => setFormData({...formData, network: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
                placeholder="e.g. Ethereum"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Image URL</label>
            <input 
              type="text" 
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all h-24 resize-none"
              placeholder="Describe the quest..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">End Date</label>
              <input 
                type="date" 
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all appearance-none"
              >
                <option value="active">ACTIVE</option>
                <option value="upcoming">UPCOMING</option>
                <option value="ended">ENDED</option>
              </select>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Official Links</label>
              <button 
                type="button" 
                onClick={addLink}
                className="text-[10px] font-black text-zinc-950 hover:underline"
              >
                + ADD LINK
              </button>
            </div>
            <div className="space-y-3">
              {formData.links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={link.name}
                    onChange={e => updateLink(i, 'name', e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="Name"
                  />
                  <input 
                    type="text" 
                    value={link.url}
                    onChange={e => updateLink(i, 'url', e.target.value)}
                    className="flex-[2] bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="URL"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeLink(i)}
                    className="p-2 text-zinc-300 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram Posts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Telegram Posts</label>
              <button 
                type="button" 
                onClick={addTelegramPost}
                className="text-[10px] font-black text-zinc-950 hover:underline"
              >
                + ADD POST
              </button>
            </div>
            <div className="space-y-3">
              {formData.telegram_posts.map((post, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={post}
                    onChange={e => updateTelegramPost(i, e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="Post URL"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeTelegramPost(i)}
                    className="p-2 text-zinc-300 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="p-6 border-t border-zinc-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 font-black py-4 rounded-xl transition-all border border-zinc-200 uppercase tracking-widest text-xs"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs"
          >
            SAVE CHANGES
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileModal = ({ 
  onClose, 
  onSave, 
  profile, 
  title 
}: { 
  onClose: () => void; 
  onSave: (p: Profile) => void; 
  profile?: Profile;
  title: string;
}) => {
  const [formData, setFormData] = useState<Profile>(profile || {
    id: Math.random().toString(36).substr(2, 9),
    gmail: '',
    profile_name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-zinc-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Profile Name</label>
            <input 
              required
              type="text" 
              value={formData.profile_name}
              onChange={e => setFormData({...formData, profile_name: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              placeholder="e.g. Main Account"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gmail / Email</label>
            <input 
              required
              type="email" 
              value={formData.gmail}
              onChange={e => setFormData({...formData, gmail: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              placeholder="example@gmail.com"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs"
          >
            SAVE PROFILE
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ProjectDetailsModal = ({ 
  project, 
  onClose, 
  profiles, 
  tasks, 
  logs, 
  onToggleLog,
  onAddTask,
  onEditProject,
  onDeleteProject
}: { 
  project: Project; 
  onClose: () => void; 
  profiles: Profile[];
  tasks: Task[];
  logs: Log[];
  onToggleLog: (taskId: string, profile: Profile) => void;
  onAddTask: (t: Task) => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'info'>('tasks');
  const [showAddTask, setShowAddTask] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.is_daily && !b.is_daily) return -1;
      if (!a.is_daily && b.is_daily) return 1;
      return 0;
    });
  }, [tasks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 bg-zinc-950/60 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="relative h-48 md:h-64 shrink-0 bg-zinc-50">
          <img 
            src={project.image || 'https://picsum.photos/seed/crypto/1200/600'} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button 
              onClick={onEditProject}
              className="p-2 bg-white/80 backdrop-blur hover:bg-white rounded-full border border-zinc-100 transition-all shadow-sm"
            >
              <Edit3 className="w-5 h-5 text-zinc-950" />
            </button>
            <button 
              onClick={() => {
                if (confirm('Delete this project?')) onDeleteProject();
              }}
              className="p-2 bg-white/80 backdrop-blur hover:bg-red-50 rounded-full border border-zinc-100 transition-all shadow-sm"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
            <button onClick={onClose} className="p-2 bg-white/80 backdrop-blur hover:bg-white rounded-full border border-zinc-100 transition-all shadow-sm">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border border-zinc-100 flex items-center justify-center overflow-hidden shadow-lg">
                <img src={project.image || 'https://picsum.photos/seed/crypto/200/200'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                  <h2 className="text-2xl md:text-4xl font-black text-zinc-950 tracking-tighter uppercase leading-none">{project.name}</h2>
                  <span className="bg-zinc-950 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    {project.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-zinc-400 text-[10px] font-black">
                  <span className="uppercase tracking-widest text-zinc-950">{project.category}</span>
                  <span className="uppercase">{project.network}</span>
                  <span className="uppercase">ENDS {project.end_date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 md:px-10 border-b border-zinc-100 flex gap-6 md:gap-10 shrink-0 bg-white overflow-x-auto no-scrollbar">
          {[
            { id: 'tasks', label: 'TASKS', icon: CheckCircle2 },
            { id: 'notes', label: 'UPDATES', icon: MessageSquare },
            { id: 'info', label: 'INFO', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "py-4 md:py-6 font-black text-[10px] flex items-center gap-2 border-b-2 transition-all tracking-widest whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-zinc-950 text-zinc-950" 
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-50/10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div 
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase">TASKS</h3>
                  <button 
                    onClick={() => setShowAddTask(true)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    ADD
                  </button>
                </div>

                <div className="space-y-4">
                  {sortedTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      profiles={profiles}
                      logs={logs.filter(l => l.taskId === task.id)}
                      onToggleLog={(p) => onToggleLog(task.id, p)}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-zinc-100">
                      <p className="text-zinc-300 text-sm font-black tracking-widest uppercase">NO TASKS</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-sm font-black text-zinc-950 mb-4 tracking-widest uppercase border-b border-zinc-50 pb-2">TASK HISTORY</h4>
                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-center py-10">No history yet.</p>
                    ) : (
                      [...logs].reverse().slice(0, 20).map((log, i) => {
                        const task = tasks.find(t => t.id === log.taskId);
                        return (
                          <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center">
                                <Check className="text-white w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-zinc-950 uppercase tracking-tight">
                                  {log.profile} <span className="text-zinc-400 font-bold ml-1">({log.gmail})</span>
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase">
                                  Completed: {task?.task_name || 'Unknown Task'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest">{log.date}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
                    <h4 className="text-sm font-black text-zinc-950 mb-4 tracking-widest uppercase border-b border-zinc-50 pb-2">ABOUT</h4>
                    <p className="text-zinc-500 leading-relaxed text-base font-medium">{project.description}</p>
                  </div>
                  <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
                    <h4 className="text-sm font-black text-zinc-950 mb-4 tracking-widest uppercase border-b border-zinc-50 pb-2">LINKS</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.links.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-950 transition-all group"
                        >
                          <span className="text-xs font-black text-zinc-600 group-hover:text-zinc-950 uppercase tracking-tight">{link.name}</span>
                          <ExternalLink className="w-4 h-4 text-zinc-300 group-hover:text-zinc-950" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 p-6 rounded-3xl text-white shadow-xl h-fit">
                  <h4 className="text-sm font-black mb-4 tracking-widest uppercase border-b border-zinc-800 pb-2">TELEGRAM</h4>
                  <div className="space-y-3">
                    {project.telegram_posts.map((post, i) => (
                      <a 
                        key={i} 
                        href={post} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-500 hover:text-white transition-all truncate font-bold"
                      >
                        {post}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {showAddTask && (
        <AddTaskModal 
          onClose={() => setShowAddTask(false)} 
          onAdd={onAddTask}
        />
      )}
    </div>
  );
};

const TaskItem = ({ 
  task, 
  profiles, 
  logs, 
  onToggleLog 
}: { 
  task: Task; 
  profiles: Profile[]; 
  logs: Log[]; 
  onToggleLog: (p: Profile) => void 
}) => {
  const [expanded, setExpanded] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const getCompletionCount = () => {
    return logs.filter(l => l.date === today && l.status === 'done').length;
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-b-4 border-b-zinc-50">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-50/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm transition-all",
            task.is_daily ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-300"
          )}>
            {task.is_daily ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-zinc-950 text-sm md:text-base tracking-tighter uppercase">{task.task_name}</h4>
              {task.is_daily && (
                <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                  DAILY
                </span>
              )}
            </div>
            <a 
              href={task.link} 
              target="_blank" 
              rel="noreferrer" 
              onClick={e => e.stopPropagation()}
              className="text-[10px] font-black text-zinc-400 hover:text-zinc-950 flex items-center gap-1 mt-1 transition-colors uppercase"
            >
              LINK <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-right">
            <p className="text-lg md:text-2xl font-black text-zinc-950 tracking-tighter">{getCompletionCount()} <span className="text-zinc-200 font-medium">/ {profiles.length}</span></p>
            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">DONE</p>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-zinc-300 transition-transform", expanded && "rotate-90 text-zinc-950")} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-50 bg-zinc-50/10"
          >
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {profiles.map((profile) => {
                const isDone = logs.some(l => l.gmail === profile.gmail && l.date === today);
                return (
                  <button
                    key={profile.id}
                    onClick={() => onToggleLog(profile)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all group relative overflow-hidden",
                      isDone 
                        ? "bg-zinc-950 border-zinc-950 text-white shadow-lg" 
                        : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-950 hover:text-zinc-950"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                      isDone ? "bg-white/10 border-white/20" : "bg-zinc-50 border-zinc-100"
                    )}>
                      {isDone ? <Check className="text-white w-4 h-4" /> : <Circle className="w-4 h-4 text-zinc-100" />}
                    </div>
                    <div className="flex flex-col items-center w-full overflow-hidden px-1">
                      <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center leading-tight">
                        {profile.profile_name}
                      </span>
                      <span className="text-[7px] text-zinc-400 truncate w-full text-center font-bold leading-tight">
                        {profile.gmail}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddTaskModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Task) => void }) => {
  const [taskName, setTaskName] = useState('');
  const [link, setLink] = useState('');
  const [isDaily, setIsDaily] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      task_name: taskName,
      link,
      is_daily: isDaily
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-zinc-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase">ADD TASK</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Task Name</label>
            <input 
              required
              type="text" 
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              placeholder="e.g. DAILY SWAP"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Link</label>
            <input 
              type="url" 
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 transition-all"
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <input 
              type="checkbox" 
              id="isDaily"
              checked={isDaily}
              onChange={e => setIsDaily(e.target.checked)}
              className="w-5 h-5 accent-zinc-950 rounded cursor-pointer"
            />
            <label htmlFor="isDaily" className="text-xs font-black text-zinc-950 cursor-pointer uppercase tracking-tight">
              DAILY RECURRING TASK
            </label>
          </div>
          <button 
            type="submit"
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs"
          >
            ADD TASK
          </button>
        </form>
      </motion.div>
    </div>
  );
};
