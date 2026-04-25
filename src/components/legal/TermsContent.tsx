"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n";

function TermsJa() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">利用規約</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">最終更新日: 2026年4月4日</p>

        <section className="mt-6" aria-labelledby="terms-ja-1">
          <h2 id="terms-ja-1" className="text-xl font-semibold mb-3">第1条（適用）</h2>
          <p className="mb-4">
            本利用規約（以下「本規約」といいます）は、本サービス（第2条に定義）の利用条件を定めるものです。
            ユーザー（第2条に定義）は、本規約に同意した上で、本サービスを利用するものとします。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-2">
          <h2 id="terms-ja-2" className="text-xl font-semibold mb-3">第2条（定義）</h2>
          <p className="mb-2">本規約において使用する用語の定義は、次のとおりとします。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>「本サービス」とは、「BookClub」という名称の読書管理・読書会サービスをいいます。</li>
            <li>「ユーザー」とは、本サービスを利用する全ての方をいいます。</li>
            <li>「登録ユーザー」とは、本サービスに登録を行ったユーザーをいいます。</li>
            <li>「投稿データ」とは、ユーザーが本サービス上に投稿、送信又はアップロードしたレビュー・コメント・読書記録等のコンテンツをいいます。</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-3">
          <h2 id="terms-ja-3" className="text-xl font-semibold mb-3">第3条（登録）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスの利用を希望する方は、本規約を遵守することに同意し、運営者の定める方法により登録の申請を行うものとします。</li>
            <li>運営者は、登録申請者に以下の事由があると判断した場合、登録を拒否することがあります。
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>本規約に違反するおそれがあると認められる場合</li>
                <li>登録申請に際して虚偽の事項を届け出た場合</li>
                <li>過去に本サービスの利用停止措置を受けたことがある場合</li>
                <li>その他、運営者が登録を適当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-4">
          <h2 id="terms-ja-4" className="text-xl font-semibold mb-3">第4条（禁止事項）</h2>
          <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>法令又は公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>他のユーザー、第三者又は運営者の知的財産権、肖像権、プライバシーその他の権利又は利益を侵害する行為</li>
            <li>他のユーザーに対する嫌がらせ又は誹謗中傷する行為</li>
            <li>不正アクセス又はこれを試みる行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>虚偽の情報を登録又は投稿する行為</li>
            <li>スパム行為、商業広告等の宣伝を目的とする行為</li>
            <li>著作権者の許諾なく書籍の内容を大量に転載する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-5">
          <h2 id="terms-ja-5" className="text-xl font-semibold mb-3">第5条（投稿データの取扱い）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>ユーザーは、投稿データについて、自らが投稿その他送信することについての適法な権利を有していること、及び投稿データが第三者の権利を侵害していないことについて、運営者に対し表明し、保証するものとします。</li>
            <li>ユーザーは、投稿データについて、運営者に対し、世界的、非独占的、無償、サブライセンス可能かつ譲渡可能な使用、複製、配布、派生著作物の作成、表示及び実行に関するライセンスを付与します。</li>
            <li>運営者は、法令又は本規約の遵守状況等を確認する必要がある場合、投稿データの内容を確認することができます。</li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-6">
          <h2 id="terms-ja-6" className="text-xl font-semibold mb-3">第6条（利用制限及び登録抹消）</h2>
          <p className="mb-2">
            運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、投稿データの削除、本サービスの利用制限又は登録の抹消を行うことができるものとします。
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>本規約のいずれかの条項に違反した場合</li>
            <li>登録事項に虚偽の事実があることが判明した場合</li>
            <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-7">
          <h2 id="terms-ja-7" className="text-xl font-semibold mb-3">第7条（保証の否認及び免責事項）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>運営者は、本サービスに事実上又は法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。</li>
            <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
            <li>本サービスは個人の学習目的で作成されたものであり、商用利用を目的としたものではありません。</li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-8">
          <h2 id="terms-ja-8" className="text-xl font-semibold mb-3">第8条（サービス内容の変更等）</h2>
          <p>
            運営者は、ユーザーに通知することなく、本サービスの内容を変更し、又は本サービスの提供を中止することができるものとします。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-9">
          <h2 id="terms-ja-9" className="text-xl font-semibold mb-3">第9条（利用規約の変更）</h2>
          <p>
            運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            変更後の本規約は、本サービス上に表示した時点より効力を生じるものとします。
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-ja-10">
          <h2 id="terms-ja-10" className="text-xl font-semibold mb-3">第10条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>
      </CardContent>
    </Card>
  );
}

