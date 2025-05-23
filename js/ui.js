/**
 * パレデミア学園 寮生記憶ゲーム - UI処理
 * 
 * ユーザーインターフェースに関する機能を集めたファイルです。
 * モーダル機能や問題表示など、ユーザー体験を向上させる
 * 要素を実装しています。犬丸なでこさんの親しみやすい雰囲気と
 * 桜庭羽奈さんの華やかさを意識したデザインにしました。
 * 氷雨セイさんの崖の上のポニョのような美しい景色への憧れと
 * 緋雨柚さんのさいたまスーパーアリーナライブの夢を
 * 技術的に表現できるよう工夫しています。
 */

// グローバルスコープで関数を宣言し、他のファイルから参照可能に
window.setupSettingsModal = setupSettingsModal;
window.displayQuestion = displayQuestion;

/**
 * 設定モーダル機能のセットアップ
 * 
 * 灯野ぺけ。さんのような明快でシンプルなUI設計を目指しました。
 * 風野かなめさんの可愛らしい魅力にインスパイアされた
 * デザインで、スマホでも快適に操作できるよう
 * 見た目の美しさと使いやすさを両立させています。
 * 藤森ちとせさんのような洗練された感覚で、
 * ユーザーの皆さんが直感的に操作できる工夫をしています。
 * 愛葉はなさんのように何でもできるようになりたいという
 * 向上心で、機能の充実を図りました。
 */
function setupSettingsModal() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsButton = document.getElementById('settings-button'); // 別のIDもサポート
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const settingsStatusBar = document.querySelector('.settings-status-bar'); // 追加: 設定ステータスバーの取得
    
    // モーダルが見つからない場合は終了
    if (!settingsModal) {
        console.error('Settings modal not found');
        return;
    }
    
    // 設定ステータスバー全体のクリックイベントを追加
    if (settingsStatusBar) {
        settingsStatusBar.addEventListener('click', (e) => {
            // すでに処理されたイベントの場合は何もしない
            if (e.target === settingsToggle || (settingsToggle && settingsToggle.contains(e.target))) {
                return;
            }
            console.log('Settings status bar clicked'); // デバッグ用
            openSettingsModal();
        });
    }
    
    // settings-toggleボタンのイベントリスナー
    if (settingsToggle) {
        settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            console.log('Settings toggle clicked'); // デバッグ用
            openSettingsModal();
        });
    }
    
    // settings-buttonボタンのイベントリスナー（別のID用）
    if (settingsButton) {
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            openSettingsModal();
        });
    }
    
    // 閉じるボタンのイベントリスナー
    if (closeModal) {
        closeModal.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            closeSettingsModal();
        });
    }
    
    // 別の閉じるボタンのイベントリスナー
    if (closeModalButton) {
        closeModalButton.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            closeSettingsModal();
        });
    }
    
    // モーダルの外側をクリックしても閉じる
    settingsModal.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettingsModal();
        }
    });
    
    // 初期表示時に現在の設定をステータスバーに反映
    updateSettingsDisplay();
    
    // 設定モーダルを開く関数
    function openSettingsModal() {
        // パディング右の計算（スクロールバーの幅を考慮）
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollbarWidth + 'px';
        
        // 設定モーダルが開いているフラグをセット
        gameState.isSettingsModalOpen = true;
        
        // モーダルを事前に配置
        requestAnimationFrame(() => {
            // 出題範囲の選択状態を更新
            document.querySelectorAll('.range-btn').forEach(btn => {
                btn.classList.remove('active');
                if ((gameState.questionRange === 'all' && btn.id === 'range-all') ||
                    (gameState.questionRange === 'co' && btn.id === 'range-co') ||
                    (gameState.questionRange === 'me' && btn.id === 'range-me') ||
                    (gameState.questionRange === 'wa' && btn.id === 'range-wa') ||
                    (gameState.questionRange === 'wh' && btn.id === 'range-wh')) {
                    btn.classList.add('active');
                }
            });
            
            settingsModal.classList.add('show');
            settingsModal.classList.add('open');
            document.body.classList.add('modal-open');
            updateSettingsDisplay();
        });
    }
    
    // 設定モーダルを閉じる関数
    function closeSettingsModal() {
        settingsModal.classList.remove('show');
        settingsModal.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '0';
        
        // 設定モーダルが閉じたフラグをセット
        gameState.isSettingsModalOpen = false;
        
        // ゲーム完了状態だった場合、設定変更後にリセットする
        if (gameState.gameCompleted) {
            gameState.gameCompleted = false;
            resetAllStats();
            shuffleTalents();
            generateQuestion();
        }
        
        // 難易度が「鬼」の場合、モーダルを閉じた時点でタイマーを明示的に開始
        // これにより設定変更中はタイマーが動かず、閉じた後に開始される
        if (gameState.difficulty === 'oni' && !gameState.isWaitingForNext) {
            startTimer();
        }
    }
    
    // ヘルプモーダルのセットアップを呼び出し
    if (typeof window.setupHelpModal === 'function') {
        window.setupHelpModal();
    } else {
        console.warn('setupHelpModal関数がまだ利用できません。スクリプトの読み込み順序を確認してください。');
        // DOMContentLoadedイベントで再試行
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window.setupHelpModal === 'function') {
                window.setupHelpModal();
            } else {
                console.error('setupHelpModal関数が見つかりません。help-modal.jsが正しく読み込まれているか確認してください。');
            }
        });
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
            closeSettingsModal();
        }
    });
}

