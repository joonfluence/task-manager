const db = require('./db');
const { parseMarkdownFile } = require('./markdown-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Obsidian Vault의 마크다운 파일 경로
const markdownPath = '/Users/yijun/Obsidian Vault/이번주_챌린지_틈틈히_할_일.md';

function loadFromMarkdown() {
  try {
    // 프로덕션 환경에서는 마크다운 로드 스킵
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ 프로덕션 환경: 마크다운 로드 스킵됨\n');
      return;
    }

    // DB에 데이터가 있는지 확인
    db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
      if (err || (row && row.count > 0)) {
        console.log('✅ DB에 기존 데이터가 있습니다. 마크다운 로드 스킵합니다.\n');
        return;
      }

      // DB가 비어있을 때만 마크다운 로드
      let tasks;
      try {
        tasks = parseMarkdownFile(markdownPath);
      } catch (parseErr) {
        console.log('⚠️  마크다운 파일을 찾을 수 없습니다. 초기화 스킵됨\n');
        return;
      }
      console.log(`\n📖 마크다운 파일에서 ${tasks.length}개의 항목을 로드합니다.\n`);

      // 새 데이터 삽입 (기존 데이터 유지)
      let inserted = 0;

      tasks.forEach(task => {
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        db.run(
          `INSERT INTO tasks (id, section, title, priority, completed, createdAt, dayData)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            task.section,
            task.title,
            task.priority || 'medium',
            task.completed || 0,
            createdAt,
            task.dayData || null
          ],
          (err) => {
            if (err) {
              console.error('Insert error:', err);
            } else {
              inserted++;
            }
          }
        );
      });

      // 완료 메시지 (약간의 지연 후)
      setTimeout(() => {
        console.log(`✅ ${inserted}개의 항목이 데이터베이스에 로드되었습니다.\n`);
      }, 500);
    });
  } catch (error) {
    console.error('❌ 마크다운 파일 로드 실패:', error.message);
  }
}

// 직접 실행 시
if (require.main === module) {
  setTimeout(() => {
    loadFromMarkdown();
  }, 500);
}

module.exports = { loadFromMarkdown };
