# RESCENE FANSITE

RESCENEの情報を日本語で整理する、非公式・非営利の静的ファンサイトです。

## 開発

```bash
npm install
npm run dev
```

品質確認と静的出力:

```bash
npm run typecheck
npm run lint
npm run build
```

`npm run build` で Cloudflare Pages に配置可能な `out/` を生成します。

## コンテンツ管理

- サイト設定: `site.config.ts`
- ニュース: `data/news.ts`
- スケジュール: `data/schedules.ts`
- メンバー: `data/members.ts`
- ディスコグラフィー: `data/releases.ts`
- 日本活動: `data/japan-activities.ts`
- 公式リンク: `data/official-links.ts`

公開前に、人物情報・外部リンク・画像利用条件・公式動画URLを一次情報で再確認してください。確認待ち情報には `verify_before_publish` を付けています。
