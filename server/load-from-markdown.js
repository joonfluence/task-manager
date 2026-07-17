const db = require('./db');
const { parseMarkdownFile } = require('./markdown-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Obsidian Vault의 마크다운 파일 경로
const markdownPath = '/Users/yijun/Obsidian Vault/이번주_챌린지_틈틈히_할_일.md';

function loadFromMarkdown() {
  try {
    const tasks = parseMarkdownFile(markdownPath);
    console.log(`\n📖 마크다운 파일에서 ${tasks.length}개의 항목을 찾았습니다.\n`);

    // 기존 데이터 삭제 (처음 로드 시만)
    db.run('DELETE FROM tasks', () => {
      // 새 데이터 삽입
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
