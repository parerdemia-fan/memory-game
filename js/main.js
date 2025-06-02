/**
 * パレデミア学園 寮生記憶ゲーム - メインコントローラー
 * 
 * アプリケーションのエントリーポイントと全体の調整を行うファイルです。
 * ゲームの初期化、UIイベントの設定などを担当します。
 * game.jsで定義されたgameStateを共有して使用します。
 * まるで愛上オハナさんの植物への愛情のような生命力を、
 * このファイルがシステム全体に与えています。
 * 緋雨柚さんが持つライブへの情熱のように、
 * このアプリも多くの方に楽しんでいただけることを願っています。
 * 艶島カオルさんのような巧みなモノマネの才能にインスパイアされ、
 * 各タレントさんの個性をプログラムで表現できるよう工夫しました。
 */

// DOMが読み込まれたときの処理
document.addEventListener('DOMContentLoaded', () => {
    // スクリプトの読み込みを確認する
    if (typeof window.setupSettingsModal === 'function') {
        initialize();
    } else {
        console.error('UI関数が見つかりません。スクリプトの読み込み順序を確認してください。');
        // スクリプトの読み込みを待機する簡易機能を追加
        setTimeout(() => {
            if (typeof window.setupSettingsModal === 'function') {
                initialize();
            } else {
                console.error('UI関数の読み込みに失敗しました。ページを再読み込みしてください。');
            }
        }, 500); // 500ミリ秒待機
    }
});

/**
 * 保存された設定の読み込み
 * 
 * 星ノ夢みよさんの深い感謝の心のように、
 * ユーザーの好みを大切にする機能です。前回の設定を記憶し、
 * 再訪問時にも同じ環境で遊べるよう配慮しています。
 * 
 * @return {Object|null} 保存された設定オブジェクトまたはnull
 */
