# RESCENE FANSITE repository rules

- このサイトはRESCENEの個人運営・非公式ファンサイトです。
- 公式発表だけを確定事実として扱い、未確認情報を断定しません。
- 公式文章の全文転載、歌詞全文の掲載を行いません。
- 画像を自動取得・追加しません。提供済みまたは利用条件を確認した素材だけを使います。
- Claude Designの完成仕様を無断で再設計しません。
- 記事更新と大規模コード変更を可能な限り分離します。
- データ変更時に不要なUI変更を行いません。
- `main`へ直接pushしません。
- 変更後にbuild・型検査・lint・主要リンク検査を行います。
- `verificationStatus: verify_before_publish` の情報は、本番公開前に一次情報で再確認します。

## Required Noise

このプロジェクトは `docs/rescene-required-noise-profile.md` を視覚表現の保護規約として使用します。

コード整理と視覚表現の均質化を混同しません。リファクタリング時に以下を無断で統一しません。

- 非対称配置
- 個別画像重心
- 非等分比率
- 微細な位置ずれ
- 個別装飾座標
- モーション周期・イージング
- その他profileでprotectedとされた値

「説明できない」「使用箇所が1件しかない」「共通化できる」という理由だけで削除しません。変更する場合は `docs/visual-audit.md` に従い、実ブラウザで変更前後を比較します。

Required Noiseは新しい不規則性を自動生成する許可ではありません。既存の保護値を変更するとき、または新しい視覚表現を設計するときだけ、参照原則に定められた比較工程を使用します。

アクセシビリティと機能要件はRequired Noiseより上位です。WCAG 2.2 AA、可読性、フォーカス表示、正しいARIA、キーボード・タッチ操作、320pxでの成立、`prefers-reduced-motion`、静的出力を壊す差異は保護しません。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
