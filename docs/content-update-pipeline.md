# コンテンツ更新パイプライン

## 公開までの流れ

ScheduleとNewsは別の時刻・ブランチ・Pull Requestで更新します。`main`への直接pushとActionsからの`vercel --prod`は行いません。VercelのGit連携が`main`へのマージを検出してProduction buildを開始します。

- Schedule: JST 09:17、15:17、21:17に`.github/workflows/update-schedule.yml`を実行します。安全条件をすべて満たす場合は`automation/schedule-update`の機械PRを検証後にsquash mergeします。人間の操作は不要です。
- News: JST 10:37、16:37、22:37に`.github/workflows/update-news.yml`を実行します。`automation/news-review`へ候補または承認済み本文を積み、必ず人間が確認するPRとして止めます。

## 自動公開と候補の境界

- `data/schedules.json`: RESCENE公式Mnet Plusカレンダーの「放送」「公演」「行事」に相当するラベルだけを確認済み予定として同期します。同名で連続する終日レコードは1件の期間へまとめます。
- `data/pending/schedules.json`: 公式カレンダーからの消失、日付・期間・終日区分の変更、source IDが一致しない近似イベント、非一次情報を確認候補へ送ります。既存の公開予定は自動削除・自動日付変更しません。
- `data/pending/news.json`: RESCENE公式Mnet Plus Noticeと公式YouTubeの高シグナル項目を候補として収集します。本文は自動生成せず、公開もしません。
- `data/news.json`: 人間が候補に完成記事を追加し、`status` を `approved` にした場合だけ更新スクリプトが重複検査後に昇格します。
- `data/tmi.txt`: 自動更新・自動整形・自動削除の対象外です。

候補Newsを承認する場合は、候補レコードへ公開用のNewsレコードと同じ形の `article` を追加します。`dedupeKeys` は最低1件必要です。出典URL、重複キー、イベント日＋正規化タイトルのいずれかが公開済み記事と一致した場合は `duplicate` となり、公開されません。

## Scheduleの自動反映条件

次の条件をすべて満たすSchedule差分だけを自動マージします。

- 先頭sourceがRESCENE公式Mnet Plusカレンダーである
- 公式source IDで既存項目と一意に照合できる、または明確な新規予定である
- 既存予定の削除・日付変更を含まない
- 未解決のSchedule確認候補がない
- 1回の追加・安全な更新が5件以下である
- Schedule以外のデータを変更していない
- 安全判定テスト、schema validation、型検査、lint、build、主要リンク検査がすべて成功する

5件を超える変更、公式予定の消失、日付変更、同一イベントの曖昧一致、非一次情報を検出した場合は`[Schedule review]` PRに切り替え、自動マージしません。既存Scheduleの`scheduled`から`completed`への状態更新や、同じ公式source IDに対する日付以外の変更は安全な更新として扱います。レビューPRが未解決の間は、後続のSchedule更新も自動マージしません。

## 出典と更新日

収集先と固有の表示補正は `scripts/config/update-sources.json` に置きます。自動確定するScheduleの一次情報はRESCENE公式Mnet Plusカレンダーです。KCON LA 2026とK-WORLD DREAM AWARDSには、会場・配信時刻を照合するための主催者または公式配信元を追加しています。

`data/content-meta.json` はデータ群ごとの最終変更日です。公開NewsまたはScheduleのJSONが実際に変わった場合だけ該当日を更新します。候補だけの追加、空振り実行、buildだけではサイトの最終更新日は変わりません。TMIの日付は手動管理です。

## ローカル実行

```bash
npm run update:news
npm run update:schedule
npm run verify
npm run update
```

一時的に収集開始日・終了日を変える場合は `UPDATE_START_DATE=YYYY-MM-DD` と `UPDATE_END_DATE=YYYY-MM-DD` を指定できます。通常は開始日を2026-08-09、終了日を実行日から120日後として扱います。

`npm run verify` はSchedule安全判定テスト、データ検証、型検査、lint、静的build、sitemapと主要外部リンクの検査を実行します。`npm run update`はNewsとScheduleの両方をローカルで収集した後に同じ検証を行います。アクセス制限（401、403、405、429）と一時的な通信エラーは警告、404・410・その他のHTTPエラーは失敗です。

## GitHub / Vercelの初期設定

1. GitHubリポジトリをremoteとして登録し、現在の作業ブランチからPull Requestを作ります。`main` へ直接pushしません。
2. GitHubのActions設定で、Workflowの読み書き権限、Pull Request作成、リポジトリのauto-mergeを許可します。Scheduleの機械PRをマージできるよう、`GITHUB_TOKEN`によるPull Request操作をブランチ保護ルールと整合させます。
3. Vercelの既存プロジェクト `rescene-site` をそのGitHubリポジトリへ接続し、Production Branchを `main` に設定します。
4. Pull RequestのPreview、Productionの公開URL、canonical URLを確認します。
5. 一般公開時はVercelのDeployment Protectionを解除し、ログアウト状態で200応答になることと `noindex` が付いていないことを確認します。

Vercel CLIで直接Productionへ出す場合は緊急時の手動経路に限定します。`vercel deploy --prod --yes` を使う前に、必ず `npm run update` が成功していることを確認してください。