function loadSavedSettings() {
    try {
        const savedSettings = localStorage.getItem('parerdemia_settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
    }
    return null;
}

// ゲームの初期化
function initialize() {
    // gameStateはgame.jsで定義されたグローバルオブジェクトを使用
    loadTalents();
    setupEventListeners();
    
    // ui.jsで定義された関数をwindowオブジェクト経由で呼び出し
    window.setupSettingsModal();
    
    // 保存された設定を読み込んで適用
    const savedSettings = loadSavedSettings();
    let foundActiveMode = false;
    let foundActiveOption = false;
    let foundActiveDifficulty = false;
    let foundActiveRange = false;
    
    if (savedSettings) {
        console.log('保存された設定を読み込みました:', savedSettings);
        
        // モード設定を適用
        if (savedSettings.mode) {
            gameState.mode = savedSettings.mode;
            foundActiveMode = true;
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                if ((savedSettings.mode === 'image-select' && btn.id === 'image-select-mode') ||
                    (savedSettings.mode === 'name-select' && btn.id === 'name-select-mode') ||
                    (savedSettings.mode === 'dream-select' && btn.id === 'dream-select-mode')) {
                    btn.classList.add('active');
                }
            });
        }
        
        // 難易度設定を適用
        if (savedSettings.difficulty) {
            gameState.difficulty = savedSettings.difficulty;
            foundActiveDifficulty = true;
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
                if ((savedSettings.difficulty === 'easy' && btn.id === 'easy-mode') ||
                    (savedSettings.difficulty === 'hard' && btn.id === 'hard-mode') ||
                    (savedSettings.difficulty === 'oni' && btn.id === 'oni-mode')) {
                    btn.classList.add('active');
                }
            });

            // 鬼モードの場合、選択肢数と出題範囲の制約を適用
            if (savedSettings.difficulty === 'oni') {
                // 選択肢数を4に強制
                gameState.optionsCount = 4;
                document.querySelectorAll('.option-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.add('disabled');
                    btn.disabled = true;
                });
                document.getElementById('option-4').classList.add('active');

                // 出題範囲を全員に強制
                gameState.questionRange = 'all';
                document.querySelectorAll('.range-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.add('disabled');
                    btn.disabled = true;
                });
                document.getElementById('range-all').classList.add('active');
            }
        }
        
        // 出題範囲設定を適用（鬼モード以外の場合のみ）
        if (savedSettings.questionRange && gameState.difficulty !== 'oni') {
            gameState.questionRange = savedSettings.questionRange;
            foundActiveRange = true;
            document.querySelectorAll('.range-btn').forEach(btn => {
                btn.classList.remove('active');
                if ((savedSettings.questionRange === 'all' && btn.id === 'range-all') ||
                    (savedSettings.questionRange === 'co' && btn.id === 'range-co') ||
                    (savedSettings.questionRange === 'me' && btn.id === 'range-me') ||
                    (savedSettings.questionRange === 'wa' && btn.id === 'range-wa') ||
                    (savedSettings.questionRange === 'wh' && btn.id === 'range-wh')) {
                    btn.classList.add('active');
                }
            });
        }
        
        // 選択肢数設定を適用（鬼モード以外の場合のみ）
        if (savedSettings.optionsCount && gameState.difficulty !== 'oni') {
            gameState.optionsCount = savedSettings.optionsCount;
            foundActiveOption = true;
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.id === `option-${savedSettings.optionsCount}`) {
                    btn.classList.add('active');
                }
            });
        }
        
        // 設定を読み込んだ後、表示を更新
        if (typeof updateSettingsDisplay === 'function') {
            updateSettingsDisplay();
        }
        
        // ゲームモードの説明文を更新
        if (typeof updateGameModeDescription === 'function') {
            updateGameModeDescription();
        }
    }
    
    // HTMLのactiveクラスに合わせてゲーム状態を確認（保存設定がない場合のみ）
    // ゲームモードの確認
    if (!foundActiveMode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn.classList.contains('active')) {
                foundActiveMode = true;
                if (btn.id === 'image-select-mode') {
                    gameState.mode = 'image-select';
                } else if (btn.id === 'name-select-mode') {
                    gameState.mode = 'name-select';
                } else if (btn.id === 'dream-select-mode') {
                    gameState.mode = 'dream-select';
                }
            }
        });
    }
    
    // アクティブなモードがない場合はデフォルト設定を適用
    if (!foundActiveMode) {
        document.getElementById('image-select-mode').classList.add('active');
        gameState.mode = 'image-select';
    }
    
    // 選択肢数の確認（保存設定がない場合のみ）
    if (!foundActiveOption) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.classList.contains('active')) {
                foundActiveOption = true;
                const count = parseInt(btn.id.split('-')[1]);
                gameState.optionsCount = count;
            }
        });
    }
    
    // アクティブな選択肢設定がない場合はデフォルト設定を適用
    if (!foundActiveOption) {
        document.getElementById('option-4').classList.add('active');
        gameState.optionsCount = 4;
    }

    // 難易度設定の確認（保存設定がない場合のみ）
    if (!foundActiveDifficulty) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            if (btn.classList.contains('active')) {
                foundActiveDifficulty = true;
                const difficulty = btn.id.split('-')[0];
                if (difficulty === 'easy' || difficulty === 'hard' || difficulty === 'oni') {
                    gameState.difficulty = difficulty;
                }
            }
        });
    }
    
    // アクティブな難易度設定がない場合はデフォルト設定を適用
    if (!foundActiveDifficulty) {
        document.getElementById('easy-mode').classList.add('active');
        gameState.difficulty = 'easy';
    }
    
    // 出題範囲の初期化（デフォルト: 全員）
    document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('range-all').classList.add('active');
    
    // 初期化完了後に再度設定表示を更新
    if (typeof updateSettingsDisplay === 'function') {
        updateSettingsDisplay();
    }
    
    // ゲームモードの説明文も最終更新
    if (typeof updateGameModeDescription === 'function') {
        updateGameModeDescription();
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // ゲームモード切り替え
    document.getElementById('image-select-mode').addEventListener('click', () => setGameMode('image-select'));
    document.getElementById('name-select-mode').addEventListener('click', () => setGameMode('name-select'));
    document.getElementById('dream-select-mode').addEventListener('click', () => setGameMode('dream-select'));
    
    // 選択肢数切り替え
    document.getElementById('option-2').addEventListener('click', () => setOptionsCount(2));
    document.getElementById('option-3').addEventListener('click', () => setOptionsCount(3));
    document.getElementById('option-4').addEventListener('click', () => setOptionsCount(4));
    
    // 難易度切り替え
    document.getElementById('easy-mode').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('hard-mode').addEventListener('click', () => setDifficulty('hard'));
    document.getElementById('oni-mode').addEventListener('click', () => setDifficulty('oni'));
    
    // 出題範囲切り替え
    document.getElementById('range-all').addEventListener('click', () => setQuestionRange('all'));
    document.getElementById('range-co').addEventListener('click', () => setQuestionRange('co'));
    document.getElementById('range-me').addEventListener('click', () => setQuestionRange('me'));
    document.getElementById('range-wa').addEventListener('click', () => setQuestionRange('wa'));
    document.getElementById('range-wh').addEventListener('click', () => setQuestionRange('wh'));
}

// 出題範囲の状態管理と機能実装
function setQuestionRange(range) {
    // 前の状態を保存
    const previousRange = gameState.questionRange;
    
    // UIを更新
    document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
    if (range === 'all') {
        document.getElementById('range-all').classList.add('active');
    } else if (range === 'co') {
        document.getElementById('range-co').classList.add('active');
    } else if (range === 'me') {
        document.getElementById('range-me').classList.add('active');
    } else if (range === 'wa') {
        document.getElementById('range-wa').classList.add('active');
    } else if (range === 'wh') {
        document.getElementById('range-wh').classList.add('active');
    }
    
    // gameStateに反映
    gameState.questionRange = range;
    
    // 出題範囲が変更された場合のみゲームをリセット
    if (previousRange !== range) {
        resetGameForSettingChange();
    }
    
    // 設定を保存
    saveSettings();
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
            questionRange: gameState.questionRange,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('parerdemia_settings', JSON.stringify(settings));
        console.log('設定を保存しました:', settings);
    } catch (error) {
        console.error('設定の保存に失敗しました:', error);
    }
}