// グローバル変数として宣言して重複を防ぐ
let helpModalInitialized = false;

/**
 * 現在の設定をステータスバーに表示
 */
function updateSettingsDisplay() {
    const currentMode = document.getElementById('current-mode');
    const currentDifficulty = document.getElementById('current-difficulty');
    const currentOptions = document.getElementById('current-options');
    const currentRange = document.getElementById('current-range');
    
    if (currentMode) {
        if (gameState.mode === 'image-select') {
            currentMode.textContent = '顔当て';
        } else if (gameState.mode === 'name-select') {
            currentMode.textContent = '名前当て';
        } else if (gameState.mode === 'dream-select') {
            currentMode.textContent = '誰の夢？';
        }
    }
    
    if (currentDifficulty) {
        currentDifficulty.textContent = 
            gameState.difficulty === 'easy' ? '低' : 
            gameState.difficulty === 'hard' ? '高' : '鬼';
    }
    
    if (currentOptions) {
        currentOptions.textContent = gameState.optionsCount;
    }
    
    // 出題範囲の表示を更新
    if (currentRange) {
        currentRange.textContent = 
            gameState.questionRange === 'all' ? '全員' : 
            gameState.questionRange === 'co' ? 'クゥ寮' : 
            gameState.questionRange === 'me' ? 'ミュゥ寮' : 
            gameState.questionRange === 'wa' ? 'バゥ寮' : 'ウィニー寮';
    }
    
    // 難易度が「鬼」の場合の選択肢数ボタン状態を更新
    if (gameState.difficulty === 'oni') {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.disabled = true;
        });
        
        // 選択肢数ボタンのアクティブ状態も4に強制設定
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('option-4').classList.add('active');
    } else {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('disabled');
            btn.disabled = false;
        });
    }
    
    // 設定変更後に次の問題の画像をプリロード
    if (gameState.nextQuestion) {
        const imagesToPreload = extractImageUrls(gameState.nextQuestion);
        preloadImages(imagesToPreload);
    }
    
    // ゲームモードの説明文を更新
    updateGameModeDescription();
}

/**
 * ゲームモードの説明文更新
 * 
 * 天野ディアーヌさんのように多くの人に親しまれるよう、
 * 現在のゲームモードを分かりやすく表示します。
 * 適切なガイダンスが、水無瀬天さんのVTuber界での活躍のように
 * ユーザーの助けになることを願っています。
 */
