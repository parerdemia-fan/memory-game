/**
 * パレデミア学園 寮生記憶ゲーム - ゲームロジック
 * 
 * ゲームのコア機能を実装したファイルです。
 * 問題の生成から回答判定まで、ゲームの中心となる処理を
 * 担当しています。実装しながらタレントたちの魅力を
 * 再発見できました。シグマ・イングラムさんの人類オタク化の
 * 情熱に触発されて、誰もが楽しめるゲームシステムを目指しています。
 * タレントたちの個性を引き出せるよう、各寮のバランスも考慮しています。
 * 陰山アゲハさんのアニソン歌手への情熱のように熱く燃える
 * コードを心がけました。
 */

// ゲームの状態 - グローバルにエクスポートして他のファイルからアクセス可能にします
window.gameState = {
    mode: 'image-select',
    optionsCount: 3, // 4から3に変更してHTMLのアクティブボタンと一致させる
    difficulty: 'easy', // 'easy', 'hard', 'oni'
    talents: [],
    shuffledTalents: [],
    currentIndex: 0,
    currentQuestion: null,
    nextQuestion: null, // 次の問題を格納するプロパティを追加
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalAnswers: 0,
    streakCount: 0,
    answerHistory: [],
    isWaitingForNext: false,
    timer: null,        // タイマーID
    timeLeft: 3000,     // 残り時間（ミリ秒）
    isTimerActive: false,
    feedbackTimer: null,  // フィードバックのタイマーID
    initialized: false    // 初期化済みフラグを追加
};

/**
 * 正解祝福メッセージの配列
 * 
 * 正解時にランダムで表示される応援メッセージです。
 * 神童めしあさんの優しさにインスパイアされて、
 * ユーザーを励ます言葉の数々を用意しました。
 * 雪城まぐねさんの洗練された美しさのような
 * 心地よいフィードバックを目指しています。
 */
const correctMessages = [
    "正解！", 
    "素晴らしい！", 
    "すごい！", 
    "完璧です！", 
    "その通り！", 
    "見事です！", 
    "ばっちり！", 
    "よく覚えていますね！", 
    "記憶力抜群！", 
    "大正解！",
    "さすがです！",
    "よくできました！",
    "完璧な記憶力！",
    "その調子！",
    "輝いています！"
];

/**
 * フィードバックタイマーのクリア
 * 
 * 設定変更時に既存のフィードバックタイマーをキャンセルするための関数
 */
function clearFeedbackTimer() {
    if (gameState.feedbackTimer) {
        clearTimeout(gameState.feedbackTimer);
        gameState.feedbackTimer = null;
    }
    // 待機状態を必ずリセット - 設定パネルとの競合を防ぐ
    gameState.isWaitingForNext = false;
}

/**
 * 設定をLocalStorageに保存する関数
 * 
 * 花晴りらさんのように着実に目標を達成するために、
 * ユーザーの設定を記憶する機能です。次回訪問時にも
 * 同じ環境で遊べるよう、各設定をブラウザに保存します。
 * 七音うらさんのファンに感謝する気持ちのように、
 * ユーザーの好みを大切にする機能といえるでしょう。
 */