function TermsEn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Terms of Service</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground">Last updated: April 4, 2026</p>

        <section className="mt-6" aria-labelledby="terms-en-1">
          <h2 id="terms-en-1" className="text-xl font-semibold mb-3">Article 1 (Application)</h2>
          <p className="mb-4">
            These Terms of Service (hereinafter referred to as &quot;Terms&quot;) set forth the conditions for the use of the Service (as defined in Article 2).
            Users (as defined in Article 2) shall use the Service upon agreeing to these Terms.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-2">
          <h2 id="terms-en-2" className="text-xl font-semibold mb-3">Article 2 (Definitions)</h2>
          <p className="mb-2">The definitions of terms used in these Terms are as follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>&quot;Service&quot; refers to the reading management and book club service named &quot;BookClub&quot;.</li>
            <li>&quot;User&quot; refers to all individuals who use the Service.</li>
            <li>&quot;Registered User&quot; refers to Users who have registered with the Service.</li>
            <li>&quot;Posted Data&quot; refers to content such as reviews, comments, and reading records posted, transmitted, or uploaded by Users on the Service.</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-3">
          <h2 id="terms-en-3" className="text-xl font-semibold mb-3">Article 3 (Registration)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Those who wish to use the Service shall agree to comply with these Terms and apply for registration in the manner prescribed by the Operator.</li>
            <li>The Operator may refuse registration if the applicant falls under any of the following:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>If there is a risk of violating these Terms</li>
                <li>If false information was provided in the registration application</li>
                <li>If the applicant has previously been subject to suspension of Service use</li>
                <li>If the Operator deems registration inappropriate for other reasons</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-4">
          <h2 id="terms-en-4" className="text-xl font-semibold mb-3">Article 4 (Prohibited Actions)</h2>
          <p className="mb-2">Users shall not engage in the following actions when using the Service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Actions that violate laws or public order and morals</li>
            <li>Actions related to criminal activities</li>
            <li>Actions that infringe on intellectual property rights, portrait rights, privacy, or other rights or interests of other Users, third parties, or the Operator</li>
            <li>Harassment or defamation of other Users</li>
            <li>Unauthorized access or attempts thereof</li>
            <li>Actions that may interfere with the operation of the Service</li>
            <li>Registering or posting false information</li>
            <li>Spam or actions intended for commercial advertising</li>
            <li>Reproducing large amounts of book content without permission from the copyright holder</li>
            <li>Other actions deemed inappropriate by the Operator</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-5">
          <h2 id="terms-en-5" className="text-xl font-semibold mb-3">Article 5 (Handling of Posted Data)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Users represent and warrant to the Operator that they have the legal right to post or transmit Posted Data and that such data does not infringe on the rights of third parties.</li>
            <li>Users grant the Operator a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, create derivative works of, display, and perform Posted Data.</li>
            <li>The Operator may review the content of Posted Data when necessary to verify compliance with laws or these Terms.</li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-6">
          <h2 id="terms-en-6" className="text-xl font-semibold mb-3">Article 6 (Usage Restrictions and Registration Cancellation)</h2>
          <p className="mb-2">
            The Operator may, without prior notice, delete Posted Data, restrict Service use, or cancel registration if a User falls under any of the following:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>If the User violates any provision of these Terms</li>
            <li>If false information is found in the registered information</li>
            <li>If the Operator deems the User&apos;s use of the Service inappropriate for other reasons</li>
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-7">
          <h2 id="terms-en-7" className="text-xl font-semibold mb-3">Article 7 (Disclaimer of Warranty and Limitation of Liability)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>The Operator does not warrant, either expressly or implicitly, that the Service is free from defects, whether factual or legal.</li>
            <li>The Operator shall not be liable for any damages incurred by Users arising from the Service.</li>
            <li>This Service was created for personal learning purposes and is not intended for commercial use.</li>
          </ol>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-8">
          <h2 id="terms-en-8" className="text-xl font-semibold mb-3">Article 8 (Changes to Service Content)</h2>
          <p>
            The Operator may change the content of the Service or discontinue providing the Service without notice to Users.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-9">
          <h2 id="terms-en-9" className="text-xl font-semibold mb-3">Article 9 (Changes to Terms of Service)</h2>
          <p>
            The Operator may change these Terms at any time without notice to Users when deemed necessary.
            The revised Terms shall become effective upon being displayed on the Service.
          </p>
        </section>

        <section className="mt-6" aria-labelledby="terms-en-10">
          <h2 id="terms-en-10" className="text-xl font-semibold mb-3">Article 10 (Governing Law and Jurisdiction)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>These Terms shall be governed by Japanese law.</li>
            <li>Any disputes arising in connection with the Service shall be subject to the exclusive agreed jurisdiction of the court having jurisdiction over the Operator&apos;s location.</li>
          </ol>
        </section>
      </CardContent>
    </Card>
  );
}

export function TermsContent() {
  const { locale } = useLocale();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {locale === "ja" ? <TermsJa /> : <TermsEn />}
    </div>
  );
}
