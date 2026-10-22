import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BookOpen, ClipboardList, Clock3, LogOut,
  Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, Menu, Bell,
  GraduationCap, CalendarClock, CircleHelp, Search, ArrowUpRight, BookMarked
} from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIMES = [
  { start: '08:30', end: '09:20' }, { start: '09:20', end: '10:10' },
  { start: '10:10', end: '11:00' }, { start: '11:20', end: '12:10' },
  { start: '12:10', end: '13:00' }, { start: '13:40', end: '14:30' },
  { start: '14:30', end: '15:20' }
]
const today = new Date()
const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const offsetDate = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return isoDate(d) }
const prettyDate = (value, options={ day:'numeric', month:'short' }) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', options) : '—'
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const seed = {
  timetable: [
    {id:'c1',day:'Monday',start:'08:30',end:'09:20',subject:'Mathematics',group:'Class 10-A',room:'Room 204'},
    {id:'c2',day:'Monday',start:'10:10',end:'11:00',subject:'Physics',group:'Class 11-B',room:'Lab 2'},
    {id:'c3',day:'Monday',start:'12:10',end:'13:00',subject:'Mathematics',group:'Class 9-C',room:'Room 106'},
    {id:'c4',day:'Tuesday',start:'09:20',end:'10:10',subject:'Physics',group:'Class 11-B',room:'Lab 2'},
    {id:'c5',day:'Tuesday',start:'11:20',end:'12:10',subject:'Science',group:'Class 8-A',room:'Room 105'},
    {id:'c6',day:'Wednesday',start:'08:30',end:'09:20',subject:'Mathematics',group:'Class 10-A',room:'Room 204'},
    {id:'c7',day:'Wednesday',start:'13:40',end:'14:30',subject:'Physics',group:'Class 11-B',room:'Lab 2'},
    {id:'c8',day:'Thursday',start:'10:10',end:'11:00',subject:'Science',group:'Class 8-A',room:'Room 105'},
    {id:'c9',day:'Friday',start:'09:20',end:'10:10',subject:'Mathematics',group:'Class 9-C',room:'Room 106'},
    {id:'c10',day:'Saturday',start:'08:30',end:'09:20',subject:'Revision',group:'Class 10-A',room:'Room 204'}
  ],
  lessons: [
    {id:'l1',subject:'Mathematics',group:'Class 10-A',topic:'Quadratic equations',date:offsetDate(0),duration:'50 minutes',status:'In Progress',notes:'Complete worked examples and practice questions.'},
    {id:'l2',subject:'Physics',group:'Class 11-B',topic:'Laws of motion',date:offsetDate(1),duration:'50 minutes',status:'Not Started',notes:'Bring the force diagram worksheet.'},
    {id:'l3',subject:'Science',group:'Class 8-A',topic:'Cell structure',date:offsetDate(3),duration:'40 minutes',status:'Not Started',notes:''}
  ],
  events: [
    {id:'e1',title:'Unit test — Mathematics',type:'Exam',date:offsetDate(4),time:'10:00',notes:'Class 10-A'},
    {id:'e2',title:'Submit lesson plans',type:'Deadline',date:offsetDate(2),time:'16:00',notes:'Upload weekly plans'},
    {id:'e3',title:'Staff planning meeting',type:'Academic',date:offsetDate(6),time:'14:00',notes:'Conference room'}
  ],
  tasks: [
    {id:'t1',title:'Prepare Mathematics worksheet',due:offsetDate(1),priority:'High',done:false},
    {id:'t2',title:'Review Class 11 assignments',due:offsetDate(2),priority:'Normal',done:false},
    {id:'t3',title:'Update weekly lesson plan',due:offsetDate(0),priority:'Normal',done:true}
  ]
}

