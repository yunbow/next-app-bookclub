import type { Translations } from "./ja";

export const en: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "BookClub - Reading Management App",
    siteDescription: "Manage books, track reading, share reviews, and enjoy book clubs",
  },

  // Common
  common: {
    search: "Search...",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    cancel: "Cancel",
    or: "or",
    view: "View",
    nameNotSet: "No Name",
    getStarted: "Get Started",
    submitting: "Submitting...",
    loading: "Loading...",
    appName: "BookClub",
  },

  // Theme
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    search: "Search",
    books: "Browse Books",
    clubs: "Book Clubs",
    events: "Events",
    bookmarks: "Bookmarks",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    expand: "Expand",
    collapse: "Collapse",
  },

  // Accessibility
  accessibility: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    switchLanguage: "Switch language",
    switchTheme: "Switch theme",
    required: "Required",
    homeLink: "Back to home",
    footerNavigation: "Footer navigation",
    skipToContent: "Skip to main content",
    userMenu: "User menu",
    mobileNavigation: "Mobile navigation",
    selectLanguage: "Select language",
    selectTheme: "Select theme",
    selectFontSize: "Select font size",
    selectColorVision: "Select color vision mode",
  },

  // Footer
  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    about: "About",
    copyright: "© 2026 BookClub. All rights reserved.",
  },

  // Login
  login: {
    title: "Login",
    description: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "email@example.com",
    password: "Password",
    submit: "Login",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    invalidCredentials: "Invalid email or password",
    failed: "Login failed",
    continueWithGoogle: "Continue with Google",
    continueWithGithub: "Continue with GitHub",
  },

  // Registration
  registration: {
    success: "Registration complete. Please log in.",
    failed: "Registration failed",
    submitting: "Registering...",
    complete: "Complete registration",
    sendEmail: "Send registration email",
    sending: "Sending...",
    title: "Sign Up",
    description: "Enter your email to get started",
    emailSent: "Verification email sent",
    emailSentDescription: "Click the link in the email to complete your registration.",
    devPreview: "Development: Email preview",
    devTo: "To",
    devSubject: "Subject",
    devBody: "Body",
    devBodyText: "Thank you for registering with BookClub. Click the link below to complete your registration.",
    devLinkValid: "This link is valid for 24 hours.",
    backToLogin: "Back to login",
    alreadyHaveAccount: "Already have an account?",
    termsAgreePrefix: "By creating an account, you agree to the ",
    termsConnector: " and ",
    termsIncludingCookie: " (including {cookie})",
    termsAgreeSuffix: ".",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookieLink: "Cookie Policy",
    completed: "Registration Complete",
    completedDescription: "Your account has been successfully created.",
    devMode: "Development Mode: Account Info",
    username: "Username",
    settingsPage: "Settings Page",
    settingsPageDescription: "After logging in, you can change your username and password from the URL below.",
    openSettings: "Open Settings",
    devModeNote: "This message is only displayed in development mode.",
    goToLogin: "Go to Login",
    accountSetup: "Account Setup",
    accountSetupDescription: "Complete your registration. Set your name and password.",
    name: "Name",
    namePlaceholder: "Display name",
    passwordPlaceholder: "8+ characters, letters and numbers",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter password",
  },

  // Landing Page
  landing: {
    hero: {
      kicker: "Reading management, reviews, and book clubs in one place",
      title: "Make Reading More Fun and Deeper",
      subtitle: "Manage books, track reading, share reviews, and join book clubs. Support your reading life.",
      cta: "Get started for free",
      secondaryCta: "Login",
      trust: "Keep your shelf, goals, reviews, and events organized together",
    },
    stats: {
      library: "Library and reading status",
      tracking: "Goals, progress, and sessions",
      community: "Reviews and book clubs",
    },
    features: {
      title: "What you can do with BookClub",
      management: {
        title: "Book Management",
        description: "Easy registration with ISBN search. Manage reading status",
      },
      tracking: {
        title: "Reading Tracking",
        description: "Record reading days, start and completion dates. Visualize with statistics",
      },
      review: {
        title: "Review Sharing",
        description: "Post reviews with Markdown support. Connect with others",
      },
      club: {
        title: "Book Clubs",
        description: "Host online and offline book clubs",
      },
    },
    workflow: {
      title: "Turn reading intent into a steady habit",
      subtitle: "Register, track, and share in one flow. BookClub keeps solo reading and community reading easy to manage.",
      registerTitle: "Collect your books",
      registerDescription: "Add books quickly with ISBN or Google Books search and keep your next reads close.",
      trackTitle: "Track your progress",
      trackDescription: "Build a useful history with reading status, page progress, goals, sessions, and highlights.",
      connectTitle: "Expand the conversation",
      connectDescription: "Share reviews, join groups, and find events that lead to your next book.",
    },
    finalCta: {
      title: "Start with today’s book",
      subtitle: "Add one book and keep your reading record and reviews in the same place.",
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "We use cookies to improve our service. By clicking 'Accept', you agree to our use of cookies.",
    accept: "Accept",
    decline: "Decline",
  },

  // Logout
  logout: {
    title: "Logout",
    confirm: "Are you sure you want to logout?",
  },

  // Settings
  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription: "Language and theme settings",
    language: "Display Language",
    languageDescription: "Select display language",
    theme: "Theme",
    themeDescription: "Light, dark, or system preference",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust text size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    colorVision: "Visual Support",
    colorVisionDescription: "Display for color vision characteristics",
    colorVisionNormal: "Normal",
    colorVisionProtanopia: "Protanopia (Red)",
    colorVisionDeuteranopia: "Deuteranopia (Green)",
    colorVisionTritanopia: "Tritanopia (Blue)",
    account: "Account Information",
    accountDescription: "Email, user ID, and account deletion",
    loginHistory: "Login History",
    loginHistoryDescription: "View recent login history",
    changePassword: "Change Password",
    changePasswordDescription: "Change your password",
  },

  // About
  about: {
    title: "About",
    authorName: "yunbow",
    serviceTitle: "About BookClub",
    serviceDescription: "BookClub is a reading management app designed to make reading more fun and meaningful. Register books, track your reading, share reviews, and join book clubs — everything you need to support your reading life. This service was developed for personal learning purposes.",
    opensInNewTab: "{name} (opens in new tab)",
  },
};
