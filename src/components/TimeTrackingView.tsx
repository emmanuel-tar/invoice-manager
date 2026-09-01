import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Timer,
  Calendar,
  Users,
  FolderOpen,
  MoreVertical,
  Edit3,
  Trash2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { TimeEntry, Project } from '../types';

interface TimeTrackingViewProps {
  onAddTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onInvoiceProject: (projectId: string) => void;
}

const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Website Redesign',
    clientId: 'client_1',
    status: 'active',
    budget: 500000,
    hourlyRate: 15000,
    startDate: '2026-08-01',
    description: 'Complete redesign of corporate website',
  },
  {
    id: 'proj_2',
    name: 'Mobile App Development',
    clientId: 'client_2',
    status: 'active',
    budget: 1200000,
    hourlyRate: 20000,
    startDate: '2026-07-15',
    description: 'Cross-platform mobile application',
  },
  {
    id: 'proj_3',
    name: 'ERP Implementation',
    clientId: 'client_3',
    status: 'on_hold',
    hourlyRate: 25000,
    startDate: '2026-06-01',
    description: 'Enterprise resource planning system deployment',
  },
  {
    id: 'proj_4',
    name: 'Brand Identity',
    clientId: 'client_1',
    status: 'completed',
    budget: 300000,
    hourlyRate: 12000,
    startDate: '2026-05-01',
    endDate: '2026-07-30',
    description: 'Complete brand identity package',
  },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: 'te_1',
    projectId: 'proj_1',
    userId: 'user_1',
    description: 'Homepage design mockups',
    startTime: '2026-08-31T09:00:00Z',
    endTime: '2026-08-31T12:00:00Z',
    duration: 180,
    isBillable: true,
    hourlyRate: 15000,
    invoiced: false,
  },
  {
    id: 'te_2',
    projectId: 'proj_1',
    userId: 'user_1',
    description: 'Client meeting and feedback',
    startTime: '2026-08-31T14:00:00Z',
    endTime: '2026-08-31T15:30:00Z',
    duration: 90,
    isBillable: true,
    hourlyRate: 15000,
    invoiced: false,
  },
  {
    id: 'te_3',
    projectId: 'proj_2',
    userId: 'user_2',
    description: 'API integration',
    startTime: '2026-08-31T10:00:00Z',
    endTime: '2026-08-31T16:00:00Z',
    duration: 360,
    isBillable: true,
    hourlyRate: 20000,
    invoiced: true,
    invoiceId: 'inv_5',
  },
  {
    id: 'te_4',
    projectId: 'proj_1',
    userId: 'user_1',
    description: 'Internal research',
    startTime: '2026-08-30T09:00:00Z',
    endTime: '2026-08-30T10:30:00Z',
    duration: 90,
    isBillable: false,
    hourlyRate: 0,
    invoiced: false,
  },
];

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({
  onAddTimeEntry,
  onUpdateProject,
  onDeleteProject,
  onInvoiceProject,
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'projects' | 'entries'>('timer');
  const [selectedProject, setSelectedProject] = useState<string>('proj_1');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerDescription, setTimerDescription] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    hourlyRate: 15000,
    status: 'active',
  });
  const [newEntry, setNewEntry] = useState({
    description: '',
    projectId: 'proj_1',
    duration: 60,
    isBillable: true,
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const todayEntries = mockTimeEntries.filter(
    (e) => e.startTime.startsWith('2026-08-31')
  );

  const todayTotalMinutes = todayEntries.reduce((sum, e) => sum + e.duration, 0);
  const todayBillableMinutes = todayEntries.filter((e) => e.isBillable).reduce((sum, e) => sum + e.duration, 0);
  const todayEarnings = todayEntries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + (e.duration / 60) * e.hourlyRate, 0);

  const projectStats = mockProjects.map((proj) => {
    const entries = mockTimeEntries.filter((e) => e.projectId === proj.id);
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
    const billableAmount = entries
      .filter((e) => e.isBillable)
      .reduce((sum, e) => sum + (e.duration / 60) * e.hourlyRate, 0);
    return {
      ...proj,
      totalHours: totalMinutes / 60,
      billableAmount,
      entryCount: entries.length,
    };
  });

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    (window as any).__timerInterval = interval;
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    clearInterval((window as any).__timerInterval);
    if (timerSeconds > 0 && timerDescription) {
      onAddTimeEntry({
        projectId: selectedProject,
        userId: 'user_1',
        description: timerDescription,
        startTime: new Date(Date.now() - timerSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: Math.floor(timerSeconds / 60),
        isBillable: true,
        hourlyRate: mockProjects.find((p) => p.id === selectedProject)?.hourlyRate || 15000,
        invoiced: false,
      });
    }
    setTimerSeconds(0);
    setTimerDescription('');
  };

  const handleCreateProject = () => {
    if (newProject.name) {
      onUpdateProject({
        id: `proj_${Date.now()}`,
        name: newProject.name || '',
        clientId: 'client_1',
        status: 'active',
        hourlyRate: newProject.hourlyRate || 15000,
        startDate: new Date().toISOString().split('T')[0],
        description: newProject.description,
      });
      setShowNewProjectModal(false);
      setNewProject({ name: '', hourlyRate: 15000, status: 'active' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Time Tracking & Projects</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track time, manage projects, and bill clients efficiently
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400">Today's Hours</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatDuration(todayTotalMinutes)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Billable Time</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatDuration(todayBillableMinutes)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400">Today's Earnings</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(todayEarnings)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <FolderOpen className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs text-slate-400">Active Projects</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {mockProjects.filter((p) => p.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg w-fit">
        {(['timer', 'projects', 'entries'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'timer' && 'Timer'}
            {tab === 'projects' && 'Projects'}
            {tab === 'entries' && 'Time Entries'}
          </button>
        ))}
      </div>

      {/* Timer Tab */}
      {activeTab === 'timer' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <div className="max-w-lg mx-auto text-center">
            {/* Project Selector */}
            <div className="mb-6">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {mockProjects
                  .filter((p) => p.status === 'active')
                  .map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
              <div className="text-6xl font-mono font-bold text-white mb-2">
                {formatTimerDisplay(timerSeconds)}
              </div>
              <p className="text-sm text-slate-400">
                {isTimerRunning ? 'Timer running...' : 'Ready to start'}
              </p>
            </div>

            {/* Description Input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="What are you working on?"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center"
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-lg font-medium transition-colors"
                >
                  <Play className="w-6 h-6" />
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      clearInterval((window as any).__timerInterval);
                    }}
                    className="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Square className="w-5 h-5" />
                    Stop & Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectStats.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : project.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : project.status === 'on_hold'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Total Hours</p>
                  <p className="text-sm font-bold text-white">{project.totalHours.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Billable</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {formatCurrency(project.billableAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Rate</p>
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(project.hourlyRate)}/h
                  </p>
                </div>
              </div>

              {project.budget && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Budget Usage</span>
                    <span className="text-white">
                      {Math.round((project.billableAmount / project.budget) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.billableAmount / project.budget > 0.9
                          ? 'bg-red-500'
                          : project.billableAmount / project.budget > 0.7
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((project.billableAmount / project.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => onInvoiceProject(project.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Create Invoice
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Time Entries Tab */}
      {activeTab === 'entries' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-medium text-white">Recent Time Entries</h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {mockTimeEntries.map((entry) => {
              const project = mockProjects.find((p) => p.id === entry.projectId);
              return (
                <div
                  key={entry.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${entry.isBillable ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                      <Timer className={`w-4 h-4 ${entry.isBillable ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{project?.name}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          {new Date(entry.startTime).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatDuration(entry.duration)}</p>
                      {entry.isBillable && (
                        <p className="text-xs text-emerald-400">
                          {formatCurrency((entry.duration / 60) * entry.hourlyRate)}
                        </p>
                      )}
                    </div>
                    {entry.invoiced && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Invoiced
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hourly Rate (₦)</label>
                <input
                  type="number"
                  value={newProject.hourlyRate}
                  onChange={(e) => setNewProject({ ...newProject, hourlyRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Project description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
