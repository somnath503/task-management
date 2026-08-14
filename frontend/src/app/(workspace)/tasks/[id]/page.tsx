"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  Lock, Unlock, PanelRight, Plus, Tag, SignalHigh, Circle, X, ArrowLeft, Trash2, Save, Edit2, CheckCircle2, Eye, Share, Settings, Check
} from "lucide-react";

interface Task {
  id: string;
  fullName: string;
  lastName: string;
  iepDue?: string;
  priority?: string;
  status?: string;
  collaborators?: string;
}

interface Subtask {
  id: number;
  title: string;
  priority: string;
  members: string;
  date: string;
}

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  // Main Task Fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [isSavingDetails, setIsSavingDetails] = useState(false); 

  // Sidebar Fields
  const [status, setStatus] = useState("Backlog");
  const [priority, setPriority] = useState("No Priority");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  const [propertiesList, setPropertiesList] = useState(["Designer"]);
  const [customProperty, setCustomProperty] = useState("");

  const [labels, setLabels] = useState(["Research"]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelText, setNewLabelText] = useState("");

  const [teamsList, setTeamsList] = useState(["Frontend"]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamText, setNewTeamText] = useState("");

  // Dropdown Refs
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Share & Updates
  const [shareText, setShareText] = useState("Share");
  const [eyeActive, setEyeActive] = useState(false);
  const [updatesLog, setUpdatesLog] = useState([
    { id: 1, text: "posted an update", date: "Aug 2026", author: "You" }
  ]);
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: 1, title: "Draft initial structure", priority: "High", members: "AB", date: "" }
  ]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskPriority, setNewSubtaskPriority] = useState("Normal");
  const [newSubtaskMember, setNewSubtaskMember] = useState("");
  const [newSubtaskDate, setNewSubtaskDate] = useState("");
  
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
  const [editSubtaskPriority, setEditSubtaskPriority] = useState("Normal");
  const [editSubtaskMember, setEditSubtaskMember] = useState("");
  const [editSubtaskDate, setEditSubtaskDate] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3001/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTask(res.data);
        setTaskTitle(res.data.fullName || "");
        setTaskDesc(res.data.lastName || "");
        if (res.data.status) setStatus(res.data.status);
        if (res.data.priority) setPriority(res.data.priority);
        if (res.data.createdAt) setStartDateStr(new Date(res.data.createdAt).toISOString().split('T')[0]);
        if (res.data.iepDue) setEndDateStr(new Date(res.data.iepDue).toISOString().split('T')[0]);
      } catch (error) {
        console.error("Failed to fetch task details");
      } finally {
        setIsLoading(false);
      }
    };
    if (taskId) fetchTask();
  }, [taskId]);

  // Click Outside Listener for Detail Page Dropdowns
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
      await axios.patch(`http://localhost:3001/tasks/${taskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleSaveMainDetails = async () => {
    setIsSavingDetails(true);
    await saveUpdateToBackend({ fullName: taskTitle, lastName: taskDesc });
    logUpdate(`updated task details`);
    setTimeout(() => setIsSavingDetails(false), 1500); 
  };

  // Settings Actions
  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      router.push("/tasks");
    } catch (error) { console.error("Failed to delete task:", error); }
  };

  const handleDuplicateTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { fullName: `${taskTitle} (Copy)`, lastName: taskDesc, priority: priority, status: status, iepDue: endDateStr ? new Date(endDateStr).toISOString() : undefined };
      const res = await axios.post(`http://localhost:3001/tasks`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsSettingsOpen(false);
      router.push(`/tasks/${res.data.id}`);
    } catch (error) { console.error("Failed to duplicate task:", error); }
  };

  const handleArchiveTask = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3001/tasks/${taskId}`, { status: "Archived" }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus("Archived");
      logUpdate("archived the task");
      setIsSettingsOpen(false);
    } catch (error) { console.error("Failed to archive task:", error); }
  };

  const logUpdate = (text: string) => {
    setUpdatesLog(prev => [{ id: Date.now(), text: text, date: "Just now", author: "You" }, ...prev]);
  };

  const cycleStatus = () => {
    if (isLocked) return;
    const statuses = ["Backlog", "In Progress", "In Review", "Done"];
    const nextStatus = statuses[(statuses.indexOf(status) + 1) % statuses.length];
    setStatus(nextStatus);
    saveUpdateToBackend({ status: nextStatus });
    logUpdate(`changed status to ${nextStatus}`);
  };

  const handlePrioritySelect = (newPriority: string) => {
    setIsPriorityDropdownOpen(false);
    if (newPriority === priority) return;
    logUpdate(`changed priority from ${priority || 'No Priority'} to ${newPriority}`);
    setPriority(newPriority);
    saveUpdateToBackend({ priority: newPriority });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const val = e.target.value;
    setEndDateStr(val);
    if (val) saveUpdateToBackend({ iepDue: new Date(val).toISOString() });
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
    if (e.key === 'Enter') { e.preventDefault(); const val = customProperty.trim(); if (val !== "" && !propertiesList.includes(val)) setPropertiesList([...propertiesList, val]); setCustomProperty(""); }
  };
  const handleAddLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); const val = newLabelText.trim(); if (val !== "" && !labels.includes(val)) setLabels([...labels, val]); setNewLabelText(""); setIsAddingLabel(false); }
  };
  const handleAddTeam = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); const val = newTeamText.trim(); if (val !== "" && !teamsList.includes(val)) setTeamsList([...teamsList, val]); setNewTeamText(""); setIsAddingTeam(false); }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: taskTitle || 'Task Details', url: window.location.href }); } catch (err) { console.error('Share failed:', err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!");
      setTimeout(() => setShareText("Share"), 2000);
    }
  };

  // Subtask Functions
  const handleSaveSubtask = () => {
    if (newSubtaskTitle.trim() === "") return;
    setSubtasks([...subtasks, { id: Date.now(), title: newSubtaskTitle.trim(), priority: newSubtaskPriority, members: newSubtaskMember, date: newSubtaskDate }]);
    setNewSubtaskTitle(""); setNewSubtaskPriority("Normal"); setNewSubtaskMember(""); setNewSubtaskDate(""); setIsAddingSubtask(false);
  };
  const startEditSubtask = (st: Subtask) => {
    setEditingSubtaskId(st.id); setEditSubtaskTitle(st.title); setEditSubtaskPriority(st.priority); setEditSubtaskMember(st.members); setEditSubtaskDate(st.date);
  };
  const saveEditSubtask = () => {
    setSubtasks(subtasks.map(st => st.id === editingSubtaskId ? { ...st, title: editSubtaskTitle, priority: editSubtaskPriority, members: editSubtaskMember, date: editSubtaskDate } : st));
    setEditingSubtaskId(null);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center text-theme-muted">Loading Task Details...</div>;
  if (!task) return <div className="flex h-full items-center justify-center text-red-500">Task not found.</div>;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-theme-muted">
            <Link href="/tasks" className="flex items-center gap-1 font-medium text-theme-text transition-colors hover:opacity-80">
              <ArrowLeft size={16} /> Back
            </Link>
    
          </div>
          <div className="flex items-center gap-2">
            {/* <button onClick={() => setEyeActive(!eyeActive)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-colors hover:bg-theme-border ${eyeActive ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-theme-muted'}`} title="Watch Task"><Eye size={14} /></button> */}
            <button onClick={handleShareClick} className={`flex h-8 items-center justify-center gap-1 rounded-md border border-theme-border px-2 transition-colors hover:bg-theme-border ${shareText === 'Copied!' ? 'text-green-500 bg-green-50 dark:bg-green-900/30' : 'text-theme-muted'}`} title="Share Task"><Share size={14} /> <span className="text-xs">{shareText}</span></button>
            <button onClick={() => setIsLocked(!isLocked)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-colors hover:bg-theme-border hover:text-theme-text ${isLocked ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-theme-muted'}`} title={isLocked ? "Unlock Task" : "Lock Task"}>{isLocked ? <Lock size={14} /> : <Unlock size={14} />}</button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`flex h-8 w-8 items-center justify-center rounded-md border border-theme-border transition-opacity hover:opacity-80 ${isSidebarOpen ? 'bg-theme-border text-theme-text' : 'text-theme-muted'}`} title="Toggle Details Sidebar"><PanelRight size={14} /></button>
          </div>
        </div>

       {/* Editable Main Task with Click-to-Edit & Sleek Save */}
        <div className="flex flex-col gap-2 relative">
          
          {/* Title: Click to Edit */}
          {isEditingTitle && !isLocked ? (
            <input 
              autoFocus
              value={taskTitle} 
              onChange={(e) => setTaskTitle(e.target.value)} 
              onBlur={() => { handleSaveMainDetails(); setIsEditingTitle(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSaveMainDetails(); setIsEditingTitle(false); } }}
              placeholder="Task Title..."
              className="text-3xl font-bold text-theme-text bg-transparent outline-none border-b border-blue-500 w-full pb-1 transition-colors"
            />
          ) : (
            <h1 
              onClick={() => !isLocked && setIsEditingTitle(true)}
              className={`text-3xl font-bold text-theme-text pb-1 border-b border-transparent transition-colors min-h-[40px] ${!isLocked ? 'cursor-pointer hover:border-theme-border' : ''}`}
            >
              {taskTitle || <span className="opacity-50">Task Title...</span>}
            </h1>
          )}

          {/* Description: Click to Edit */}
          <div className="relative mt-2">
            {isEditingDesc && !isLocked ? (
              <div className="relative">
                <textarea 
                  autoFocus
                  value={taskDesc} 
                  onChange={(e) => setTaskDesc(e.target.value)} 
                  onBlur={() => { handleSaveMainDetails(); setIsEditingDesc(false); }}
                  placeholder="Add details about this task..."
                  className="max-w-2xl text-theme-muted bg-theme-border/10 rounded-md p-3 outline-none w-full resize-none border border-blue-500 min-h-[100px] pb-10 transition-all shadow-sm"
                />
                <button 
                  onMouseDown={(e) => e.preventDefault()} // Prevents textarea from losing focus before click registers
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
                {taskDesc || <span className="opacity-50">Add details about this task...</span>}
              </div>
            )}
          </div>
        </div>

        {/* Inline Properties & Labels below the main text */}
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
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-theme-text text-[8px] font-bold text-theme-base shadow-sm">
                    {prop.charAt(0).toUpperCase()}
                  </span>
                  {prop}
                  {!isLocked && <X size={10} className="ml-1 hidden group-hover:block" />}
                </span>
              ))}
              {!isLocked && (
                <input 
                  type="text" 
                  value={customProperty} 
                  onChange={(e) => setCustomProperty(e.target.value)} 
                  onKeyDown={handleAddProperty} 
                  placeholder="+ Add Property" 
                  className="w-32 rounded-full border border-dashed border-theme-border bg-transparent px-3 py-1 text-xs font-medium text-theme-text outline-none transition-colors hover:border-theme-text focus:border-solid focus:border-blue-500" 
                />
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <span className="mt-1 w-24 text-theme-muted">Labels</span>
            <div className="flex flex-wrap items-center gap-2">
              {labels.map(label => (
                <span 
                  key={label} 
                  onClick={() => { if(!isLocked) setLabels(labels.filter(l => l !== label))}} 
                  className={`group flex items-center gap-1 rounded-full border border-theme-border px-3 py-1 text-xs font-medium text-theme-text transition-colors ${isLocked ? '' : 'cursor-pointer hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'}`}
                >
                  <Tag size={10} /> {label} {!isLocked && <X size={10} className="ml-1 hidden group-hover:block" />}
                </span>
              ))}
              {(!isLocked && isAddingLabel) ? (
                <input 
                  autoFocus 
                  value={newLabelText} 
                  onChange={(e) => setNewLabelText(e.target.value)} 
                  onKeyDown={handleAddLabel} 
                  onBlur={() => setIsAddingLabel(false)} 
                  placeholder="Type & Enter..." 
                  className="rounded-full border border-theme-border bg-transparent px-3 py-1 text-xs text-theme-text outline-none focus:border-blue-500" 
                />
              ) : (!isLocked && (
                <button 
                  onClick={() => setIsAddingLabel(true)} 
                  className="flex items-center gap-1 rounded-full border border-dashed border-theme-border px-3 py-1 text-xs font-medium text-theme-muted transition-colors hover:border-theme-text hover:text-theme-text"
                >
                  <Plus size={10} /> Add Label
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div>
          <button className="mb-4 flex items-center gap-2 text-sm font-bold text-theme-text hover:opacity-80">▾ Subtasks ({subtasks.length})</button>
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
                {subtasks.map((st) => (
                  editingSubtaskId === st.id ? (
                    <tr key={st.id} className="bg-theme-border/20">
                      <td className="px-4 py-3"><input autoFocus value={editSubtaskTitle} onChange={(e) => setEditSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditSubtask()} className="w-full bg-transparent text-sm text-theme-text outline-none border-b border-theme-text" /></td>
                      <td className="px-4 py-3"><select value={editSubtaskPriority} onChange={(e) => setEditSubtaskPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer"><option value="High" className="text-theme-base">High</option><option value="Medium" className="text-theme-base">Medium</option><option value="Low" className="text-theme-base">Low</option><option value="Normal" className="text-theme-base">Normal</option></select></td>
                      <td className="px-4 py-3"><input type="text" value={editSubtaskMember} onChange={(e) => setEditSubtaskMember(e.target.value)} placeholder="Name..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" /></td>
                      <td className="px-4 py-3"><input type="date" value={editSubtaskDate} onChange={(e) => setEditSubtaskDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" /></td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2"><button onClick={() => setEditingSubtaskId(null)} className="p-1 text-theme-muted hover:text-theme-text"><X size={16} /></button><button onClick={saveEditSubtask} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90"><Save size={12} /> Save</button></td>
                    </tr>
                  ) : (
                    <tr key={st.id} className="transition-colors hover:bg-theme-border/50">
                      <td className="px-4 py-3 font-medium text-theme-text">{st.title}</td>
                      <td className={`px-4 py-3 ${getPriorityColor(st.priority)}`}>{st.priority}</td>
                      <td className="px-4 py-3">
                        {st.members ? (
                           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[10px] font-bold text-white shadow-sm" title={st.members}>{st.members.charAt(0).toUpperCase()}</div>
                        ) : (
                           <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-theme-border text-theme-muted" title="No members">+</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-theme-muted">{st.date ? new Date(st.date).toLocaleDateString() : "No Date"}</td>
                      <td className="px-4 py-3 text-right text-theme-muted flex items-center justify-end gap-2">
                        {!isLocked && (
                          <><button onClick={() => startEditSubtask(st)} className="transition-colors hover:text-blue-500"><Edit2 size={16} /></button><button onClick={() => setSubtasks(subtasks.filter(t => t.id !== st.id))} className="transition-colors hover:text-red-500"><Trash2 size={16} /></button></>
                        )}
                      </td>
                    </tr>
                  )
                ))}
                
                {(!isLocked && isAddingSubtask) ? (
                  <tr className="bg-theme-border/20">
                    <td className="px-4 py-3"><input autoFocus value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveSubtask()} placeholder="Subtask Name..." className="w-full bg-transparent text-sm text-theme-text outline-none focus:border-b focus:border-theme-text" /></td>
                    <td className="px-4 py-3"><select value={newSubtaskPriority} onChange={(e) => setNewSubtaskPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer"><option value="High" className="text-theme-base">High</option><option value="Medium" className="text-theme-base">Medium</option><option value="Low" className="text-theme-base">Low</option><option value="Normal" className="text-theme-base">Normal</option></select></td>
                    <td className="px-4 py-3"><input type="text" value={newSubtaskMember} onChange={(e) => setNewSubtaskMember(e.target.value)} placeholder="Name..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" /></td>
                    <td className="px-4 py-3"><input type="date" value={newSubtaskDate} onChange={(e) => setNewSubtaskDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" /></td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2"><button onClick={() => setIsAddingSubtask(false)} className="p-1 text-theme-muted hover:text-theme-text"><X size={16} /></button><button onClick={handleSaveSubtask} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90"><Save size={12} /> Save</button></td>
                  </tr>
                ) : (!isLocked && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3"><button onClick={() => setIsAddingSubtask(true)} className="flex w-full items-center gap-1 font-medium text-theme-muted transition-colors hover:text-theme-text"><Plus size={14} className="mr-1"/> Add Subtasks</button></td>
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
                
                {/* Settings Gear & Dropdown */}
                <Settings 
                  size={16} 
                  className="cursor-pointer hover:text-theme-text" 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                />
                {isSettingsOpen && (
                  <div className="absolute right-0 top-6 z-50 w-36 rounded-lg border border-theme-border bg-theme-card p-1 shadow-lg">
                    <button onClick={handleDuplicateTask} className="w-full rounded-md px-3 py-2 text-left text-xs text-theme-text hover:bg-theme-border">Duplicate Task</button>
                    {/* <button onClick={handleArchiveTask} className="w-full rounded-md px-3 py-2 text-left text-xs text-theme-text hover:bg-theme-border">Archive Task</button> */}
                    <div className="my-1 border-t border-theme-border"></div>
                    <button onClick={handleDeleteTask} className="w-full rounded-md px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">Delete Task</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Status</span>
                <button disabled={isLocked} onClick={cycleStatus} className="flex flex-1 items-center gap-2 font-medium text-theme-text transition-colors hover:opacity-80">
                  <Circle size={10} className={`fill-current ${status === 'Done' ? 'text-green-500' : 'text-orange-500'}`} /> {status}
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
                  {task?.collaborators ? (
                    <div className="flex items-center gap-1"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[9px] font-bold text-white shadow-sm">{task.collaborators.charAt(0).toUpperCase()}</div> {task.collaborators}</div>
                  ) : (
                    <><Plus size={14}/> Add members</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="w-24 text-theme-muted">Dates</span>
                <div className="flex flex-1 items-center gap-1">
                  <input type="date" disabled={isLocked} value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} className="w-24 rounded-md border border-theme-border bg-transparent px-1 py-0.5 text-xs text-theme-text outline-none [color-scheme:dark] transition-colors hover:bg-theme-border" />
                  <span className="text-theme-muted">→</span>
                  <input type="date" disabled={isLocked} value={endDateStr} onChange={handleEndDateChange} className="w-24 rounded-md border border-theme-border bg-transparent px-1 py-0.5 text-xs text-theme-text outline-none [color-scheme:dark] transition-colors hover:bg-theme-border" />
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