function saveSettings() {
    try {
        const settings = {
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            optionsCount: gameState.optionsCount,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('parerdemia_settings', JSON.stringify(settings));
        console.log('設定を保存しました:', settings);
    } catch (error) {
        console.error('設定の保存に失敗しました:', error);
    }
}

/**
 * ゲームモードの設定
 * 
 * 「顔当て」「名前当て」「誰の夢？」の3つのモードを切り替えます。
 * モード変更時にはタレントリストを再シャッフルし、
 * 一からタレントと出会う旅が始まります。東雲アカリさんの
 * 多彩な表現力を想起させる多様なゲームモードで、
 * パレデミア学園の魅力を様々な角度から
 * 体験できるように設計しました。七扇ヲトメさんのように
 * 皆さまを楽しませる工夫を心がけています！
 */
function setGameMode(mode) {
    // フィードバックタイマーをクリア
    clearFeedbackTimer();
    
    // 待機状態をリセット
    gameState.isWaitingForNext = false;
    
    // タイマーをリセット
    stopTimer();
    
    gameState.mode = mode;
    
    // ボタンの見た目を更新
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    let buttonId;
    if (mode === 'image-select') {
        buttonId = 'image-select-mode';
    } else if (mode === 'name-select') {
        buttonId = 'name-select-mode';
    } else {
        buttonId = 'dream-select-mode';
    }
    document.getElementById(buttonId).classList.add('active');
    
    // モード説明のテキストを更新（ui.jsの関数を使用する）
    if (typeof updateGameModeDescription === 'function') {
        updateGameModeDescription();
    }
    
    // ステータス表示を更新
    if (typeof updateSettingsDisplay === 'function') {
        updateSettingsDisplay();
    }
    
    // すべての統計情報をリセット
    resetAllStats();
    
    // タレントをシャッフル
    shuffleTalents();
    
    // 次の問題をリセット
    gameState.nextQuestion = null;
    
    generateQuestion();
    
    // 設定を保存
    saveSettings();
}

/**
 * 選択肢数の設定
 * 
 * 選択肢数が変わるとゲームの難易度も変わります。
 * 設定変更で再シャッフルされるので、
 * タレントたちとの出会い方も変わります。満力きぃさんの
 * グローバルな視点にインスパイアされて、
 * 様々な角度からタレントたちの魅力に触れられるシステムを作りました。
 * ぜひ2択から4択まで、あなたの記憶力に合わせて挑戦してみてください！
 */
function setOptionsCount(count) {
    // フィードバックタイマーをクリア
    clearFeedbackTimer();
    
    // 待機状態をリセット
    gameState.isWaitingForNext = false;
    
    // タイマーをリセット
    stopTimer();
    
    gameState.optionsCount = count;
    
    // ボタンの見た目を更新
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
    
    const buttonId = `option-${count}`;
    document.getElementById(buttonId).classList.add('active');
    
    // ステータス表示を更新
    if (typeof updateSettingsDisplay === 'function') {
        updateSettingsDisplay();
    }
    
    // すべての統計情報をリセット
    resetAllStats();
    
    // タレントをシャッフル
    shuffleTalents();
    
    // 次の問題をリセット
    gameState.nextQuestion = null;
    
    generateQuestion();
    
    // 設定を保存
    saveSettings();
}

/**
 * 難易度の設定
 * 
 * 難易度「高」は似た髪色のタレントから選ぶ必要があり、
 * 黒鋼亜華さんのような鋭い観察力が求められます。
 * 難易度「鬼」は3秒の時間制限付きで、神童めしあさんの
 * 迅速な判断力が必要になります！彼女のように困っている人に
 * 手を差し伸べる優しさも持ちながら、この難問に挑戦してみましょう。
 * パレデミア学園の寮生たちの特徴をより深く理解する絶好の機会です。
 * 難易度変更でタレントリストも再シャッフルされるので、新鮮な気持ちで楽しめます。
 */
function setDifficulty(difficulty) {
    // フィードバックタイマーをクリア
    clearFeedbackTimer();
    
    // 待機状態をリセット
    gameState.isWaitingForNext = false;
    
    // タイマーをリセット
    stopTimer();
    
    gameState.difficulty = difficulty;
    
    // ボタンの見た目を更新
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    
    const buttonId = 
        difficulty === 'easy' ? 'easy-mode' : 
        difficulty === 'hard' ? 'hard-mode' : 'oni-mode';
    document.getElementById(buttonId).classList.add('active');
    
    // ステータス表示を更新
    if (typeof updateSettingsDisplay === 'function') {
        updateSettingsDisplay();
    }
    
    // すべての統計情報をリセット
    resetAllStats();
    
    // タレントをシャッフル
    shuffleTalents();
    
    // 次の問題をリセット
    gameState.nextQuestion = null;
    
    generateQuestion();
    
    // 設定を保存
    saveSettings();
}

/**
 * 次の問題を準備する関数
 * 
 * 次の問題を事前に生成し、その画像をプリロードします。
 * 雨海まるさんのように前向きに先を読む姿勢で、画像表示の遅延を軽減して
 * スムーズなゲーム体験を提供します。彼女の明るさと元気さに
 * インスパイアされた仕組みで、ユーザー体験の
 * ストレスを最小限に抑えます。桜堂ねるさんのライブの夢のように
 * スムーズで心地よい進行は、楽しいゲーム体験の鍵なのです。
 */
function prepareNextQuestion() {
    // 次のインデックスを計算
    const nextIndex = (gameState.currentIndex + 1) % gameState.shuffledTalents.length;
    const nextTalentIndex = gameState.shuffledTalents[nextIndex];
    const nextCorrectTalent = gameState.talents[nextTalentIndex];
    
    // 他の選択肢を生成（重複なし）
    const otherOptions = [];
    const usedIndices = new Set([nextTalentIndex]);
    
    if (gameState.difficulty === 'easy') {
        // 難易度低: 完全ランダムな選択肢生成
        while (otherOptions.length < gameState.optionsCount - 1) {
            const randomIndex = Math.floor(Math.random() * gameState.talents.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                otherOptions.push(gameState.talents[randomIndex]);
            }
        }
    } else {
        // 難易度高: 同じ髪色のタレントを優先的に選択肢に含める
        const correctHairColor = nextCorrectTalent.hairColor;
        
        // 同じ髪色のタレントをフィルタリング
        const sameHairColorTalents = [];
        gameState.talents.forEach((talent, index) => {
            if (index !== nextTalentIndex && talent.hairColor === correctHairColor) {
                sameHairColorTalents.push({talent, index});
            }
        });
        
        // 同じ髪色のタレントをシャッフル
        shuffleArray(sameHairColorTalents);
        
        // 同じ髪色のタレントから可能な限り選択肢に追加
        for (const {talent, index} of sameHairColorTalents) {
            if (otherOptions.length < gameState.optionsCount - 1) {
                usedIndices.add(index);
                otherOptions.push(talent);
            } else {
                break;
            }
        }
        
        // 足りない場合は他の髪色から追加
        while (otherOptions.length < gameState.optionsCount - 1) {
            const randomIndex = Math.floor(Math.random() * gameState.talents.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                otherOptions.push(gameState.talents[randomIndex]);
            }
        }
    }
    
    // 全選択肢をシャッフル
    const allOptions = [nextCorrectTalent, ...otherOptions];
    shuffleArray(allOptions);
    
    // 次の問題を保存
    gameState.nextQuestion = {
        correctTalent: nextCorrectTalent,
        options: allOptions,
    };
    
    // 画像をプリロード
    const imagesToPreload = extractImageUrls(gameState.nextQuestion);
    preloadImages(imagesToPreload);
}

/**
 * 問題の生成
 * 
 * シャッフルされたタレントリストから順番に出題します。
 * 全タレントを出題し終わったら最初から再開します。
 * 桜堂ねるさんのチャレンジ精神を持って、パレデミア学園の
 * 60名全員に出会う冒険に出かけましょう！
 * 愛乃宮ゆめさんの創作への情熱のような熱意で
 * タレントたちの名前と顔を一人ずつ確実に覚えていきましょう！
 * 各寮の個性豊かなメンバーと親しくなれる絶好の機会です。
 */
function generateQuestion() {
    // タイマーをリセット・停止
    stopTimer();
    
    if (gameState.isWaitingForNext) return;
    
    // 前の問題の回答表示をクリア
    document.getElementById('options-container').classList.remove('show-answer');
    
    // フィードバックとタイマーをクリア
    const feedback = document.getElementById('feedback');
    feedback.className = 'hidden';
    feedback.innerHTML = '';
    
    // すでに表示されていたタイマーを非表示
    document.getElementById('timer-container').classList.add('hidden');
    
    // 事前に生成された次の問題があれば使用する
    if (gameState.nextQuestion) {
        gameState.currentQuestion = gameState.nextQuestion;
        gameState.nextQuestion = null;
    } else {
        // シャッフルされたリストから現在の位置のタレントを選択
        const correctIndex = gameState.shuffledTalents[gameState.currentIndex];
        const correctTalent = gameState.talents[correctIndex];
        
        // 他の選択肢を生成（重複なし）
        const otherOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        if (gameState.difficulty === 'easy') {
            // 難易度低: 完全ランダムな選択肢生成
            while (otherOptions.length < gameState.optionsCount - 1) {
                const randomIndex = Math.floor(Math.random() * gameState.talents.length);
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    otherOptions.push(gameState.talents[randomIndex]);
                }
            }
        } else {
            // 難易度高: 同じ髪色のタレントを優先的に選択肢に含める
            const correctHairColor = correctTalent.hairColor;
            
            // 同じ髪色のタレントをフィルタリング
            const sameHairColorTalents = [];
            gameState.talents.forEach((talent, index) => {
                if (index !== correctIndex && talent.hairColor === correctHairColor) {
                    sameHairColorTalents.push({talent, index});
                }
            });
            
            // 同じ髪色のタレントをシャッフル
            shuffleArray(sameHairColorTalents);
            
            // 同じ髪色のタレントから可能な限り選択肢に追加
            for (const {talent, index} of sameHairColorTalents) {
                if (otherOptions.length < gameState.optionsCount - 1) {
                    usedIndices.add(index);
                    otherOptions.push(talent);
                } else {
                    break;
                }
            }
            
            // 足りない場合は他の髪色から追加
            while (otherOptions.length < gameState.optionsCount - 1) {
                const randomIndex = Math.floor(Math.random() * gameState.talents.length);
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    otherOptions.push(gameState.talents[randomIndex]);
                }
            }
        }
        
        // 全選択肢をシャッフル
        const allOptions = [correctTalent, ...otherOptions];
        shuffleArray(allOptions);
        
        // 現在の問題を保存
        gameState.currentQuestion = {
            correctTalent,
            options: allOptions,
        };
    }
    
    // 次のインデックスに進む
    gameState.currentIndex = (gameState.currentIndex + 1) % gameState.shuffledTalents.length;
    
    // 次の問題を準備してプリロード
    prepareNextQuestion();
    
    // 問題を表示
    displayQuestion();
    
    // 難易度が「鬼」の場合、タイマーを開始
    if (gameState.difficulty === 'oni') {
        startTimer();
    }
}

