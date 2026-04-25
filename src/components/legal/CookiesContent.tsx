"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n";

function CookiesJa() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Cookieポリシー</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">最終更新日: 2026年4月4日</p>

        <section className="mt-6" aria-labelledby="cookies-ja-1">
          <h2 id="cookies-ja-1" className="text-xl font-semibold mb-3">1. Cookieとは</h2>
          <p>
            Cookie（クッキー）とは、ウェブサイトを訪問した際に、ブラウザに保存される小さなテキストファイルです。
            Cookieを使用することで、ウェブサイトはユーザーの設定や行動を記憶し、より良いサービスを提供することができます。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-2">
          <h2 id="cookies-ja-2" className="text-xl font-semibold mb-3">2. Cookieの使用目的</h2>
          <p className="mb-2">本サービスでは、以下の目的でCookieを使用しています。</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.1 必須Cookie</h3>
          <p className="mb-2">本サービスの基本的な機能を提供するために必要なCookieです。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>ログイン状態の維持</li>
            <li>セキュリティの確保</li>
            <li>セッション管理</li>
            <li>CSRF（クロスサイトリクエストフォージェリ）対策</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.2 機能性Cookie</h3>
          <p className="mb-2">ユーザーの利便性を向上させるために使用するCookieです。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>ユーザー設定の保存（言語設定、テーマ設定、フォントサイズなど）</li>
            <li>サイドバーの開閉状態の保存</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.3 分析Cookie</h3>
          <p className="mb-2">本サービスの利用状況を分析し、改善するために使用するCookieです。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>ページビュー数の測定</li>
            <li>ユーザーの行動パターンの分析</li>
            <li>サービス改善のための統計情報の収集</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-3">
          <h2 id="cookies-ja-3" className="text-xl font-semibold mb-3">3. 使用しているCookieの種類</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">3.1 ファーストパーティCookie</h3>
          <p className="mb-2">本サービスが直接設定するCookieです。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.session-token</code>: 認証セッション管理</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.csrf-token</code>: CSRF対策トークン</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.callback-url</code>: 認証後のリダイレクト先</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">3.2 サードパーティCookie</h3>
          <p>
            現在、本サービスではサードパーティCookie（外部サービスが設定するCookie）は使用していません。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-4">
          <h2 id="cookies-ja-4" className="text-xl font-semibold mb-3">4. Cookieの有効期間</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>セッションCookie</strong>: ブラウザを閉じると削除されます</li>
            <li><strong>永続Cookie</strong>: 設定された有効期限まで保持されます（最大30日間）</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-5">
          <h2 id="cookies-ja-5" className="text-xl font-semibold mb-3">5. Cookieの管理と無効化</h2>
          <p className="mb-2">
            ほとんどのブラウザでは、Cookieの受け入れや拒否を設定できます。
            Cookieを無効にすることも可能ですが、その場合、本サービスの一部機能（ログイン維持など）が正常に動作しない可能性があります。
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">主要ブラウザでのCookie設定方法</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Chrome</strong>: 設定 &gt; プライバシーとセキュリティ &gt; Cookie と他のサイトデータ</li>
            <li><strong>Firefox</strong>: 設定 &gt; プライバシーとセキュリティ &gt; Cookie とサイトデータ</li>
            <li><strong>Safari</strong>: 環境設定 &gt; プライバシー &gt; Cookie とウェブサイトのデータ</li>
            <li><strong>Microsoft Edge</strong>: 設定 &gt; Cookie とサイトのアクセス許可 &gt; Cookie とサイト データの管理と削除</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-6">
          <h2 id="cookies-ja-6" className="text-xl font-semibold mb-3">6. Cookie使用の同意</h2>
          <p>
            本サービスを利用することにより、本Cookieポリシーに基づくCookieの使用に同意したものとみなされます。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-7">
          <h2 id="cookies-ja-7" className="text-xl font-semibold mb-3">7. Cookieポリシーの変更</h2>
          <p>
            運営者は、必要に応じて本ポリシーを変更することがあります。
            変更後のCookieポリシーは、本サービス上に表示した時点より効力を生じるものとします。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-ja-8">
          <h2 id="cookies-ja-8" className="text-xl font-semibold mb-3">8. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。<br />
            メールアドレス: yunbow.dev@gmail.com
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

