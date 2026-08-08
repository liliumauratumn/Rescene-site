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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
