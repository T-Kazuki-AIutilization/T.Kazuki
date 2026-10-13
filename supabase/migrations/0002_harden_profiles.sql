-- 0002: 一般ユーザーが自分の plan / role / stripe_customer_id を書き換えられないようにする
-- RLS の profiles_update_own は行単位の制御のみなので、列単位の権限で保護する。
-- service_role（Webhook・管理 API）は影響を受けない。
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, business_name, email, updated_at) ON public.profiles TO authenticated;
REVOKE INSERT ON public.profiles FROM authenticated;
GRANT INSERT (id, display_name, business_name, email) ON public.profiles TO authenticated;

-- 念のため anon からの書き込みは全面禁止
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
