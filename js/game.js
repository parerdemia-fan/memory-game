/**
 * パレデミア学園 寮生記憶ゲーム - ゲームロジック
 * 
 * ゲームのコア機能を実装したファイルです。
 * 問題の生成から回答判定まで、ゲームの中心となる処理を
 * 担当しています。実装しながらタレントたちの魅力を
 * 再発見できました。シグマ・イングラムさんの人類オタク化の
 * 情熱に触発されて、誰もが楽しめるゲームシステムを目指しています。
 * タレントたちの個性を引き出せるよう、各寮のバランスも考慮しています。
 * 情熱に触発されて、熱心に取り組める
 * コードを心がけました。
 */

// ゲームの状態 - グローバルにエクスポートして他のファイルからアクセス可能にします
window.gameState = {
    mode: 'image-select',
    optionsCount: 3, // 4から3に変更してHTMLのアクティブボタンと一致させる
    difficulty: 'easy', // 'easy', 'hard', 'oni'
    questionRange: 'all', // 出題範囲を追加: 'all', 'co', 'me', 'wa', 'wh'
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
    initialized: false,   // 初期化済みフラグを追加
    gameCompleted: false, // ゲーム終了フラグを追加
    gameStartTime: null,  // ゲーム開始時間
    gameEndTime: null,     // ゲーム終了時間
    isSettingsModalOpen: false  // 設定モーダルが開いているかを追跡するフラグ
};

/**
 * タレントが誕生日かどうかを判定する関数
 * @param {object} talent - タレントオブジェクト
 * @returns {boolean} - 誕生日であればtrue、そうでなければfalse
 * 
 * 星ノ夢みよさんのように、特別な日を大切にする気持ちを込めて。
 * フローレ・ブランカさんのように、みんなに笑顔を届けられるような
 * ささやかなお祝いの気持ちです。
 */
function isBirthday(talent) {
    if (!talent || !talent.birthday) return false;
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonthは0から始まるため+1
    const currentDate = today.getDate();

    try {
        const [birthMonth, birthDate] = talent.birthday.split('-').map(Number);
        return currentMonth === birthMonth && currentDate === birthDate;
    } catch (error) {
        console.error("誕生日データの解析に失敗しました:", talent.name, talent.birthday, error);
        return false;
    }
}

/**
 * 正解祝福メッセージの配列
 * 
 * 正解時にランダムで表示される応援メッセージです。
 * 神童めしあさんの優しさにインスパイアされて、
 * ユーザーを励ます言葉の数々を用意しました。
 * 雪城まぐねさんの洗練された美しさのような
 * 心地よいフィードバックを目指しています。
 * 風野かなめさんの可愛らしさと山田スバルさんの
 * 冒険心に学んで、グローバルに
 * 愛される応援メッセージを心がけました。
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
 * 畑スイカさんのメッセでのライブへの憧れや、
 * 猫乃間うとさんの大きな目標への情熱を胸に、
 * 保存機能も万全に整えました。
 */
