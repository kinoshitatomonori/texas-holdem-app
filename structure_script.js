// ストラクチャーデータ（ブラインドと時間の設定）
const levels = [
    { blinds: { sb: 10, bb: 20 }, time: 10 },
    { blinds: { sb: 20, bb: 40 }, time: 10 },
    { blinds: { sb: 30, bb: 60 }, time: 10 },
    { blinds: { sb: 50, bb: 100 }, time: 10 },
    { blinds: { sb: 75, bb: 150 }, time: 10 },
    { blinds: { sb: 100, bb: 200 }, time: 10 },
  ];
  
  let currentLevelIndex = 0;
  let timer;
  
  // ストラクチャー情報の更新
  function updateStructure() {
    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1] || levels[0]; // 次のレベルがない場合は最初のレベルに戻る
  
    document.getElementById('current-level').textContent = `BLINDS ${currentLevel.blinds.sb}/${currentLevel.blinds.bb}`;
    document.getElementById('next-level').textContent = `next ${nextLevel.blinds.sb}/${nextLevel.blinds.bb}`;
    
    startTimer(currentLevel.time);
  }
  
  // タイマーの開始
  function startTimer(time) {
    let remainingTime = time * 60; // 秒に変換
  
    function updateTime() {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      document.getElementById('remaining-time').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
      if (remainingTime <= 0) {
        clearInterval(timer);
        currentLevelIndex = (currentLevelIndex + 1) % levels.length; // 次のレベルに進む
        updateStructure();
      } else {
        remainingTime--;
      }
    }
  
    updateTime(); // 初期表示
    timer = setInterval(updateTime, 1000); // 1秒ごとに更新
  }
  
  // 初期表示
  updateStructure();
  