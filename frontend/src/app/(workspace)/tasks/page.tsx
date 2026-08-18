"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Plus, CheckCircle2, Circle, Trash2, Save, X, Search, 
  SignalHigh, List, LayoutGrid, Check, Edit2, Share, Filter, ChevronRight, User, Users, Calendar, Tag
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState("");
  
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterSubmenu, setActiveFilterSubmenu] = useState<string | null>(null);
  
  const [visibleColumns, setVisibleColumns] = useState({
    priority: true,
    members: true,
    dueDate: true,
  });
  
  // Dropdown Click-Outside Refs
  const fieldsDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Share State
  const [shareText, setShareText] = useState("Share");

  // Inline Add Form State
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Normal");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMember, setNewMember] = useState("");

  // Inline Edit State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editPriority, setEditPriority] = useState("Normal");
  const [editDueDate, setEditDueDate] = useState("");
  const [editMember, setEditMember] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("API_BASE_URL/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (error) {
        console.error("Failed to fetch tasks.");
      }
    };
    fetchTasks();
  }, []);

  // Click Outside Listener for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldsDropdownRef.current && !fieldsDropdownRef.current.contains(event.target as Node)) {
        setIsFieldsOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
        setActiveFilterSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Share Functionality
  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tasks Board',
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!");
      setTimeout(() => setShareText("Share"), 2000);
    }
  };

  const handleSaveInlineTask = async (defaultStatus: string) => {
    if (newTaskTitle.trim() === "") return;

    const newTaskPayload = {
      fullName: newTaskTitle,
      lastName: "Pending Details",
      priority: newPriority,
      status: defaultStatus,
      iepDue: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      collaborators: newMember || undefined,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("API_BASE_URL/tasks", newTaskPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle(""); setNewDueDate(""); setNewPriority("Normal"); setNewMember(""); setAddingSection(null);
    } catch (error) {
      console.error("Failed to save inline task:", error);
    }
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.fullName);
    setEditPriority(task.priority || "Normal");
    setEditDueDate(task.iepDue ? new Date(task.iepDue).toISOString().split('T')[0] : "");
    setEditMember(task.collaborators || "");
  };

  const saveEditingTask = async () => {
    if (!editingTaskId || editTaskTitle.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        fullName: editTaskTitle,
        priority: editPriority,
        iepDue: editDueDate ? new Date(editDueDate).toISOString() : null,
        collaborators: editMember || null,
      };

      await axios.patch(`API_BASE_URL/tasks/${editingTaskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(tasks.map(t => 
        t.id === editingTaskId 
          ? { ...t, fullName: editTaskTitle, priority: editPriority, iepDue: payload.iepDue as string, collaborators: editMember || undefined }
          : t
      ));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Failed to save edited task:", error);
    }
  };

  const toggleTaskCompletion = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Done" ? "Backlog" : "Done";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`API_BASE_URL/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch(e) {
      console.error(e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`API_BASE_URL/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task");
    }
  };

  const getPriorityColor = (pri: string) => {
    if (pri === "Urgent") return "text-red-600";
    if (pri === "High") return "text-orange-500";
    if (pri === "Medium") return "text-yellow-500";
    if (pri === "Low") return "text-blue-400";
    return "text-theme-muted";
  };

  // Complex Filter Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    const matchesMember = memberFilter ? t.collaborators?.toLowerCase().includes(memberFilter.toLowerCase()) : true;
    return matchesSearch && matchesPriority && matchesMember;
  });

  const groupedTasks = {
    "To Do": filteredTasks.filter(t => !t.status || t.status === "Backlog" || t.status === "To Do"),
    "Doing": filteredTasks.filter(t => t.status === "In Progress" || t.status === "In Review"),
    "Completed": filteredTasks.filter(t => t.status === "Done"),
  };

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // --- LIST VIEW ---
  const renderListTable = (title: string, groupTasks: Task[], defaultStatus: string) => (
    <div className="mb-8" key={title}>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-bold text-theme-text">▾ {title} ({groupTasks.length})</span>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-theme-border bg-theme-card transition-colors duration-200">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-theme-border bg-theme-sidebar text-theme-muted">
            <tr>
              <th className="px-4 py-3 font-medium w-12"></th>
              <th className="px-4 py-3 font-medium w-1/2">Task</th>
              {visibleColumns.priority && <th className="px-4 py-3 font-medium">Priority</th>}
              {visibleColumns.members && <th className="px-4 py-3 font-medium">Members</th>}
              {visibleColumns.dueDate && <th className="px-4 py-3 font-medium">Due Date</th>}
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {groupTasks.map((task) => (
              editingTaskId === task.id ? (
                /* INLINE EDIT ROW */
                <tr key={task.id} className="bg-theme-border/20">
                  <td className="px-4 py-3"><Circle size={18} className="text-theme-muted opacity-50" /></td>
                  <td className="px-4 py-3">
                    <input autoFocus value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditingTask()} className="w-full bg-transparent text-sm font-medium text-theme-text outline-none border-b border-theme-text" />
                  </td>
                  {visibleColumns.priority && (
                    <td className="px-4 py-3">
                      <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer">
                        <option value="Urgent" className="text-theme-base">Urgent</option>
                        <option value="High" className="text-theme-base">High</option>
                        <option value="Medium" className="text-theme-base">Medium</option>
                        <option value="Low" className="text-theme-base">Low</option>
                        <option value="Normal" className="text-theme-base">Normal</option>
                      </select>
                    </td>
                  )}
                  {visibleColumns.members && (
                    <td className="px-4 py-3">
                      <input type="text" value={editMember} onChange={(e) => setEditMember(e.target.value)} placeholder="Name..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" />
                    </td>
                  )}
                  {visibleColumns.dueDate && (
                    <td className="px-4 py-3">
                      <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" />
                    </td>
                  )}
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setEditingTaskId(null)} className="p-1 text-theme-muted hover:text-theme-text transition-colors"><X size={16} /></button>
                    <button onClick={saveEditingTask} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90 transition-opacity"><Save size={12} /> Save</button>
                  </td>
                </tr>
              ) : (
                /* NORMAL VIEW ROW */
                <tr key={task.id} className={`transition-colors hover:bg-theme-border/50 ${task.status === 'Done' ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleTaskCompletion(task.id, task.status || "")} className="text-theme-muted hover:text-green-500">
                      {task.status === 'Done' ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
                    </button>
                  </td>
                  <td className={`px-4 py-3 font-medium text-theme-text ${task.status === 'Done' ? 'line-through' : ''}`}>
                    <Link href={`/tasks/${task.id}`} className="hover:underline hover:text-blue-500 transition-colors">
                      {task.fullName}
                    </Link>
                  </td>
                  {visibleColumns.priority && (
                    <td className={`px-4 py-3 font-medium ${getPriorityColor(task.priority || "Normal")}`}>
                      <SignalHigh size={14} className="inline mr-1"/> {task.priority || "Normal"}
                    </td>
                  )}
                  {visibleColumns.members && (
                    <td className="px-4 py-3">
                      {task.collaborators ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-xs font-bold text-white shadow-sm" title={task.collaborators}>{task.collaborators.charAt(0).toUpperCase()}</div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-theme-border text-theme-muted" title="No members">+</div>
                      )}
                    </td>
                  )}
                  {visibleColumns.dueDate && (
                    <td className="px-4 py-3 text-theme-muted">
                      {task.iepDue ? new Date(task.iepDue).toLocaleDateString() : "No Date"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-theme-muted flex items-center justify-end gap-2">
                    <button onClick={() => startEditingTask(task)} className="p-1 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              )
            ))}

            {/* INLINE ADD ROW */}
            {addingSection === title ? (
              <tr className="bg-theme-border/20">
                <td className="px-4 py-3"><Circle size={18} className="text-theme-muted opacity-50" /></td>
                <td className="px-4 py-3">
                  <input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineTask(defaultStatus)} placeholder="Task Name..." className="w-full bg-transparent text-sm text-theme-text outline-none border-b border-theme-text" />
                </td>
                {visibleColumns.priority && (
                  <td className="px-4 py-3">
                    <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer">
                      <option value="Urgent" className="text-theme-base">Urgent</option>
                      <option value="High" className="text-theme-base">High</option>
                      <option value="Medium" className="text-theme-base">Medium</option>
                      <option value="Low" className="text-theme-base">Low</option>
                      <option value="Normal" className="text-theme-base">Normal</option>
                    </select>
                  </td>
                )}
                {visibleColumns.members && (
                  <td className="px-4 py-3">
                    <input type="text" value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Initials..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" />
                  </td>
                )}
                {visibleColumns.dueDate && (
                  <td className="px-4 py-3">
                    <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" />
                  </td>
                )}
                <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                  <button onClick={() => setAddingSection(null)} className="p-1 text-theme-muted hover:text-theme-text transition-colors"><X size={16} /></button>
                  <button onClick={() => handleSaveInlineTask(defaultStatus)} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1.5 text-xs font-medium text-theme-base hover:opacity-90 transition-opacity"><Save size={12} /> Save</button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-3">
                  <button onClick={() => setAddingSection(title)} className="flex w-full items-center gap-1 font-medium text-theme-muted transition-colors hover:text-theme-text">
                    <Plus size={16} /> Add Task
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- BOARD VIEW ---
  const renderBoardColumn = (title: string, groupTasks: Task[], defaultStatus: string) => (
    <div className="flex flex-col gap-3 min-w-[300px] flex-1" key={title}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-theme-text">{title} <span className="text-theme-muted font-normal">({groupTasks.length})</span></span>
        <button onClick={() => setAddingSection(title)} className="text-theme-muted hover:text-theme-text"><Plus size={16} /></button>
      </div>

      {addingSection === title && (
        <div className="rounded-lg border border-theme-border bg-theme-card p-3 shadow-sm mb-2">
          <input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineTask(defaultStatus)} placeholder="Task name..." className="w-full bg-transparent text-sm font-medium text-theme-text outline-none mb-3" />
          <div className="flex items-center justify-between">
            <button onClick={() => setAddingSection(null)} className="text-xs text-theme-muted hover:text-theme-text">Cancel</button>
            <button onClick={() => handleSaveInlineTask(defaultStatus)} className="rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90">Save</button>
          </div>
        </div>
      )}

      {groupTasks.map(task => (
        <div key={task.id} className="group relative flex flex-col gap-3 rounded-lg border border-theme-border bg-theme-card p-3 shadow-sm hover:border-theme-text/30 transition-colors">
          <div className="flex justify-between items-start gap-2">
            <Link href={`/tasks/${task.id}`} className={`text-sm font-medium text-theme-text hover:underline ${task.status === 'Done' ? 'line-through opacity-70' : ''}`}>
              {task.fullName}
            </Link>
            <button onClick={() => deleteTask(task.id)} className="text-theme-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleTaskCompletion(task.id, task.status || "")} className="text-theme-muted hover:text-green-500">
                {task.status === 'Done' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
              </button>
              <span className={`flex items-center gap-1 text-xs font-medium ${getPriorityColor(task.priority || "Normal")}`}>
                <SignalHigh size={12} /> {task.priority || "Normal"}
              </span>
            </div>
            <div className="flex items-center gap-2">
               {task.iepDue && <span className="text-xs text-theme-muted">{new Date(task.iepDue).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
               {task.collaborators && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[9px] font-bold text-white shadow-sm">
                    {task.collaborators.charAt(0).toUpperCase()}
                  </div>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top Filter Bar Area */}
      <div className="mb-6 flex items-center justify-end gap-3 text-sm relative">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-theme-muted" />
          <input 
            type="text" placeholder="Search tasks..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border border-theme-border bg-transparent py-1.5 pl-8 pr-3 text-theme-text outline-none focus:border-blue-500 transition-colors"
          />
        </div>


        <button 
          onClick={handleShareClick}
          className="flex items-center gap-2 rounded-md border border-theme-border px-3 py-1.5 font-medium text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
        >
          <Share size={14} /> <span className={shareText === 'Copied!' ? 'text-green-500' : ''}>{shareText}</span>
        </button>
        
        <div className="relative" ref={fieldsDropdownRef}>
          <button 
            onClick={() => setIsFieldsOpen(!isFieldsOpen)}
            className="flex items-center gap-2 rounded-md border border-theme-border px-3 py-1.5 font-medium text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
          >
            Fields ▾
          </button>
          
          {isFieldsOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-theme-border bg-theme-card p-2 shadow-lg">
              <div className="flex border-b border-theme-border pb-2 mb-2 bg-theme-border/30 rounded-md p-1">
                <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}>
                  <List size={12}/> List
                </button>
                <button onClick={() => setViewMode('board')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1 rounded-md transition-colors ${viewMode === 'board' ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}>
                  <LayoutGrid size={12}/> Board
                </button>
              </div>
              
              <div className="flex flex-col gap-1">
                <button onClick={() => toggleColumn('priority')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">
                  Priority {visibleColumns.priority && <Check size={14} />}
                </button>
                <button onClick={() => toggleColumn('members')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">
                  Members {visibleColumns.members && <Check size={14} />}
                </button>
                <button onClick={() => toggleColumn('dueDate')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">
                  Due Date {visibleColumns.dueDate && <Check size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Filter Dropdown (Nested Menu) */}
        <div className="relative" ref={filterDropdownRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center rounded-md border border-theme-border p-1.5 transition-colors ${priorityFilter || memberFilter ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30' : 'text-theme-muted hover:bg-theme-border hover:text-theme-text'}`}
          >
            <Filter size={16} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-theme-border bg-theme-card p-1 shadow-xl">
              <div className="flex flex-col gap-1">
                <button onMouseEnter={() => setActiveFilterSubmenu('priority')} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm text-theme-text ${activeFilterSubmenu === 'priority' ? 'bg-theme-border' : 'hover:bg-theme-border'}`}>
                  <div className="flex items-center gap-2"><SignalHigh size={14} className="text-theme-muted"/> Priority</div>
                  <ChevronRight size={14} className="text-theme-muted" />
                </button>
                
                {/* Members Input Filter */}
                <button onMouseEnter={() => setActiveFilterSubmenu('members')} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm text-theme-text ${activeFilterSubmenu === 'members' ? 'bg-theme-border' : 'hover:bg-theme-border'}`}>
                  <div className="flex items-center gap-2"><User size={14} className="text-theme-muted"/> Members</div>
                  <ChevronRight size={14} className="text-theme-muted" />
                </button>
              </div>

              {/* Priority Nested Submenu */}
              {activeFilterSubmenu === 'priority' && (
                <div className="absolute right-full top-0 mr-1 w-48 rounded-lg border border-theme-border bg-theme-card p-1 shadow-xl">
                  <div className="px-3 py-2 text-xs text-theme-muted mb-1">Priority</div>
                  {["No Priority", "Urgent", "High", "Medium", "Low", "Normal"].map((level) => (
                    <button 
                      key={level}
                      onClick={() => { setPriorityFilter(level === "No Priority" ? null : level); setIsFilterOpen(false); setActiveFilterSubmenu(null); }} 
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-theme-border ${getPriorityColor(level)}`}
                    >
                      <div className="flex items-center gap-2"><SignalHigh size={14} /> {level}</div>
                      {((priorityFilter === level) || (!priorityFilter && level === "No Priority")) && <Check size={14} className="text-theme-text" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Members Nested Submenu */}
              {activeFilterSubmenu === 'members' && (
                <div className="absolute right-full top-8 mr-1 w-48 rounded-lg border border-theme-border bg-theme-card p-2 shadow-xl">
                  <div className="text-xs text-theme-muted mb-2">Filter by Member</div>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Type initials or name..."
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="w-full rounded-md border border-theme-border bg-theme-base px-2 py-1.5 text-sm text-theme-text outline-none focus:border-blue-500"
                  />
                  <div className="mt-2 flex justify-end">
                    <button onClick={() => { setMemberFilter(""); setIsFilterOpen(false); }} className="text-xs text-theme-muted hover:text-theme-text mr-3">Clear</button>
                    <button onClick={() => setIsFilterOpen(false)} className="rounded bg-theme-text px-2 py-1 text-xs font-medium text-theme-base">Apply</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        
      </div>

      {viewMode === 'list' ? (
        <div className="flex flex-col">
          {renderListTable("To Do", groupedTasks["To Do"], "Backlog")}
          {renderListTable("Doing", groupedTasks["Doing"], "In Progress")}
          {renderListTable("Completed", groupedTasks["Completed"], "Done")}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
          {renderBoardColumn("To Do", groupedTasks["To Do"], "Backlog")}
          {renderBoardColumn("Doing", groupedTasks["Doing"], "In Progress")}
          {renderBoardColumn("Completed", groupedTasks["Completed"], "Done")}
        </div>
      )}
    </div>
  );
}