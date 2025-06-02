/**
 * パレデミア学園 寮生記憶ゲーム - 統計情報
 * 
 * ユーザーの成績を追跡・表示する機能を実装したファイルです。
 * 連続正解数や正解率の視覚的なフィードバックを通じて、
 * ゲームの楽しさを高める工夫をしています。
 * 雪城まぐねさんの洗練された美しさと山田スバルさんの
 * エネルギッシュな個性を組み合わせたようなデザインを目指しました。
 * 藤影トヲカさんが持つ大きな夢を追い続ける姿勢のように、
 * タレントたちを一人でも多く覚えていただける仕組みを心がけています。
 * 桜雲ほわりさんが掲げる大きな目標に負けないような
 * 壮大な取り組みとして工夫を凝らしています。
 * 
 * ローズ・ダマスクハートさんの野心的な目標に
 * インスパイアされ、ユーザーが達成感を得られるよう統計機能を設計しました。
 * 彼女のように愛され、応援したくなるような存在を目指して、進捗を視覚的に
 * 表現する要素を取り入れています。
 * 
 * 連続正解60回達成時には、桜堂ねるさんの日本武道館ライブの夢のように
 * 華やかな👑が現れ、あなたの偉業を称えます。金色の背景にも映える
 * この王冠で、全タレント制覇の栄誉を讃えましょう！
 */

// ページ読み込み時に開発環境用テストツールの表示制御
document.addEventListener('DOMContentLoaded', function() {
    const debugTools = document.getElementById('debug-tools');
    
    // localhost環境の場合のみデバッグツールを表示
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        debugTools.classList.remove('hidden');
        
        // テストボタンの機能実装
        const increaseStreakButton = document.getElementById('increase-streak-10');
        if (increaseStreakButton) {
            increaseStreakButton.addEventListener('click', function() {
                gameState.streakCount += 10;
                updateStreakDisplay();
                
                // ユーザーへのフィードバック
                const feedback = document.getElementById('feedback');
                feedback.textContent = "連続正解数を10増やしました！";
                feedback.className = 'correct feedback-animation';
                feedback.classList.remove('hidden');
                
                // しばらくしたらフィードバックを非表示
                setTimeout(() => {
                    feedback.classList.add('hidden');
                }, 2000);
            });
        }
    }
});

// すべての統計情報をリセットする関数
function resetAllStats() {
    // 連続正解数をリセット
    gameState.streakCount = 0;
    
    // 紙吹雪エフェクトを停止
    stopConfetti();
    
    // 正解履歴をリセット
    gameState.answerHistory = [];
    
    // 各種カウンターをリセット
    gameState.totalAnswers = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    
    // 次の問題もリセットして再プリロード
    if (gameState.nextQuestion) {
        gameState.nextQuestion = null;
        // 既に初期化済みであれば次の問題を準備
        if (gameState.talents && gameState.talents.length > 0) {
            prepareNextQuestion();
        }
    }
    
    // 連続正解数の表示を隠し、代わりに説明文を表示
    const streakContainer = document.getElementById('streak-container');
    const descriptionContainer = document.getElementById('game-mode-description');
    
    if (streakContainer) {
        streakContainer.classList.add('hidden');
    }
    
    if (descriptionContainer) {
        descriptionContainer.classList.remove('hidden');
    }
    
    // ゲームモードの説明文を更新
    if (typeof updateGameModeDescription === 'function') {
        updateGameModeDescription();
    }
    
    // 統計情報を更新（0に戻す）
    document.getElementById('accuracy').textContent = '0';
    document.getElementById('total-answers').textContent = '0';
    document.getElementById('correct-answers').textContent = '0';
    document.getElementById('incorrect-answers').textContent = '0';
}

