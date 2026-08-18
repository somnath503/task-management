"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Plus, Trash2, Save, X, Search, 
  SignalHigh, Check, Filter, Columns, User, Edit2, ChevronRight, Share, List, LayoutGrid
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  priority?: string;
  lead?: string;
  dueDate?: string;
  status?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState("");
  const [shareText, setShareText] = useState("Share");

  // Dropdown States
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterSubmenu, setActiveFilterSubmenu] = useState<string | null>(null);
  
  const [visibleColumns, setVisibleColumns] = useState({
    priority: true,
    lead: true,
    dueDate: true,
  });
  
  const fieldsDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Inline Add Form State
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newPriority, setNewPriority] = useState("Normal");
  const [newDueDate, setNewDueDate] = useState("");
  const [newLead, setNewLead] = useState("");

  // Inline Edit Form State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editPriority, setEditPriority] = useState("Normal");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLead, setEditLead] = useState("");

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("API_BASE_URL/projects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to fetch projects.");
      }
    };
    fetchProjects();
  }, []);

  // Click Outside Listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldsDropdownRef.current && !fieldsDropdownRef.current.contains(event.target as Node)) setIsFieldsOpen(false);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
        setActiveFilterSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShareClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Projects Board', url: window.location.href }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!"); setTimeout(() => setShareText("Share"), 2000);
    }
  };

  // Save New Project
  const handleSaveInlineProject = async (defaultStatus: string = "Planning") => {
    if (newProjectName.trim() === "") return;
    const payload = {
      name: newProjectName,
      priority: newPriority,
      lead: newLead || undefined,
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      status: defaultStatus
    };
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("API_BASE_URL/projects", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects([res.data, ...projects]); 
      setNewProjectName(""); setNewDueDate(""); setNewPriority("Normal"); setNewLead(""); setAddingSection(null);
    } catch (error) { console.error("Failed to save project:", error); }
  };

  // Start Editing Project
  const startEditingProject = (p: Project) => {
    setEditingProjectId(p.id); setEditProjectName(p.name); setEditPriority(p.priority || "Normal");
    setEditLead(p.lead || ""); setEditDueDate(p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : "");
  };

  // Save Edited Project
  const saveEditingProject = async () => {
    if (!editingProjectId || editProjectName.trim() === "") return;
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: editProjectName,
        priority: editPriority,
        lead: editLead || null,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      };
      await axios.patch(`API_BASE_URL/projects/${editingProjectId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(projects.map(p => p.id === editingProjectId ? { ...p, name: editProjectName, priority: editPriority, lead: editLead || undefined, dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined } : p));
      setEditingProjectId(null);
    } catch (error) { console.error("Failed to update project:", error); }
  };

  // Delete Project
  const deleteProject = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`API_BASE_URL/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) { console.error("Failed to delete project"); }
  };

  const getPriorityColor = (pri: string) => {
    if (pri === "Urgent") return "text-red-600";
    if (pri === "High") return "text-orange-500";
    if (pri === "Medium") return "text-yellow-500";
    if (pri === "Low") return "text-blue-400";
    return "text-theme-muted";
  };

  // Complex Filter Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter ? p.priority === priorityFilter : true;
    const matchesLead = leadFilter ? p.lead?.toLowerCase().includes(leadFilter.toLowerCase()) : true;
    return matchesSearch && matchesPriority && matchesLead;
  });

  const toggleColumn = (col: keyof typeof visibleColumns) => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));

  // --- BOARD VIEW (Only ONE column now) ---
  const renderBoardColumn = (title: string, groupProjects: Project[], defaultStatus: string) => (
    <div className="flex flex-col gap-3 min-w-[300px] flex-1 max-w-[400px]" key={title}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-theme-text">{title} <span className="text-theme-muted font-normal">({groupProjects.length})</span></span>
        <button onClick={() => setAddingSection(title)} className="text-theme-muted hover:text-theme-text"><Plus size={16} /></button>
      </div>

      {addingSection === title && (
        <div className="rounded-lg border border-theme-border bg-theme-card p-3 shadow-sm mb-2">
          <input autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineProject(defaultStatus)} placeholder="Project name..." className="w-full bg-transparent text-sm font-medium text-theme-text outline-none mb-3" />
          <div className="flex items-center justify-between">
            <button onClick={() => setAddingSection(null)} className="text-xs text-theme-muted hover:text-theme-text">Cancel</button>
            <button onClick={() => handleSaveInlineProject(defaultStatus)} className="rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90">Save</button>
          </div>
        </div>
      )}

      {groupProjects.map(project => (
        <div key={project.id} className="group relative flex flex-col gap-3 rounded-lg border border-theme-border bg-theme-card p-3 shadow-sm hover:border-theme-text/30 transition-colors">
          <div className="flex justify-between items-start gap-2">
            <Link href={`/projects/${project.id}`} className={`text-sm font-medium text-theme-text hover:underline hover:text-blue-500 transition-colors ${project.status === 'Completed' ? 'line-through opacity-70' : ''}`}>
              {project.name}
            </Link>
            <button onClick={() => deleteProject(project.id)} className="text-theme-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className={`flex items-center gap-1 text-xs font-medium ${getPriorityColor(project.priority || "Normal")}`}>
              <SignalHigh size={12} /> {project.priority || "Normal"}
            </span>
            <div className="flex items-center gap-2">
               {project.dueDate && <span className="text-xs text-theme-muted">{new Date(project.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
               {project.lead && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-[9px] font-bold text-white shadow-sm" title={project.lead}>
                    {project.lead.charAt(0).toUpperCase()}
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-text">Projects</h1>
        
        <div className="flex items-center gap-2 text-sm relative">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-theme-muted" />
            <input 
              type="text" placeholder="Search projects..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-theme-border bg-transparent py-1.5 pl-8 pr-3 text-theme-text outline-none focus:border-blue-500 transition-colors w-48"
            />
          </div>
          
          {/* Share Button */}
          <button 
            onClick={handleShareClick}
            className="flex items-center gap-2 rounded-md border border-theme-border px-3 py-1.5 font-medium text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
          >
            <Share size={14} /> <span className={`hidden sm:inline ${shareText === 'Copied!' ? 'text-green-500' : ''}`}>{shareText}</span>
          </button>

          {/* Fields Dropdown */}
          <div className="relative" ref={fieldsDropdownRef}>
            <button 
              onClick={() => setIsFieldsOpen(!isFieldsOpen)}
              className="flex items-center gap-2 rounded-md border border-theme-border px-3 py-1.5 font-medium text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors"
            >
              <Columns size={14} /> Fields ▾
            </button>
            {isFieldsOpen && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-theme-border bg-theme-card p-2 shadow-xl">
                {/* List / Board Switch */}
                <div className="flex border-b border-theme-border pb-2 mb-2 bg-theme-border/30 rounded-md p-1">
                  <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}>
                    <List size={12}/> List
                  </button>
                  <button onClick={() => setViewMode('board')} className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1 rounded-md transition-colors ${viewMode === 'board' ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}>
                    <LayoutGrid size={12}/> Board
                  </button>
                </div>
                
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggleColumn('priority')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">Priority {visibleColumns.priority && <Check size={14} />}</button>
                  <button onClick={() => toggleColumn('lead')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">Members {visibleColumns.lead && <Check size={14} />}</button>
                  <button onClick={() => toggleColumn('dueDate')} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-theme-text hover:bg-theme-border">Due Date {visibleColumns.dueDate && <Check size={14} />}</button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Dropdown (Nested Menu Matching Figma) */}
          <div className="relative" ref={filterDropdownRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center rounded-md border border-theme-border p-1.5 transition-colors ${priorityFilter || leadFilter ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30' : 'text-theme-muted hover:bg-theme-border hover:text-theme-text'}`}
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
                  
                  {/* Reporter/Members Input Filter */}
                  <button onMouseEnter={() => setActiveFilterSubmenu('reporter')} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm text-theme-text ${activeFilterSubmenu === 'reporter' ? 'bg-theme-border' : 'hover:bg-theme-border'}`}>
                    <div className="flex items-center gap-2"><User size={14} className="text-theme-muted"/> Reporter</div>
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

                {/* Reporter / Members Nested Submenu */}
                {activeFilterSubmenu === 'reporter' && (
                  <div className="absolute right-full top-8 mr-1 w-48 rounded-lg border border-theme-border bg-theme-card p-2 shadow-xl">
                    <div className="text-xs text-theme-muted mb-2">Filter by Reporter</div>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Type initials or name..."
                      value={leadFilter}
                      onChange={(e) => setLeadFilter(e.target.value)}
                      className="w-full rounded-md border border-theme-border bg-theme-base px-2 py-1.5 text-sm text-theme-text outline-none focus:border-blue-500"
                    />
                    <div className="mt-2 flex justify-end">
                      <button onClick={() => { setLeadFilter(""); setIsFilterOpen(false); }} className="text-xs text-theme-muted hover:text-theme-text mr-3">Clear</button>
                      <button onClick={() => setIsFilterOpen(false)} className="rounded bg-theme-text px-2 py-1 text-xs font-medium text-theme-base">Apply</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="overflow-x-auto rounded-lg border border-theme-border bg-theme-card transition-colors duration-200">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-theme-border bg-theme-sidebar text-theme-muted">
              <tr>
                <th className="px-4 py-4 font-medium w-1/2">Projects</th>
                {visibleColumns.priority && <th className="px-4 py-4 font-medium">Priority</th>}
                {visibleColumns.lead && <th className="px-4 py-4 font-medium">Lead</th>}
                {visibleColumns.dueDate && <th className="px-4 py-4 font-medium">Due Date</th>}
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {filteredProjects.map((project) => (
                editingProjectId === project.id ? (
                  /* INLINE EDIT ROW */
                  <tr key={project.id} className="bg-theme-border/20">
                    <td className="px-4 py-3">
                      <input autoFocus value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditingProject()} className="w-full bg-transparent text-sm font-medium text-theme-text outline-none border-b border-theme-text" />
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
                    {visibleColumns.lead && (
                      <td className="px-4 py-3">
                        <input type="text" value={editLead} onChange={(e) => setEditLead(e.target.value)} placeholder="Initials..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" />
                      </td>
                    )}
                    {visibleColumns.dueDate && (
                      <td className="px-4 py-3">
                        <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" />
                      </td>
                    )}
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      <button onClick={() => setEditingProjectId(null)} className="p-1 text-theme-muted hover:text-theme-text transition-colors"><X size={16} /></button>
                      <button onClick={saveEditingProject} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1 text-xs font-medium text-theme-base hover:opacity-90 transition-opacity"><Save size={12} /> Save</button>
                    </td>
                  </tr>
                ) : (
                  /* NORMAL VIEW ROW */
                  <tr key={project.id} className="transition-colors hover:bg-theme-border/50">
                    <td className="px-4 py-3 font-medium text-theme-text">
                      <Link href={`/projects/${project.id}`} className="hover:underline hover:text-blue-500 transition-colors">
                        {project.name}
                      </Link>
                    </td>
                    {visibleColumns.priority && (
                      <td className={`px-4 py-3 font-medium ${getPriorityColor(project.priority || "Normal")}`}>
                        <SignalHigh size={14} className="inline mr-1"/> {project.priority || "Normal"}
                      </td>
                    )}
                    {visibleColumns.lead && (
                      <td className="px-4 py-3">
                        {project.lead ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white shadow-sm" title={project.lead}>
                            {project.lead.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-theme-border text-theme-muted" title="No lead">+</div>
                        )}
                      </td>
                    )}
                    {visibleColumns.dueDate && (
                      <td className="px-4 py-3 text-theme-muted">
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No Date"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-theme-muted flex items-center justify-end gap-2">
                      <button onClick={() => startEditingProject(project)} className="p-1 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deleteProject(project.id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )
              ))}

              {/* INLINE ADD ROW */}
              {addingSection === 'list' ? (
                <tr className="bg-theme-border/20">
                  <td className="px-4 py-3">
                    <input autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineProject("Planning")} placeholder="Project Name..." className="w-full bg-transparent text-sm text-theme-text outline-none border-b border-theme-text" />
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
                  {visibleColumns.lead && (
                    <td className="px-4 py-3">
                      <input type="text" value={newLead} onChange={(e) => setNewLead(e.target.value)} placeholder="Initials..." className="w-16 bg-transparent text-sm text-theme-text outline-none border-b border-theme-border" />
                    </td>
                  )}
                  {visibleColumns.dueDate && (
                    <td className="px-4 py-3">
                      <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="bg-transparent text-sm text-theme-text outline-none cursor-pointer [color-scheme:dark]" />
                    </td>
                  )}
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setAddingSection(null)} className="p-1 text-theme-muted hover:text-theme-text transition-colors"><X size={16} /></button>
                    <button onClick={() => handleSaveInlineProject("Planning")} className="flex items-center gap-1 rounded bg-theme-text px-3 py-1.5 text-xs font-medium text-theme-base hover:opacity-90 transition-opacity"><Save size={12} /> Save</button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4">
                    <button onClick={() => setAddingSection('list')} className="flex w-full items-center gap-2 font-medium text-theme-muted transition-colors hover:text-theme-text">
                      <Plus size={16} /> Add Projects
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
          {/* ONLY ONE COLUMN FOR PROJECTS IN BOARD VIEW */}
          {renderBoardColumn("All Projects", filteredProjects, "Planning")}
        </div>
      )}
    </div>
  );
}