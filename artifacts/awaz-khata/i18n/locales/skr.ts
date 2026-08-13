import type { Strings } from './en';

/**
 * Saraiki — Perso-Arabic script with the four implosive letters (ٻ ݙ ڳ ݨ)
 * that distinguish it from Urdu and Punjabi.
 *
 * NOTE: these strings have not been reviewed by a native Saraiki speaker.
 * Treat them as a solid first pass, not final copy.
 */
const skr: Strings = {
  common: {
    appName: 'آواز کھاتہ',
    tagline: 'اپݨے پیسیاں دا حساب، بس ڳالھ کر کے۔',
    cancel: 'رہݨ ڈیو',
    confirm: 'ٹھیک ہے',
    save: 'سانبھو',
    delete: 'مٹاؤ',
    edit: 'بدلو',
    done: 'تھی ڳیا',
    retry: 'ولدا کوشش کرو',
    close: 'بند کرو',
    seeAll: 'سارے ݙیکھو',
    search: 'ڳولو',
    today: 'اڄ',
    yesterday: 'ڪل',
    thisMonth: 'ایں مہینے',
    back: 'واپس',
    add: 'ملاؤ',
    optional: 'مرضی نال',
    rupees: 'روپے',
    loading: 'انتظار کرو…',
  },

  nav: {
    home: 'گھر',
    awaz: 'آواز',
    khata: 'کھاتہ',
    settings: 'ترتیباں',
  },

  greeting: {
    morning: 'صبح بخیر',
    afternoon: 'السلام علیکم',
    evening: 'شام بخیر',
    night: 'شب بخیر',
    withName: '{greeting}، {name}',
  },

  home: {
    availableBalance: 'موجود رقم',
    income: 'آمدن',
    expenses: 'خرچ',
    quickActions: 'چھیتی کم',
    speak: 'ڳالھ کرو',
    addTransaction: 'نواں اندراج',
    openKhata: 'کھاتہ',
    spendingTitle: 'ایں مہینے دا خرچ',
    recentTransactions: 'نویں کم',
    balanceHidden: 'رقم لُکی ہوئی ہے',
    askByVoice: 'تُساں ایہ وی پُچھ سڳدے او',
  },

  voice: {
    title: 'آواز کھاتہ',
    prompt: 'اپݨے پیسیاں بارے ٻولو یا پُچھو',
    idleHeading: 'میں ڪیا مدد کراں؟',
    tapToSpeak: 'ٻولݨ کیتے دٻاؤ',
    tapToStop: 'روکݨ کیتے دٻاؤ',
    listening: 'سُݨدا پیا ہاں…',
    understanding: 'سمجھدا پیا ہاں…',
    saving: 'کھاتے وچ سانبھدا پیا ہاں…',
    speaking: 'جواب ݙیندا پیا ہاں…',
    success: 'تھی ڳیا',
    errorUnderstand: 'میں تُہاݙی ڳالھ سمجھ نہ سڳیا۔ ولدا ٻولو۔',
    youSaid: 'تُساں آکھیا',
    iUnderstood: 'میں سمجھیا',
    isThisCorrect: 'ڪیا ایہ ٹھیک ہے؟',
    typeInstead: 'لکھ کے ٻولو',
    typePlaceholder: 'اپݨی ڳالھ یا سوال لکھو…',
    send: 'گھلو',
    recentExchanges: 'نویں',
  },

  permission: {
    title: 'بس ڳالھ کر کے ٻولو',
    body: 'آواز کھاتہ تُہاݙے مائیک نال تُہاݙی ڳالھ سُݨدا ہے تاں جو تُساں ٻول کے حساب لکھوا سڳو تے سوال پُچھ سڳو۔',
    continue: 'اڳوں ودھو',
    deniedTitle: 'مائیک نہ مِلیا',
    deniedBody:
      'مائیک دی اجازت نہ مِلی۔ تُساں اپݨی ڳالھ لکھ کے وی ٻول سڳدے او، یا فون دیاں ترتیباں وچوں اجازت ݙے سڳدے او۔',
    openSettings: 'ترتیباں کھولو',
  },

  txType: {
    expense: 'خرچ',
    income: 'آمدن',
    given: 'ݙِتے',
    received: 'مِلے',
  },

  category: {
    food: 'ماݨی',
    transport: 'سفر',
    fuel: 'پٹرول',
    bills: 'ٻِل',
    shopping: 'خریداری',
    education: 'پڑھائی',
    health: 'صحت',
    other: 'ٻیا',
    uncategorized: 'بغیر قسم',
  },

  khata: {
    title: 'کھاتہ',
    tabTransactions: 'اندراج',
    tabPeople: 'ماݨھو',
    searchPlaceholder: 'اندراج ڳولو',
    filterAll: 'سارے',
    filterTitle: 'چھانٹو',
    youGave: 'تُساں ݙِتے',
    youReceived: 'واپس مِلے',
    remaining: 'ٻاقی',
    settled: 'ٻرابر',
    theyOwe: 'اُنھاں ݙے ذمے',
    youOwe: 'تُہاݙے ذمے',
    history: 'تفصیل',
    entryCount: '{count} اندراج',
  },

  detail: {
    title: 'اندراج',
    category: 'قسم',
    person: 'ناں',
    note: 'تفصیل',
    date: 'تریخ',
    type: 'قسم',
    deleteTitle: 'ایہ اندراج مٹاواں؟',
    deleteBody: 'ایہ کھاتے وچوں نکل ویسی تے کُل رقم بدل ویسی۔ ایہ واپس نہ آ سڳدا۔',
  },

  manual: {
    title: 'نواں اندراج',
    editTitle: 'اندراج بدلو',
    amount: 'رقم',
    amountPlaceholder: '۰',
    type: 'قسم',
    category: 'زمرہ',
    person: 'ناں',
    personPlaceholder: 'ناں لکھو',
    note: 'تفصیل',
    notePlaceholder: 'ڪیں شے کیتے؟',
    errorAmount: 'رقم صفر توں ودھ ہووݨی چاہیدی ہے۔',
    errorPerson: 'ݙِتے تے مِلے کیتے ناں ضروری ہے۔',
  },

  settings: {
    title: 'ترتیباں',
    profile: 'پروفائل',
    name: 'ناں',
    namePlaceholder: 'تُہاݙا ناں',

    languageVoice: 'ٻولی تے آواز',
    appLanguage: 'ایپ دی ٻولی',
    voiceLanguage: 'آواز دی ٻولی',
    voiceLanguageNote: 'ٻولیا ہویا جواب ہݨ صرف اردو وچ ہے۔',
    voiceResponses: 'جواب ٻول کے سُݨاؤ',

    appearance: 'شکل',
    theme: 'تھیم',
    themeLight: 'چانݨا',
    themeDark: 'ڳوڑھا',
    themeSystem: 'فون مطابق',

    accessibility: 'سہولت',
    textSize: 'لکھائی دا سائز',
    textSizeSmall: 'نِکا',
    textSizeDefault: 'عام',
    textSizeLarge: 'وݙا',
    textSizeXLarge: 'ٻہوں وݙا',
    highContrast: 'ڳوڑھا فرق',
    haptics: 'ہلکی تھرتھراہٹ',

    privacy: 'پردہ',
    hideBalances: 'رقم لُکاؤ',
    hideBalancesHint: 'رقم دی تھاں نُقطے آسن، دٻاوݨ تے ظاہر تھیسن۔',

    about: 'ایپ بارے',
    version: 'ورژن',

    unavailable: 'ہݨ دستیاب نہیں',

    account: 'اکاؤنٹ',
    signedIn: 'سائن اِن ہو',
    signOut: 'سائن آؤٹ',
    signOutTitle: 'سائن آؤٹ کرݨا ہے؟',
    signOutBody: 'تہاݙیاں ترجیحاں ایں فون تے ہی رہسن۔ تساں جݙاں چاہو ولدا سائن اِن کر سڳدے ہو۔',
  },

  auth: {
    signInTitle: 'اپݨے کھاتے وچ ولدے آؤ',
    signInSubtitle: 'سائن اِن کرو تے اپݨا کھاتہ اُتھوں ہی جاری رکھو۔',
    signUpTitle: 'آواز کھاتہ وچ ڀلے آۓ',
    signUpSubtitle: 'اپݨے پیسیاں دا حساب، بس ڳالھ کر کے۔',

    continueWithGoogle: 'گوگل نال جاری رکھو',
    connectingGoogle: 'رابطہ تھی رہیا ہے…',
    dividerOr: 'یا',

    email: 'ای میل',
    emailPlaceholder: 'you@example.com',
    password: 'پاس ورڈ',
    passwordPlaceholder: 'اپݨا پاس ورڈ',
    passwordHint: 'گھٹ کنوں گھٹ ۸ حرف۔',

    signIn: 'سائن اِن کرو',
    signingIn: 'سائن اِن تھی رہیا ہے…',
    createAccount: 'اکاؤنٹ بݨاؤ',
    creatingAccount: 'اکاؤنٹ بݨ رہیا ہے…',

    noAccount: 'اکاؤنٹ کائنی؟',
    signUpLink: 'اکاؤنٹ بݨاؤ',
    haveAccount: 'پہلے کنوں اکاؤنٹ ہے؟',
    signInLink: 'سائن اِن کرو',

    verifyTitle: 'اپݨی ای میل ݙیکھو',
    verifySubtitle: 'اساں {email} تے ۶ ہندسیاں دا کوڈ ڳھلیا ہے۔',
    code: 'تصدیقی کوڈ',
    codePlaceholder: '123456',
    verify: 'ای میل دی تصدیق کرو',
    verifying: 'تصدیق تھی رہی ہے…',
    resend: 'نواں کوڈ ڳھلو',
    resent: 'نواں کوڈ ڳھل ڳیا ہے۔',

    googleNeedsBuild:
      'گوگل سائن اِن کیتے ایپ دا انسٹال شدہ ورژن چاہیدا ہے، Expo Go کائنی۔ فی الحال ای میل ورتو۔',

    errorEmailRequired: 'اپݨا ای میل پتہ لکھو۔',
    errorEmailInvalid: 'ایہہ ای میل پتہ ٹھیک کائنی لڳدا۔',
    errorPasswordRequired: 'اپݨا پاس ورڈ لکھو۔',
    errorPasswordShort: 'گھٹ کنوں گھٹ ۸ حرف ورتو۔',
    errorCodeRequired: '۶ ہندسیاں دا کوڈ لکھو۔',
    errorCredentials: 'ای میل یا پاس ورڈ ٹھیک کائنی۔',
    errorEmailTaken: 'ایں ای میل تے پہلے کنوں اکاؤنٹ موجود ہے۔',
    errorPasswordWeak: 'ودھ مضبوط پاس ورڈ چُݨو۔',
    errorCodeInvalid: 'ایہہ کوڈ ٹھیک کائنی۔',
    errorCodeExpired: 'ایں کوڈ دی میعاد مُک ڳئی۔ نواں کوڈ منڳواؤ۔',
    errorGoogleCancelled: 'گوگل سائن اِن منسوخ تھی ڳیا۔',
    errorGoogleFailed: 'گوگل نال سائن اِن نہ تھی سڳیا۔ ولدا کوشش کرو۔',
    errorNetwork: 'سرور تئیں رسائی نہ تھی سڳی۔ اپݨا انٹرنیٹ ݙیکھو۔',
    errorTooManyAttempts: 'ولا ولا کوششاں۔ تھوڑی ڳھڑی بعد ولدا کوشش کرو۔',
    errorGeneric: 'کجھ غلط تھی ڳیا۔ ولدا کوشش کرو۔',

    a11yShowPassword: 'پاس ورڈ ݙکھاؤ',
    a11yHidePassword: 'پاس ورڈ لُکاؤ',
    a11yErrorLabel: 'خرابی',
    a11yLoading: 'انتظار کرو',
  },

  onboarding: {
    skip: 'چھݙو',
    next: 'اڳوں',
    start: 'شروع کرو',
    welcomeTitle: 'آواز کھاتہ',
    welcomeBody: 'اپݨے پیسیاں دا حساب بس ٻول کے رکھو — نہ فارم، نہ لکھائی۔',
    languageTitle: 'اپݨی ٻولی چُݨو',
    languageBody: 'تُساں ایہ بعد وچ ترتیباں توں بدل سڳدے او۔',
    micTitle: 'بس ٻول کے ٻولو',
    micBody:
      'مائیک دٻاؤ تے ٻولو جو تُساں ڪیا خرچ کیتا، ڪیا کمایا، ڪیں کوں ݙِتا یا ڪیں توں لیا۔ آواز کھاتہ اردو، رومن اردو تے انگریزی سمجھدا ہے۔',
    tryTitle: 'ایہ آکھ کے ݙیکھو',
    tryBody: 'مائیک دٻاؤ تے ایہناں وچوں کوئی ہک ٻولو۔',
  },

  empty: {
    transactionsTitle: 'تُہاݙا کھاتہ خالی ہے',
    transactionsBody: 'پہلے میݙے کوں اپݨا پہلا حساب ٻولو۔',
    transactionsAction: 'ہݨ ٻولو',
    peopleTitle: 'ہݨ کوئی ناں نہیں',
    peopleBody: 'جݙاں تُساں ڪیں کوں پیسے ݙیسو یا ڪیں توں گھِنسو، اُنھاں دا کھاتہ اِتھاں آ ویسی۔',
    searchTitle: 'ڪجھ نہ لَبھا',
    searchBody: 'کوئی ٻیا لفظ آزماؤ یا چھانٹی ہٹا ݙیو۔',
    spendingTitle: 'ایں مہینے کوئی خرچ نہیں',
    spendingBody: 'خرچ لکھدے ای زمریاں دی تفصیل اِتھاں آ ویسی۔',
    historyTitle: 'کوئی ڳالھ ٻات نہیں',
    historyBody: 'ایں دوران کیتی ڳالھ ٻات اِتھاں ݙِسسی۔',
  },

  error: {
    generic: 'ڪجھ غلط تھی ڳیا، ولدا کوشش کرو۔',
    network: 'سرور نال رابطہ نہ تھی سڳیا۔',
    offline: 'انٹرنیٹ نال رابطہ نہیں ہے۔',
    offlineBody: 'آواز کھاتہ کوں تُہاݙی ڳالھ سمجھݨ تے سانبھݨ کیتے انٹرنیٹ چاہیدا ہے۔',
    loadFailed: 'کھاتہ کھُل نہ سڳیا۔',
  },

  a11y: {
    micIdle: 'ریکارڈنگ شروع کرو',
    micRecording: 'ریکارڈنگ روکو',
    micBusy: 'انتظار کرو، کم چل رہیا ہے',
    back: 'واپس ون٘ڄو',
    close: 'بند کرو',
    tabHome: 'گھر',
    tabAwaz: 'آواز',
    tabKhata: 'کھاتہ',
    tabSettings: 'ترتیباں',
    expense: '{amount} خرچ',
    income: '{amount} آمدن',
    given: '{person} کوں {amount} ݙِتے',
    received: '{person} توں {amount} مِلے',
    revealBalance: 'رقم ظاہر کرو',
    hideBalance: 'رقم لُکاؤ',
    selected: 'چُݨیا ہویا',
  },

  suggestions: {
    todaySpend: 'اڄ میں ڪِتّے پیسے خرچ کیتے؟',
    monthSummary: 'ایں مہینے دا حساب ٻولو',
    topCategory: 'سب توں ودھ خرچ ڪیں شے تے تھیا؟',
  },
};

export default skr;
