import type { Strings } from './en';

/**
 * Urdu — the app's primary language.
 *
 * Wording that already existed in the app (the mic prompts, the «جی، میں نے
 * سن لیا» acknowledgement style) is preserved rather than re-translated, so
 * the spoken and written voice stay consistent.
 */
const ur: Strings = {
  common: {
    appName: 'آواز کھاتہ',
    tagline: 'اپنے پیسوں کا حساب، بس بول کر۔',
    cancel: 'منسوخ',
    confirm: 'ٹھیک ہے',
    save: 'محفوظ کریں',
    delete: 'حذف کریں',
    edit: 'تبدیلی',
    done: 'مکمل',
    retry: 'دوبارہ کوشش کریں',
    close: 'بند کریں',
    seeAll: 'سب دیکھیں',
    search: 'تلاش',
    today: 'آج',
    yesterday: 'کل',
    thisMonth: 'اس مہینے',
    back: 'واپس',
    add: 'شامل کریں',
    optional: 'اختیاری',
    rupees: 'روپے',
    loading: 'انتظار کریں…',
  },

  nav: {
    home: 'ہوم',
    awaz: 'آواز',
    khata: 'کھاتہ',
    settings: 'ترتیبات',
  },

  greeting: {
    morning: 'صبح بخیر',
    afternoon: 'السلام علیکم',
    evening: 'شام بخیر',
    night: 'شب بخیر',
    withName: '{greeting}، {name}',
  },

  home: {
    availableBalance: 'دستیاب رقم',
    income: 'آمدن',
    expenses: 'خرچ',
    quickActions: 'فوری کام',
    speak: 'بولیں',
    addTransaction: 'اندراج',
    openKhata: 'کھاتہ',
    spendingTitle: 'اس مہینے کا خرچ',
    recentTransactions: 'حالیہ سرگرمیاں',
    balanceHidden: 'رقم چھپی ہوئی ہے',
    askByVoice: 'آپ یہ بھی پوچھ سکتے ہیں',
  },

  voice: {
    title: 'آواز کھاتہ',
    prompt: 'اپنے پیسوں کے بارے میں بتائیں یا پوچھیں',
    idleHeading: 'میں کیا مدد کروں؟',
    tapToSpeak: 'بولنے کے لیے دبائیں',
    tapToStop: 'روکنے کے لیے دبائیں',
    listening: 'سن رہا ہوں…',
    understanding: 'سمجھ رہا ہوں…',
    saving: 'کھاتے میں محفوظ کر رہا ہوں…',
    speaking: 'جواب دے رہا ہوں…',
    success: 'ہو گیا',
    errorUnderstand: 'میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔',
    youSaid: 'آپ نے کہا',
    iUnderstood: 'میں نے سمجھا',
    isThisCorrect: 'کیا یہ درست ہے؟',
    typeInstead: 'لکھ کر بتائیں',
    typePlaceholder: 'اپنی بات یا سوال لکھیں…',
    send: 'بھیجیں',
    recentExchanges: 'حالیہ',
  },

  permission: {
    title: 'بس بول کر بتائیں',
    body: 'آواز کھاتہ آپ کے مائیکروفون سے آپ کی بات سنتا ہے تاکہ آپ بول کر حساب لکھوا سکیں اور سوال پوچھ سکیں۔',
    continue: 'آگے بڑھیں',
    deniedTitle: 'مائیکروفون دستیاب نہیں',
    deniedBody:
      'مائیکروفون کی اجازت نہیں ملی۔ آپ اپنی بات لکھ کر بھی بتا سکتے ہیں، یا فون کی ترتیبات میں جا کر اجازت دے سکتے ہیں۔',
    openSettings: 'ترتیبات کھولیں',
  },

  txType: {
    expense: 'خرچ',
    income: 'آمدن',
    given: 'دیے',
    received: 'وصول',
  },

  category: {
    food: 'کھانا',
    transport: 'سفر',
    fuel: 'پٹرول',
    bills: 'بل',
    shopping: 'خریداری',
    education: 'تعلیم',
    health: 'صحت',
    other: 'دیگر',
    uncategorized: 'بغیر زمرہ',
  },

  khata: {
    title: 'کھاتہ',
    tabTransactions: 'اندراجات',
    tabPeople: 'لوگ',
    searchPlaceholder: 'اندراج تلاش کریں',
    filterAll: 'سب',
    filterTitle: 'چھانٹیں',
    youGave: 'آپ نے دیے',
    youReceived: 'واپس ملے',
    remaining: 'باقی',
    settled: 'برابر',
    theyOwe: 'ان کے ذمے',
    youOwe: 'آپ کے ذمے',
    history: 'تفصیل',
    entryCount: '{count} اندراج',
  },

  detail: {
    title: 'اندراج',
    category: 'زمرہ',
    person: 'نام',
    note: 'تفصیل',
    date: 'تاریخ',
    type: 'قسم',
    deleteTitle: 'یہ اندراج حذف کریں؟',
    deleteBody: 'یہ آپ کے کھاتے سے نکل جائے گا اور کل رقم بدل جائے گی۔ اسے واپس نہیں لایا جا سکتا۔',
  },

  manual: {
    title: 'نیا اندراج',
    editTitle: 'اندراج میں تبدیلی',
    amount: 'رقم',
    amountPlaceholder: '۰',
    type: 'قسم',
    category: 'زمرہ',
    person: 'نام',
    personPlaceholder: 'نام لکھیں',
    note: 'تفصیل',
    notePlaceholder: 'کس چیز کے لیے؟',
    errorAmount: 'رقم صفر سے زیادہ ہونی چاہیے۔',
    errorPerson: 'دیے اور وصول کے لیے نام ضروری ہے۔',
  },

  settings: {
    title: 'ترتیبات',
    profile: 'پروفائل',
    name: 'نام',
    namePlaceholder: 'آپ کا نام',

    languageVoice: 'زبان اور آواز',
    appLanguage: 'ایپ کی زبان',
    voiceLanguage: 'آواز کی زبان',
    voiceLanguageNote: 'بولا ہوا جواب فی الحال صرف اردو میں ہے۔',
    voiceResponses: 'جواب بول کر سنائیں',

    appearance: 'شکل و صورت',
    theme: 'تھیم',
    themeLight: 'روشن',
    themeDark: 'گہرا',
    themeSystem: 'فون کے مطابق',

    accessibility: 'رسائی',
    textSize: 'تحریر کا سائز',
    textSizeSmall: 'چھوٹا',
    textSizeDefault: 'عام',
    textSizeLarge: 'بڑا',
    textSizeXLarge: 'بہت بڑا',
    highContrast: 'گہرا تضاد',
    haptics: 'ہلکی تھرتھراہٹ',

    privacy: 'رازداری',
    hideBalances: 'رقم چھپائیں',
    hideBalancesHint: 'رقم کی جگہ نقطے دکھائے جائیں گے، دبانے پر ظاہر ہوں گے۔',

    about: 'ایپ کے بارے میں',
    version: 'ورژن',

    unavailable: 'ابھی دستیاب نہیں',

    account: 'اکاؤنٹ',
    signedIn: 'سائن اِن ہیں',
    signOut: 'سائن آؤٹ',
    signOutTitle: 'سائن آؤٹ کریں؟',
    signOutBody: 'آپ کی ترجیحات اسی فون پر محفوظ رہیں گی۔ آپ جب چاہیں دوبارہ سائن اِن کر سکتے ہیں۔',
  },

  auth: {
    signInTitle: 'اپنے کھاتے میں واپس آئیں',
    signInSubtitle: 'سائن اِن کریں اور اپنا کھاتہ وہیں سے جاری رکھیں۔',
    signUpTitle: 'آواز کھاتہ میں خوش آمدید',
    signUpSubtitle: 'اپنے پیسوں کا حساب، بس بول کر۔',

    continueWithGoogle: 'گوگل کے ساتھ جاری رکھیں',
    connectingGoogle: 'رابطہ ہو رہا ہے…',
    dividerOr: 'یا',

    email: 'ای میل',
    emailPlaceholder: 'you@example.com',
    password: 'پاس ورڈ',
    passwordPlaceholder: 'اپنا پاس ورڈ',
    passwordHint: 'کم از کم ۸ حروف۔',

    signIn: 'سائن اِن کریں',
    signingIn: 'سائن اِن ہو رہا ہے…',
    createAccount: 'اکاؤنٹ بنائیں',
    creatingAccount: 'اکاؤنٹ بن رہا ہے…',

    noAccount: 'اکاؤنٹ نہیں ہے؟',
    signUpLink: 'اکاؤنٹ بنائیں',
    haveAccount: 'پہلے سے اکاؤنٹ ہے؟',
    signInLink: 'سائن اِن کریں',

    verifyTitle: 'اپنی ای میل دیکھیں',
    verifySubtitle: 'ہم نے {email} پر ۶ ہندسوں کا کوڈ بھیجا ہے۔',
    code: 'تصدیقی کوڈ',
    codePlaceholder: '123456',
    verify: 'ای میل کی تصدیق کریں',
    verifying: 'تصدیق ہو رہی ہے…',
    resend: 'نیا کوڈ بھیجیں',
    resent: 'نیا کوڈ بھیج دیا گیا ہے۔',

    googleNeedsBuild:
      'گوگل سائن اِن کے لیے ایپ کا انسٹال شدہ ورژن چاہیے، Expo Go نہیں۔ فی الحال ای میل استعمال کریں۔',

    errorEmailRequired: 'اپنا ای میل پتہ لکھیں۔',
    errorEmailInvalid: 'یہ ای میل پتہ درست نہیں لگتا۔',
    errorPasswordRequired: 'اپنا پاس ورڈ لکھیں۔',
    errorPasswordShort: 'کم از کم ۸ حروف استعمال کریں۔',
    errorCodeRequired: '۶ ہندسوں کا کوڈ لکھیں۔',
    errorCredentials: 'ای میل یا پاس ورڈ درست نہیں۔',
    errorEmailTaken: 'اس ای میل پر پہلے سے اکاؤنٹ موجود ہے۔',
    errorPasswordWeak: 'زیادہ مضبوط پاس ورڈ منتخب کریں۔',
    errorCodeInvalid: 'یہ کوڈ درست نہیں۔',
    errorCodeExpired: 'اس کوڈ کی میعاد ختم ہو گئی۔ نیا کوڈ منگوائیں۔',
    errorGoogleCancelled: 'گوگل سائن اِن منسوخ کر دیا گیا۔',
    errorGoogleFailed: 'گوگل سے سائن اِن نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
    errorNetwork: 'سرور تک رسائی نہیں ہو سکی۔ اپنا انٹرنیٹ دیکھیں۔',
    errorTooManyAttempts: 'بہت زیادہ کوششیں۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    errorGeneric: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',

    a11yShowPassword: 'پاس ورڈ دکھائیں',
    a11yHidePassword: 'پاس ورڈ چھپائیں',
    a11yErrorLabel: 'خرابی',
    a11yLoading: 'انتظار کریں',
  },

  onboarding: {
    skip: 'چھوڑیں',
    next: 'آگے',
    start: 'شروع کریں',
    welcomeTitle: 'آواز کھاتہ',
    welcomeBody: 'اپنے پیسوں کا حساب بس بول کر رکھیں — نہ فارم، نہ لکھائی۔',
    languageTitle: 'اپنی زبان چنیں',
    languageBody: 'آپ اسے بعد میں ترتیبات سے بدل سکتے ہیں۔',
    micTitle: 'بس بول کر بتائیں',
    micBody:
      'مائیک دبائیں اور بتائیں کہ آپ نے کیا خرچ کیا، کیا کمایا، کس کو دیا یا کس سے لیا۔ آواز کھاتہ اردو، رومن اردو اور انگریزی سمجھتا ہے۔',
    tryTitle: 'یہ کہہ کر دیکھیں',
    tryBody: 'مائیک دبائیں اور ان میں سے کوئی ایک بولیں۔',
  },

  empty: {
    transactionsTitle: 'آپ کا کھاتہ خالی ہے',
    transactionsBody: 'پہلے مجھے اپنا پہلا حساب بتائیں۔',
    transactionsAction: 'ابھی بولیں',
    peopleTitle: 'ابھی کوئی نام نہیں',
    peopleBody: 'جب آپ کسی کو پیسے دیں گے یا کسی سے لیں گے، ان کا کھاتہ یہاں آ جائے گا۔',
    searchTitle: 'کچھ نہیں ملا',
    searchBody: 'کوئی اور لفظ آزمائیں یا چھانٹی ہٹا دیں۔',
    spendingTitle: 'اس مہینے کوئی خرچ نہیں',
    spendingBody: 'خرچ درج کرتے ہی زمروں کی تفصیل یہاں آ جائے گی۔',
    historyTitle: 'کوئی گفتگو نہیں',
    historyBody: 'اس دوران کی گئی بات چیت یہاں دکھائی دے گی۔',
  },

  error: {
    generic: 'کچھ غلط ہو گیا، دوبارہ کوشش کریں۔',
    network: 'سرور سے رابطہ نہیں ہو سکا۔',
    offline: 'انٹرنیٹ سے رابطہ نہیں ہے۔',
    offlineBody: 'آواز کھاتہ کو آپ کی بات سمجھنے اور محفوظ کرنے کے لیے انٹرنیٹ چاہیے۔',
    loadFailed: 'کھاتہ کھل نہیں سکا۔',
  },

  a11y: {
    micIdle: 'ریکارڈنگ شروع کریں',
    micRecording: 'ریکارڈنگ روکیں',
    micBusy: 'انتظار کریں، کام جاری ہے',
    back: 'واپس جائیں',
    close: 'بند کریں',
    tabHome: 'ہوم',
    tabAwaz: 'آواز',
    tabKhata: 'کھاتہ',
    tabSettings: 'ترتیبات',
    expense: '{amount} خرچ',
    income: '{amount} آمدن',
    given: '{person} کو {amount} دیے',
    received: '{person} سے {amount} وصول',
    revealBalance: 'رقم ظاہر کریں',
    hideBalance: 'رقم چھپائیں',
    selected: 'منتخب',
  },

  suggestions: {
    todaySpend: 'آج میں نے کتنے پیسے خرچ کیے؟',
    monthSummary: 'اس مہینے کا حساب بتاؤ',
    topCategory: 'سب سے زیادہ خرچ کس چیز پر ہوا؟',
  },
};

export default ur;