function CookiesEn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Cookie Policy</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">Last updated: April 4, 2026</p>

        <section className="mt-6" aria-labelledby="cookies-en-1">
          <h2 id="cookies-en-1" className="text-xl font-semibold mb-3">1. What are Cookies</h2>
          <p>
            Cookies are small text files that are stored in your browser when you visit a website.
            By using cookies, websites can remember user settings and behavior to provide better services.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-2">
          <h2 id="cookies-en-2" className="text-xl font-semibold mb-3">2. Purpose of Cookie Use</h2>
          <p className="mb-2">This Service uses cookies for the following purposes:</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Essential Cookies</h3>
          <p className="mb-2">Cookies necessary to provide basic functionality of the Service.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintaining login status</li>
            <li>Ensuring security</li>
            <li>Session management</li>
            <li>CSRF (Cross-Site Request Forgery) protection</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Functional Cookies</h3>
          <p className="mb-2">Cookies used to improve user convenience.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Saving user preferences (language settings, theme settings, font size, etc.)</li>
            <li>Saving sidebar open/close state</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Analytics Cookies</h3>
          <p className="mb-2">Cookies used to analyze and improve Service usage.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Measuring page views</li>
            <li>Analyzing user behavior patterns</li>
            <li>Collecting statistical information for service improvement</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-3">
          <h2 id="cookies-en-3" className="text-xl font-semibold mb-3">3. Types of Cookies Used</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">3.1 First-Party Cookies</h3>
          <p className="mb-2">Cookies set directly by this Service.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.session-token</code>: Authentication session management</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.csrf-token</code>: CSRF protection token</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">authjs.callback-url</code>: Redirect destination after authentication</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Third-Party Cookies</h3>
          <p>
            Currently, this Service does not use third-party cookies (cookies set by external services).
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-4">
          <h2 id="cookies-en-4" className="text-xl font-semibold mb-3">4. Cookie Duration</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session Cookies</strong>: Deleted when the browser is closed</li>
            <li><strong>Persistent Cookies</strong>: Retained until the set expiration date (maximum 30 days)</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-5">
          <h2 id="cookies-en-5" className="text-xl font-semibold mb-3">5. Managing and Disabling Cookies</h2>
          <p className="mb-2">
            Most browsers allow you to accept or reject cookies.
            You can also disable cookies, but some features of this Service (such as maintaining login) may not function properly if you do so.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">How to Configure Cookies in Major Browsers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Chrome</strong>: Settings &gt; Privacy and security &gt; Cookies and other site data</li>
            <li><strong>Firefox</strong>: Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
            <li><strong>Safari</strong>: Preferences &gt; Privacy &gt; Cookies and website data</li>
            <li><strong>Microsoft Edge</strong>: Settings &gt; Cookies and site permissions &gt; Manage and delete cookies and site data</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-6">
          <h2 id="cookies-en-6" className="text-xl font-semibold mb-3">6. Consent to Cookie Use</h2>
          <p>
            By using this Service, you are deemed to have consented to the use of cookies based on this Cookie Policy.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-7">
          <h2 id="cookies-en-7" className="text-xl font-semibold mb-3">7. Changes to Cookie Policy</h2>
          <p>
            The Operator may change this Policy as necessary.
            The revised Cookie Policy shall become effective upon being displayed on the Service.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="cookies-en-8">
          <h2 id="cookies-en-8" className="text-xl font-semibold mb-3">8. Contact</h2>
          <p>
            For inquiries regarding this Policy, please contact us at:<br />
            Email: yunbow.dev@gmail.com
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

export function CookiesContent() {
  const { locale } = useLocale();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {locale === "ja" ? <CookiesJa /> : <CookiesEn />}
    </div>
  );
}
