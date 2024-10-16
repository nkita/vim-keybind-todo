'use client'

import NormalPageTemplate from "@/components/normal-page-template";

export default function Home() {
    return (
        <NormalPageTemplate>
            <main className="container mx-auto px-4 pt-8">
                <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
                <section>
                    <h2 className="text-2xl font-semibold mt-6 mb-3">1. 個人情報の利用目的</h2>
                    <p>
                        当サイトでは、お問い合わせ時に名前やメールアドレスなどの個人情報を入力いただく場合がございます。
                        取得した個人情報は、以下の目的でのみ利用いたします：
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>アプリ上でのユーザー情報の表示</li>
                        <li>ユーザーデータの特定と管理</li>
                    </ul>
                    <p>上記の目的以外では、取得した個人情報を利用いたしません。</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-6 mb-3">2. Google Analytics の利用について</h2>
                    <p>
                        当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。
                        Google Analyticsはデータの収集のためにCookieを使用していますが、このデータは匿名で収集されており、個人を特定するものではありません。
                    </p>
                    <p className="mt-2">
                        収集を拒否する場合は、ブラウザの設定でCookieを無効にすることができます。詳細については、
                        <a href="https://marketingplatform.google.com/about/analytics/terms/jp/" className="text-primary hover:underline">
                            Google Analyticsサービス利用規約
                        </a>
                        をご確認ください。
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-6 mb-3">3. Google認証の利用について</h2>
                    <p>
                        当サイトでは、ユーザー認証にGoogle認証（OAuth 2.0）を使用しています。
                        この認証方法では、以下の点にご留意ください：
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>ユーザーのGoogleアカウント情報へのアクセスを要求します</li>
                        <li>パスワードなどの機密情報は当サイトには共有されません</li>
                        <li>認証プロセスはGoogleのセキュアなサーバー上で行われます</li>
                    </ul>
                    <p className="mt-2">
                        Google認証を通じて取得した情報は、ユーザー認証とアカウント管理の目的でのみ使用され、
                        第三者との共有や他の目的での使用は行いません。
                    </p>
                    <p className="mt-2">
                        Google認証の詳細については、
                        <a href="https://developers.google.com/identity/protocols/oauth2" className="text-primary hover:underline">
                            Google OAuth 2.0
                        </a>
                        をご確認ください。
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mt-6 mb-3">4. プライバシーポリシーの変更について</h2>
                    <p>
                        当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しおよび改善していきます。
                        修正された最新のプライバシーポリシーは常に本ページにて開示されます。
                    </p>
                </section>

                <p className="mt-8 text-sm text-muted-foreground">最終更新日：2024年11月1日</p>
            </main>
        </NormalPageTemplate>
    )
}