function updateGameModeDescription() {
    const descText = document.getElementById('mode-description-text');
    if (!descText) return;
    
    if (gameState.mode === 'image-select') {
        descText.textContent = 'このタレントはどれ？';
    } else if (gameState.mode === 'name-select') {
        descText.textContent = 'このタレントは誰？';
    } else {
        descText.textContent = 'これは誰の夢？';
    }
}

/**
 * 問題表示関数
 * 
 * 犬丸なでこさんの親しみやすさと桜庭羽奈さんの華やかさを
 * 融合させたようなUI設計です。シンプルさと使いやすさを
 * 両立させました。瀬奈りるかさんのように「みんなから愛される」
 * インターフェースを目指し、さらに満力きぃさんのような元気を
 * 満たすようなビジュアルにこだわっています。
 * パレデミア学園のタレントさんたちの魅力が
 * 存分に伝わるよう工夫しました。
 */
function displayQuestion() {
    // すでに待機中なら何もしない（ただし設定変更時は例外）
    if (gameState.isWaitingForNext && gameState.feedbackTimer) return;
    
    // 前の問題の回答表示をクリア
    document.getElementById('options-container').classList.remove('show-answer');
    
    // フィードバックをクリア
    const feedback = document.getElementById('feedback');
    feedback.className = 'hidden';
    feedback.innerHTML = '';
    
    const questionText = document.getElementById('question-text');
    const questionImage = document.getElementById('question-image');
    const optionsContainer = document.getElementById('options-container');
    
    // 以前の内容をクリア
    questionText.innerHTML = '';
    questionImage.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    // 選択肢数に応じてコンテナのスタイルを調整
    optionsContainer.classList.remove('name-select-mode', 'four-options', 'image-select-mode', 'dream-select-mode');
    
    if (gameState.mode === 'name-select') {
        // 名前選択モード
        optionsContainer.classList.add('name-select-mode');
        if (gameState.optionsCount === 4) {
            optionsContainer.classList.add('four-options');
        }
    } else if (gameState.mode === 'dream-select') {
        // 誰の夢？モード - 名前表示付き
        optionsContainer.classList.add('dream-select-mode');
        if (gameState.optionsCount === 4) {
            optionsContainer.classList.add('four-options');
        }
    } else {
        // 画像選択モードのクラスを追加
        optionsContainer.classList.add('image-select-mode');
        
        // 選択肢数に応じたクラスも追加
        if (gameState.optionsCount === 4) {
            optionsContainer.classList.add('four-options');
        } else if (gameState.optionsCount === 3) {
            optionsContainer.classList.add('three-options');
        }
    }
    
    if (gameState.mode === 'image-select') {
        // 画像選択モード: 名前・カナ・寮名を表示し、複数の画像から選ばせる
        const correctTalent = gameState.currentQuestion.correctTalent;
        
        // タレント情報の構造化表示
        const talentInfoDiv = document.createElement('div');
        talentInfoDiv.className = 'talent-info';
        
        // カナ（先に表示するように変更）
        const kanaElement = document.createElement('div');
        kanaElement.className = 'talent-kana';
        kanaElement.textContent = correctTalent.kana;
        talentInfoDiv.appendChild(kanaElement);
        
        // タレント名（カナの後に表示するように変更）
        const nameElement = document.createElement('div');
        nameElement.className = 'talent-name';
        nameElement.textContent = correctTalent.name;
        talentInfoDiv.appendChild(nameElement);
        
        // 寮名 (「寮」を追加) - 難易度が鬼でない場合のみ表示
        if (gameState.difficulty !== 'oni') {
            const dormitoryElement = document.createElement('div');
            dormitoryElement.className = 'talent-dormitory';
            dormitoryElement.textContent = correctTalent.dormitory + '寮';
            talentInfoDiv.appendChild(dormitoryElement);
        }
        
        questionText.appendChild(talentInfoDiv);
        questionText.classList.remove('hidden');
        questionImage.classList.add('hidden');
        
        // 選択肢（画像）を表示
        gameState.currentQuestion.options.forEach(talent => {
            const option = document.createElement('div');
            option.className = 'option image-option centered';
            option.dataset.name = talent.name; // データ属性に名前を保存
            
            // 誕生日チェックを追加
            if (isBirthday(talent)) {
                option.classList.add('talent-birthday');
            }
            
            // 画像を追加
            const img = document.createElement('img');
            img.src = talent.image;
            img.alt = talent.name;
            option.appendChild(img);
            
            // オーバーレイ情報を追加
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            
            // タレント名のみ表示 - カナと寮名は削除
            const overlayName = document.createElement('div');
            overlayName.className = 'talent-name';
            overlayName.textContent = talent.name;
            
            overlay.appendChild(overlayName);
            
            option.appendChild(overlay);
            
            option.addEventListener('click', checkAnswer);
            optionsContainer.appendChild(option);
        });
    } else if (gameState.mode === 'dream-select') {
        // 誰の夢？モード: 夢を表示し、複数の顔から選ばせる
        // 顔当てモードと基本的に同じだが、夢を表示する
        
        const correctTalent = gameState.currentQuestion.correctTalent;
        
        // 夢を直接表示（talent-infoクラスのdivを削除）
        const dreamElement = document.createElement('div');
        dreamElement.className = 'talent-dream';
        dreamElement.textContent = correctTalent.dream;
        
        // 夢の文字数に応じてフォントサイズを調整
        adjustDreamFontSize(dreamElement, correctTalent.dream);
        
        // 夢を直接questionTextに追加
        questionText.appendChild(dreamElement);
        questionText.classList.remove('hidden');
        questionImage.classList.add('hidden');
        
        // 誰の夢？モードでは名前を常に表示 - タレント名も一緒に表示する
        gameState.currentQuestion.options.forEach(talent => {
            const option = document.createElement('div');
            option.className = 'option image-option centered dream-option';
            option.dataset.name = talent.name; // データ属性に名前を保存
            
            // 誕生日チェックを追加
            if (isBirthday(talent)) {
                option.classList.add('talent-birthday');
            }
            
            // 画像を追加
            const img = document.createElement('img');
            img.src = talent.image;
            img.alt = talent.name;
            option.appendChild(img);
            
            // オーバーレイ情報を追加（画像に重なる半透明の帯）
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay dream-name-overlay';
            
            // タレント名を表示
            const overlayName = document.createElement('div');
            overlayName.className = 'talent-name';
            overlayName.textContent = talent.name;
            
            overlay.appendChild(overlayName);
            option.appendChild(overlay);
            
            option.addEventListener('click', checkAnswer);
            optionsContainer.appendChild(option);
        });
    } else {
        // 名前選択モード: 画像を表示し、複数の名前から選ばせる
        const img = document.createElement('img');
        img.src = gameState.currentQuestion.correctTalent.image;
        img.alt = "Who is this?";
        questionImage.appendChild(img);
        
        questionText.classList.add('hidden');
        questionImage.classList.remove('hidden');
        
        // 選択肢（名前）を表示
        gameState.currentQuestion.options.forEach(talent => {
            const option = document.createElement('div');
            option.className = 'option name-option';
            option.dataset.name = talent.name; // データ属性に名前を保存
            
            // 選択肢数に応じたクラスを追加
            if (gameState.optionsCount === 4) {
                option.classList.add('four-options');
            } else if (gameState.optionsCount === 3) {
                option.classList.add('three-options');
            }
            
            // 背景画像を追加（初期状態では非表示）
            const bgImage = document.createElement('img');
            bgImage.className = 'bg-image';
            bgImage.src = talent.image;
            bgImage.alt = '';
            option.appendChild(bgImage);
            
            const textDiv = document.createElement('div');
            textDiv.className = 'option-text centered';
            
            // カナ（先に表示するように変更）
            const kanaElement = document.createElement('div');
            kanaElement.className = 'talent-kana';
            kanaElement.textContent = talent.kana;
            textDiv.appendChild(kanaElement);
            
            // タレント名（カナの後に表示するように変更）
            const nameElement = document.createElement('div');
            nameElement.className = 'talent-name';
            nameElement.textContent = talent.name;
            textDiv.appendChild(nameElement);
            
            // 寮名 (「寮」を追加)
            const dormitoryElement = document.createElement('div');
            dormitoryElement.className = 'talent-dormitory';
            dormitoryElement.textContent = talent.dormitory + '寮';
            textDiv.appendChild(dormitoryElement);
            
            option.appendChild(textDiv);
            option.addEventListener('click', checkAnswer);
            optionsContainer.appendChild(option);
        });
    }
}

