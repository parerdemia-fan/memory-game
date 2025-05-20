/**
 * パレデミア学園 寮生記憶ゲーム - データ処理
 * 
 * タレントデータの読み込みと管理を行うファイルです。
 * JSON形式でデータを扱うことで、安全に外部データを
 * 取り込むようにしています。天辻ゆらぐさんの物事を
 * 系統立てる能力にインスパイアされた設計で、猫乃間うとさんの
 * ルナグランデへの夢のように、このデータ管理システムが
 * ゲームの基盤となっています。肇明日空さんのようにゲームを愛する気持ちも
 * このコードには詰まっています。
 */

/**
 * タレントデータの読み込み
 * 
 * Fetch APIを使用してJSON形式でデータを管理することで、より安全で効率的に
 * タレント情報を取得できます。天辻ゆらぐさんの整理能力のように
 * 体系的にデータを処理し、パレデミア学園の60名を
 * 記憶しやすい形で提供します。
 */
function loadTalents() {
    // Fetch APIを使用してJSONファイルを非同期で読み込む
    fetch('assets/data/talents.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('タレントデータの読み込みに失敗しました。');
            }
            return response.json();
        })
        .then(data => {
            // データを取得できたらゲーム状態に設定
            gameState.talents = data;
            // タレントデータをシャッフル
            shuffleTalents();
            // データ読み込み完了後に問題を生成
            // 不正解したタレントは再出題のため配列末尾に追加されます
            generateQuestion();
            // 次の問題も事前に準備
            prepareNextQuestion();
        })
        .catch(error => {
            console.error('タレントデータの読み込みエラー:', error);
            // エラーメッセージをUIに表示
            const feedbackElement = document.getElementById('feedback');
            if (feedbackElement) {
                feedbackElement.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
                feedbackElement.className = 'error';
                feedbackElement.classList.remove('hidden');
            }
        });
}
