# RESCENE FANSITE 必須ノイズ・プロファイル

## 位置づけ

この文書は、Claude Designから現在の実装へ残っている差異を、今後のAI実装・リファクタリングで失わないための保護規約である。

参照原則：`/Users/ena/Documents/GitHub/nag-ai-magazine/docs/required-noise-design-principles-v2.1.md`

- 新しい不規則性を追加するための仕様ではない。
- 値の心理的・ブランド的な意味を説明しない。
- 保護理由は「Claude Designとの視覚比較で保持」で足りる。
- アクセシビリティ、可読性、操作性、レスポンシブ、静的出力を壊す差異は保護しない。
- 保護値を変更する場合は、`docs/visual-audit.md`に従って変更前後を実ブラウザで比較する。

## 保護する差異

### Hero

- `public/images/hero.png`は`2880 × 1800`の合成画像である。5人それぞれのcrop、被写体の上下位置、人物間の黒い余白、上部の大きな文字、下部の罫線とbrush輪郭が画像内に固定されている。画像を等幅カードへ分解したり、中央cropで再構成したりしない。
- `<Image width={2880} height={1800}>`と`.hero-visual > img { width: 100%; height: auto; }`の組み合わせで、合成画像の全体比率を維持する。モバイルでもHero自体を非表示にしない。
- デスクトップのプロフィール・ヒット領域は、共通Y位置`top: 17%`、高さ`64%`を基準にしつつ、人物ごとに次のX位置と幅を保持する。

| Member | left | width |
| --- | ---: | ---: |
| MAY | `5.24%` | `17.05%`（共通値） |
| LIV | `23.26%` | `17.05%`（共通値） |
| ZENA | `41.98%` | `17.01%` |
| MINAMI | `60.17%` | `16.77%` |
| WONI | `78.13%` | `17.04%` |

- ヒット領域間の余白は完全等分ではない。`20%`刻み、同一幅、均等gapへ正規化しない。
- ヒット内の名前は領域下端に寄せ、`padding: 18px`と名前下の`8px`を保持する。名前の表示位置を人物画像の中央へ統一しない。
- `hero-name-row`は画像内の不均一な人物cropとは別の、5等分された操作導線である。この等分自体を「ノイズ不足」とみなして崩さない。
- `767px`以下ではヒット領域のみを隠し、Hero画像と名前導線を残す。モバイルでHero全体を消す変更は行わない。

### Members

- ホームの順序は`homeOrder`を正本とする。`MAY → LIV → ZENA → MINAMI → WONI`を`displayOrder`やデータ配列順へ統一しない。
- デスクトップのカード段差は次を保持する。

| Member | margin-top |
| --- | ---: |
| MAY | `0` |
| LIV | `42px` |
| ZENA | `16px` |
| MINAMI | `42px` |
| WONI | `0` |

- ホームカードの`aspect-ratio: 0.55`と`gap: clamp(8px, 1.2vw, 18px)`を、一般的な正方形カードや均質カードグリッドへ置換しない。
- `767px`以下ではデスクトップの個別marginを解除し、表示順の偶数カード、現在はLIVとMINAMI、だけを`translateY(24px)`する。この24px段差を平坦化しない。
- モバイルの段差後に続く説明文の`margin-top: 54px`は、カードのずれを受け止める現在の組み合わせとして扱う。片方だけを変更しない。
- ホームカード画像は`cover`、詳細ページのデスクトップ画像は`cover`かつ`object-position: 50% 12%`、モバイル詳細は`contain`かつ`center`である。ブレークポイントをまたいで一つのcrop方式へ統一しない。
- メンバー詳細のデスクトップ構成は、`318px / 残り`の非等分grid、portraitの`min-height: 700px`、左だけの`18px`marginを保持する。左右対称の余白や中央カードへ変更しない。
- モバイル詳細ではportraitを`440px`行として本文の前へ置き、左右に`var(--page-pad)`を使う。このモバイル専用構成をデスクトップの縮小版へ戻さない。
- 5枚のメンバー素材はすべて`163 × 381`だが、画像内部の人物位置と余白は同一ではない。CSSに個別`object-position`は現存しないため、存在しない個別値を追加しない。一括cropを変更する場合は5人を個別に比較する。

### Layout

- ホーム下部の入門／Discographyは`0.88fr / 1.12fr`を保持する。`1fr / 1fr`へ正規化しない。
- Footerの3列は`1.3fr / 1fr / 1.2fr`を保持する。3等分へ正規化しない。
- Discography一覧の5列は`0.8fr / 1.55fr / 1fr / 1.35fr / 1fr`と各列の最小幅の組み合わせを保持する。
- Members一覧の列は`74px / 0.55fr / 1fr / 0.6fr`、identity-only時は`74px / 1fr`である。単一の汎用一覧gridへ統一しない。
- News一覧の`0.36fr / 1fr`、Schedule現在状態の`0.8fr / 1.2fr`、Schedule過去行の`0.32fr / 1fr`を、無条件に同一の比率へ統一しない。
- Japan Archiveの年見出し`0.25fr / 1fr`と記録行`0.24fr / 1fr`は近いが同じではない。共通トークンへ統合する前に実画面を比較する。
- Linksのグループは`0.42fr / 1fr`、関連行は`0.25fr / 1fr`、Track Listは`64px / 1fr / 0.38fr`である。使用箇所が少ないことだけを理由に共通比率へ置換しない。
- これらの比率はモバイルで`1fr`中心の情報順へ再構成される。PCレイアウトを縮小して残すのではなく、現在のブレークポイント別構造を保持する。

### Images

