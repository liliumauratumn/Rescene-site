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
npm run validate:data
npm run check:links
```

`npm run build` はNext.jsの完全静的出力を行い、配信可能なファイルを `out/` に生成します。公式ソースの収集から全検査までまとめて行う場合は `npm run update` を実行します。

## データの正本

- サイト名、canonical URL、説明文: `data/site.json`
- データ群ごとの最終更新日: `data/content-meta.json`
- Schedule自動取得の最終成功日: `data/schedule-sync.json`
- 共通サイト設定の読み出し: `site.config.ts`
- News: `data/news.json`
- Members: `data/members.json`
- Releases / Discography: `data/releases.json`
- Schedule: `data/schedules.json`
- Japan Activities: `data/japan-activities.json`
- First RESCENEの動画: `data/starter-videos.json`
- 公式・正規配信・主催者リンク: `data/official-links.json`

サイト名、canonical URL、説明文は、`data/site.json` の `siteName`、`siteUrl`、`shortDescription` を更新します。About・ヘッダー・フッター・sitemapの最終更新日は `data/content-meta.json` のうち最新の日付を参照します。ホームとSchedule上部の次回日本予定は、公開可能な`data/schedules.json`のうち未来の`region: JP`から共通算出します。該当予定がない場合の最終確認日は`data/schedule-sync.json`を参照します。

## コンテンツ更新

### News

`data/news.json` に記事を追加します。`slug` はURLになるため重複させず、`publishedAt`、出典名、出典URL、本文、関連ID、`verificationStatus` を設定します。

### Members

`data/members.json` を更新します。名義、生年月日、出身、役割、説明、画像はレコードの `verificationStatus` で公開制御します。低解像度画像を表示枠に合わせて拡大せず、使用条件と十分な解像度を確認できない場合は画像なし表示を使います。

### Releases

`data/releases.json` を更新します。公開する作品は `publish: true` にしたうえで、作品名、発売日、形態、収録曲などを確認し、`verificationStatus` を確認済み状態にします。`publish: false` または未確認状態の作品は公開されません。

### Schedule

`data/schedules.json` を更新します。開催日時、会場、応募期間、販売開始、出典URLを別々の項目として記録します。日時や会場を確認できない予定は推測値を入れず、未確認状態のまま公開しません。未来の日本予定が追加されると、Schedule一覧とTOPのNEXT IN JAPANへ同じレコードが反映されます。

### 自動収集

`npm run update:news` は公式Noticeと公式YouTubeからNews候補を `data/pending/news.json` へ集めます。`npm run update:schedule` はRESCENE公式Mnet Plusカレンダーの確認済み予定を同期し、安全判定レポートを出力できます。候補と確定情報の境界、重複排除、Scheduleの自動反映条件、GitHub ActionsからVercelまでの運用は `docs/content-update-pipeline.md` を参照してください。TMIは自動処理の対象外です。

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

`lib/content.ts` が公開可否を一元判定します。未確認状態のMembers、News、Releases、Schedule、Japan Activities、動画は公開配列から除外されます。未確認情報を説明文や検索データへ直接ハードコードしないでください。

## Vercel

Vercelではこのリポジトリを既存の `rescene-site` プロジェクトへGit連携し、Production Branchを `main` に設定します。Next.jsとして自動検出されるため、通常はbuild commandやoutput directoryの上書きは不要です。

定期更新はScheduleとNewsで分離しています。`.github/workflows/update-schedule.yml` は安全条件をすべて満たすScheduleだけを機械PR経由で自動マージし、例外はレビュー待ちにします。`.github/workflows/update-news.yml` はNews専用のレビューPRを作成し、自動マージしません。Vercelは`main`へのマージをProductionへ反映します。Actionsから`main`への直接pushやProductionへの直接deployは行いません。

CMS、データベース、Serverless APIは不要です。一般公開前に、事実関係、画像の利用条件、外部URL、Vercelのドメイン・Deployment Protection・検索エンジン向けヘッダーを人間が最終確認します。