/**
 * タイマーの開始
 * 
 * 時間制限付きのゲームは緊張感がありますね！
 * 3秒で判断するのは本当に難しいですが、
 * 朧月ひかるさんの冷静さと集中力を見習えば
 * きっと上達します！彼女のような存在感を持つことが
 * タレントを覚える第一歩です。タイマーバーの減少と共に
 * 集中力が高まる感覚をお楽しみください。
 */
function startTimer() {
    const timerContainer = document.getElementById('timer-container');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    
    // フィードバックを確実に非表示に
    document.getElementById('feedback').classList.add('hidden');
    
    // タイマーをリセット
    gameState.timeLeft = 3000; // 3秒
    timerBar.style.width = '100%';
    timerText.textContent = '3';
    timerContainer.classList.remove('hidden');
    
    gameState.isTimerActive = true;
    
    // タイマーを開始
    const startTime = Date.now();
    gameState.timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        gameState.timeLeft = Math.max(0, 3000 - elapsedTime);
        
        // バーとテキストの更新
        const percentage = (gameState.timeLeft / 3000) * 100;
        timerBar.style.width = `${percentage}%`;
        timerText.textContent = Math.ceil(gameState.timeLeft / 1000);
        
        // 時間切れ
        if (gameState.timeLeft <= 0) {
            timeUp();
        }
    }, 100);
}