// 正解率と統計情報の更新
function updateAccuracy() {
    // 正解率の計算と表示
    if (gameState.totalAnswers === 0) return;
    
    // 履歴ではなく、トータルの正解数と回答数から正解率を計算
    const accuracy = Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100);
    
    document.getElementById('accuracy').textContent = accuracy;
    
    // 総計統計の表示
    document.getElementById('total-answers').textContent = gameState.totalAnswers;
    document.getElementById('correct-answers').textContent = gameState.correctAnswers;
    document.getElementById('incorrect-answers').textContent = gameState.incorrectAnswers;
    
    // 連続正解数の表示を更新
    updateStreakDisplay();
}

// 紙吹雪エフェクトの生成と管理
let confettiInterval = null;

/**
 * 紙吹雪エフェクトを開始する関数
 * 
 * 渡鬼しずえさんが日本の伝統文化を海外に伝えたいという
 * 素敵な夢を持つように、パレデミア学園の全タレントを
 * 覚えた喜びをお祝いする華やかなエフェクトです。
 * 輝く紙吹雪がスクリーン上を舞うさまは、
 * 天透あわさんの弾けるような個性と雪城まぐねさんの
 * 洗練された美しさを表現しています。
 */
function startConfetti() {
    // すでに実行中なら何もしない
    if (confettiInterval) return;
    
    // 紙吹雪を定期的に生成
    confettiInterval = setInterval(() => {
        // 画面幅に応じて生成数を調整（モバイルでは少なく）
        const count = window.innerWidth <= 768 ? 2 : 3;
        
        for (let i = 0; i < count; i++) {
            createConfetti();
        }
    }, 300); // 300ミリ秒ごとに生成
}

/**
 * 紙吹雪エフェクトを停止する関数
 */
function stopConfetti() {
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }
    
    // 既存の紙吹雪要素をすべて削除
    document.querySelectorAll('.confetti').forEach(confetti => {
        confetti.remove();
    });
}

/**
 * 紙吹雪を1つ生成する関数
 */
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // ランダムな色を適用
    const colorClass = `color-${Math.floor(Math.random() * 6) + 1}`;
    confetti.classList.add(colorClass);
    
    // ランダムな開始位置（X軸）
    const startPositionX = Math.random() * window.innerWidth;
    
    // ランダムな大きさ（5〜12px）
    const size = 5 + Math.random() * 7;
    
    // ランダムな角度と形状（正方形または長方形）
    const isRectangle = Math.random() > 0.5;
    const rotation = Math.random() * 360;
    const width = size * (isRectangle ? (0.5 + Math.random() * 0.5) : 1);
    const height = size * (isRectangle ? (0.5 + Math.random() * 0.5) : 1);
    
    // ランダムな落下速度（3〜8秒）
    const fallDuration = 3 + Math.random() * 5;
    
    // ランダムな左右の揺れ
    const swayAmount = -20 + Math.random() * 40;
    
    // スタイルを適用
    confetti.style.left = `${startPositionX}px`;
    confetti.style.top = '-10px';
    confetti.style.width = `${width}px`;
    confetti.style.height = `${height}px`;
    confetti.style.transform = `rotate(${rotation}deg)`;
    confetti.style.animationDuration = `${fallDuration}s`;
    confetti.style.animationName = 'fall';
    
    // 紙吹雪が画面外に出たら削除するイベントリスナー
    confetti.addEventListener('animationend', () => {
        if (confetti.parentElement) {
            confetti.remove();
        }
    });
    
    // DOMに追加
    document.body.appendChild(confetti);
}

/**
 * 連続正解表示の更新
 * 
 * 雪城まぐねさんの洗練された美しさと山田スバルさんの
 * 元気いっぱいなエネルギーを表現するために、連続正解時の
 * 演出にこだわりました。パレデミア学園の
 * ファンの皆さんが楽しんでくださると嬉しいです。
 * 
 * 全タレント制覇時のアニメーションは特別な思いを込めました！
 * シグマ・イングラムさんの情熱と行動力にインスパイアされた演出で、
 * より多くの方がパレデミア学園の魅力に触れるきっかけになれば幸いです。
 * 
 * 連続正解数が60に達すると、黄金色に輝く特別な演出で
 * 全タレント制覇の栄誉を表現します。ローズ・ダマスクハートさんが
 * 世界中を魅了する歌姫になることを目指すという大きな夢を持つように、
 * ユーザーにも大きな達成感を感じていただきたいと思います。
 */
