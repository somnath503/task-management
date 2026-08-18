"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, Unlock, PanelRight, Plus, Tag, SignalHigh, Circle, X, ArrowLeft, Trash2, Save, Edit2, CheckCircle2, Eye, Share, Settings, Check
} from "lucide-react";
import api from "@/lib/api";

interface Project {
  id: string;
  name: string;
  priority?: string;
  lead?: string;
  dueDate?: string;
}

interface ProjectTask {
  id: number;
  title: string;
  priority: string;
  members: string;
  date: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  // Click-to-Edit States
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false); 

  // Sidebar Fields
  const [status, setStatus] = useState("Planning");
  const [priority, setPriority] = useState("No Priority");
  const [dueDateStr, setDueDateStr] = useState("");
  const [lead, setLead] = useState("");

  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Arrays (Properties, Labels, Teams)
  const [propertiesList, setPropertiesList] = useState(["Phase 1", "UI/UX"]);
  const [customProperty, setCustomProperty] = useState("");

  const [labels, setLabels] = useState(["Architecture"]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelText, setNewLabelText] = useState("");

  const [teamsList, setTeamsList] = useState(["Frontend", "Design"]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamText, setNewTeamText] = useState("");

  // Dropdown Refs
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Share & Updates
  const [shareText, setShareText] = useState("Share");
  const [eyeActive, setEyeActive] = useState(false);
  const [updatesLog, setUpdatesLog] = useState([
    { id: 1, text: "created the project", date: "Just now", author: "You" }
  ]);
  
  // Project Tasks (Subtasks equivalent)
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([
    { id: 1, title: "Draft initial structure", priority: "High", members: "AB", date: "" }
  ]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Normal");
  const [newTaskMember, setNewTaskMember] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("Normal");
  const [editTaskMember, setEditTaskMember] = useState("");
  const [editTaskDate, setEditTaskDate] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
        setProjectName(res.data.name || "");
        setLead(res.data.lead || "");
        if (res.data.priority) setPriority(res.data.priority);
        if (res.data.dueDate) setDueDateStr(new Date(res.data.dueDate).toISOString().split('T')[0]);
      } catch (error) {
        console.error("Failed to fetch project details");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setIsPriorityDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveUpdateToBackend = async (payload: any) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/projects/${projectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleSaveMainDetails = async () => {
    setIsSavingDetails(true);
    await saveUpdateToBackend({ name: projectName });
    logUpdate(`updated project details`);
    setTimeout(() => setIsSavingDetails(false), 1500); 
  };

  const logUpdate = (text: string) => {
    setUpdatesLog(prev => [{ id: Date.now(), text: text, date: "Just now", author: "You" }, ...prev]);
  };

  // Settings Actions
  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      router.push("/projects");
    } catch (error) { console.error("Failed to delete project:", error); }
  };

  const handleDuplicateProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { name: `${projectName} (Copy)`, priority: priority, dueDate: dueDateStr ? new Date(dueDateStr).toISOString() : undefined };
      const res = await api.post(`/projects`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsSettingsOpen(false);
      router.push(`/projects/${res.data.id}`);
    } catch (error) { console.error("Failed to duplicate project:", error); }
  };

  const handleArchiveProject = async () => {
    setStatus("Archived");
    logUpdate("archived the project");
    setIsSettingsOpen(false);
  };

  const cycleStatus = () => {
    if (isLocked) return;
    const statuses = ["Planning", "In Progress", "Review", "Completed", "Archived"];
    const nextStatus = statuses[(statuses.indexOf(status) + 1) % statuses.length];
    setStatus(nextStatus);
    logUpdate(`changed status to ${nextStatus}`);
  };

  const handlePrioritySelect = (newPriority: string) => {
    setIsPriorityDropdownOpen(false);
    if (newPriority === priority) return;
    logUpdate(`changed priority to ${newPriority}`);
    setPriority(newPriority);
    saveUpdateToBackend({ priority: newPriority });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const val = e.target.value;
    setDueDateStr(val);
    if (val) saveUpdateToBackend({ dueDate: new Date(val).toISOString() });
  };

  const getPriorityColor = (pri: string) => {
    if (pri === "Urgent") return "text-red-600";
    if (pri === "High") return "text-orange-500";
    if (pri === "Medium") return "text-yellow-500";
    if (pri === "Low") return "text-blue-400";
    return "text-gray-400";
  };

  // Array handlers
  const handleAddProperty = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      const val = customProperty.trim(); 
      if (val !== "" && !propertiesList.includes(val)) setPropertiesList([...propertiesList, val]); 
      setCustomProperty(""); 
    }
  };

  const handleAddLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      const val = newLabelText.trim(); 
      if (val !== "" && !labels.includes(val)) setLabels([...labels, val]); 
      setNewLabelText(""); setIsAddingLabel(false); 
    }
  };

  const handleAddTeam = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      const val = newTeamText.trim(); 
      if (val !== "" && !teamsList.includes(val)) setTeamsList([...teamsList, val]); 
      setNewTeamText(""); setIsAddingTeam(false); 
    }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: projectName || 'Project Details', url: window.location.href }); } catch (err) { console.error('Share failed:', err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!"); setTimeout(() => setShareText("Share"), 2000);
    }
  };

  // Project Tasks (Subtasks) Functions
  const handleSaveProjectTask = () => {
    if (newTaskTitle.trim() === "") return;
    setProjectTasks([...projectTasks, { id: Date.now(), title: newTaskTitle.trim(), priority: newTaskPriority, members: newTaskMember, date: newTaskDate }]);
    setNewTaskTitle(""); setNewTaskPriority("Normal"); setNewTaskMember(""); setNewTaskDate(""); setIsAddingTask(false);
  };

  const startEditProjectTask = (pt: ProjectTask) => {
    setEditingTaskId(pt.id); setEditTaskTitle(pt.title); setEditTaskPriority(pt.priority); setEditTaskMember(pt.members); setEditTaskDate(pt.date);
  };

  const saveEditProjectTask = () => {
    setProjectTasks(projectTasks.map(pt => pt.id === editingTaskId ? { ...pt, title: editTaskTitle, priority: editTaskPriority, members: editTaskMember, date: editTaskDate } : pt));
    setEditingTaskId(null);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center text-theme-muted">Loading Project Details...</div>;
  if (!project) return <div className="flex h-full items-center justify-center text-red-500">Project not found.</div>;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-theme-muted">
            <Link href="/projects" className="flex items-center gap-1 font-medium text-theme-text transition-colors hover:opacity-80"><ArrowLeft size={16} /> Back</Link>
            <span className="mx-2 text-theme-border">|</span>
            
          </div>
          <div className="flex items-center gap-2">
            {/* <button onClick={() => setEyeActive(!eyeActive)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-colors hover:bg-theme-border ${eyeActive ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-theme-muted'}`} title="Watch Project"><Eye size={14} /></button> */}
            <button onClick={handleShareClick} className={`flex h-8 items-center justify-center gap-1 rounded-md border border-theme-border px-2 transition-colors hover:bg-theme-border ${shareText === 'Copied!' ? 'text-green-500 bg-green-50 dark:bg-green-900/30' : 'text-theme-muted'}`} title="Share Project"><Share size={14} /> <span className="text-xs">{shareText}</span></button>
            <button onClick={() => setIsLocked(!isLocked)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-colors hover:bg-theme-border hover:text-theme-text ${isLocked ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-theme-muted'}`} title={isLocked ? "Unlock" : "Lock"}>{isLocked ? <Lock size={14} /> : <Unlock size={14} />}</button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-opacity hover:opacity-80 ${isSidebarOpen ? 'bg-theme-border text-theme-text' : 'text-theme-muted'}`} title="Toggle Details Sidebar"><PanelRight size={14} /></button>
          </div>
        </div>

        {/* Editable Main Project with Click-to-Edit & Sleek Save */}
        <div className="flex flex-col gap-2 relative">
          
          {/* Title: Click to Edit */}
          {isEditingTitle && !isLocked ? (
            <input 
              autoFocus
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              onBlur={() => { handleSaveMainDetails(); setIsEditingTitle(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSaveMainDetails(); setIsEditingTitle(false); } }}
              placeholder="Project Title..."
              className="text-3xl font-bold text-theme-text bg-transparent outline-none border-b border-blue-500 w-full pb-1 transition-colors"
            />
          ) : (
            <h1 
              onClick={() => !isLocked && setIsEditingTitle(true)}
              className={`text-3xl font-bold text-theme-text pb-1 border-b border-transparent transition-colors min-h-[40px] ${!isLocked ? 'cursor-pointer hover:border-theme-border' : ''}`}
            >
              {projectName || <span className="opacity-50">Project Title...</span>}
            </h1>
          )}

          {/* Description: Click to Edit */}
          <div className="relative mt-2">
            {isEditingDesc && !isLocked ? (
              <div className="relative">
                <textarea 
                  autoFocus
                  value={projectDesc} 
                  onChange={(e) => setProjectDesc(e.target.value)} 
                  onBlur={() => { handleSaveMainDetails(); setIsEditingDesc(false); }}
                  placeholder="Add details about this project..."
                  className="max-w-2xl text-theme-muted bg-theme-border/10 rounded-md p-3 outline-none w-full resize-none border border-blue-500 min-h-[100px] pb-10 transition-all shadow-sm"
                />
                <button 
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => { handleSaveMainDetails(); setIsEditingDesc(false); }} 
                  title="Save Details"
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-600 active:scale-95"
                >
                  {isSavingDetails ? <CheckCircle2 size={16}/> : <Save size={16}/>}
                </button>
              </div>
            ) : (
              <div 
                onClick={() => !isLocked && setIsEditingDesc(true)}
                className={`max-w-2xl text-theme-muted min-h-[80px] p-3 -ml-3 rounded-md border border-transparent transition-colors whitespace-pre-wrap ${!isLocked ? 'cursor-pointer hover:bg-theme-border/20 hover:border-theme-border/50' : ''}`}
              >
                {projectDesc || <span className="opacity-50">Add details about this project...</span>}
              </div>
            )}
          </div>
        </div>

        {/* Inline Properties & Labels */}
        <div className="flex flex-col gap-4 text-sm mt-4">
          <div className="flex items-start gap-6">
            <span className="mt-1 w-24 text-theme-muted">Properties</span>
            <div className="flex flex-wrap items-center gap-2">
              {propertiesList.map((prop) => (
                <span 
                  key={prop} 
                  onClick={() => { if(!isLocked) setPropertiesList(propertiesList.filter(p => p !== prop))}} 
                  className={`group flex items-center gap-1.5 rounded-full border border-theme-border px-3 py-1 text-xs font-medium text-theme-text transition-colors ${isLocked ? '' : 'cursor-pointer hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'}`}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-theme-text text-[8px] font-bold text-theme-base shadow-sm">{prop.charAt(0).toUpperCase()}</span>{prop}
                  {!isLocked && <X size={10} className="ml-1 hidden group-hover:block" />}
                </span>
              ))}
              {!isLocked && (
                <input type="text" value={customProperty} onChange={(e) => setCustomProperty(e.target.value)} onKeyDown={handleAddProperty} placeholder="+ Add Property" className="w-32 rounded-full border border-dashed border-theme-border bg-transparent px-3 py-1 text-xs font-medium text-theme-text outline-none transition-colors hover:border-theme-text focus:border-solid focus:border-blue-500" />
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <span className="mt-1 w-24 text-theme-muted">Labels</span>
            <div className="flex flex-wrap items-center gap-2">
              {labels.map(label => (
                <span key={label} onClick={() => { if(!isLocked) setLabels(labels.filter(l => l !== label))}} className={`group flex items-center gap-1 rounded-full border border-theme-border px-3 py-1 text-xs font-medium text-theme-text transition-colors ${isLocked ? '' : 'cursor-pointer hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'}`}>
                  <Tag size={10} /> {label} {!isLocked && <X size={10} className="ml-1 hidden group-hover:block" />}
                </span>
              ))}
              {(!isLocked && isAddingLabel) ? (
                <input autoFocus value={newLabelText} onChange={(e) => setNewLabelText(e.target.value)} onKeyDown={handleAddLabel} onBlur={() => setIsAddingLabel(false)} placeholder="Type & Enter..." className="rounded-full border border-theme-border bg-transparent px-3 py-1 text-xs text-theme-text outline-none focus:border-blue-500" />
              ) : (!isLocked && (
                <button onClick={() => setIsAddingLabel(true)} className="flex items-center gap-1 rounded-full border border-dashed border-theme-border px-3 py-1 text-xs font-medium text-theme-muted transition-colors hover:border-theme-text hover:text-theme-text"><Plus size={10} /> Add Label</button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Tasks (Subtasks) Section */}
        <div>
          <button className="mb-4 flex items-center gap-2 text-sm font-bold text-theme-text hover:opacity-80">▾ Project Tasks ({projectTasks.length})</button>
          <div className="overflow-hidden rounded-lg border border-theme-border bg-theme-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-theme-border bg-theme-sidebar text-theme-muted">
                <tr>
                  <th className="px-4 py-3 font-medium w-1/3">Task</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Members</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {projectTasks.map((pt) => (
                  editingTaskId === pt.id ? (
                    <tr key={pt.id} className="bg-theme-border/20">
                      <td className="px-4 py-3"><input autoFocus value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditProjectTask()} className="w-full bg-transparent text-sm text-theme-text outline-none border-b border-theme-text" /></td>
                      <td className="px-4 py-3"><select value={editTaskPriority} onChange={(e) => setEditTaskPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer"><option value="High" className="text-theme-base">High</option><option value="Medium" className="text-theme-base">Medium</option><option value="Low" className="text-theme-base">Low</option><option value="Normal" className="text-theme-base">Normal</option></select></td>
                      <td className="px-4 py-3"><input type="text" value={editTaskMember} onChange={(e) => setEditTaskMember(e.target.value)} placeholder="Name..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" /></td>
                      <td className="px-4 py-3"><input type="date" value={editTaskDate} onChange={(e) => setEditTaskDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" /></td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2"><button onClick={() => setEditingTaskId(null)} className="p-1 text-theme-muted hover:text-theme-text"><X size={16} /></button><button onClick={saveEditProjectTask} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90"><Save size={12} /> Save</button></td>
                    </tr>
                  ) : (
                    <tr key={pt.id} className="transition-colors hover:bg-theme-border/50">
                      <td className="px-4 py-3 font-medium text-theme-text">{pt.title}</td>
                      <td className={`px-4 py-3 ${getPriorityColor(pt.priority)}`}>{pt.priority}</td>
                      <td className="px-4 py-3">
                        {pt.members ? (
                           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[10px] font-bold text-white shadow-sm" title={pt.members}>{pt.members.charAt(0).toUpperCase()}</div>
                        ) : (
                           <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-theme-border text-theme-muted" title="No members">+</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-theme-muted">{pt.date ? new Date(pt.date).toLocaleDateString() : "No Date"}</td>
                      <td className="px-4 py-3 text-right text-theme-muted flex items-center justify-end gap-2">
                        {!isLocked && (
                          <><button onClick={() => startEditProjectTask(pt)} className="transition-colors hover:text-blue-500"><Edit2 size={16} /></button><button onClick={() => setProjectTasks(projectTasks.filter(t => t.id !== pt.id))} className="transition-colors hover:text-red-500"><Trash2 size={16} /></button></>
                        )}
                      </td>
                    </tr>
                  )
                ))}
                
                {(!isLocked && isAddingTask) ? (
                  <tr className="bg-theme-border/20">
                    <td className="px-4 py-3"><input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveProjectTask()} placeholder="Task Name..." className="w-full bg-transparent text-sm text-theme-text outline-none focus:border-b focus:border-theme-text" /></td>
                    <td className="px-4 py-3"><select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer"><option value="High" className="text-theme-base">High</option><option value="Medium" className="text-theme-base">Medium</option><option value="Low" className="text-theme-base">Low</option><option value="Normal" className="text-theme-base">Normal</option></select></td>
                    <td className="px-4 py-3"><input type="text" value={newTaskMember} onChange={(e) => setNewTaskMember(e.target.value)} placeholder="Name..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" /></td>
                    <td className="px-4 py-3"><input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" /></td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2"><button onClick={() => setIsAddingTask(false)} className="p-1 text-theme-muted hover:text-theme-text"><X size={16} /></button><button onClick={handleSaveProjectTask} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90"><Save size={12} /> Save</button></td>
                  </tr>
                ) : (!isLocked && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3"><button onClick={() => setIsAddingTask(true)} className="flex w-full items-center gap-1 font-medium text-theme-muted transition-colors hover:text-theme-text"><Plus size={14} className="mr-1"/> Add Task</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      {isSidebarOpen && (
        <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-80 transition-all duration-300">
          
          {/* Details Card */}
          <div className="rounded-xl border border-theme-border bg-theme-card p-4 shadow-sm relative">
            <div className="mb-6 flex items-center justify-between border-b border-theme-border pb-3 relative">
              <h3 className="flex items-center gap-2 font-bold text-theme-text">▾ Details</h3>
              <div className="flex items-center gap-2 text-theme-muted relative" ref={settingsDropdownRef}>
                <Plus size={16} className="cursor-pointer hover:text-theme-text" />
                <Settings 
                  size={16} 
                  className="cursor-pointer hover:text-theme-text" 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                />
                {isSettingsOpen && (
                  <div className="absolute right-0 top-6 z-50 w-36 rounded-lg border border-theme-border bg-theme-card p-1 shadow-lg">
                    <button onClick={handleDuplicateProject} className="w-full rounded-md px-3 py-2 text-left text-xs text-theme-text hover:bg-theme-border">Duplicate Project</button>
                    {/* <button onClick={handleArchiveProject} className="w-full rounded-md px-3 py-2 text-left text-xs text-theme-text hover:bg-theme-border">Archive Project</button> */}
                    <div className="my-1 border-t border-theme-border"></div>
                    <button onClick={handleDeleteProject} className="w-full rounded-md px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">Delete Project</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Status</span>
                <button disabled={isLocked} onClick={cycleStatus} className="flex flex-1 items-center gap-2 font-medium text-theme-text transition-colors hover:opacity-80">
                  <Circle size={10} className={`fill-current ${status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`} /> {status}
                </button>
              </div>
              
              <div className="flex items-center justify-between relative" ref={priorityDropdownRef}>
                <span className="w-24 text-theme-muted">Priority</span>
                <button 
                  disabled={isLocked} 
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)} 
                  className={`flex flex-1 items-center gap-1 font-medium transition-colors hover:bg-theme-border px-1 py-0.5 rounded-md ${getPriorityColor(priority)}`}
                >
                  <SignalHigh size={14}/> {priority} <span className="text-theme-muted ml-1 text-xs">v</span>
                </button>

                {isPriorityDropdownOpen && !isLocked && (
                  <div className="absolute left-24 top-8 z-50 w-48 rounded-lg border border-theme-border bg-theme-card p-1 shadow-xl">
                    <div className="px-3 py-2 text-xs font-semibold text-theme-muted">Priority</div>
                    {["No Priority", "Urgent", "High", "Medium", "Low"].map((level) => (
                      <button 
                        key={level} onClick={() => handlePrioritySelect(level)} 
                        className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-theme-border ${getPriorityColor(level)}`}
                      >
                        <div className="flex items-center gap-2"><SignalHigh size={14} /> {level}</div>
                        {priority === level && <Check size={14} className="text-theme-text" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Members</span>
                <button disabled={isLocked} className="flex flex-1 items-center gap-1 font-medium text-theme-text transition-colors hover:opacity-80">
                  {lead ? (
                    <div className="flex items-center gap-1"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-[9px] font-bold text-white shadow-sm">{lead.charAt(0).toUpperCase()}</div> {lead}</div>
                  ) : (
                    <><Plus size={14}/> Add members</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Dates</span>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-theme-muted text-xs mr-1">Due:</span>
                  <input type="date" disabled={isLocked} value={dueDateStr} onChange={handleDueDateChange} className="w-28 rounded-md border border-theme-border bg-transparent px-1 py-0.5 text-xs text-theme-text outline-none [color-scheme:dark] transition-colors hover:bg-theme-border" />
                </div>
              </div>

              <div className="flex items-start justify-between">
                <span className="mt-1 w-24 text-theme-muted">Labels</span>
                <div className="flex flex-1 flex-wrap items-center gap-1">
                  {labels.map(l => <span key={l} className="rounded border border-theme-border px-1.5 py-0.5 text-[10px] text-theme-text">{l}</span>)}
                  {!isLocked && <button onClick={() => setIsAddingLabel(true)} className="text-theme-muted hover:text-theme-text"><Plus size={14}/></button>}
                </div>
              </div>

              {/* Functional Teams Section */}
              <div className="flex items-start justify-between">
                <span className="mt-1 w-24 text-theme-muted">Teams</span>
                <div className="flex flex-1 flex-wrap items-center gap-1">
                  {teamsList.map(t => <span key={t} onClick={() => { if(!isLocked) setTeamsList(teamsList.filter(x => x !== t))}} className={`rounded bg-theme-border px-1.5 py-0.5 text-[10px] font-medium text-theme-text ${isLocked ? '' : 'cursor-pointer hover:bg-red-50 hover:text-red-500'}`}>{t}</span>)}
                  {!isLocked && (
                    isAddingTeam ? (
                      <input autoFocus value={newTeamText} onChange={e => setNewTeamText(e.target.value)} onKeyDown={handleAddTeam} onBlur={() => setIsAddingTeam(false)} placeholder="Team name" className="w-16 bg-transparent border-b border-theme-border text-xs outline-none focus:border-blue-500" />
                    ) : (
                      <button onClick={() => setIsAddingTeam(true)} className="text-theme-muted hover:text-theme-text"><Plus size={14}/></button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Reporter</span>
                <div className="flex flex-1 items-center gap-1 text-theme-text font-medium">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-sm">Y</div>
                  You
                </div>
              </div>

            </div>
          </div>

          {/* Updates Card (Activity Log) */}
          <div className="rounded-xl border border-theme-border bg-theme-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="flex items-center gap-2 font-bold text-theme-text">▾ Updates</h3>
            </div>
            <div className="flex flex-col gap-5">
              {updatesLog.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[10px] font-bold text-white shadow-sm flex-shrink-0">
                    {log.author.charAt(0)}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-theme-text">{log.author}</span>
                    <span className="text-sm text-theme-muted">{log.text} · <span className="text-xs">{log.date}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}