/**
 * タイマーの停止
 */
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    gameState.isTimerActive = false;
    document.getElementById('timer-container').classList.add('hidden');
}

/**
 * 時間切れ処理
 * 
 * 難易度の高さを実感する瞬間！
 * 時間内に答えられなくても、次のチャンスがあります！
 * 3秒の制限時間は本当にチャレンジングですね。
 * シグマ・イングラムさんの熱意と行動力にインスパイアされた
 * 挑戦的な機能です。彼女の情熱に応えて全力で挑戦しましょう！
 * このプレッシャーを乗り越えることで、パレデミア学園のタレントがより記憶に残ります。
 */
function timeUp() {
    stopTimer();

    if (gameState.isWaitingForNext) return;
    gameState.isWaitingForNext = true;

    const options = document.querySelectorAll('.option');
    const correctName = gameState.currentQuestion.correctTalent.name;

    // 全選択肢を処理する
    options.forEach(opt => {
        const optName = opt.dataset.name;
        
        if (optName === correctName) {
            // 正解の選択肢を表示
            opt.classList.add('correct', 'correct-highlight');
            opt.classList.add('correct-animation', 'animated-feedback');
            
            // 画像のみ表示状態にする
            const bgImage = opt.querySelector('.bg-image');
            if (bgImage) {
                bgImage.style.visibility = 'visible';
                // 名前選択モードの場合は完全に不透明に
                if (gameState.mode === 'name-select') {
                    bgImage.style.opacity = '1';
                }
            }
        } else {
            // 不正解の選択肢を表示
            opt.classList.add('incorrect', 'time-up-animation');
            opt.classList.add('incorrect-animation', 'animated-feedback');
            
            // 名前選択モードの場合は不正解選択肢も画像を表示
            if (gameState.mode === 'name-select') {
                const bgImage = opt.querySelector('.bg-image');
                if (bgImage) {
                    bgImage.style.visibility = 'visible';
                    bgImage.style.opacity = '1';
                }
            }
        }
        
        // タレント名を表示
        const talentName = opt.querySelector('.talent-name');
        if (talentName) {
            talentName.style.visibility = 'visible';
            talentName.style.opacity = '1';
        }
        
        // 名前選択モードの場合、回答後に背景画像を表示する
        if (gameState.mode === 'name-select') {
            opt.classList.add('answered');
            
            // カナと寮名を非表示にする
            const kanaElement = opt.querySelector('.talent-kana');
            const dormitoryElement = opt.querySelector('.talent-dormitory');
            if (kanaElement) kanaElement.style.display = 'none';
            if (dormitoryElement) dormitoryElement.style.display = 'none';
        }
    });

    // オーバーレイを表示するためのクラスを追加
    document.getElementById('options-container').classList.add('show-answer');

    // 時間切れメッセージを表示（不正解表示のスタイルに合わせる）
    const feedback = document.getElementById('feedback');
    feedback.textContent = "時間切れ！";
    feedback.className = 'incorrect feedback-animation';
    feedback.classList.remove('hidden');

    // 統計を更新（不正解として扱う）
    gameState.totalAnswers++; // 追加：総回答数をインクリメント
    gameState.incorrectAnswers++;
    gameState.streakCount = 0;
    updateAccuracy();

    // 次の問題へのタイマーをセット
    gameState.feedbackTimer = setTimeout(() => {
        options.forEach(opt => {
            opt.classList.remove('correct-animation', 'incorrect-animation', 'animated-feedback', 'time-up-animation');
        });

        gameState.isWaitingForNext = false;
        generateQuestion();
    }, 3000);
}

