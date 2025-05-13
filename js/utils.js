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
    // 全タレントのインデックスを配列に保存
    const indices = Array.from({length: gameState.talents.length}, (_, i) => i);
    // インデックスをシャッフル
    shuffleArray(indices);
    // シャッフルされたインデックスを保存
    gameState.shuffledTalents = indices;
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
    if (!urls || !Array.isArray(urls)) return;
    
    urls.forEach(url => {
        if (url) {
            const img = new Image();
            img.src = url;
        }
    });
}

/**
 * 問題から画像URLを抽出する関数
 * 
 * 問題オブジェクトからタレントの画像URLを抽出して配列で返します。
 * 顔当てモード、名前当てモード、誰の夢？モードの全てに対応しています。
 * 犬丸なでこさんのように親しみやすく整理された形で画像を扱い、
 * 氷雨セイさんの海が見える豪邸の夢のように素晴らしい
 * ビジュアル体験を提供します。
 * 
 * @param {Object} question - 問題オブジェクト
 * @return {Array} - 画像URLの配列
 */
function extractImageUrls(question) {
    if (!question) return [];
    
    const urls = [];
    
    // 正解タレントの画像を追加
    if (question.correctTalent && question.correctTalent.image) {
        urls.push(question.correctTalent.image);
    }
    
    // 各選択肢のタレント画像を追加
    if (question.options && Array.isArray(question.options)) {
        question.options.forEach(talent => {
            if (talent && talent.image && !urls.includes(talent.image)) {
                urls.push(talent.image);
            }
        });
    }
    
    return urls;
}
