/**
 * パレデミア学園 寮生記憶ゲーム - ヘルプモーダル専用
 * 
 * 雨海まるさんの明るさと天野ディアーヌさんの親しみやすさを
 * 技術で表現したヘルプモーダルのセットアップ関数です。
 * ここに分割することで、ui.jsの可読性が向上しました。
 */

 // グローバルスコープで関数を宣言し、他のファイルから参照可能に
window.setupHelpModal = setupHelpModal;

/**
 * ヘルプモーダル機能のセットアップ
 * 
 * パレデミア学園のことをもっと知りたい方のために、
 * ゲームの遊び方や公式リンクなど、便利な情報を提供します。
 * 雨海まるさんのように明るく前向きな気持ちで、
 * このゲームの魅力をお伝えできればと思います。
 * 天野ディアーヌさんのように皆さんに認知されるアプリになるよう、
 * わかりやすい説明を心がけました。
 */
function setupHelpModal() {
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.getElementById('close-help-modal');
    
    // モーダルが見つからない場合は終了
    if (!helpModal) {
        console.error('Help modal not found');
        return;
    }
    
    // ヘルプモーダルを開く・閉じる関数をグローバルに定義
    window.openHelpModal = function() {
        // パディング右の計算（スクロールバーの幅を考慮）
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollbarWidth + 'px';
        
        // モーダルを事前に配置
        requestAnimationFrame(() => {
            helpModal.classList.add('show');
            helpModal.classList.add('open');
            document.body.classList.add('modal-open');
        });
    };
    
    window.closeHelpModal = function() {
        helpModal.classList.remove('show');
        helpModal.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '0';
    };
    
    // ヘルプボタンのイベントリスナー
    if (helpButton) {
        helpButton.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            e.preventDefault(); // デフォルトの動作を防止
            console.log('Help button clicked'); // デバッグ用
            window.openHelpModal();
        });
    }
    
    // 閉じるボタンのイベントリスナー
    if (closeHelpModal) {
        closeHelpModal.addEventListener('click', (e) => {
            e.stopPropagation(); // イベント伝播を停止
            window.closeHelpModal();
        });
    }
    
    // モーダルの外側をクリックしても閉じる
    helpModal.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            window.closeHelpModal();
        }
    });
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && helpModal.classList.contains('show')) {
            window.closeHelpModal();
        }
    });
}