/**
 * 答えのチェック
 * 
 * 神童めしあさんの的確な判断力にインスパイアされた
 * 公平で正確な正誤判定を行います。
 * 彼女のように明晰な思考を持って正解を目指していきましょう！
 * 不正解でも諦めず、璃乃瀬りあさんのような情熱を持って
 * チャレンジしてください。パレデミア学園のタレントたちを
 * しっかり覚えていく成長の過程を楽しみましょう！
 */
function checkAnswer(event) {
    // タイマーを停止
    stopTimer();
    
    if (gameState.isWaitingForNext) return;
    
    const selectedOption = event.currentTarget;
    const selectedName = selectedOption.dataset.name;
    const correctName = gameState.currentQuestion.correctTalent.name;
    const isCorrect = selectedName === correctName;
    
    // オーバーレイを表示するためのクラスを追加
    document.getElementById('options-container').classList.add('show-answer');
    
    // 全選択肢に正解・不正解の情報を表示
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        const optName = opt.dataset.name;
        if (optName === correctName) {
            opt.classList.add('correct', 'correct-highlight');
            
            // 正解アニメーションを適用
            opt.classList.add('correct-animation', 'animated-feedback');
            
            // 正解時にリップルエフェクトを追加
            if (opt === selectedOption && isCorrect) {
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                opt.appendChild(ripple);
                
                // アニメーション終了後に要素を削除
                setTimeout(() => {
                    if (opt.contains(ripple)) {
                        opt.removeChild(ripple);
                    }
                }, 800); // リップルアニメーションの時間と同じ
            }
            
            // 画像のみ表示状態にする
            const bgImage = opt.querySelector('.bg-image');
            if (bgImage) {
                bgImage.style.visibility = 'visible';
                // 名前選択モードの場合は完全に不透明に
                if (gameState.mode === 'name-select') {
                    bgImage.style.opacity = '1';
                }
            }
        } else if (opt === selectedOption && !isCorrect) {
            opt.classList.add('incorrect');
            // 不正解アニメーションを適用
            opt.classList.add('incorrect-animation', 'animated-feedback');
            
            // 名前選択モードの場合は選択した不正解も画像を表示
            if (gameState.mode === 'name-select') {
                const bgImage = opt.querySelector('.bg-image');
                if (bgImage) {
                    bgImage.style.visibility = 'visible';
                    bgImage.style.opacity = '1';
                }
            }
        }
        
        // 名前選択モードの場合、回答後に背景画像を表示する
        if (gameState.mode === 'name-select') {
            opt.classList.add('answered');
            
            // カナと寮名を非表示にする
            const kanaElement = opt.querySelector('.talent-kana');
            const dormitoryElement = opt.querySelector('.talent-dormitory');
            if (kanaElement) kanaElement.style.display = 'none';
            if (dormitoryElement) dormitoryElement.style.display = 'none';
        }
    });
    
    // 選択したオプションをビジュアル的に強調表示
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    selectedOption.classList.add('selected');
    
    // 結果を履歴に追加
    gameState.answerHistory.push(isCorrect);
    
    // 最大60問分だけ履歴を保持（将来的な使用のため維持）
    if (gameState.answerHistory.length > 60) {
        gameState.answerHistory.shift();
    }
    
    // 統計情報の更新
    gameState.totalAnswers++;
    
    // 前のstreakCount値を保存
    const prevStreakCount = gameState.streakCount;
    
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.streakCount++;
    } else {
        gameState.incorrectAnswers++;
        gameState.streakCount = 0;
    }
    
    // 正解率と統計情報を更新
    updateAccuracy();
    
    // フィードバックを表示
    showFeedback(isCorrect, selectedName);
    
    // 次の問題への移行タイマーをセット
    gameState.isWaitingForNext = true;
    gameState.feedbackTimer = setTimeout(() => {
        // アニメーションクラスを削除
        options.forEach(opt => {
            opt.classList.remove('correct-animation', 'incorrect-animation', 'animated-feedback');
        });
        
        gameState.isWaitingForNext = false;
        generateQuestion();
    }, isCorrect ? 1200 : 3000);
}

