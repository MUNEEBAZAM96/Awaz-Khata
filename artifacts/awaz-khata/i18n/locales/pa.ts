import type { Strings } from './en';

/**
 * Punjabi (Shahmukhi) — the script Punjabi is written in in Pakistan.
 *
 * Written as Punjabi, not transliterated Urdu: second person is «تُسیں»,
 * verbs take Punjabi forms («سُن رہیا واں», «دَسو», «ہو گیا»).
 *
 * NOTE: these strings have not been reviewed by a native Punjabi speaker.
 * Treat them as a solid first pass, not final copy.
 */
const pa: Strings = {
  common: {
    appName: 'آواز کھاتہ',
    tagline: 'اپنے پیسیاں دا حساب، بس بول کے۔',
    cancel: 'رہݨ دیو',
    confirm: 'ٹھیک اے',
    save: 'سانبھو',
    delete: 'مٹاؤ',
    edit: 'بدلو',
    done: 'مُک گیا',
    retry: 'مُڑ کوشش کرو',
    close: 'بند کرو',
    seeAll: 'سارے ویکھو',
    search: 'لبھو',
    today: 'اَج',
    yesterday: 'کَل',
    thisMonth: 'ایس مہینے',
    back: 'واپس',
    add: 'جوڑو',
    optional: 'مرضی نال',
    rupees: 'روپے',
    loading: 'اُڈیک کرو…',
  },

  nav: {
    home: 'گھر',
    awaz: 'آواز',
    khata: 'کھاتہ',
    settings: 'سیٹنگاں',
  },

  greeting: {
    morning: 'صبح بخیر',
    afternoon: 'السلام علیکم',
    evening: 'شام بخیر',
    night: 'شب بخیر',
    withName: '{greeting}، {name}',
  },

  home: {
    availableBalance: 'کول موجود رقم',
    income: 'آمدن',
    expenses: 'خرچہ',
    quickActions: 'چھیتی کم',
    speak: 'بولو',
    addTransaction: 'نویں اِندراج',
    openKhata: 'کھاتہ',
    spendingTitle: 'ایس مہینے دا خرچہ',
    recentTransactions: 'نویں کم',
    balanceHidden: 'رقم لُکی ہوئی اے',
    askByVoice: 'تُسیں ایہہ وی پُچھ سکدے او',
  },

  voice: {
    title: 'آواز کھاتہ',
    prompt: 'اپنے پیسیاں بارے دَسو یا پُچھو',
    idleHeading: 'میں کی مدد کراں؟',
    tapToSpeak: 'بولݨ لئی دباؤ',
    tapToStop: 'روکݨ لئی دباؤ',
    listening: 'سُن رہیا واں…',
    understanding: 'سمجھ رہیا واں…',
    saving: 'کھاتے وچ سانبھ رہیا واں…',
    speaking: 'جواب دے رہیا واں…',
    success: 'ہو گیا',
    errorUnderstand: 'میں تُہاڈی گَل سمجھ نئیں سکیا۔ مُڑ بولو۔',
    youSaid: 'تُسیں کیہا',
    iUnderstood: 'میں سمجھیا',
    isThisCorrect: 'کی ایہہ ٹھیک اے؟',
    typeInstead: 'لکھ کے دَسو',
    typePlaceholder: 'اپنی گَل یا سوال لکھو…',
    send: 'گھلو',
    recentExchanges: 'نویں',
  },

  permission: {
    title: 'بس بول کے دَسو',
    body: 'آواز کھاتہ تُہاڈے مائیک نال تُہاڈی گَل سُݨدا اے تاں جو تُسیں بول کے حساب لکھوا سکو تے سوال پُچھ سکو۔',
    continue: 'اَگے ودھو',
    deniedTitle: 'مائیک نئیں مِلیا',
    deniedBody:
      'مائیک دی اجازت نئیں مِلی۔ تُسیں اپنی گَل لکھ کے وی دَس سکدے او، یا فون دیاں سیٹنگاں وچوں اجازت دے سکدے او۔',
    openSettings: 'سیٹنگاں کھولو',
  },

  txType: {
    expense: 'خرچہ',
    income: 'آمدن',
    given: 'دِتے',
    received: 'مِلے',
  },

  category: {
    food: 'روٹی',
    transport: 'سفر',
    fuel: 'پٹرول',
    bills: 'بِل',
    shopping: 'خریداری',
    education: 'پڑھائی',
    health: 'صحت',
    other: 'ہور',
    uncategorized: 'بغیر قسم',
  },

  khata: {
    title: 'کھاتہ',
    tabTransactions: 'اِندراج',
    tabPeople: 'بندے',
    searchPlaceholder: 'اِندراج لبھو',
    filterAll: 'سارے',
    filterTitle: 'چھانٹو',
    youGave: 'تُسیں دِتے',
    youReceived: 'واپس مِلے',
    remaining: 'باقی',
    settled: 'برابر',
    theyOwe: 'اوہناں ولوں',
    youOwe: 'تُہاڈے ولوں',
    history: 'تفصیل',
    entryCount: '{count} اِندراج',
  },

  detail: {
    title: 'اِندراج',
    category: 'قسم',
    person: 'ناں',
    note: 'تفصیل',
    date: 'تریخ',
    type: 'قسم',
    deleteTitle: 'ایہہ اِندراج مٹاؤں؟',
    deleteBody: 'ایہہ کھاتے وچوں نکل جائے گا تے کُل رقم بدل جائے گی۔ ایہہ واپس نئیں آ سکدا۔',
  },

  manual: {
    title: 'نواں اِندراج',
    editTitle: 'اِندراج بدلو',
    amount: 'رقم',
    amountPlaceholder: '۰',
    type: 'قسم',
    category: 'زمرہ',
    person: 'ناں',
    personPlaceholder: 'ناں لکھو',
    note: 'تفصیل',
    notePlaceholder: 'کِس شے لئی؟',
    errorAmount: 'رقم صفر توں ودھ ہوݨی چاہیدی اے۔',
    errorPerson: 'دِتے تے مِلے لئی ناں ضروری اے۔',
  },

  settings: {
    title: 'سیٹنگاں',
    profile: 'پروفائل',
    name: 'ناں',
    namePlaceholder: 'تُہاڈا ناں',

    languageVoice: 'زبان تے آواز',
    appLanguage: 'ایپ دی زبان',
    voiceLanguage: 'آواز دی زبان',
    voiceLanguageNote: 'بولیا ہویا جواب ہاݨ صرف اردو وچ اے۔',
    voiceResponses: 'جواب بول کے سُݨاؤ',

    appearance: 'شکل',
    theme: 'تھیم',
    themeLight: 'چانݨا',
    themeDark: 'گُوڑھا',
    themeSystem: 'فون مطابق',

    accessibility: 'سوکھ',
    textSize: 'لکھائی دا سائز',
    textSizeSmall: 'نِکا',
    textSizeDefault: 'عام',
    textSizeLarge: 'وڈا',
    textSizeXLarge: 'بہوں وڈا',
    highContrast: 'گُوڑھا فرق',
    haptics: 'ہلکی تھرتھراہٹ',

    privacy: 'پردہ داری',
    hideBalances: 'رقم لُکاؤ',
    hideBalancesHint: 'رقم دی تھاں نُقطے آݨگے، دباؤ تے ظاہر ہوݨگے۔',

    about: 'ایپ بارے',
    version: 'ورژن',

    unavailable: 'ہاݨ دستیاب نئیں',

    account: 'اکاؤنٹ',
    signedIn: 'سائن اِن او',
    signOut: 'سائن آؤٹ',
    signOutTitle: 'سائن آؤٹ کرنا اے؟',
    signOutBody: 'تہاڈیاں ترجیحاں ایسے فون تے رہݨ گیاں۔ تسیں جدوں چاہو دوبارہ سائن اِن کر سکدے او۔',
  },

  auth: {
    signInTitle: 'اپݨے کھاتے وچ واپس آؤ',
    signInSubtitle: 'سائن اِن کرو تے اپݨا کھاتہ اوتھوں ای جاری رکھو۔',
    signUpTitle: 'آواز کھاتہ وچ جی آیاں نوں',
    signUpSubtitle: 'اپݨے پیسیاں دا حساب، بس بول کے۔',

    continueWithGoogle: 'گوگل نال جاری رکھو',
    connectingGoogle: 'رابطہ ہو رہیا اے…',
    dividerOr: 'یا',

    email: 'ای میل',
    emailPlaceholder: 'you@example.com',
    password: 'پاس ورڈ',
    passwordPlaceholder: 'اپݨا پاس ورڈ',
    passwordHint: 'گھٹ توں گھٹ ۸ حرف۔',

    signIn: 'سائن اِن کرو',
    signingIn: 'سائن اِن ہو رہیا اے…',
    createAccount: 'اکاؤنٹ بݨاؤ',
    creatingAccount: 'اکاؤنٹ بݨ رہیا اے…',

    noAccount: 'اکاؤنٹ نئیں اے؟',
    signUpLink: 'اکاؤنٹ بݨاؤ',
    haveAccount: 'پہلے توں اکاؤنٹ اے؟',
    signInLink: 'سائن اِن کرو',

    verifyTitle: 'اپݨی ای میل ویکھو',
    verifySubtitle: 'اسیں {email} تے ۶ ہندسیاں دا کوڈ گھلیا اے۔',
    code: 'تصدیقی کوڈ',
    codePlaceholder: '123456',
    verify: 'ای میل دی تصدیق کرو',
    verifying: 'تصدیق ہو رہی اے…',
    resend: 'نواں کوڈ گھلو',
    resent: 'نواں کوڈ گھل گیا اے۔',

    googleNeedsBuild:
      'گوگل سائن اِن لئی ایپ دا انسٹال شدہ ورژن چاہیدا اے، Expo Go نئیں۔ فی الحال ای میل ورتو۔',

    errorEmailRequired: 'اپݨا ای میل پتہ لکھو۔',
    errorEmailInvalid: 'ایہہ ای میل پتہ ٹھیک نئیں لگدا۔',
    errorPasswordRequired: 'اپݨا پاس ورڈ لکھو۔',
    errorPasswordShort: 'گھٹ توں گھٹ ۸ حرف ورتو۔',
    errorCodeRequired: '۶ ہندسیاں دا کوڈ لکھو۔',
    errorCredentials: 'ای میل یا پاس ورڈ ٹھیک نئیں۔',
    errorEmailTaken: 'ایس ای میل تے پہلے توں اکاؤنٹ موجود اے۔',
    errorPasswordWeak: 'ودھ مضبوط پاس ورڈ چُݨو۔',
    errorCodeInvalid: 'ایہہ کوڈ ٹھیک نئیں۔',
    errorCodeExpired: 'ایس کوڈ دی میعاد مُک گئی۔ نواں کوڈ منگواؤ۔',
    errorGoogleCancelled: 'گوگل سائن اِن منسوخ ہو گیا۔',
    errorGoogleFailed: 'گوگل نال سائن اِن نئیں ہو سکیا۔ دوبارہ کوشش کرو۔',
    errorNetwork: 'سرور تیکر رسائی نئیں ہو سکی۔ اپݨا انٹرنیٹ ویکھو۔',
    errorTooManyAttempts: 'بہت زیادہ کوششاں۔ تھوڑی دیر بعد دوبارہ کوشش کرو۔',
    errorGeneric: 'کجھ غلط ہو گیا۔ دوبارہ کوشش کرو۔',

    a11yShowPassword: 'پاس ورڈ ویکھاؤ',
    a11yHidePassword: 'پاس ورڈ لُکاؤ',
    a11yErrorLabel: 'خرابی',
    a11yLoading: 'انتظار کرو',
  },

  onboarding: {
    skip: 'چھڈو',
    next: 'اَگے',
    start: 'شروع کرو',
    welcomeTitle: 'آواز کھاتہ',
    welcomeBody: 'اپنے پیسیاں دا حساب بس بول کے رکھو — نہ فارم، نہ لکھائی۔',
    languageTitle: 'اپنی زبان چُݨو',
    languageBody: 'تُسیں ایہہ بعد وچ سیٹنگاں توں بدل سکدے او۔',
    micTitle: 'بس بول کے دَسو',
    micBody:
      'مائیک دباؤ تے دَسو کہ تُسیں کی خرچ کیتا، کی کمایا، کِنوں دِتا یا کِس توں لیا۔ آواز کھاتہ اردو، رومن اردو تے انگریزی سمجھدا اے۔',
    tryTitle: 'ایہہ کہہ کے ویکھو',
    tryBody: 'مائیک دباؤ تے ایہناں وچوں کوئی اِک بولو۔',
  },

  empty: {
    transactionsTitle: 'تُہاڈا کھاتہ خالی اے',
    transactionsBody: 'پہلاں مینوں اپنا پہلا حساب دَسو۔',
    transactionsAction: 'ہاݨ بولو',
    peopleTitle: 'ہاݨ کوئی ناں نئیں',
    peopleBody: 'جدوں تُسیں کِسے نوں پیسے دیوگے یا کِسے توں لَوگے، اوہناں دا کھاتہ ایتھے آ جائے گا۔',
    searchTitle: 'کُجھ نئیں لَبھا',
    searchBody: 'کوئی ہور لفظ اَزماؤ یا چھانٹی ہٹا دیو۔',
    spendingTitle: 'ایس مہینے کوئی خرچہ نئیں',
    spendingBody: 'خرچہ لکھدے ای زمریاں دی تفصیل ایتھے آ جائے گی۔',
    historyTitle: 'کوئی گَل بات نئیں',
    historyBody: 'ایس دوران کیتی گَل بات ایتھے دِسے گی۔',
  },

  error: {
    generic: 'کُجھ غلط ہو گیا، مُڑ کوشش کرو۔',
    network: 'سرور نال رابطہ نئیں ہو سکیا۔',
    offline: 'انٹرنیٹ نال رابطہ نئیں اے۔',
    offlineBody: 'آواز کھاتہ نوں تُہاڈی گَل سمجھݨ تے سانبھݨ لئی انٹرنیٹ چاہیدا اے۔',
    loadFailed: 'کھاتہ کھُل نئیں سکیا۔',
  },

  a11y: {
    micIdle: 'ریکارڈنگ شروع کرو',
    micRecording: 'ریکارڈنگ روکو',
    micBusy: 'اُڈیک کرو، کم چل رہیا اے',
    back: 'واپس جاؤ',
    close: 'بند کرو',
    tabHome: 'گھر',
    tabAwaz: 'آواز',
    tabKhata: 'کھاتہ',
    tabSettings: 'سیٹنگاں',
    expense: '{amount} خرچہ',
    income: '{amount} آمدن',
    given: '{person} نوں {amount} دِتے',
    received: '{person} توں {amount} مِلے',
    revealBalance: 'رقم ظاہر کرو',
    hideBalance: 'رقم لُکاؤ',
    selected: 'چُݨیا ہویا',
  },

  suggestions: {
    todaySpend: 'اَج میں کِنّے پیسے خرچ کیتے؟',
    monthSummary: 'ایس مہینے دا حساب دَسو',
    topCategory: 'سب توں ودھ خرچہ کِس شے تے ہویا؟',
  },
};

export default pa;
