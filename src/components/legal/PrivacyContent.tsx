"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n";

function PrivacyJa() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">最終更新日: 2026年4月4日</p>

        <section className="mt-6" aria-labelledby="privacy-ja-1">
          <h2 id="privacy-ja-1" className="text-xl font-semibold mb-3">1. はじめに</h2>
          <p>
            BookClub（以下「本サービス」といいます）の運営者（以下「運営者」といいます）は、
            ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-2">
          <h2 id="privacy-ja-2" className="text-xl font-semibold mb-3">2. 収集する情報</h2>
          <p className="mb-2">運営者は、以下の情報を収集します。</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.1 ユーザーが提供する情報</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>メールアドレス</li>
            <li>ユーザー名・表示名</li>
            <li>プロフィール情報（自己紹介、プロフィール画像、好きなジャンルなど）</li>
            <li>読書記録（本の登録・読書状況・ページ数・読書セッションなど）</li>
            <li>投稿コンテンツ（レビュー・コメント・ハイライトなど）</li>
            <li>読書目標・チャレンジへの参加情報</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.2 自動的に収集される情報</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IPアドレス</li>
            <li>ブラウザの種類</li>
            <li>アクセス日時</li>
            <li>Cookie情報</li>
            <li>デバイス情報</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-3">
          <h2 id="privacy-ja-3" className="text-xl font-semibold mb-3">3. 情報の利用目的</h2>
          <p className="mb-2">収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>本サービスの提供、維持、保護及び改善のため</li>
            <li>読書記録・統計・実績バッジ等の機能を提供するため</li>
            <li>ユーザーからのお問い合わせへの対応のため</li>
            <li>利用規約違反行為への対応のため</li>
            <li>本サービスに関する規約、ポリシー等の変更に関する通知のため</li>
            <li>本サービスの利用状況の分析及び統計情報の作成のため</li>
            <li>セキュリティ及び不正利用の防止のため</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-4">
          <h2 id="privacy-ja-4" className="text-xl font-semibold mb-3">4. 情報の第三者提供</h2>
          <p className="mb-2">
            運営者は、以下のいずれかに該当する場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>法令に基づく場合</li>
            <li>人の生命、身体又は財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-5">
          <h2 id="privacy-ja-5" className="text-xl font-semibold mb-3">5. 外部サービス連携</h2>
          <p className="mb-2">
            本サービスでは、書籍情報の取得のためにGoogle Books APIを利用しています。
            Google Booksのプライバシーポリシーについては、Googleのプライバシーポリシーをご確認ください。
          </p>
          <p>
            また、Google・GitHubアカウントによるログインに対応しています。これらのサービスの利用にあたっては、
            各サービスのプライバシーポリシーが適用されます。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-6">
          <h2 id="privacy-ja-6" className="text-xl font-semibold mb-3">6. Cookieの使用</h2>
          <p className="mb-2">
            本サービスでは、サービスの利便性向上及び利用状況の分析のため、Cookieを使用しています。
            Cookieの詳細については、<a href="/cookies" className="text-primary hover:underline">Cookieポリシー</a>をご確認ください。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-7">
          <h2 id="privacy-ja-7" className="text-xl font-semibold mb-3">7. セキュリティ</h2>
          <p>
            運営者は、個人情報の漏洩、滅失又は毀損の防止その他の個人情報の安全管理のため、
            適切なセキュリティ対策を講じるよう努めます。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-8">
          <h2 id="privacy-ja-8" className="text-xl font-semibold mb-3">8. 個人情報の開示・訂正・削除</h2>
          <p>
            ユーザーは、本サービスの設定画面において、自己の個人情報を閲覧、訂正、削除することができます。
            アカウントの削除を希望する場合は、設定画面からアカウント削除の手続きを行ってください。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-9">
          <h2 id="privacy-ja-9" className="text-xl font-semibold mb-3">9. お子様の個人情報</h2>
          <p>
            本サービスは、13歳未満のお子様を対象としておらず、13歳未満のお子様から意図的に個人情報を収集することはありません。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-10">
          <h2 id="privacy-ja-10" className="text-xl font-semibold mb-3">10. プライバシーポリシーの変更</h2>
          <p>
            運営者は、必要に応じて本ポリシーを変更することがあります。
            変更後のプライバシーポリシーは、本サービス上に表示した時点より効力を生じるものとします。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-11">
          <h2 id="privacy-ja-11" className="text-xl font-semibold mb-3">11. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。<br />
            メールアドレス: yunbow.dev@gmail.com
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-ja-12">
          <h2 id="privacy-ja-12" className="text-xl font-semibold mb-3">12. 免責事項</h2>
          <p>
            本サービスは個人の学習目的で作成されたものであり、商用利用を目的としたものではありません。
            運営者は、本サービスの利用により発生したいかなる損害についても、一切の責任を負いません。
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