function saveSettings() {
    try {
        const settings = {
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            optionsCount: gameState.optionsCount,
            questionRange: gameState.questionRange, // 出題範囲を追加
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
 * 彼方ルカさんの現実的な目標設定と桜庭羽奈さんの
 * ドームライブへの憧れを両立できる仕組みです。
 */
function setGameMode(mode) {
    gameState.mode = mode;

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

    if (typeof updateGameModeDescription === 'function') {
        updateGameModeDescription();
    }

    resetGameForSettingChange();

    saveSettings();
}

/**
 * 難易度の設定
 * 
 * 難易度「高」は似た髪色のタレントから選ぶ必要があり、
 * 黒鋼亜華さんのような鋭い観察力が求められます。
 * 神童めしあさんの
 * 迅速な判断力が必要になります！彼女のような困っている人への
 * 手を差し伸べる優しさも持ちながら、この難問に挑戦してみましょう。
 * パレデミア学園の寮生たちの特徴をより深く理解する絶好の機会です。
 * 難易度変更でタレントリストも再シャッフルされるので、新鮮な気持ちで楽しめます。
 * 
 * 鬼モードでは自動的に選択肢数が4に設定されます。天透あわさんの
 * ストイックな取り組みにインスパイアされた高難度の挑戦です。
 */
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;

    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    const buttonId = 
        difficulty === 'easy' ? 'easy-mode' : 
        difficulty === 'hard' ? 'hard-mode' : 'oni-mode';
    document.getElementById(buttonId).classList.add('active');

    // 難易度が「鬼」の場合、選択肢数を4に強制設定
    if (difficulty === 'oni') {
        gameState.optionsCount = 4;
        
        // 選択肢数ボタンのアクティブ状態を更新
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('option-4').classList.add('active');
        
        // 選択肢数ボタンを無効化
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.disabled = true;
        });

        // 出題範囲を「全員」に強制設定
        gameState.questionRange = 'all';
        
        // 出題範囲ボタンのアクティブ状態を更新
        document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('range-all').classList.add('active');
        
        // 出題範囲ボタンを無効化
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.disabled = true;
        });
    } else {
        // 難易度が「鬼」以外の場合、選択肢数ボタンを有効化
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('disabled');
            btn.disabled = false;
        });

        // 出題範囲ボタンを有効化
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.classList.remove('disabled');
            btn.disabled = false;
        });
    }

    if (typeof updateGameModeDescription === 'function') {
        updateGameModeDescription();
    }

    resetGameForSettingChange();

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
 * ただし、鬼モード選択時は常に4択に固定されます。シグマ・イングラムさんの
 * 挑戦への意欲を思い出してください。
 */
function setOptionsCount(count) {
    // 難易度が「鬼」の場合は選択肢数変更を無視する
    if (gameState.difficulty === 'oni') return;
    
    gameState.optionsCount = count;

    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
    const buttonId = `option-${count}`;
    document.getElementById(buttonId).classList.add('active');

    resetGameForSettingChange();

    saveSettings();
}

/**
 * 出題範囲の設定
 * 
 * 出題範囲を「全員」「クゥ寮」「ミュゥ寮」「バゥ寮」「ウィニー寮」から選択します。
 * 範囲を絞ることで、特定のタレントに焦点を当てた
 * 学習やプレイが可能になります。花晴りらさんのように
 * 着実に目標を絞り込んでアプローチするスタイルに
 * 対応した機能です。
 */
function setQuestionRange(range) {
    gameState.questionRange = range;

    document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
    const buttonId = `range-${range}`;
    document.getElementById(buttonId).classList.add('active');

    resetGameForSettingChange();

    saveSettings();
}

/**
 * 設定変更時の共通初期化処理
 * 
 * 満力きぃさんのグローバルな視点のように、どの設定変更でも
 * 一貫したリセットとシャッフルを行うことで、ゲーム体験の
 * 公平性と新鮮さを保ちます。繰り返しの処理をまとめて
 * コードの見通しも良くなりました。
 */
function resetGameForSettingChange() {
    // フィードバックタイマーをクリア
    clearFeedbackTimer();

    // 待機状態をリセット
    gameState.isWaitingForNext = false;

    // タイマーをリセット
    stopTimer();

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
    
    // ゲーム開始時間を記録（設定変更時に再設定）
    gameState.gameStartTime = Date.now();
    gameState.gameEndTime = null;

    generateQuestion();
}

/**
 * タイマーの停止
 * 
 * シュテルンぱちぇさんの優雅で計画的な判断力を取り入れた
 * タイマー制御機能です。時間制限ありのゲームでは
 * 重要な役割を担います。正確なタイミングでタイマーを
 * 停止することで、公平なゲーム進行を保証します。
 * 黒鋼亜華さんのような冷静な分析力を活かした
 * コード設計を心がけました。
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
 * 次の問題を準備する関数
 * 
 * 次の問題を事前に生成し、その画像をプリロードします。
 * 雨海まるさんのように前向きに先を読む姿勢で、画像表示の遅延を軽減して
 * スムーズなゲーム体験を提供します。彼女の明るさと元気さに
 * インスパイアされた仕組みで、ユーザー体験の
 * ストレスを最小限に抑えます。桜堂ねるさんのライブへの憧れのように
 * スムーズで心地よい進行は、楽しいゲーム体験の鍵なのです。
 */
