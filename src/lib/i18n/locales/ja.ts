export type Translations = {
  metadata: {
    siteTitle: string;
    siteDescription: string;
  };
  common: {
    search: string;
    login: string;
    logout: string;
    register: string;
    cancel: string;
    or: string;
    view: string;
    nameNotSet: string;
    getStarted: string;
    submitting: string;
    loading: string;
    appName: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  language: {
    ja: string;
    en: string;
  };
  nav: {
    home: string;
    dashboard: string;
    search: string;
    books: string;
    clubs: string;
    events: string;
    bookmarks: string;
    notifications: string;
    profile: string;
    settings: string;
    expand: string;
    collapse: string;
  };
  accessibility: {
    showPassword: string;
    hidePassword: string;
    switchLanguage: string;
    switchTheme: string;
    required: string;
    homeLink: string;
    footerNavigation: string;
    skipToContent: string;
    userMenu: string;
    mobileNavigation: string;
    selectLanguage: string;
    selectTheme: string;
    selectFontSize: string;
    selectColorVision: string;
  };
  footer: {
    terms: string;
    privacy: string;
    cookies: string;
    about: string;
    copyright: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    invalidCredentials: string;
    failed: string;
    continueWithGoogle: string;
    continueWithGithub: string;
  };
  registration: {
    success: string;
    failed: string;
    submitting: string;
    complete: string;
    sendEmail: string;
    sending: string;
    title: string;
    description: string;
    emailSent: string;
    emailSentDescription: string;
    devPreview: string;
    devTo: string;
    devSubject: string;
    devBody: string;
    devBodyText: string;
    devLinkValid: string;
    backToLogin: string;
    alreadyHaveAccount: string;
    termsAgreePrefix: string;
    termsConnector: string;
    termsIncludingCookie: string;
    termsAgreeSuffix: string;
    termsLink: string;
    privacyLink: string;
    cookieLink: string;
    completed: string;
    completedDescription: string;
    devMode: string;
    username: string;
    settingsPage: string;
    settingsPageDescription: string;
    openSettings: string;
    devModeNote: string;
    goToLogin: string;
    accountSetup: string;
    accountSetupDescription: string;
    name: string;
    namePlaceholder: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
  };
  landing: {
    hero: {
      kicker: string;
      title: string;
      subtitle: string;
      cta: string;
      secondaryCta: string;
      trust: string;
    };
    stats: {
      library: string;
      tracking: string;
      community: string;
    };
    features: {
      title: string;
      management: {
        title: string;
        description: string;
      };
      tracking: {
        title: string;
        description: string;
      };
      review: {
        title: string;
        description: string;
      };
      club: {
        title: string;
        description: string;
      };
    };
    workflow: {
      title: string;
      subtitle: string;
      registerTitle: string;
      registerDescription: string;
      trackTitle: string;
      trackDescription: string;
      connectTitle: string;
      connectDescription: string;
    };
    finalCta: {
      title: string;
      subtitle: string;
    };
  };
  cookieConsent: {
    message: string;
    accept: string;
    decline: string;
  };
  logout: {
    title: string;
    confirm: string;
  };
  settings: {
    title: string;
    appearance: string;
    appearanceDescription: string;
    language: string;
    languageDescription: string;
    theme: string;
    themeDescription: string;
    fontSize: string;
    fontSizeDescription: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    colorVision: string;
    colorVisionDescription: string;
    colorVisionNormal: string;
    colorVisionProtanopia: string;
    colorVisionDeuteranopia: string;
    colorVisionTritanopia: string;
    subscription: string;
    subscriptionDescription: string;
    account: string;
    accountDescription: string;
    loginHistory: string;
    loginHistoryDescription: string;
    changePassword: string;
    changePasswordDescription: string;
  };
  about: {
    title: string;
    authorName: string;
    serviceTitle: string;
    serviceDescription: string;
    opensInNewTab: string;
  };
};

export const ja: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "BookClub - 読書管理アプリ",
    siteDescription: "本の管理、読書記録、レビュー、読書会を楽しむアプリ",
  },

  // Common
  common: {
    search: "検索...",
    login: "ログイン",
    logout: "ログアウト",
    register: "新規登録",
    cancel: "キャンセル",
    or: "または",
    view: "見る",
    nameNotSet: "名前未設定",
    getStarted: "始める",
    submitting: "送信中...",
    loading: "読み込み中...",
    appName: "BookClub",
  },

  // Theme
  theme: {
    light: "ライト",
    dark: "ダーク",
    system: "システム",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "ホーム",
    dashboard: "ダッシュボード",
    search: "検索",
    books: "本を探す",
    clubs: "読書会",
    events: "イベント",
    bookmarks: "ブックマーク",
    notifications: "通知",
    profile: "プロフィール",
    settings: "設定",
    expand: "展開",
    collapse: "折りたたむ",
  },

  // Accessibility
  accessibility: {
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを隠す",
    switchLanguage: "言語を切り替え",
    switchTheme: "テーマを切り替え",
    required: "必須",
    homeLink: "ホームへ戻る",
    footerNavigation: "フッターナビゲーション",
    skipToContent: "メインコンテンツへスキップ",
    userMenu: "ユーザーメニュー",
    mobileNavigation: "モバイルナビゲーション",
    selectLanguage: "言語を選択",
    selectTheme: "テーマを選択",
    selectFontSize: "フォントサイズを選択",
    selectColorVision: "色覚モードを選択",
  },

  // Footer
  footer: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    cookies: "Cookieポリシー",
    about: "作成者",
    copyright: "© 2026 BookClub. All rights reserved.",
  },

  // Login
  login: {
    title: "ログイン",
    description: "アカウントにログインしてください",
    email: "メールアドレス",
    emailPlaceholder: "email@example.com",
    password: "パスワード",
    submit: "ログイン",
    submitting: "ログイン中...",
    noAccount: "アカウントをお持ちでないですか？",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません",
    failed: "ログインに失敗しました",
    continueWithGoogle: "Google でログイン",
    continueWithGithub: "GitHub でログイン",
  },

  // Registration
  registration: {
    success: "登録が完了しました。ログインしてください。",
    failed: "登録に失敗しました",
    submitting: "登録中...",
    complete: "登録を完了する",
    sendEmail: "登録メールを送信",
    sending: "送信中...",
    title: "新規登録",
    description: "メールアドレスを入力して登録を開始",
    emailSent: "確認メールを送信しました",
    emailSentDescription: "メールに記載されたリンクをクリックして、登録を完了してください。",
    devPreview: "開発環境: メールプレビュー",
    devTo: "宛先",
    devSubject: "件名",
    devBody: "本文",
    devBodyText: "BookClubへのご登録ありがとうございます。以下のリンクをクリックして、登録を完了してください。",
    devLinkValid: "このリンクは24時間有効です。",
    backToLogin: "ログインページへ戻る",
    alreadyHaveAccount: "既にアカウントをお持ちですか？",
    termsAgreePrefix: "アカウントを登録することにより、",
    termsConnector: "と",
    termsIncludingCookie: "（{cookie}を含む）",
    termsAgreeSuffix: "に同意したとみなされます。",
    termsLink: "利用規約",
    privacyLink: "プライバシーポリシー",
    cookieLink: "Cookieの使用",
    completed: "登録完了",
    completedDescription: "アカウントの登録が完了しました。",
    devMode: "開発モード: アカウント情報",
    username: "ユーザー名",
    settingsPage: "設定画面",
    settingsPageDescription: "ログイン後、以下のURLからユーザー名とパスワードを変更できます。",
    openSettings: "設定画面を開く",
    devModeNote: "このメッセージは開発モードでのみ表示されます。",
    goToLogin: "ログイン画面へ",
    accountSetup: "アカウント設定",
    accountSetupDescription: "で登録を完了します。名前とパスワードを設定してください。",
    name: "名前",
    namePlaceholder: "表示名",
    passwordPlaceholder: "8文字以上、英字と数字を含む",
    confirmPassword: "パスワード（確認）",
    confirmPasswordPlaceholder: "パスワードを再入力",
  },

  // Landing Page
  landing: {
    hero: {
      kicker: "読書管理・レビュー・読書会をひとつに",
      title: "読書をもっと楽しく、もっと深く",
      subtitle: "本の管理、読書記録、レビュー共有、読書会まで。あなたの読書ライフをサポートします。",
      cta: "無料で始める",
      secondaryCta: "ログイン",
      trust: "本棚、読書目標、レビュー、イベントをまとめて管理",
    },
    stats: {
      library: "本棚とステータス管理",
      tracking: "目標・進捗・読書セッション",
      community: "レビュー共有と読書会",
    },
    features: {
      title: "BookClubでできること",
      management: {
        title: "本の管理",
        description: "ISBN検索で簡単登録。読書ステータスを管理",
      },
      tracking: {
        title: "読書記録",
        description: "読書日数、開始日、完了日を記録。統計で可視化",
      },
      review: {
        title: "レビュー共有",
        description: "Markdown対応のレビュー投稿。交流できる",
      },
      club: {
        title: "読書会",
        description: "オンライン・オフラインの読書会を開催",
      },
    },
    workflow: {
      title: "読みたい気持ちを、続く習慣へ",
      subtitle: "登録、記録、共有までをひとつの流れに。個人の読書も、仲間との読書も扱いやすくします。",
      registerTitle: "本を集める",
      registerDescription: "ISBN検索やGoogle Books検索で読みたい本をすばやく登録できます。",
      trackTitle: "進捗を残す",
      trackDescription: "読書ステータス、ページ進捗、目標、ハイライトを日々の記録として積み上げます。",
      connectTitle: "読書を広げる",
      connectDescription: "レビュー、グループ、イベントを通じて感想や次の一冊に出会えます。",
    },
    finalCta: {
      title: "今日の一冊から始めましょう",
      subtitle: "読みたい本を登録して、読書記録とレビューを同じ場所に残せます。",
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "このサイトでは、サービスの向上のためにCookieを使用しています。Cookieの使用に同意いただける場合は「同意する」をクリックしてください。",
    accept: "同意する",
    decline: "拒否する",
  },

  // Logout
  logout: {
    title: "ログアウト",
    confirm: "ログアウトしますか？",
  },

  // Settings
  settings: {
    title: "設定",
    appearance: "外観",
    appearanceDescription: "表示言語とテーマの設定",
    language: "表示言語",
    languageDescription: "表示言語を選択",
    theme: "テーマ",
    themeDescription: "ライト、ダーク、またはシステム設定",
    fontSize: "フォントサイズ",
    fontSizeDescription: "テキストの大きさを調整",
    fontSizeSmall: "小",
    fontSizeMedium: "中",
    fontSizeLarge: "大",
    colorVision: "視覚サポート",
    colorVisionDescription: "色覚特性に応じた表示",
    colorVisionNormal: "標準",
    colorVisionProtanopia: "1型色覚（赤）",
    colorVisionDeuteranopia: "2型色覚（緑）",
    colorVisionTritanopia: "3型色覚（青）",
    subscription: "サブスクリプション",
    subscriptionDescription: "プランの確認・変更、支払い管理",
    account: "アカウント情報",
    accountDescription: "メールアドレス、ユーザーID、アカウント削除",
    loginHistory: "ログイン履歴",
    loginHistoryDescription: "最近のログイン履歴を確認",
    changePassword: "パスワード変更",
    changePasswordDescription: "パスワードを変更",
  },

  // About
  about: {
    title: "作成者について",
    authorName: "yunbow",
    serviceTitle: "BookClub について",
    serviceDescription: "BookClub は、読書をもっと楽しく・深くするための読書管理アプリです。本の登録・読書記録・レビュー共有・読書会への参加など、あなたの読書生活を総合的にサポートします。個人の学習目的で開発されたサービスです。",
    opensInNewTab: "{name}（新しいタブで開く）",
  },
};
