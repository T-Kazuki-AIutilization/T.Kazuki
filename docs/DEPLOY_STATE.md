# FreelanceOS 公開作業の進捗（2026-10-13 時点）

## 完了
- [x] GitHub へ push 済み（リポジトリは T-Kazuki-AIutilization/T.Kazuki へ移動済み。旧 URL からリダイレクトされる）
- [x] Supabase クラウド（ref `fjbbkbphlmxfyisiejqv`、東京）にスキーマ適用済み（テーブル9・RLSポリシー27・auth トリガー）
- [x] 既存ユーザー（t.kazuki1385@gmail.com）を `admin` に設定
- [x] Stripe テスト環境に商品・価格あり（Pro 月額980 / Pro+ 月額1,480）

## Vercel に登録する環境変数（Production）
| 変数名 | 値 | 備考 |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | https://fjbbkbphlmxfyisiejqv.supabase.co | 公開情報 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | sb_publishable_07RC1x7I7v78IKrYRa7d2w_z4KFy_P2 | 公開キー（Supabase の新形式 publishable key） |
| SUPABASE_SERVICE_ROLE_KEY | **（ユーザーが転記）** Supabase → Project Settings → API Keys → Secret keys の `default` を表示してコピー | 秘密 |
| STRIPE_SECRET_KEY | **（ユーザーが転記）** Stripe → 開発者 → API キー → シークレットキー（テスト: sk_test_…） | 秘密 |
| STRIPE_WEBHOOK_SECRET | **（Webhook 作成後に転記）** | 秘密 |
| STRIPE_PRO_PRICE_ID | price_1TnOs8485lX35o0sKDoIfzov | テスト環境 Pro 月額 |
| STRIPE_PRO_PLUS_PRICE_ID | price_1TnQL8485lX35o0syH7PjZzJ | テスト環境 Pro+ 月額 |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | pk_test_…（Stripe → 開発者 → API キー → 公開可能キー） | 公開キー |
| NEXT_PUBLIC_APP_URL | https://<vercel のドメイン> | デプロイ後に確定 |

※ 本番課金を始めるときは Stripe を本番モードに切り替え、商品・価格・Webhook を本番側で作り直し、上記のキー・価格 IDを本番用に差し替える。

## 完了（2026-10-13 夜）
- [x] Vercel プロジェクト `freelanceos`（Hobby）作成、GitHub 連携、本番デプロイ成功 → **https://freelanceos-eosin.vercel.app**
  - 注意: `freelanceos.vercel.app` は他人のプロジェクト。実ドメインは `-eosin` 付き。
  - `vercel.json` の regions を `nrt1`（無効）→ `hnd1` に修正
- [x] Supabase Auth → Site URL = https://freelanceos-eosin.vercel.app、Redirect URL = https://freelanceos-eosin.vercel.app/**
- [x] Stripe（テスト）Webhook 作成: `freelanceos-production`（we_1UQB4O485lX35o0sJ0b5XHIU）
  - URL: https://freelanceos-eosin.vercel.app/api/stripe/webhook
  - イベント: checkout.session.completed / customer.subscription.created / updated / deleted

## 完了: 秘密キー3件を Vercel に登録（ユーザー、2026-10-13）→ 再デプロイ済み

### 検証結果（2026-10-13）
- 未認証の checkout API → 401 / webhook 署名なし → 400 / 不正署名 → 400（= 署名シークレット読込済み）
- Stripe Shell から `stripe trigger customer.subscription.created` → Webhook 配信 **200 OK**
- /dashboard 未ログイン → /login にリダイレクト

## 登録手順の控え（再掲）
Vercel → freelanceos → Settings → Environment Variables → 「Add Environment Variable」で以下を追加（Environment: Production and Preview）。
| Key | 取得場所 |
|---|---|
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Project Settings → API Keys → Secret keys → default の目のアイコンで表示してコピー |
| STRIPE_SECRET_KEY | Stripe（テスト）→ 開発者 → API キー → シークレットキー（sk_test_…） |
| STRIPE_WEBHOOK_SECRET | Stripe → Workbench → Webhook → freelanceos-production → 署名シークレット（whsec_…）の目のアイコン |
登録後に再デプロイが必要（Deployments → 最新 → … → Redeploy。または Claude に「再デプロイして」と依頼）。

## その後の動作確認
- [ ] サインアップ → メール確認 → /dashboard
- [ ] /settings/billing → Pro アップグレード → Stripe Checkout（テストカード 4242 4242 4242 4242）→ plan が pro になる（14日トライアル）
- [ ] Stripe で解約 → plan が free に戻る


## 本番課金への切り替え（2026-10-13 着手）
### 完了
- [x] 課金ページ: Free へのダウングレード／プラン変更を Stripe カスタマーポータル経由に修正（以前は checkout に plan=free を送って 422 になっていた）
- [x] テスト環境のカスタマーポータル設定を保存（解約可・プラン切替可（Pro 月額 ⇄ Pro+ 月額）・数量変更不可）

### 要対応（ユーザー）: Stripe 本番環境の有効化
Stripe ダッシュボード右上「本番環境に切り替える」→ 事業情報ウィザードを完了する（本人確認・銀行口座を含むため Claude は入力しない）。
- 事業形態: 個人事業主
- ビジネスのウェブサイト: https://freelanceos-eosin.vercel.app
- 商品またはサービスの説明: フリーランス向けの事業管理 SaaS（月額サブスクリプション）。案件・売上・クライアントの管理ダッシュボードを提供。
- 公開情報の明細書表記（カード明細に出る名前）: FREELANCEOS など
- 銀行口座: 売上の振込先

### 有効化後に Claude が行うこと
1. 本番モードで商品・価格を作成（Pro 月額 980円 / Pro+ 月額 1,480円、JPY、継続）
2. 本番モードの Webhook を作成（URL 同じ、イベント4種）
3. 本番モードのカスタマーポータル設定を保存
4. Vercel の環境変数を本番値に更新（STRIPE_PRO_PRICE_ID / STRIPE_PRO_PLUS_PRICE_ID は Claude、STRIPE_SECRET_KEY（sk_live_）と STRIPE_WEBHOOK_SECRET はユーザー）→ 再デプロイ
5. 実カードで 1 件登録し即解約して疎通確認（任意）