function readData(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback } catch { return fallback }
}
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => readData(key, initial))
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue]
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  function submit(e) {
    e.preventDefault(); setError('')
    if (!email.includes('@')) return setError('Enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'register' && !name.trim()) return setError('Please enter your name.')
    const accounts = readData('tp_accounts', [])
    if (mode === 'register') {
      if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) return setError('An account with this email already exists.')
      const account = { name: name.trim(), email: email.toLowerCase(), password }
      localStorage.setItem('tp_accounts', JSON.stringify([...accounts, account]))
      localStorage.setItem('tp_user', JSON.stringify({name:account.name,email:account.email}))
      onLogin({name:account.name,email:account.email})
    } else {
      const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
      if (account) {
        localStorage.setItem('tp_user', JSON.stringify({name:account.name,email:account.email}))
        onLogin({name:account.name,email:account.email})
      } else if (email.toLowerCase() === 'demo@teacherplanner.com' && password === 'teacher123') {
        const demo = {name:'Alex Morgan',email:'demo@teacherplanner.com'}
        localStorage.setItem('tp_user', JSON.stringify(demo)); onLogin(demo)
      } else setError('Email or password not found. Try the demo account or register.')
    }
  }
  return <div className="auth-page">
    <div className="auth-left">
      <div className="brand"><span className="brand-mark"><GraduationCap size={22}/></span><span>Teacher Planner</span></div>
      <div className="auth-intro"><p className="eyebrow">A calmer school day</p><h1>Your teaching day,<br/><em>thoughtfully planned.</em></h1><p>Keep your timetable, lesson plans, and important dates in one simple workspace.</p></div>
      <div className="auth-note"><CalendarClock size={18}/> Plan the week. Make room to teach.</div>
    </div>
    <div className="auth-right">
      <form className="auth-form" onSubmit={submit}>
        <div className="mobile-brand"><GraduationCap size={24}/> Teacher Planner</div>
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
        <h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}</h2>
        <p className="muted">{mode === 'login' ? 'Your teaching day is waiting.' : 'Set up your personal planning space.'}</p>
        {mode === 'register' && <label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Alex Morgan" required/></label>}
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu" required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength="6" required/></label>
        {error && <div className="error-box">{error}</div>}
        <button className="btn primary full" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        {mode === 'login' && <button type="button" className="demo-btn" onClick={()=>{setEmail('demo@teacherplanner.com');setPassword('teacher123')}}>Fill demo account details</button>}
        <p className="auth-switch">{mode === 'login' ? 'New to Teacher Planner?' : 'Already have an account?'} <button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        <p className="security-note">Demo version: account details are stored in this browser only. This is not secure production authentication.</p>
      </form>
    </div>
  </div>
}

function Modal({ title, onClose, children }) {
  useEffect(() => { const fn = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn) }, [onClose])
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>{children}</div></div>
}
function Empty({title, text}) { return <div className="empty-state"><BookMarked size={24}/><strong>{title}</strong><span>{text}</span></div> }
function SectionHeader({eyebrow, title, subtitle, action}) { return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle&&<p className="muted">{subtitle}</p>}</div>{action}</div> }
function Status({status}) { return <span className={`status status-${status.toLowerCase().replaceAll(' ','-')}`}>{status}</span> }

