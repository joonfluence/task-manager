import { useState, useEffect } from 'react';
import './App.css';

const SECTIONS = [
  { id: 'challenge', label: '📋 이번주 챌린지', color: '#3b82f6' },
  { id: 'todolist', label: '📌 틈틈히 리스트', color: '#10b981' },
  { id: 'difficult', label: '🎯 어려운 작업', color: '#f59e0b' },
  { id: 'easy', label: '🎧 쉬운 작업', color: '#8b5cf6' },
  { id: 'completed', label: '✅ 완료 현황', color: '#6b7280' },
  { id: 'today', label: '📅 오늘의 목표', color: '#ec4899' },
  { id: 'weekly', label: '🎬 주간 계획', color: '#06b6d4' }
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function ChallengeItem({ task, onToggleDay, onToggleComplete, onDelete }) {
  const dayData = task.dayData ? JSON.parse(task.dayData) : {};

  return (
    <div className="challenge-item">
      <div className="challenge-title-section">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id, task.completed)}
          className="task-checkbox"
        />
        <span className={`challenge-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="delete-button"
        >
          ✕
        </button>
      </div>

      <div className="day-selector">
        {DAYS.map(day => (
          <button
            key={day}
            className={`day-button ${dayData[day] ? 'active' : ''}`}
            onClick={() => onToggleDay(task.id, day)}
            title={`${day}요일`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, task.completed)}
        className="task-checkbox"
      />
      <span className={`task-title ${task.completed ? 'completed' : ''}`}>
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="delete-button"
      >
        ✕
      </button>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [activeSection, setActiveSection] = useState('challenge');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      const statsMap = {};
      data.forEach(stat => {
        statsMap[stat.section] = stat;
      });
      setStats(statsMap);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: activeSection,
          title: newTaskTitle
        })
      });

      if (response.ok) {
        setNewTaskTitle('');
        await fetchTasks();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleDay = async (taskId, day) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const dayData = task.dayData ? JSON.parse(task.dayData) : {};
    dayData[day] = !dayData[day];

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayData: JSON.stringify(dayData) })
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update day:', error);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (response.ok) {
        await fetchTasks();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTasks();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const currentSectionData = SECTIONS.find(s => s.id === activeSection);
  const sectionTasks = tasks.filter(t => t.section === activeSection);
  const sectionStats = stats[activeSection] || { total: 0, completed: 0 };

  if (loading) {
    return <div className="container"><div className="loading">로딩 중...</div></div>;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>📝 할 일 관리 서비스</h1>
        <p className="subtitle">Obsidian 할 일 목록을 웹에서 관리하세요</p>
      </header>

      <div className="container">
        {/* Sidebar - Sections */}
        <nav className="sidebar">
          <h3>섹션</h3>
          <div className="section-list">
            {SECTIONS.map(section => {
              const sectionStats = stats[section.id] || { total: 0, completed: 0 };
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  className={`section-button ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    borderLeftColor: isActive ? section.color : 'transparent'
                  }}
                >
                  <span>{section.label}</span>
                  <span className="count">
                    {sectionStats.completed}/{sectionStats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {/* Section Header */}
          <div className="section-header">
            <h2 style={{ color: currentSectionData.color }}>
              {currentSectionData.label}
            </h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${sectionStats.total > 0 ? (sectionStats.completed / sectionStats.total) * 100 : 0}%`,
                  backgroundColor: currentSectionData.color
                }}
              />
            </div>
            <p className="progress-text">
              {sectionStats.completed} / {sectionStats.total} 완료
            </p>
          </div>

          {/* Task List */}
          <div className="task-list">
            {sectionTasks.length === 0 ? (
              <p className="empty-state">이 섹션에 할 일이 없습니다.</p>
            ) : activeSection === 'challenge' ? (
              sectionTasks.map(task => (
                <ChallengeItem
                  key={task.id}
                  task={task}
                  onToggleDay={handleToggleDay}
                  onToggleComplete={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              sectionTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="새로운 할 일을 입력하세요..."
              className="task-input"
            />
            <button type="submit" className="add-button">
              추가
            </button>
          </form>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>총 {tasks.length}개의 할 일 중 {tasks.filter(t => t.completed).length}개 완료 | 마지막 동기화: {new Date().toLocaleTimeString('ko-KR')}</p>
      </footer>
    </div>
  );
}

export default App;