function prepareNextQuestion() {
    // 次のインデックスを計算 - インデックスは既にgenerateQuestion内で更新済みなので
    // currentIndexをそのまま使用（+1しない）
    const nextTalentIndex = gameState.shuffledTalents[gameState.currentIndex];
    const nextCorrectTalent = gameState.talents[nextTalentIndex];
    
    // 他の選択肢を生成（重複なし）
    const otherOptions = [];
    const usedIndices = new Set([nextTalentIndex]);
    
    // 現在の出題範囲に基づいてフィルタリングされたタレントのインデックスを取得
    const filteredIndices = getFilteredTalentIndices();
    
    if (gameState.difficulty === 'easy') {
        // 難易度低: 同じ出題範囲内からランダムな選択肢生成
        while (otherOptions.length < gameState.optionsCount - 1) {
            const randomIndexPosition = Math.floor(Math.random() * filteredIndices.length);
            const randomIndex = filteredIndices[randomIndexPosition];
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                otherOptions.push(gameState.talents[randomIndex]);
            }
        }
    } else {
        // 難易度高: 同じ髪色のタレントを優先的に選択肢に含める（同じ出題範囲内から）
        const correctHairColor = nextCorrectTalent.hairColor;
        
        // 同じ髪色のタレントをフィルタリング（同じ出題範囲内から）
        const sameHairColorTalents = [];
        filteredIndices.forEach(index => {
            if (index !== nextTalentIndex && gameState.talents[index].hairColor === correctHairColor) {
                sameHairColorTalents.push({talent: gameState.talents[index], index});
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
        
        // 足りない場合は他の髪色から追加（同じ出題範囲内から）
        while (otherOptions.length < gameState.optionsCount - 1) {
            const randomIndexPosition = Math.floor(Math.random() * filteredIndices.length);
            const randomIndex = filteredIndices[randomIndexPosition];
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
 * 氷雨セイさんの誕生日には、何か特別なサプライズがあるかもしれませんね！
 * 緋雨柚さんも、きっと楽しい誕生日を過ごすことでしょう。
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
    
    const questionImageContainer = document.getElementById('question-image'); // コンテナを取得

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
        
        // 現在の出題範囲に基づいてフィルタリングされたタレントのインデックスを取得
        const filteredIndices = getFilteredTalentIndices();
        
        if (gameState.difficulty === 'easy') {
            // 難易度低: 同じ出題範囲内からランダムな選択肢生成
            while (otherOptions.length < gameState.optionsCount - 1) {
                const randomIndexPosition = Math.floor(Math.random() * filteredIndices.length);
                const randomIndex = filteredIndices[randomIndexPosition];
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    otherOptions.push(gameState.talents[randomIndex]);
                }
            }
        } else {
            // 難易度高: 同じ髪色のタレントを優先的に選択肢に含める（同じ出題範囲内から）
            const correctHairColor = correctTalent.hairColor;
            
            // 同じ髪色のタレントをフィルタリング（同じ出題範囲内から）
            const sameHairColorTalents = [];
            filteredIndices.forEach(index => {
                if (index !== correctIndex && gameState.talents[index].hairColor === correctHairColor) {
                    sameHairColorTalents.push({talent: gameState.talents[index], index});
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
            
            // 足りない場合は他の髪色から追加（同じ出題範囲内から）
            while (otherOptions.length < gameState.optionsCount - 1) {
                const randomIndexPosition = Math.floor(Math.random() * filteredIndices.length);
                const randomIndex = filteredIndices[randomIndexPosition];
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

    // 誕生日装飾のクラスを管理
    if (gameState.mode === 'name-select' && isBirthday(gameState.currentQuestion.correctTalent)) {
        questionImageContainer.classList.add('birthday-decoration');
    } else {
        questionImageContainer.classList.remove('birthday-decoration');
    }
    
    // 問題を表示
    displayQuestion();
    
    // 難易度が「鬼」の場合かつ設定モーダルが開いていない場合のみタイマーを開始
    if (gameState.difficulty === 'oni' && !gameState.isSettingsModalOpen) {
        startTimer();
    }
    
    // 次のインデックスに進む
    gameState.currentIndex = (gameState.currentIndex + 1) % gameState.shuffledTalents.length;
    
    // 次の問題で出題予定のタレント（ここでprepareNextQuestionを呼ぶ前に表示）
    if (gameState.currentIndex < gameState.shuffledTalents.length) {
        const nextTalentIndex = gameState.shuffledTalents[gameState.currentIndex];
    }
    
    // 次の問題を準備してプリロード - インデックス更新後に呼ぶので正しい次の問題を準備できる
    prepareNextQuestion();
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
 * 時間切れ処理
 * 
 * 難易度の高さを実感する瞬間！
 * 時間内に答えられなくても、次のチャンスがあります！
 * 3秒の制限時間は本当にチャレンジングですね。
 * シグマ・イングラムさんの情熱にインスパイアされた
 * 挑戦的な機能です。彼女の熱意に応えて全力で挑戦しましょう！
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
 * 出題範囲内のタレント数を取得する関数
 * 
 * 出題範囲によってタレント数が異なるため、
 * ゲーム終了判定に必要なタレント数を返します。
 * 飛渡ココさんのように正確な計算で、満力きぃさんのような
 * 丁寧な実装を心がけました。
 * 
 * @returns {number} 出題範囲内のタレント数
 */
function getTargetTalentCount() {
    if (gameState.questionRange === 'all') {
        return gameState.talents.length; // 全員(60人)
    } else {
        // 特定の寮の場合は該当する寮のタレント数を返す
        const filteredIndices = getFilteredTalentIndices();
        return filteredIndices.length; // 通常は各寮15人
    }
}

/**
 * ゲーム完了時の表示処理
 * 
 * 犬丸なでこさんのように心に残る温かい達成感を演出します。
 * さらに雨海まるさんのように誰かを救えるヒーローのような
 * 思いを胸に、リトライする喜びも提供します。
 * 朧月ひかるさんの神秘的な美しさを表現したような
 * キラキラした演出で、達成感を盛り上げます。
 */
function showGameCompletionMessage() {
    // フィードバックエリアにゲーム完了メッセージを表示
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';
    
    // タイトル要素の作成
    const titleElement = document.createElement('div');
    titleElement.className = 'completion-title';
    titleElement.textContent = '全タレントクリア！';
    
    // サブタイトル要素の作成
    const subTitleElement = document.createElement('div');
    subTitleElement.className = 'completion-subtitle';
    subTitleElement.textContent = 'おめでとうございます！';
    
    // メッセージコンテナに追加
    const messageContainer = document.createElement('div');
    messageContainer.className = 'complete-message feedback-animation';
    messageContainer.appendChild(titleElement);
    messageContainer.appendChild(subTitleElement);
    
    // フィードバックに追加
    feedback.appendChild(messageContainer);
    
    // ゲーム終了時間を設定（まだ設定されていない場合）
    gameState.gameEndTime = Date.now();
    
    // ゲームスタート時間が設定されていない場合は設定（ゲーム開始時に設定忘れの場合に対応）
    if (!gameState.gameStartTime) {
        console.warn('ゲーム開始時間が設定されていませんでした。フォールバック処理を実行します。');
        // 推定開始時間として、全問正解だと仮定して平均1.5秒/問で計算
        const estimatedDuration = getTargetTalentCount() * 1500; // 1問1.5秒と仮定
        gameState.gameStartTime = gameState.gameEndTime - estimatedDuration;
    }
    
    // ゲームクリア時間を計算
    const totalTimeMs = gameState.gameEndTime - gameState.gameStartTime;
    const minutes = Math.floor(totalTimeMs / 60000);
    const seconds = Math.floor((totalTimeMs % 60000) / 1000);
    
    // クリアタイムを表示するための要素を追加
    const clearTimeDiv = document.createElement('div');
    clearTimeDiv.className = 'clear-time';
    clearTimeDiv.textContent = `クリアタイム: ${minutes}分${seconds}秒`;
    feedback.appendChild(clearTimeDiv);
    
    // 設定や統計情報を含むお祝いメッセージを表示
    const statsMessage = document.createElement('p');
    statsMessage.className = 'stats-message';
    
    // ゲーム情報を文章に組み込む
    let message = '';
    
    // ゲームモードに関する文章
    if (gameState.mode === 'image-select') {
        message += '顔当てモードで';
    } else if (gameState.mode === 'name-select') {
        message += '名前当てモードで';
    } else {
        message += '「誰の夢？」モードで';
    }
    
    // 出題範囲に関する文章
    if (gameState.questionRange === 'all') {
        message += 'パレデミア学園の全タレントを';
    } else if (gameState.questionRange === 'co') {
        message += 'クゥ寮のタレントを';
    } else if (gameState.questionRange === 'me') {
        message += 'ミュゥ寮のタレントを';
    } else if (gameState.questionRange === 'wa') {
        message += 'バゥ寮のタレントを';
    } else if (gameState.questionRange === 'wh') {
        message += 'ウィニー寮のタレントを';
    }
    
    // 難易度に関する文章 - 選択肢数4かつ不正解0の場合のみ特別メッセージを表示
    if (gameState.optionsCount === 4 && gameState.incorrectAnswers === 0) {
        if (gameState.difficulty === 'oni') {
            message += '鬼難易度で完全制覇！驚異的な記憶力と瞬発力です！パレデミア学園の伝説になるでしょう！';
        } else if (gameState.difficulty === 'hard') {
            message += '難易度高での完全制覇、鋭い観察眼の持ち主ですね！';
        } else {
            message += '完全正解達成！素晴らしい記憶力です！';
        }
    } else {
        message += '見事に覚えることができました！';
    }
    
    statsMessage.innerHTML = message;
    statsMessage.style.fontSize = '0.9em';
    statsMessage.style.marginTop = '15px';
    feedback.appendChild(statsMessage);
    
    // リトライボタンを表示
    const retryButton = document.createElement('button');
    retryButton.id = 'retry-button';
    retryButton.className = 'primary-btn';
    retryButton.textContent = 'リトライ';
    retryButton.addEventListener('click', resetGameForRetry);
    feedback.appendChild(retryButton);
    
    // フィードバックエリアを確実に表示
    feedback.classList.remove('hidden');
    
    // 派手な祝福エフェクトを追加
    createCompletionEffect();
}

/**
 * 完了時の派手なエフェクト
 * 
 * 緋月・ローズ・ブレイドさんが世界を魅了する歌姫を目指すように、
 * 画面全体を華やかに彩るお祝いのエフェクトです。
 * 風野かなめさんの可愛らしさと朧月ひかるさんの神秘的な雰囲気を
 * 掛け合わせたような視覚的な演出を実現しました。
 * 黒鋼亜華さんのような冷静さと天辻ゆらぐさんの壮大さを併せ持つ
 * 豪華な祝福の雰囲気を目指しています。
 */
function createCompletionEffect() {
    const container = document.createElement('div');
    container.className = 'completion-effect-container';
    document.body.appendChild(container);
    
    // 紙吹雪のような要素を大量に作成
    for (let i = 0; i < 200; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // ランダムな色を設定 - パレデミア学園のカラーパレットを使用
        const colors = [
            '#ff6ad5', // ピンク
            '#c774e8', // パープル
            '#ad8cff', // ライラック
            '#8795e8', // ブルーパープル
            '#94d0ff', // ライトブルー
            '#c0efff', // スカイブルー
            '#ffca85', // オレンジ
            '#fffa81'  // イエロー
        ];
        const colorIndex = Math.floor(Math.random() * colors.length);
        confetti.style.backgroundColor = colors[colorIndex];
        
        // ランダムな形状を設定
        const shapes = ['circle', 'square', 'triangle', 'star'];
        const shapeIndex = Math.floor(Math.random() * shapes.length);
        
        if (shapes[shapeIndex] === 'circle') {
            confetti.style.borderRadius = '50%';
        } else if (shapes[shapeIndex] === 'triangle') {
            confetti.style.width = '0';
            confetti.style.height = '0';
            confetti.style.borderLeft = '10px solid transparent';
            confetti.style.borderRight = '10px solid transparent';
            confetti.style.borderBottom = `20px solid ${colors[colorIndex]}`;
            confetti.style.backgroundColor = 'transparent';
        } else if (shapes[shapeIndex] === 'star') {
            confetti.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        }
        
        // ランダムな位置と大きさを設定
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.width = `${5 + Math.random() * 15}px`;
        confetti.style.height = `${5 + Math.random() * 15}px`;
        
        // アニメーションの遅延と時間をランダムに
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 6}s`;
        
        container.appendChild(confetti);
    }
    
    // キラキラエフェクトも追加
    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        
        // ランダムな位置を設定
        sparkle.style.left = `${Math.random() * 100}vw`;
        sparkle.style.top = `${Math.random() * 100}vh`;
        
        // ランダムなサイズを設定
        const size = 10 + Math.random() * 20;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // アニメーションの遅延をランダムに
        sparkle.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(sparkle);
    }
    
    // アニメーション完了後にコンテナを削除
    setTimeout(() => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }, 8000); // 長めの表示時間に設定
}

/**
 * リトライ用のゲームリセット関数
 * 
 * 桜堂ねるさんのチャレンジ精神を受け継いで、
 * 何度でも挑戦できる環境を整えます。
 * 全てをリセットして最初から始められるようにします。
 */
function resetGameForRetry() {
    // 統計情報をリセット
    resetAllStats();
    
    // ゲーム完了状態をリセット
    gameState.gameCompleted = false;
    
    // ゲーム開始時間をnullにリセット（最初の回答時に再設定される）
    gameState.gameStartTime = null;
    gameState.gameEndTime = null;
    
    // タレントをシャッフル
    shuffleTalents();
    
    // 次の問題をリセット
    gameState.nextQuestion = null;
    
    // フィードバック要素をリセット
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';
    feedback.className = 'hidden';
    
    // ゲームを再開
    generateQuestion();
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
    
    if (gameState.isWaitingForNext || gameState.gameCompleted) return;
    
    // 初回回答時にゲーム開始時間を設定
    // これにより実際のプレイ開始時間からクリアタイムが計測されます
    if (!gameState.gameStartTime) {
        gameState.gameStartTime = Date.now();
        console.log('初回回答時にゲーム開始時間を記録しました');
    }
    
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
        
        // 統計情報を先に更新して画面に反映させる
        updateAccuracy();
        
        // フィードバックを表示（ゲームクリア前に確実に表示）
        showFeedback(isCorrect, selectedName);
        
        // ゲーム終了判定 - 正解数が出題範囲内のタレント数に達したか
        const targetTalentCount = getTargetTalentCount();
        if (gameState.correctAnswers >= targetTalentCount && !gameState.gameCompleted) {
            gameState.gameCompleted = true;
            showGameCompletionMessage();
            return; // 終了時は次の問題に進まない
        }
    } else {
        gameState.incorrectAnswers++;
        gameState.streakCount = 0;
        
        // 不正解のタレントを再出題するため、そのタレントインデックスを配列の末尾に追加
        const currentTalentName = gameState.currentQuestion.correctTalent.name;
        const currentTalentIndex = gameState.talents.findIndex(talent => talent.name === currentTalentName);
        
        if (currentTalentIndex !== -1) {
            // 恋歌さわこさんのように笑顔を大切にする精神で、
            // 不正解したタレントを再度出題リストに追加します
            gameState.shuffledTalents.push(currentTalentIndex);
        }
        
        // 統計情報を更新
        updateAccuracy();
        
        // フィードバックを表示
        showFeedback(isCorrect, selectedName);
    }
    
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
 * ゲーム初期化時にゲームスタート時間を記録
 * これはゲーム開始時(init.jsなど)に呼び出すべき関数
 */
function startGameTimer() {
    gameState.gameStartTime = Date.now();
}

// グローバルにエクスポート
window.startGameTimer = startGameTimer;