export default function App() {
  const [user, setUser] = useState(() => readData('tp_user', null))
  const [timetable, setTimetable] = useStoredState('tp_timetable', seed.timetable)
  const [lessons, setLessons] = useStoredState('tp_lessons', seed.lessons)
  const [events, setEvents] = useStoredState('tp_events', seed.events)
  const [tasks, setTasks] = useStoredState('tp_tasks', seed.tasks)
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [activeDay, setActiveDay] = useState(DAYS[(today.getDay()+6)%7] || 'Monday')
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [calendarMode, setCalendarMode] = useState('month')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function logout() { localStorage.removeItem('tp_user'); setUser(null); navigate('/') }
  const todayName = DAYS[(today.getDay()+6)%7]
  const todaysClasses = timetable.filter(c=>c.day===todayName).sort((a,b)=>a.start.localeCompare(b.start))
  const pendingTasks = tasks.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due))
  const upcomingEvents = [...events].filter(e=>e.date>=isoDate(today)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4)
  const todayLessons = lessons.filter(l=>l.date===isoDate(today))
  const getFree = day => TIMES.filter(slot=>!timetable.some(c=>c.day===day&&c.start===slot.start)).map(s=>({...s,day}))
  const nextClass = todaysClasses.find(c=>c.start > `${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')}`)

  function openModal(type, record=null) { setEditing(record); setModal(type) }
  function saveRecord(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const v = Object.fromEntries(form.entries())
    if (modal==='class') {
      if (v.end<=v.start) return alert('Class end time must be after its start time.')
      const record={id:editing?.id||uid(),day:v.day,start:v.start,end:v.end,subject:v.subject.trim(),group:v.group.trim(),room:v.room.trim()}
      setTimetable(prev=>editing?prev.map(x=>x.id===editing.id?record:x):[...prev,record])
    } else if (modal==='lesson') {
      const record={id:editing?.id||uid(),subject:v.subject.trim(),group:v.group.trim(),topic:v.topic.trim(),date:v.date,duration:v.duration,status:v.status,notes:v.notes.trim()}
      setLessons(prev=>editing?prev.map(x=>x.id===editing.id?record:x):[...prev,record])
    } else if (modal==='event') {
      const record={id:editing?.id||uid(),title:v.title.trim(),type:v.type,date:v.date,time:v.time||'',notes:v.notes.trim()}
      setEvents(prev=>editing?prev.map(x=>x.id===editing.id?record:x):[...prev,record])
    } else if (modal==='task') {
      const record={id:editing?.id||uid(),title:v.title.trim(),due:v.due,priority:v.priority,done:editing?.done||false}
      setTasks(prev=>editing?prev.map(x=>x.id===editing.id?record:x):[...prev,record])
    }
    setModal(null); setEditing(null)
  }
  function removeRecord(type, id) {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    if(type==='class') setTimetable(p=>p.filter(x=>x.id!==id))
    if(type==='lesson') setLessons(p=>p.filter(x=>x.id!==id))
    if(type==='event') setEvents(p=>p.filter(x=>x.id!==id))
    if(type==='task') setTasks(p=>p.filter(x=>x.id!==id))
  }
  const navItems = [
    {to:'/dashboard',label:'Overview',icon:LayoutDashboard},
    {to:'/timetable',label:'Weekly timetable',icon:CalendarDays},
    {to:'/lessons',label:'Lesson planner',icon:BookOpen},
    {to:'/calendar',label:'Academic calendar',icon:CalendarClock},
    {to:'/tasks',label:'Tasks & deadlines',icon:ClipboardList}
  ]
  if (!user) return <Auth onLogin={setUser}/>
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><span className="brand-mark"><GraduationCap size={22}/></span><span>Teacher Planner</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item=><NavLink key={item.to} to={item.to} onClick={()=>setMobileNav(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><item.icon size={18}/><span>{item.label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18}/><div><strong>Keep it simple</strong><span>One day at a time.</span></div></div><button className="nav-item logout" onClick={logout}><LogOut size={18}/><span>Sign out</span></button></div>
    </aside>
    {mobileNav&&<div className="mobile-overlay" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={21}/></button><div className="crumb">Workspace <span>/</span> <strong>Planner</strong></div><div className="topbar-right"><span className="today-pill"><span className="green-dot"/>{today.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span><div className="avatar">{(user.name||'T').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div><div className="user-label"><strong>{user.name}</strong><span>Teacher account</span></div></div></header>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<Dashboard user={user} todayName={todayName} todaysClasses={todaysClasses} todayLessons={todayLessons} free={getFree(todayName)} tasks={pendingTasks} events={upcomingEvents} nextClass={nextClass} navigate={navigate} openModal={openModal} lessons={lessons}/>}/>
          <Route path="/timetable" element={<Timetable timetable={timetable} setTimetable={setTimetable} activeDay={activeDay} setActiveDay={setActiveDay} openModal={openModal} removeRecord={removeRecord} getFree={getFree} editing={editing}/>}/>
          <Route path="/lessons" element={<Lessons lessons={lessons} search={search} setSearch={setSearch} openModal={openModal} removeRecord={removeRecord} setLessons={setLessons}/>}/>
          <Route path="/calendar" element={<CalendarPage month={month} setMonth={setMonth} mode={calendarMode} setMode={setCalendarMode} events={events} lessons={lessons} timetable={timetable} openModal={openModal} removeRecord={removeRecord}/>}/>
          <Route path="/tasks" element={<Tasks tasks={tasks} setTasks={setTasks} openModal={openModal} removeRecord={removeRecord} search={search} setSearch={setSearch}/>}/>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </div>
      <footer className="footer"><span>Teacher Planner</span><span>Plan clearly. Teach confidently.</span></footer>
    </main>
    {modal && <RecordModal type={modal} editing={editing} onClose={()=>{setModal(null);setEditing(null)}} onSubmit={saveRecord}/>}
  </div>
}

function Dashboard({user,todayName,todaysClasses,todayLessons,free,tasks,events,nextClass,navigate,openModal,lessons}) {
  return <>
    <SectionHeader eyebrow="YOUR WORKSPACE" title={`Good ${today.getHours()<12?'morning':today.getHours()<17?'afternoon':'evening'}, ${user.name.split(' ')[0]}.`} subtitle={`${today.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Here's your teaching overview.`} action={<button className="btn primary" onClick={()=>openModal('class')}><Plus size={17}/> Add a class</button>}/>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon blue"><CalendarDays size={19}/></div><span>Classes today</span><strong>{todaysClasses.length}</strong><small>{todaysClasses.length===1?'1 class on your schedule':`${todaysClasses.length} classes on your schedule`}</small></div>
      <div className="stat-card"><div className="stat-icon green"><Clock3 size={19}/></div><span>Free periods</span><strong>{free.length}</strong><small>Across {todayName}</small></div>
      <div className="stat-card"><div className="stat-icon amber"><BookOpen size={19}/></div><span>Lessons planned</span><strong>{lessons.filter(l=>l.date>=isoDate(today)&&l.status!=='Completed').length}</strong><small>Upcoming and in progress</small></div>
      <div className="stat-card"><div className="stat-icon rose"><ClipboardList size={19}/></div><span>Pending tasks</span><strong>{tasks.length}</strong><small>Tasks still to complete</small></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel schedule-panel"><div className="panel-head"><div><h2>Today's schedule</h2><p className="muted">{todayName}, {prettyDate(isoDate(today),{day:'numeric',month:'long'})}</p></div><button className="text-btn" onClick={()=>navigate('/timetable')}>Full timetable <ArrowUpRight size={15}/></button></div>
        {todaysClasses.length===0?<Empty title="A lighter day" text="No classes are scheduled for today."/>:<div className="schedule-list">{todaysClasses.map((c,i)=><div className="schedule-row" key={c.id}><div className="time-col"><strong>{c.start}</strong><span>{c.end}</span></div><div className={`schedule-marker marker-${i%4}`}/><div className="schedule-info"><strong>{c.subject}</strong><span>{c.group} · {c.room}</span></div><span className="duration-tag">{c.start}–{c.end}</span></div>)}</div>}
        {nextClass&&<div className="next-class"><span className="green-dot"/><span><strong>Up next:</strong> {nextClass.subject} at {nextClass.start}</span></div>}
      </section>
      <section className="panel free-panel"><div className="panel-head"><div><h2>Free periods</h2><p className="muted">Room to plan, mark, and reset</p></div><Clock3 size={19} className="subtle-icon"/></div>
        <div className="free-summary"><strong>{free.length}</strong><span>open periods today</span></div>
        <div className="free-slots">{free.slice(0,6).map(s=><span key={s.start}>{s.start}<small>– {s.end}</small></span>)}</div>
        <button className="btn secondary full" onClick={()=>navigate('/timetable')}>View weekly availability</button>
      </section>
      <section className="panel"><div className="panel-head"><div><h2>Upcoming deadlines</h2><p className="muted">Stay one step ahead</p></div><button className="text-btn" onClick={()=>navigate('/tasks')}>View tasks <ArrowUpRight size={15}/></button></div>
        {tasks.length===0?<Empty title="All caught up" text="No pending tasks right now."/>:<div className="compact-list">{tasks.slice(0,4).map(t=><div className="compact-row" key={t.id}><span className="task-check"/><div className="compact-info"><strong>{t.title}</strong><span>Due {prettyDate(t.due,{weekday:'short',day:'numeric',month:'short'})}</span></div><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></div>)}</div>}
      </section>
      <section className="panel"><div className="panel-head"><div><h2>Academic dates</h2><p className="muted">Important dates coming up</p></div><button className="text-btn" onClick={()=>navigate('/calendar')}>Calendar <ArrowUpRight size={15}/></button></div>
        {events.length===0?<Empty title="No events ahead" text="Add exams, deadlines, or school events."/>:<div className="event-list">{events.map(ev=><div className="event-row" key={ev.id}><div className="event-date"><strong>{new Date(`${ev.date}T12:00:00`).getDate()}</strong><span>{new Date(`${ev.date}T12:00:00`).toLocaleDateString('en-IN',{month:'short'})}</span></div><div className="compact-info"><strong>{ev.title}</strong><span>{ev.type}{ev.time?` · ${ev.time}`:''}</span></div></div>)}</div>}
      </section>
    </div>
  </>
}

function Timetable({timetable,activeDay,setActiveDay,openModal,removeRecord,getFree}) {
  const classes = timetable.filter(c=>c.day===activeDay).sort((a,b)=>a.start.localeCompare(b.start))
  const sorted = [...timetable].sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day)||a.start.localeCompare(b.start))
  return <>
    <SectionHeader eyebrow="PLAN YOUR WEEK" title="Weekly timetable" subtitle="Your classes at a glance, Monday through Saturday." action={<button className="btn primary" onClick={()=>openModal('class')}><Plus size={17}/> Add a class</button>}/>
    <div className="day-tabs">{DAYS.map(d=><button key={d} onClick={()=>setActiveDay(d)} className={activeDay===d?'selected':''}>{d.slice(0,3)}<span>{timetable.filter(c=>c.day===d).length}</span></button>)}</div>
    <div className="panel timetable-panel"><div className="panel-head"><div><h2>{activeDay}</h2><p className="muted">{classes.length} scheduled classes · {getFree(activeDay).length} free periods</p></div><span className="availability-badge"><span className="green-dot"/>{getFree(activeDay).length} periods available</span></div>
      <div className="timetable-list">{TIMES.map((slot,i)=>{const c=classes.find(x=>x.start===slot.start);return <div className={`timetable-slot ${c?'has-class':'is-free'}`} key={slot.start}><div className="slot-time"><strong>{slot.start}</strong><span>{slot.end}</span></div><div className="slot-body">{c?<><div className={`class-color color-${i%4}`}/><div className="class-details"><strong>{c.subject}</strong><span>{c.group} <i>·</i> {c.room}</span></div><span className="class-time">{c.start} – {c.end}</span><div className="row-actions"><button className="icon-btn" aria-label="Edit class" onClick={()=>openModal('class',c)}><Pencil size={15}/></button><button className="icon-btn danger-hover" aria-label="Delete class" onClick={()=>removeRecord('class',c.id)}><Trash2 size={15}/></button></div></>:<div className="free-label"><span className="free-dot"/>Free period <small>Time for planning or a break</small></div>}</div></div>})}</div>
    </div>
    <div className="panel week-overview"><div className="panel-head"><div><h2>Week at a glance</h2><p className="muted">Compare teaching load across the week</p></div></div><div className="week-bars">{DAYS.map(d=>{const count=timetable.filter(c=>c.day===d).length;return <button key={d} className={`week-bar ${activeDay===d?'current':''}`} onClick={()=>setActiveDay(d)}><span className="bar-track"><span style={{height:`${Math.max(8,count/7*100)}%`}}/></span><strong>{count}</strong><small>{d.slice(0,3)}</small></button>})}</div></div>
  </>
}

function Lessons({lessons,search,setSearch,openModal,removeRecord,setLessons}) {
  const filtered=lessons.filter(l=>`${l.subject} ${l.group} ${l.topic}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.date.localeCompare(b.date))
  return <>
    <SectionHeader eyebrow="TEACHING PREPARATION" title="Lesson planner" subtitle="Plan each lesson and track your progress." action={<button className="btn primary" onClick={()=>openModal('lesson')}><Plus size={17}/> New lesson plan</button>}/>
    <div className="toolbar"><div className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lessons, subjects, classes…"/></div><span className="muted">{filtered.length} lesson plans</span></div>
    {filtered.length===0?<div className="panel"><Empty title="No lesson plans found" text="Try another search or create a new plan."/></div>:<div className="lesson-grid">{filtered.map(l=><article className="lesson-card" key={l.id}><div className="lesson-card-top"><span className="subject-tag">{l.subject}</span><Status status={l.status}/></div><h2>{l.topic}</h2><p className="lesson-group">{l.group}</p>{l.notes&&<p className="lesson-notes">{l.notes}</p>}<div className="lesson-meta"><span><CalendarDays size={15}/>{prettyDate(l.date,{day:'numeric',month:'short',year:'numeric'})}</span><span><Clock3 size={15}/>{l.duration}</span></div><div className="lesson-card-bottom"><select aria-label="Lesson status" value={l.status} onChange={e=>setLessons(p=>p.map(x=>x.id===l.id?{...x,status:e.target.value}:x))}><option>Not Started</option><option>In Progress</option><option>Completed</option></select><div className="row-actions"><button className="icon-btn" aria-label="Edit lesson" onClick={()=>openModal('lesson',l)}><Pencil size={15}/></button><button className="icon-btn danger-hover" aria-label="Delete lesson" onClick={()=>removeRecord('lesson',l.id)}><Trash2 size={15}/></button></div></div></article>)}</div>}
  </>
}

function CalendarPage({month,setMonth,mode,setMode,events,lessons,timetable,openModal,removeRecord}) {
  const year=month.getFullYear(), m=month.getMonth()
  const firstDay=(new Date(year,m,1).getDay()+6)%7
  const daysInMonth=new Date(year,m+1,0).getDate()
  const calendarCells=[...Array(firstDay).fill(null),...Array(daysInMonth).fill(0).map((_,i)=>i+1)]
  while(calendarCells.length%7) calendarCells.push(null)
  const allEvents=[...events.map(e=>({...e,kind:'event'})),...lessons.map(l=>({id:l.id,title:l.topic,type:'Lesson',date:l.date,kind:'lesson'}))]
  const selectedMonthEvents=allEvents.filter(e=>e.date.startsWith(`${year}-${String(m+1).padStart(2,'0')}`)).sort((a,b)=>a.date.localeCompare(b.date))
  const [selectedDate,setSelectedDate]=useState(isoDate(today))
  const selectedItems=allEvents.filter(e=>e.date===selectedDate)
  function shift(delta){setMonth(new Date(year,m+delta,1))}
  return <>
    <SectionHeader eyebrow="DATES THAT MATTER" title="Academic calendar" subtitle="Keep exams, deadlines, and lesson dates in view." action={<button className="btn primary" onClick={()=>openModal('event')}><Plus size={17}/> Add event</button>}/>
    <div className="calendar-layout"><section className="panel calendar-panel"><div className="calendar-controls"><button className="icon-btn" onClick={()=>shift(-1)} aria-label="Previous month"><ChevronLeft size={19}/></button><h2>{month.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h2><button className="icon-btn" onClick={()=>shift(1)} aria-label="Next month"><ChevronRight size={19}/></button><button className="text-btn today-link" onClick={()=>{setMonth(new Date(today.getFullYear(),today.getMonth(),1));setSelectedDate(isoDate(today))}}>Today</button></div>
      <div className="calendar-grid">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div className="calendar-weekday" key={d}>{d}</div>)}{calendarCells.map((day,i)=>{const date=day?`${year}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`:'';const dayItems=allEvents.filter(e=>e.date===date);return <button key={i} disabled={!day} onClick={()=>setSelectedDate(date)} className={`calendar-day ${date===selectedDate?'chosen':''} ${date===isoDate(today)?'is-today':''}`}><span>{day||''}</span>{dayItems.slice(0,2).map((ev,j)=><i key={ev.id+j} className={`calendar-dot dot-${ev.type==='Exam'?'exam':ev.type==='Deadline'?'deadline':ev.type==='Lesson'?'lesson':'event'}`}/>)}</button>})}</div>
      <div className="calendar-legend"><span><i className="calendar-dot dot-exam"/> Exams</span><span><i className="calendar-dot dot-deadline"/> Deadlines</span><span><i className="calendar-dot dot-lesson"/> Lessons</span><span><i className="calendar-dot dot-event"/> Events</span></div>
    </section>
    <aside className="panel selected-day-panel"><div className="panel-head"><div><p className="eyebrow">SELECTED DATE</p><h2>{prettyDate(selectedDate,{weekday:'long',day:'numeric',month:'long'})}</h2></div></div>{selectedItems.length===0?<Empty title="Nothing scheduled" text="This date is clear. Add an event whenever you need to."/>:<div className="selected-events">{selectedItems.map(ev=><div className="selected-event" key={ev.id}><div className={`event-line line-${ev.type==='Exam'?'exam':ev.type==='Deadline'?'deadline':ev.type==='Lesson'?'lesson':'event'}`}/><div><strong>{ev.title}</strong><span>{ev.type}{ev.time?` · ${ev.time}`:''}</span>{ev.kind==='event'&&<div className="row-actions event-actions"><button className="icon-btn" onClick={()=>openModal('event',events.find(x=>x.id===ev.id))}><Pencil size={14}/></button><button className="icon-btn danger-hover" onClick={()=>removeRecord('event',ev.id)}><Trash2 size={14}/></button></div>}</div></div>)}</div>}
      <div className="upcoming-mini"><h3>This month</h3>{selectedMonthEvents.length===0?<p className="muted">No events or lessons this month.</p>:selectedMonthEvents.slice(0,5).map(e=><button className="mini-date-row" key={`${e.kind}-${e.id}`} onClick={()=>setSelectedDate(e.date)}><span>{prettyDate(e.date,{day:'numeric',month:'short'})}</span><strong>{e.title}</strong></button>)}</div>
    </aside></div>
  </>
}

function Tasks({tasks,setTasks,openModal,removeRecord,search,setSearch}) {
  const filtered=tasks.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due))
  return <>
    <SectionHeader eyebrow="STAY ON TRACK" title="Tasks & deadlines" subtitle="A lightweight list for the work between lessons." action={<button className="btn primary" onClick={()=>openModal('task')}><Plus size={17}/> Add task</button>}/>
    <div className="toolbar"><div className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a task…"/></div><div className="task-counts"><span>{tasks.filter(t=>!t.done).length} pending</span><span>{tasks.filter(t=>t.done).length} completed</span></div></div>
    <section className="panel task-panel">{filtered.length===0?<Empty title="No tasks here" text="Add a task or try a different search."/>:filtered.map(t=><div className={`task-row ${t.done?'task-done':''}`} key={t.id}><button className={`check-button ${t.done?'checked':''}`} aria-label={t.done?'Mark as pending':'Mark as complete'} onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done&&<Check size={15}/>}</button><div className="task-title"><strong>{t.title}</strong><span>Due {prettyDate(t.due,{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span></div><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span><div className="row-actions"><button className="icon-btn" aria-label="Edit task" onClick={()=>openModal('task',t)}><Pencil size={15}/></button><button className="icon-btn danger-hover" aria-label="Delete task" onClick={()=>removeRecord('task',t.id)}><Trash2 size={15}/></button></div></div>)}</section>
  </>
}

function RecordModal({type,editing,onClose,onSubmit}) {
  const titles={class:editing?'Edit class':'Add a class',lesson:editing?'Edit lesson plan':'New lesson plan',event:editing?'Edit academic event':'Add academic event',task:editing?'Edit task':'Add a task'}
  const [err,setErr]=useState('')
  return <Modal title={titles[type]} onClose={onClose}><form className="record-form" onSubmit={e=>{const fd=new FormData(e.currentTarget);for(const [k,v] of fd.entries()){if(['subject','group','room','topic','title'].includes(k)&&!v.trim()){e.preventDefault();setErr('Please fill in all required fields.');return}}setErr('');onSubmit(e)}} noValidate>
    {type==='class'&&<>
      <label>Subject<input name="subject" defaultValue={editing?.subject||''} placeholder="e.g. Mathematics" required autoFocus/></label>
      <div className="form-row"><label>Day<select name="day" defaultValue={editing?.day||'Monday'}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></label><label>Class / section<input name="group" defaultValue={editing?.group||''} placeholder="e.g. Class 10-A" required/></label></div>
      <div className="form-row"><label>Start time<select name="start" defaultValue={editing?.start||'08:30'}>{TIMES.map(s=><option key={s.start} value={s.start}>{s.start}</option>)}</select></label><label>End time<select name="end" defaultValue={editing?.end||'09:20'}>{[...TIMES.map(s=>s.end),'15:40','16:00'].filter((v,i,a)=>a.indexOf(v)===i).sort().map(t=><option key={t}>{t}</option>)}</select></label></div>
      <label>Classroom<input name="room" defaultValue={editing?.room||''} placeholder="e.g. Room 204" required/></label>
    </>}
    {type==='lesson'&&<>
      <div className="form-row"><label>Subject<input name="subject" defaultValue={editing?.subject||''} placeholder="e.g. Physics" required autoFocus/></label><label>Class / section<input name="group" defaultValue={editing?.group||''} placeholder="e.g. Class 11-B" required/></label></div>
      <label>Lesson topic<input name="topic" defaultValue={editing?.topic||''} placeholder="e.g. Laws of motion" required/></label>
      <div className="form-row"><label>Planned date<input type="date" name="date" defaultValue={editing?.date||isoDate(today)} required/></label><label>Duration<select name="duration" defaultValue={editing?.duration||'50 minutes'}>{['30 minutes','40 minutes','50 minutes','60 minutes','90 minutes','2 hours'].map(x=><option key={x}>{x}</option>)}</select></label></div>
      <label>Status<select name="status" defaultValue={editing?.status||'Not Started'}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></label>
      <label>Notes <span className="optional">(optional)</span><textarea name="notes" defaultValue={editing?.notes||''} rows="3" placeholder="Materials, activities, or reminders…"/></label>
    </>}
    {type==='event'&&<>
      <label>Event title<input name="title" defaultValue={editing?.title||''} placeholder="e.g. Science unit test" required autoFocus/></label>
      <div className="form-row"><label>Event type<select name="type" defaultValue={editing?.type||'Academic'}><option>Academic</option><option>Exam</option><option>Deadline</option><option>Holiday</option><option>Meeting</option></select></label><label>Date<input type="date" name="date" defaultValue={editing?.date||isoDate(today)} required/></label></div>
      <label>Time <span className="optional">(optional)</span><input type="time" name="time" defaultValue={editing?.time||''}/></label>
      <label>Notes <span className="optional">(optional)</span><textarea name="notes" defaultValue={editing?.notes||''} rows="3" placeholder="Details or location…"/></label>
    </>}
    {type==='task'&&<>
      <label>Task title<input name="title" defaultValue={editing?.title||''} placeholder="e.g. Prepare weekly worksheets" required autoFocus/></label>
      <div className="form-row"><label>Due date<input type="date" name="due" defaultValue={editing?.due||isoDate(today)} required/></label><label>Priority<select name="priority" defaultValue={editing?.priority||'Normal'}><option>Low</option><option>Normal</option><option>High</option></select></label></div>
    </>}
    {err&&<div className="error-box">{err}</div>}
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn primary">{editing?'Save changes':'Create'}</button></div>
  </form></Modal>
}