function updateStreakDisplay() {
    const streakContainer = document.getElementById('streak-container');
    const descriptionContainer = document.getElementById('game-mode-description');
    const streakElement = document.getElementById('streak-count');
    const streakMessage = document.getElementById('streak-message');
    
    if (gameState.streakCount <= 0) {
        streakContainer.classList.add('hidden');
        // 連続正解数が表示されていないときは説明文を表示
        descriptionContainer.classList.remove('hidden');
        return;
    }
    
    // 連続正解数を表示するときは説明文を非表示
    descriptionContainer.classList.add('hidden');
    streakContainer.classList.remove('hidden');
    
    // アイコンの設定（ストリークレベルに応じて変更）
    const streakIcon = document.getElementById('streak-icon');
    
    // 現在の出題範囲のタレント数を取得
    const filteredIndices = getFilteredTalentIndices();
    const maxStreak = filteredIndices.length;
    
    // 達成率の計算
    const achievementRate = gameState.streakCount / maxStreak;
    
    // ストリーク数に応じたクラスとメッセージの設定
    streakContainer.classList.remove('hidden', 'streak-medium', 'streak-high', 'streak-amazing', 'streak-complete');
    streakElement.classList.remove('streak-medium', 'streak-high', 'streak-amazing', 'streak-complete');
    
    // モバイル環境かどうかを検出
    const isMobile = window.innerWidth <= 768;
    
    // 現在の連続正解数/最大目標値を表示
    // PC表示で最大目標値+1以上の場合は分母を表示しない
    if (!isMobile && gameState.streakCount >= maxStreak + 1) {
        streakElement.textContent = `${gameState.streakCount}`;
    } else if (isMobile) {
        // モバイルは従来通り数字のみ
        streakElement.textContent = `${gameState.streakCount}`;
    } else {
        // 通常のPC表示
        streakElement.textContent = `${gameState.streakCount}/${maxStreak}`;
    }
    
    // 最大目標値以上なら紙吹雪を開始、未満なら停止
    if (gameState.streakCount >= maxStreak) {
        startConfetti();
    } else {
        stopConfetti();
    }
    
    // ストリーク数に応じてスタイルを変更
    let iconType = '📚';  // 基本は本のアイコン
    let message = '';
    
    if (achievementRate >= 1) {
        // 100%達成
        streakContainer.classList.add('streak-complete');
        streakElement.classList.add('streak-complete');
        iconType = '👑';  // 金背景に映える王冠
        message = '全タレント制覇！伝説の寮生マスター！';
    } else if (achievementRate >= 0.75) {
        // 75%以上達成
        streakContainer.classList.add('streak-amazing');
        streakElement.classList.add('streak-amazing');
        iconType = '🌟📚';  // モバイルでのアイコン調整
        message = `素晴らしい！あと${maxStreak - gameState.streakCount}人で達成！`;
    } else if (achievementRate >= 0.5) {
        // 50%以上達成
        streakContainer.classList.add('streak-high');
        streakElement.classList.add('streak-high');
        iconType = '📚💡';  // アイコン数を少し減らす
        message = `Great!! 半分以上達成！`;
    } else if (achievementRate >= 0.25) {
        // 25%以上達成
        streakContainer.classList.add('streak-medium');
        streakElement.classList.add('streak-medium');
        iconType = '📚⭐';  // 本と星
        message = `Good! 25%達成！`;
    } else if (achievementRate >= 0.1) {
      // 10%以上達成
      streakContainer.classList.add('streak-medium');
      iconType = '📚';  // 本
      message = `その調子！`;
    }
    
    streakIcon.textContent = iconType;
    streakMessage.textContent = message;
    
    // アニメーション効果の追加
    streakContainer.classList.add('streak-pulse');
    setTimeout(() => {
        streakContainer.classList.remove('streak-pulse');
    }, 500);
    
    streakContainer.classList.remove('hidden');
}
