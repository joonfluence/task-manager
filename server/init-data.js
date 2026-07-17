const db = require('./db');

const initialTasks = [
  // Challenge Section
  { section: 'challenge', title: '도파민 디톡스', priority: 'high', completed: 0 },
  { section: 'challenge', title: '매일 5KM 달리기', priority: 'high', completed: 1 },
  { section: 'challenge', title: '팔굽혀펴기 100회', priority: 'high', completed: 0 },
  { section: 'challenge', title: '일주일 2권 이상 독서', priority: 'medium', completed: 0 },
  
  // TodoList Section
  { section: 'todolist', title: '테니스장 등록', priority: 'medium', completed: 0 },
  { section: 'todolist', title: '10kg 바벨 2개 구매', priority: 'low', completed: 0 },
  { section: 'todolist', title: '이력서 수정 (SpringBatch OOM)', priority: 'high', completed: 0 },
  
  // Difficult Section
  { section: 'difficult', title: 'GC 관련 글 작성', priority: 'high', completed: 0 },
  { section: 'difficult', title: 'JVM/GC vs Node.js 비교 글', priority: 'medium', completed: 0 },
  
  // Today Section
  { section: 'today', title: 'JVM, GC, 동시성 학습 (6시간 이상)', priority: 'high', completed: 1 },
  { section: 'today', title: '분산 시스템 설계 1부 독서 및 정리', priority: 'high', completed: 1 },
];

const { v4: uuidv4 } = require('uuid');

initialTasks.forEach(task => {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT OR IGNORE INTO tasks (id, section, title, priority, completed, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, task.section, task.title, task.priority, task.completed, createdAt]
  );
});

console.log('✅ Initial data loaded');
