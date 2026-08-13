/**
 * English strings — the reference catalogue.
 *
 * Every other locale is typed against `Strings`, so adding a key here is a
 * compile error until all five languages provide it. That is deliberate: a
 * missing translation should never reach a user as a blank label.
 *
 * `{name}`-style placeholders are substituted by `t()`.
 */
const en = {
  common: {
    appName: 'Awaz Khata',
    tagline: 'Your money. Your language. Your voice.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    retry: 'Try again',
    close: 'Close',
    seeAll: 'See all',
    search: 'Search',
    today: 'Today',
    yesterday: 'Yesterday',
    thisMonth: 'This month',
    back: 'Back',
    add: 'Add',
    optional: 'Optional',
    rupees: 'Rs.',
    loading: 'Loading…',
  },

  nav: {
    home: 'Home',
    awaz: 'Awaz',
    khata: 'Khata',
    settings: 'Settings',
  },

  greeting: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good evening',
    withName: '{greeting}, {name}',
  },

  home: {
    availableBalance: 'Available balance',
    income: 'Income',
    expenses: 'Expenses',
    quickActions: 'Quick actions',
    speak: 'Speak',
    addTransaction: 'Add entry',
    openKhata: 'Khata',
    spendingTitle: "This month's spending",
    recentTransactions: 'Recent activity',
    balanceHidden: 'Balances hidden',
    askByVoice: 'You can also ask',
  },

  voice: {
    title: 'Awaz Khata',
    prompt: 'Tell me about your money, or ask a question',
    idleHeading: 'How can I help?',
    tapToSpeak: 'Tap to speak',
    tapToStop: 'Tap to stop',
    listening: "I'm listening…",
    understanding: "I'm understanding you…",
    saving: 'Saving to your Khata…',
    speaking: 'Answering…',
    success: 'Done',
    errorUnderstand: "I couldn't understand that. Please try again.",
    youSaid: 'You said',
    iUnderstood: 'I understood',
    isThisCorrect: 'Is this correct?',
    typeInstead: 'Type instead',
    typePlaceholder: 'Write your entry or question…',
    send: 'Send',
    recentExchanges: 'Recent',
  },

  permission: {
    title: 'Speak naturally',
    body: 'Awaz Khata uses your microphone so you can record transactions and ask questions using your voice.',
    continue: 'Continue',
    deniedTitle: 'Microphone not available',
    deniedBody:
      'Microphone permission was declined. You can still type your entries, or enable the microphone in your device settings.',
    openSettings: 'Open settings',
  },

  txType: {
    expense: 'Expense',
    income: 'Income',
    given: 'Given',
    received: 'Received',
  },

  category: {
    food: 'Food',
    transport: 'Transport',
    fuel: 'Fuel',
    bills: 'Bills',
    shopping: 'Shopping',
    education: 'Education',
    health: 'Health',
    other: 'Other',
    uncategorized: 'Uncategorised',
  },

  khata: {
    title: 'Khata',
    tabTransactions: 'Transactions',
    tabPeople: 'People',
    searchPlaceholder: 'Search entries',
    filterAll: 'All',
    filterTitle: 'Filter',
    youGave: 'You gave',
    youReceived: 'Received',
    remaining: 'Remaining',
    settled: 'Settled',
    theyOwe: 'Owes you',
    youOwe: 'You owe',
    history: 'History',
    entryCount: '{count} entries',
  },

  detail: {
    title: 'Entry',
    category: 'Category',
    person: 'Person',
    note: 'Note',
    date: 'Date',
    type: 'Type',
    deleteTitle: 'Delete this entry?',
    deleteBody: 'This removes it from your Khata and changes your totals. It cannot be undone.',
  },

  manual: {
    title: 'Add entry',
    editTitle: 'Edit entry',
    amount: 'Amount',
    amountPlaceholder: '0',
    type: 'Type',
    category: 'Category',
    person: 'Person',
    personPlaceholder: 'Name',
    note: 'Note',
    notePlaceholder: 'What was it for?',
    errorAmount: 'Enter an amount greater than zero.',
    errorPerson: 'A name is needed for given and received entries.',
  },

  settings: {
    title: 'Settings',
    profile: 'Profile',
    name: 'Name',
    namePlaceholder: 'Your name',

    languageVoice: 'Language & voice',
    appLanguage: 'App language',
    voiceLanguage: 'Voice language',
    voiceLanguageNote: 'Spoken replies are currently Urdu only.',
    voiceResponses: 'Speak replies aloud',

    appearance: 'Appearance',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',

    accessibility: 'Accessibility',
    textSize: 'Text size',
    textSizeSmall: 'Small',
    textSizeDefault: 'Default',
    textSizeLarge: 'Large',
    textSizeXLarge: 'Extra large',
    highContrast: 'High contrast',
    haptics: 'Haptic feedback',

    privacy: 'Privacy',
    hideBalances: 'Hide balances',
    hideBalancesHint: 'Replaces amounts with dots until you tap to reveal.',

    about: 'About',
    version: 'Version',

    account: 'Account',
    signedIn: 'Signed in',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutBody: 'Your preferences stay on this device. You can sign back in any time.',

    unavailable: 'Not available yet',
  },

  auth: {
    signInTitle: 'Welcome back',
    signInSubtitle: 'Sign in to carry on with your khata.',
    signUpTitle: 'Welcome to Awaz Khata',
    signUpSubtitle: 'Keep track of your money just by speaking.',

    continueWithGoogle: 'Continue with Google',
    connectingGoogle: 'Connecting…',
    dividerOr: 'or',

    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    passwordHint: 'At least 8 characters.',

    signIn: 'Sign in',
    signingIn: 'Signing in…',
    createAccount: 'Create account',
    creatingAccount: 'Creating account…',

    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',

    verifyTitle: 'Check your email',
    verifySubtitle: 'We sent a 6-digit code to {email}.',
    code: 'Verification code',
    codePlaceholder: '123456',
    verify: 'Verify email',
    verifying: 'Verifying…',
    resend: 'Send a new code',
    resent: 'A new code is on its way.',

    googleNeedsBuild: 'Google sign-in needs the installed app, not Expo Go. Use email for now.',

    errorEmailRequired: 'Enter your email address.',
    errorEmailInvalid: "That email address doesn't look right.",
    errorPasswordRequired: 'Enter your password.',
    errorPasswordShort: 'Use at least 8 characters.',
    errorCodeRequired: 'Enter the 6-digit code.',
    errorCredentials: 'That email or password is not correct.',
    errorEmailTaken: 'An account already exists for this email.',
    errorPasswordWeak: 'Choose a stronger password.',
    errorCodeInvalid: 'That code is not correct.',
    errorCodeExpired: 'That code has expired. Ask for a new one.',
    errorGoogleCancelled: 'Google sign-in was cancelled.',
    errorGoogleFailed: "Couldn't sign in with Google. Please try again.",
    errorNetwork: "Couldn't reach the server. Check your connection.",
    errorTooManyAttempts: 'Too many attempts. Wait a moment and try again.',
    errorGeneric: 'Something went wrong. Please try again.',

    a11yShowPassword: 'Show password',
    a11yHidePassword: 'Hide password',
    a11yErrorLabel: 'Error',
    a11yLoading: 'Please wait',
  },

  onboarding: {
    skip: 'Skip',
    next: 'Next',
    start: 'Get started',
    welcomeTitle: 'Awaz Khata',
    welcomeBody:
      'Keep track of your money by speaking naturally — no forms, no typing.',
    languageTitle: 'Choose your language',
    languageBody: 'You can change this later in Settings.',
    micTitle: 'Speak naturally',
    micBody:
      'Tap the microphone and say what you spent, earned, gave or received. Awaz Khata understands Urdu, Roman Urdu and English.',
    tryTitle: 'Try saying',
    tryBody: 'Tap the microphone and try one of these.',
  },

  empty: {
    transactionsTitle: 'Your Khata is empty',
    transactionsBody: 'Start by telling me about your first transaction.',
    transactionsAction: 'Speak now',
    peopleTitle: 'No people yet',
    peopleBody: 'When you give or receive money from someone, their ledger appears here.',
    searchTitle: 'Nothing found',
    searchBody: 'Try a different word or clear the filters.',
    spendingTitle: 'No spending this month',
    spendingBody: 'Your category breakdown appears once you record an expense.',
    historyTitle: 'No voice history',
    historyBody: 'Your recent exchanges appear here during a session.',
  },

  error: {
    generic: 'Something went wrong. Please try again.',
    network: "Couldn't reach the server.",
    offline: 'You appear to be offline.',
    offlineBody: 'Awaz Khata needs a connection to understand and save your entries.',
    loadFailed: "Couldn't load your Khata.",
  },

  a11y: {
    micIdle: 'Start recording',
    micRecording: 'Stop recording',
    micBusy: 'Processing, please wait',
    back: 'Go back',
    close: 'Close',
    tabHome: 'Home tab',
    tabAwaz: 'Voice assistant tab',
    tabKhata: 'Khata tab',
    tabSettings: 'Settings tab',
    expense: 'Expense of {amount}',
    income: 'Income of {amount}',
    given: 'Gave {amount} to {person}',
    received: 'Received {amount} from {person}',
    revealBalance: 'Reveal balances',
    hideBalance: 'Hide balances',
    selected: 'Selected',
  },

  suggestions: {
    todaySpend: "What did I spend today?",
    monthSummary: 'Give me this month’s summary',
    topCategory: 'What did I spend most on?',
  },
};

/**
 * Same shape as the English catalogue, with every leaf widened to `string`.
 * Other locales must supply exactly these keys — no more, no fewer — but are
 * obviously free to differ in wording.
 */
export type Strings = {
  [Section in keyof typeof en]: {
    [Key in keyof (typeof en)[Section]]: string;
  };
};

export default en satisfies Strings;
