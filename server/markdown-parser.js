const fs = require('fs');
const path = require('path');

// 마크다운 파일에서 할 일 데이터 추출
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tasks = [];

  const lines = content.split('\n');
  let currentSection = null;
  let inTable = false;
  let tableHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 섹션 헤더 감지 (## 형식)
    if (line.startsWith('## ')) {
      const headerText = line.replace('## ', '').trim();

      // 섹션명을 ID로 변환
      if (headerText.includes('이번주 챌린지')) {
        currentSection = 'challenge';
        inTable = true;
        tableHeader = false;
      } else if (headerText.includes('틈틈히 리스트')) {
        currentSection = 'todolist';
        inTable = false;
      } else if (headerText.includes('어려운 작업')) {
        currentSection = 'difficult';
        inTable = false;
      } else if (headerText.includes('쉬운 작업')) {
        currentSection = 'easy';
        inTable = false;
      } else if (headerText.includes('완료')) {
        currentSection = 'completed';
        inTable = false;
      } else if (headerText.includes('오늘의 목표')) {
        currentSection = 'today';
        inTable = false;
      } else if (headerText.includes('주간') || headerText.includes('휴가')) {
        currentSection = 'weekly';
        inTable = false;
      } else if (headerText.includes('소감')) {
        currentSection = null; // 소감은 건너뛰기
      }
      continue;
    }

    if (!currentSection) continue;

    // 테이블 파싱 (Challenge section)
    if (currentSection === 'challenge' && inTable) {
      if (line.startsWith('|')) {
        if (!tableHeader) {
          tableHeader = true;
          continue; // 헤더 건너뛰기
        }

        if (line.includes('---')) {
          continue; // 구분선 건너뛰기
        }

        // 테이블 행 파싱
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 2) {
          const title = cells[0];
          const completed = cells[1].includes('✅') || cells[1].includes('완료');

          // 요일별 데이터 파싱
          const dayData = {};
          const progressText = cells[2] || '';

          // 요일별 진행 상황 추출 (금: 완료, 화: ..., 등)
          const dayMatches = progressText.match(/([월화수목금토일]):/g) || [];
          dayMatches.forEach(dayStr => {
            const day = dayStr.replace(':', '');
            dayData[day] = true;
          });

          tasks.push({
            section: currentSection,
            title: title,
            completed: completed ? 1 : 0,
            priority: 'high',
            dayData: JSON.stringify(dayData)
          });
        }
      } else if (line.trim() === '---') {
        inTable = false;
      }
    }
    // 리스트 파싱 (다른 섹션들)
    else if (line.startsWith('- [') || line.startsWith('- ')) {
      let title = line;
      let completed = 0;

      if (line.startsWith('- [x]')) {
        completed = 1;
        title = line.replace('- [x] ', '').trim();
      } else if (line.startsWith('- [ ]')) {
        title = line.replace('- [ ] ', '').trim();
      } else if (line.startsWith('- ')) {
        title = line.replace('- ', '').trim();
      }

      if (title && !title.startsWith('[') && currentSection) {
        // 괄호 안의 추가 설명 제거하기 전에 전체 제목 저장
        tasks.push({
          section: currentSection,
          title: title,
          completed: completed,
          priority: 'medium'
        });
      }
    }
  }

  return tasks;
}

module.exports = { parseMarkdownFile };
