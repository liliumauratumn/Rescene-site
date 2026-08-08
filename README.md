# RESCENE FANSITE

RESCENEの情報を日本語で整理する、個人運営・非公式の完全静的ファンサイトです。

## 開発起動

```bash
npm install
npm run dev
```

## 検証とビルド

```bash
npm run typecheck
npm run lint
npm run build
```

`npm run build` はNext.jsの完全静的出力を行い、配信可能なファイルを `out/` に生成します。

## データの正本

- サイト名、canonical URL、最終更新日、ホームとScheduleで共有する次回日本予定: `data/site.json`
- 共通サイト設定の読み出し: `site.config.ts`
- News: `data/news.json`
- Members: `data/members.json`
- Releases / Discography: `data/releases.json`
- Schedule: `data/schedules.json`
- Japan Activities: `data/japan-activities.json`
- First RESCENEの動画: `data/starter-videos.json`
- 公式・正規配信・主催者リンク: `data/official-links.json`

サイト名、canonical URL、About・ヘッダー・フッター・sitemapの最終更新日は、`data/site.json` の `site` を更新します。ホームとScheduleの次回日本予定は、同ファイルの `nextJapanSchedule` を更新します。Reactコンポーネントへ同じ値を重複記述しません。

## コンテンツ更新

### News

`data/news.json` に記事を追加します。`slug` はURLになるため重複させず、`publishedAt`、出典名、出典URL、本文、関連ID、`verificationStatus` を設定します。

### Members

`data/members.json` を更新します。英語・韓国語・日本語の名義は `identityVerificationStatus`、生年月日・出身・役割・説明・画像は `verificationStatus` で公開制御します。低解像度画像を表示枠に合わせて拡大せず、使用条件と十分な解像度を確認できない場合は画像なし表示を使います。

### Releases

`data/releases.json` を更新します。公開する作品は `publish: true` にしたうえで、作品名、発売日、形態、収録曲などを確認し、`verificationStatus` を確認済み状態にします。`publish: false` または未確認状態の作品は公開されません。

### Schedule

`data/schedules.json` を更新します。開催日時、会場、応募期間、販売開始、出典URLを別々の項目として記録します。日時や会場を確認できない予定は推測値を入れず、未確認状態のまま公開しません。現在の次回日本予定は `data/site.json` の `nextJapanSchedule` を更新します。

### Japan Activities

`data/japan-activities.json` を更新します。開催日、種別、会場、関連作品、出典URLを設定し、確認済み状態だけを公開します。個別ステージ詳細が未確認の記録は、確認が完了するまで公開されません。

## verificationStatus

公開扱い:

- `confirmed`: 一次情報で確認済み
- `verified`: 表示する値と参照先を照合済み

非公開扱い:

- `verify_before_publish`: 公開前の確認が必要
- `stage_details_verify_before_publish`: 開催・ステージ詳細の確認が必要
- `unverified`: 未確認

`lib/content.ts` が公開可否を一元判定します。未確認状態のNews、Releases、Schedule、Japan Activities、動画は公開配列から除外されます。Membersは確認済みの名義だけでページを成立させ、未確認のプロフィール項目と画像を公開表示へ渡しません。未確認情報を説明文や検索データへ直接ハードコードしないでください。

## Cloudflare Pages

Cloudflare Pagesでは次を設定します。

```text
Build command: npm run build
Build output directory: out
```

CMS、データベース、Workers APIは不要です。公開前に、事実関係、画像の利用条件、外部URL、Cloudflare Pagesのドメイン・DNS設定を人間が最終確認します。