- Heroの5人分の個別cropと人物間余白は`hero.png`内に焼き込まれている。画像最適化や差し替えで構図を中央寄せ・等分しない。
- Member detailの`object-position: 50% 12%`は非中央のデスクトップ重心として保護する。ただし画質、画像権利、可読性、モバイル成立に問題がある場合は保護より人間確認を優先する。
- Mobile Member detailの`object-fit: contain; object-position: center;`は、デスクトップと異なるcrop方針として保護する。
- Home Memberの現在値は`object-fit: cover`のみで、個別`object-position`はない。将来個別値を導入する場合は、新規視覚設計として候補比較を行う。
- `public/images/brush.png`は`672 × 256`の不均一な輪郭を持つ。整形した矩形や均一なベクター帯へ自動置換しない。

### Discography

- 一覧全体の左右1px線、各行の下線、ヘッダー帯を組み合わせた区切りを保持する。左右線を削除したり、全項目を独立カードへ変えたりしない。
- 行は暗色／白色を交互に表示する。白色行専用の本文色、補助色、hover色`#e9e5de`を暗色行と一つの状態色へ統一しない。
- デスクトップ行の`min-height: 112px`、作品名のCormorant系表示、日付・形態・タイトル曲・香りの5列構成を保持する。
- モバイルではヘッダーを隠し、1列へ再構成し、形態・タイトル曲・香りのラベルを疑似要素で補う。デスクトップ表を縮小表示しない。
- 一覧はジャケット画像の均質カードグリッドではなく、テキスト主体の行リンクである。画像カード一覧へ自動的に置換しない。
- 作品詳細のTrack Listは、デスクトップで番号列`64px`、モバイルで`44px`を持つ。`01`等の番号を本文へ吸収したり消したりしない。

### Decoration

- Hero画像内の下部brushと罫線は合成画像の一部として保持する。
- Footerのbrushは`background-size: 132% 150%`で資産境界を越えてcropされ、`filter: invert(1)`が適用される。この値を`contain`や`100% 100%`へ正規化しない。
- Footer brushはモバイルで`max-width: 260px`となる。幅100%の共通帯へ統一しない。
- Member detail portraitの左18pxだけのmargin、Heroヒット領域の小数percentage、各セクションの片側罫線は、視覚比較なしに対称化しない。
- `border-radius: 0`は現在のbutton/inputのClaude Design基準として維持する。ただし、新規コンポーネントを無条件に角丸0へ収束させるための共通規則とはみなさない。

### Motion

- 現在、常時動く装飾、個別animation、実行時乱数は存在しない。ノイズ不足を理由に追加しない。
- Heroヒット領域、ボタン、リンク、行hoverなどの多くが`160ms ease`へ共通化されている。これは現状の監査対象であり、今回のバグではない。機械的に時間やeasingをばらつかせない。
- `scroll-behavior: smooth`は`prefers-reduced-motion: reduce`で停止する。Reduced Motionを無視する動きを保護対象にしない。
- 将来の新規視覚設計では、既存の`160ms ease`を理由なく全要素へコピーしない。基準案と候補を実ブラウザで比較してから固定する。

## 現在の均質化傾向

次はバグではなく、将来の視覚監査対象である。今回の保護工程では変更しない。

- 多くのtransitionが`160ms ease`である。
- button/inputの角丸が一律`0`である。
- hoverの時間とeasingが共通化されている。
- 装飾周期の個体差がほとんど存在しない。
- Home Member画像は共通の`cover`で、CSS上の個別crop値を持たない。

今後、新規視覚設計を行う際に、これらの共通値へ自動的に収束させない。同時に、不規則性を作るためだけに機械的なばらつきを追加しない。

## 生成方式

- 手動固定値: Heroヒット領域のpercentage、Member stagger、非等分grid、Member detailのcrop、Footer brushのcrop、Discographyの構造。
- ID依存: `homeOrder`、`.hero-hit--{member.id}`、`.home-member--{member.id}`。
- 内容依存: Discographyの表示順に応じた交互行、画像素材内部の構図、モバイルでの内容ラベル再構成。
- 一時的偶然: 現在は使用しない。永続する構図や操作結果に乱数を導入しない。

## 絶対に守る機能

- WCAG 2.2 AA
- 可読性
- キーボード操作
- タッチ操作
- 320pxでの成立
- `prefers-reduced-motion`
- 完全静的出力
- フォーカス対象がSticky Headerや`NEXT IN JAPAN`に完全に隠れないこと
- 正しいHTMLとARIA

## WCAGを優先する境界

次はRequired Noiseとして巻き戻さない。

- `--text-muted: #989ba0`
- `--line-control: #62666d`
- 明暗両背景で認識できる2色focus ring
- GUIDE番号と動画番号の`#69655d`
- リンクをリンクとして伝えるDiscographyのARIA構造
- genericな`div`を命名しないための`role="group"`
- 24px以上のポインターターゲットと、主要操作の48px前後の領域
- モバイルreflowと横スクロール防止

元カンプとの差だけを理由に、コントラスト不足、見えないfocus、不正なARIA、小さすぎる操作領域、キーボード不能、モバイル破綻、Reduced Motion無視を復元しない。

## 無断で統一してはいけないもの

- Hero人物ごとの座標・幅
- Hero合成画像内の個別crop・重なり・人物間余白・brush輪郭
- Memberカードの縦位置
- Member画像の個別重心とブレークポイント別crop方式
- ホームの`MAY → LIV → ZENA → MINAMI → WONI`順
- 非等分grid比率
- Discographyの交互構造、左右線、行形式、Track番号列
- Claude Design由来の説明不能な個別値
- その他、視覚監査で保護対象と判断された値

「説明できない」「使用箇所が1件しかない」「共通化できる」は削除・統一の根拠にならない。変更が必要な場合は、先に変更対象を列挙し、`1440px`、`390px`、`320px`で変更前後を比較する。