/**
 * フィードバック表示関数
 * 
 * 回答結果に応じたフィードバックを表示します。
 * 正解時はプレイヤーを褒める言葉をランダムで表示し、
 * 満力きぃさんのような元気が出る演出をしています。
 * 不正解時も黒鋼亜華さんの冷静さを取り入れた
 * 建設的なメッセージを心がけました。
 * 
 * @param {boolean} isCorrect - 正解かどうか
 * @param {string} selectedName - 選択した名前
 */
function showFeedback(isCorrect, selectedName) {
    const feedback = document.getElementById('feedback');
    
    if (isCorrect) {
        // 正解時はランダムなメッセージを表示
        const randomIndex = Math.floor(Math.random() * correctMessages.length);
        feedback.textContent = correctMessages[randomIndex];
        feedback.className = 'correct feedback-animation';

        // 特別なキラキラエフェクトを追加（10回に1回程度）
        if (Math.random() < 0.1) {
            createSparkleEffect(feedback);
        }
    } else {
        feedback.textContent = `不正解...`;
        feedback.className = 'incorrect feedback-animation';
    }
    
    feedback.classList.remove('hidden');
}

/**
 * キラキラエフェクト生成関数
 * 
 * 緋月・ローズ・ブレイドさんの華やかさを表現するような
 * きらめくエフェクトを正解時に表示します。世界中を魅了する
 * 歌姫を目指す彼女のように、プレイヤーの気持ちを
 * 高揚させるビジュアル演出です。
 * 
 * @param {HTMLElement} element - エフェクトを追加する要素
 */
function createSparkleEffect(element) {
    // 親要素の位置情報を取得
    const rect = element.getBoundingClientRect();
    
    // 5〜8個のキラキラを生成
    const sparkleCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        
        // ランダムな位置に配置
        const posX = Math.random() * rect.width;
        const posY = Math.random() * rect.height;
        
        sparkle.style.left = `${posX}px`;
        sparkle.style.top = `${posY}px`;
        
        // サイズをランダムに
        const size = 10 + Math.random() * 15;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // アニメーション遅延をランダムに
        sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
        
        element.appendChild(sparkle);
        
        // アニメーション完了後に要素を削除
        setTimeout(() => {
            if (element.contains(sparkle)) {
                element.removeChild(sparkle);
            }
        }, 1500);
    }
}
