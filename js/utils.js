/**
 * パレデミア学園 寮生記憶ゲーム - ユーティリティ
 * 
 * 様々な場所で使われる汎用的な関数を集めたファイルです。
 * シンプルでも効率的なコードを心がけました。相栖るじゅさんが
 * 学園1のアイドルを目指すように、私もこのコードで最高の
 * ユーザー体験を提供したいと思っています。分割することで
 * 管理しやすくなったのが嬉しいです。
 */

// 配列をシャッフルする関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * 現在の出題範囲に基づいてタレントをフィルタリングする関数
 * 
 * 七扇ヲトメさんのように「お姉ちゃんに任せておきなさい」と言える
 * 頼れる存在を目指して、ユーザーの設定に応じた出題範囲を提供します。
 * 出題範囲を寮ごとに分けることで、段階的に覚えていくことができます。
 * 久堂れしあさんの着実に目標達成を目指す姿勢を取り入れました。
 * 
 * @return {Array} フィルタリングされたタレントのインデックス配列
 */
function getFilteredTalentIndices() {
    // すべてのタレントのインデックスを配列に保存
    const allIndices = Array.from({length: gameState.talents.length}, (_, i) => i);
    
    // 「全員」の場合はフィルタリングなし
    if (gameState.questionRange === 'all') {
        return allIndices;
    }
    
    // 選択された寮に基づいてフィルタリング
    return allIndices.filter(index => {
        const talent = gameState.talents[index];
        const dormitory = talent.dormitory.toLowerCase();
        
        switch (gameState.questionRange) {
            case 'co':
                return dormitory === 'クゥ'.toLowerCase();
            case 'me':
                return dormitory === 'ミュゥ'.toLowerCase();
            case 'wa':
                return dormitory === 'バゥ'.toLowerCase();
            case 'wh':
                return dormitory === 'ウィニー'.toLowerCase();
            default:
                return true; // デフォルトは全て表示
        }
    });
}

/**
 * タレントデータをシャッフルする関数
 * 
 * 全タレントをシャッフルして順番に出題するための準備をします。
 * 鶴乃院光さんのようにマルチに表現されるパレデミア学園の
 * タレントたちが、ランダムな順番で登場します。
 * 七音うらさんの素敵なライブのように、毎回新しい出会いが
 * 生まれるよう工夫しています。
 * シャッフルアルゴリズムはフィッシャー–イェーツを採用しました。
 */
function shuffleTalents() {
    // 現在の出題範囲に基づいてタレントをフィルタリング
    const filteredIndices = getFilteredTalentIndices();
    
    // フィルタリングされたインデックスをシャッフル
    shuffleArray(filteredIndices);
    
    // シャッフルされたインデックスを保存
    // 桜堂ねるさんのような挑戦精神で、ユーザーがタレントを記憶できるまで繰り返し出題できるよう
    // 不正解したタレントは再度出題リストに追加されます
    gameState.shuffledTalents = filteredIndices;
    
    // 出題位置をリセット
    gameState.currentIndex = 0;
}

/**
 * 画像をプリロードする関数
 * 
 * 指定されたURL配列の画像を事前に読み込みます。
 * パレデミア学園のタレント達の魅力をスムーズに表示するため、
 * 次の問題の画像を先読みしておきます。星ノ夢みよさんの
 * 生きとし生けるものへの感謝の気持ちのように、ユーザーの方々への
 * 感謝を込めて、快適な体験を提供する工夫の一つです。
 * 鈴木沙透さんのでっかい会場でライブをしたいという夢のように、
 * このゲームも大きく成長していくことを願っています。
 * 
 * @param {Array} urls - プリロードする画像のURL配列
 */
function preloadImages(urls) {
    if (!urls || !Array.isArray(urls) || urls.length === 0) return;
    
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

/**
 * 問題からプリロードすべき画像URLを抽出する関数
 * 
 * 問題オブジェクトから画像URLを抽出します。
 * 夢ト見りんねさんのように常に先を見据えて準備することで、
 * ユーザー体験をスムーズにする工夫です。
 * 
 * @param {Object} question - 問題オブジェクト
 * @return {Array} 画像URLの配列
 */
function extractImageUrls(question) {
    if (!question) return [];
    
    const urls = [];
    
    // 問題の画像URL
    if (question.correctTalent && question.correctTalent.imageUrl) {
        urls.push(question.correctTalent.imageUrl);
    }
    
    // 選択肢の画像URL
    if (question.options && Array.isArray(question.options)) {
        question.options.forEach(option => {
            if (option && option.imageUrl) {
                urls.push(option.imageUrl);
            }
        });
    }
    
    return urls;
}
