# FreelanceOS 本番公開手順（すべて無料枠）

所要時間の目安: 40〜60分。費用: 0円（Vercel Hobby / Supabase Free / Stripe は決済手数料のみ）。

## 0. 前提
- `main` ブランチは `npm run type-check` と `npm run build` が通る状態です。
- DB スキーマは `supabase/migrations/0001_initial_schema.sql` にあります。

## 1. Supabase（無料プラン）
1. https://supabase.com でプロジェクト作成（リージョン: Tokyo）。
2. SQL Editor に `supabase/migrations/0001_initial_schema.sql` の内容を貼り付けて実行。
3. Authentication → Providers → Email を有効化。本番では「Confirm email」を ON 推奨。
4. Authentication → URL Configuration → Site URL に本番 URL、Redirect URLs に `https://<本番ドメイン>/**` を追加。
5. Project Settings → API から以下を控える:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（秘匿）
6. 管理者にしたいユーザーで一度サインアップ後、SQL Editor で
   `update public.profiles set role='admin' where email='<自分のメール>';`

## 2. Stripe
1. https://dashboard.stripe.com → 商品を2つ作成（定期課金・月額・JPY）
   - Pro: 980円/月 → price id を `STRIPE_PRO_PRICE_ID`
   - Pro+: 1,480円/月 → price id を `STRIPE_PRO_PLUS_PRICE_ID`
2. 開発者 → API キー → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. 開発者 → Webhook → エンドポイント追加
   - URL: `https://<本番ドメイン>/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - 署名シークレットを `STRIPE_WEBHOOK_SECRET`
4. 設定 → Billing → カスタマーポータルを有効化（解約・カード変更をユーザー自身でできるようにする）。
5. 最初はテストモードのキーで動作確認 → 問題なければ本番キーに差し替え。

## 3. Vercel（Hobby プラン）
1. GitHub にこのリポジトリを push（Private で可）。
2. https://vercel.com → Import → Framework: Next.js（自動検出）。
3. Environment Variables に以下を登録（`.env.local.example` と同じ名前）:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PRO_PLUS_PRICE_ID`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`（= https://<本番ドメイン>）
4. Deploy。完了後、Supabase の Site URL と Stripe の Webhook URL を本番ドメインに合わせる。

## 4. 公開後の動作確認チェックリスト
- [ ] `/` が表示される
- [ ] サインアップ → メール確認 → `/dashboard` に入れる
- [ ] クライアント・案件・売上を1件ずつ登録できる
- [ ] `/settings/billing` から Stripe Checkout（テストカード 4242 4242 4242 4242）→ プランが `pro` になる
- [ ] Stripe ダッシュボードで解約 → プランが `free` に戻る
- [ ] `/terms` `/privacy` `/tokusho` が表示される（特商法表記は事業者情報を実際の内容に更新すること）

## 5. 注意
- `wip/local-supabase-auth` ブランチはローカル Supabase 用の暫定実装です。JWT 署名を検証しないため **本番には使わないでください**。
