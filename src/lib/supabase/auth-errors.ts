/** Supabase Auth の英語エラーを利用者向けの日本語に変換する */
export function authErrorMessage(message: string | undefined | null): string {
  const m = (message ?? '').toLowerCase()
  if (m.includes('already registered') || m.includes('already been registered')) return 'このメールアドレスは既に登録されています。ログインするか、パスワードをリセットしてください。'
  if (m.includes('invalid login credentials')) return 'メールアドレスまたはパスワードが正しくありません。'
  if (m.includes('email not confirmed')) return 'メールアドレスの確認が完了していません。登録時に届いた確認メールのリンクをクリックしてください。'
  if (m.includes('password should be at least') || m.includes('password is too short')) return 'パスワードは 8 文字以上で設定してください。'
  if (m.includes('rate limit') || m.includes('too many requests')) return '短時間に多くのリクエストがありました。しばらく待ってからもう一度お試しください。'
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'メールアドレスの形式が正しくありません。'
  if (m.includes('signups not allowed')) return '現在、新規登録を停止しています。'
  if (m.includes('network') || m.includes('fetch')) return '通信エラーが発生しました。接続を確認してもう一度お試しください。'
  return message || 'エラーが発生しました。もう一度お試しください。'
}