function PrivacyEn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Privacy Policy</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">Last updated: April 4, 2026</p>

        <section className="mt-6" aria-labelledby="privacy-en-1">
          <h2 id="privacy-en-1" className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>
            The operator (hereinafter referred to as &quot;Operator&quot;) of BookClub (hereinafter referred to as &quot;Service&quot;)
            establishes this Privacy Policy (hereinafter referred to as &quot;Policy&quot;) regarding the handling of users&apos; personal information.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-2">
          <h2 id="privacy-en-2" className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="mb-2">The Operator collects the following information:</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Information Provided by Users</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address</li>
            <li>Username and display name</li>
            <li>Profile information (bio, profile picture, favorite genres, etc.)</li>
            <li>Reading records (book registrations, reading status, page counts, reading sessions, etc.)</li>
            <li>Posted content (reviews, comments, highlights, etc.)</li>
            <li>Reading goals and challenge participation information</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Access date and time</li>
            <li>Cookie information</li>
            <li>Device information</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-3">
          <h2 id="privacy-en-3" className="text-xl font-semibold mb-3">3. Purpose of Information Use</h2>
          <p className="mb-2">Collected information is used for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, maintain, protect, and improve the Service</li>
            <li>To provide features such as reading records, statistics, and achievement badges</li>
            <li>To respond to user inquiries</li>
            <li>To address violations of the Terms of Service</li>
            <li>To notify users of changes to terms, policies, etc. related to the Service</li>
            <li>To analyze Service usage and create statistical information</li>
            <li>For security and prevention of fraudulent use</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-4">
          <h2 id="privacy-en-4" className="text-xl font-semibold mb-3">4. Disclosure to Third Parties</h2>
          <p className="mb-2">
            The Operator will not provide personal information to third parties without user consent, except in the following cases:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>When required by law</li>
            <li>When necessary to protect the life, body, or property of a person and it is difficult to obtain consent</li>
            <li>When particularly necessary for improving public health or promoting the sound development of children and it is difficult to obtain consent</li>
            <li>When cooperation is needed for a national or local government agency or its delegate to perform legally prescribed duties, and obtaining consent may impede such duties</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-5">
          <h2 id="privacy-en-5" className="text-xl font-semibold mb-3">5. Third-Party Service Integration</h2>
          <p className="mb-2">
            This Service uses the Google Books API to retrieve book information.
            For Google Books&apos; privacy policy, please refer to Google&apos;s Privacy Policy.
          </p>
          <p>
            This Service also supports login via Google and GitHub accounts.
            The privacy policies of those respective services apply when using those login methods.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-6">
          <h2 id="privacy-en-6" className="text-xl font-semibold mb-3">6. Use of Cookies</h2>
          <p className="mb-2">
            This Service uses cookies to improve convenience and analyze usage.
            For details about cookies, please refer to our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-7">
          <h2 id="privacy-en-7" className="text-xl font-semibold mb-3">7. Security</h2>
          <p>
            The Operator endeavors to implement appropriate security measures to prevent leakage, loss, or damage of personal information and ensure its safe management.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-8">
          <h2 id="privacy-en-8" className="text-xl font-semibold mb-3">8. Disclosure, Correction, and Deletion of Personal Information</h2>
          <p>
            Users can view, correct, and delete their personal information in the Service settings.
            To delete your account, please follow the account deletion procedure in the settings.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-9">
          <h2 id="privacy-en-9" className="text-xl font-semibold mb-3">9. Children&apos;s Personal Information</h2>
          <p>
            This Service is not intended for children under 13 years of age, and we do not intentionally collect personal information from children under 13.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-10">
          <h2 id="privacy-en-10" className="text-xl font-semibold mb-3">10. Changes to Privacy Policy</h2>
          <p>
            The Operator may change this Policy as necessary.
            The revised Privacy Policy shall become effective upon being displayed on the Service.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-11">
          <h2 id="privacy-en-11" className="text-xl font-semibold mb-3">11. Contact</h2>
          <p>
            For inquiries regarding this Policy, please contact us at:<br />
            Email: yunbow.dev@gmail.com
          </p>
        </section>

        <section className="mt-6" aria-labelledby="privacy-en-12">
          <h2 id="privacy-en-12" className="text-xl font-semibold mb-3">12. Disclaimer</h2>
          <p>
            This Service was created for personal learning purposes and is not intended for commercial use.
            The Operator shall not be liable for any damages arising from the use of this Service.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

export function PrivacyContent() {
  const { locale } = useLocale();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {locale === "ja" ? <PrivacyJa /> : <PrivacyEn />}
    </div>
  );
}