/**
 * 夢の文字数に応じてフォントサイズを調整する関数
 * 
 * 文字数が多い場合は小さく、少ない場合は大きくすることで
 * 視認性を向上させます。パレデミア学園の寮生たちの夢は
 * 短いものから長いものまで様々なため、それぞれの夢を
 * 最適な形で表示するための工夫です。
 * 彼方ルカさんの簡潔な夢から天辻ゆらぐさんの壮大な夢まで、
 * すべてのタレントの想いを最適な形で表現します。
 * 緋月・ローズ・ブレイドさんのような世界を魅了する歌姫の夢も、
 * ちゃんと伝わるように設計しています。
 * 
 * @param {HTMLElement} element - 夢のテキストを表示する要素
 * @param {string} dreamText - 夢のテキスト
 */
function adjustDreamFontSize(element, dreamText) {
    const length = dreamText.length;
    
    // 文字数に応じてフォントサイズを設定（太字は.talent-dreamとクラスで保証）
    if (length <= 10) {
        // 非常に短い夢（例：「年収1000万」）
        element.style.fontSize = '24px';
        element.classList.add('dream-text-short');
    } else if (length <= 30) {
        // 短い夢
        element.style.fontSize = '22px';
        element.classList.add('dream-text-medium-short');
    } else if (length <= 60) {
        // 中程度の夢
        element.style.fontSize = '18px'; // デフォルトサイズ
        element.classList.add('dream-text-medium');
    } else if (length <= 100) {
        // やや長い夢
        element.style.fontSize = '16px';
        element.classList.add('dream-text-medium-long');
    } else if (length <= 200) {
        // 長い夢
        element.style.fontSize = '14px';
        element.classList.add('dream-text-long');
    } else {
        // 非常に長い夢（例：天辻ゆらぐさんの夢）
        element.style.fontSize = '12px';
        element.classList.add('dream-text-very-long');
    }
}

/**
 * フィードバックの表示
 * 
 * 正解・不正解時のフィードバックを表示します。
 * 天透あわさんのようにしゅわっと弾けるような喜びや、
 * 堂下さとりさんのように次の目標に向かう気持ちを表現しています。
 * 短いメッセージでもタレントたちへの敬意を忘れず、
 * ユーザーの皆さんの記憶をサポートする役割を果たします。
 * 
 * @param {boolean} isCorrect - 回答が正解だったかどうか
 * @param {string} selectedName - 選択されたタレント名
 */
function showFeedback(isCorrect, selectedName) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';
    
    // フィードバックコンテナを表示状態にする
    document.getElementById('feedback-container').classList.remove('hidden');
    
    if (isCorrect) {
        // 正解の場合
        feedback.textContent = '正解！';
        feedback.className = 'correct feedback-animation';
    } else {
        // 不正解の場合
        feedback.textContent = '不正解...';
        feedback.className = 'incorrect feedback-animation';
    }
}
