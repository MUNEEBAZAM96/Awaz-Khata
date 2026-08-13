import type { Strings } from './en';

/**
 * Hindi (Devanagari, left-to-right).
 *
 * Rendered in the platform's Devanagari font — see theme/typography.ts for
 * why no font family is named for this script.
 *
 * NOTE: these strings have not been reviewed by a native Hindi speaker.
 * Treat them as a solid first pass, not final copy.
 */
const hi: Strings = {
  common: {
    appName: 'आवाज़ खाता',
    tagline: 'आपका पैसा। आपकी भाषा। आपकी आवाज़।',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएँ',
    edit: 'बदलें',
    done: 'हो गया',
    retry: 'फिर कोशिश करें',
    close: 'बंद करें',
    seeAll: 'सभी देखें',
    search: 'खोजें',
    today: 'आज',
    yesterday: 'कल',
    thisMonth: 'इस महीने',
    back: 'वापस',
    add: 'जोड़ें',
    optional: 'वैकल्पिक',
    rupees: 'रु.',
    loading: 'लोड हो रहा है…',
  },

  nav: {
    home: 'होम',
    awaz: 'आवाज़',
    khata: 'खाता',
    settings: 'सेटिंग्स',
  },

  greeting: {
    morning: 'सुप्रभात',
    afternoon: 'नमस्ते',
    evening: 'शुभ संध्या',
    night: 'शुभ रात्रि',
    withName: '{greeting}, {name}',
  },

  home: {
    availableBalance: 'उपलब्ध राशि',
    income: 'आय',
    expenses: 'खर्च',
    quickActions: 'त्वरित काम',
    speak: 'बोलें',
    addTransaction: 'नई प्रविष्टि',
    openKhata: 'खाता',
    spendingTitle: 'इस महीने का खर्च',
    recentTransactions: 'हाल की गतिविधि',
    balanceHidden: 'राशि छिपी है',
    askByVoice: 'आप यह भी पूछ सकते हैं',
  },

  voice: {
    title: 'आवाज़ खाता',
    prompt: 'अपने पैसों के बारे में बताएँ या पूछें',
    idleHeading: 'मैं क्या मदद करूँ?',
    tapToSpeak: 'बोलने के लिए दबाएँ',
    tapToStop: 'रोकने के लिए दबाएँ',
    listening: 'सुन रहा हूँ…',
    understanding: 'समझ रहा हूँ…',
    saving: 'खाते में सहेज रहा हूँ…',
    speaking: 'जवाब दे रहा हूँ…',
    success: 'हो गया',
    errorUnderstand: 'मैं आपकी बात समझ नहीं सका। फिर बोलें।',
    youSaid: 'आपने कहा',
    iUnderstood: 'मैंने समझा',
    isThisCorrect: 'क्या यह सही है?',
    typeInstead: 'लिखकर बताएँ',
    typePlaceholder: 'अपनी बात या सवाल लिखें…',
    send: 'भेजें',
    recentExchanges: 'हाल की',
  },

  permission: {
    title: 'बस बोलकर बताएँ',
    body: 'आवाज़ खाता आपके माइक्रोफ़ोन से आपकी बात सुनता है ताकि आप बोलकर हिसाब लिखवा सकें और सवाल पूछ सकें।',
    continue: 'आगे बढ़ें',
    deniedTitle: 'माइक्रोफ़ोन उपलब्ध नहीं',
    deniedBody:
      'माइक्रोफ़ोन की अनुमति नहीं मिली। आप अपनी बात लिखकर भी बता सकते हैं, या फ़ोन की सेटिंग्स में जाकर अनुमति दे सकते हैं।',
    openSettings: 'सेटिंग्स खोलें',
  },

  txType: {
    expense: 'खर्च',
    income: 'आय',
    given: 'दिए',
    received: 'मिले',
  },

  category: {
    food: 'खाना',
    transport: 'सफ़र',
    fuel: 'पेट्रोल',
    bills: 'बिल',
    shopping: 'ख़रीदारी',
    education: 'शिक्षा',
    health: 'स्वास्थ्य',
    other: 'अन्य',
    uncategorized: 'बिना श्रेणी',
  },

  khata: {
    title: 'खाता',
    tabTransactions: 'प्रविष्टियाँ',
    tabPeople: 'लोग',
    searchPlaceholder: 'प्रविष्टि खोजें',
    filterAll: 'सभी',
    filterTitle: 'छाँटें',
    youGave: 'आपने दिए',
    youReceived: 'वापस मिले',
    remaining: 'बाक़ी',
    settled: 'बराबर',
    theyOwe: 'उन पर बाक़ी',
    youOwe: 'आप पर बाक़ी',
    history: 'विवरण',
    entryCount: '{count} प्रविष्टियाँ',
  },

  detail: {
    title: 'प्रविष्टि',
    category: 'श्रेणी',
    person: 'नाम',
    note: 'विवरण',
    date: 'तारीख़',
    type: 'प्रकार',
    deleteTitle: 'यह प्रविष्टि हटाएँ?',
    deleteBody: 'यह आपके खाते से निकल जाएगी और कुल राशि बदल जाएगी। इसे वापस नहीं लाया जा सकता।',
  },

  manual: {
    title: 'नई प्रविष्टि',
    editTitle: 'प्रविष्टि बदलें',
    amount: 'राशि',
    amountPlaceholder: '0',
    type: 'प्रकार',
    category: 'श्रेणी',
    person: 'नाम',
    personPlaceholder: 'नाम लिखें',
    note: 'विवरण',
    notePlaceholder: 'किस चीज़ के लिए?',
    errorAmount: 'राशि शून्य से अधिक होनी चाहिए।',
    errorPerson: 'दिए और मिले के लिए नाम ज़रूरी है।',
  },

  settings: {
    title: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    name: 'नाम',
    namePlaceholder: 'आपका नाम',

    languageVoice: 'भाषा और आवाज़',
    appLanguage: 'ऐप की भाषा',
    voiceLanguage: 'आवाज़ की भाषा',
    voiceLanguageNote: 'बोला गया जवाब फ़िलहाल केवल उर्दू में है।',
    voiceResponses: 'जवाब बोलकर सुनाएँ',

    appearance: 'रूप',
    theme: 'थीम',
    themeLight: 'उजला',
    themeDark: 'गहरा',
    themeSystem: 'फ़ोन के अनुसार',

    accessibility: 'सुगमता',
    textSize: 'अक्षर का आकार',
    textSizeSmall: 'छोटा',
    textSizeDefault: 'सामान्य',
    textSizeLarge: 'बड़ा',
    textSizeXLarge: 'बहुत बड़ा',
    highContrast: 'अधिक कंट्रास्ट',
    haptics: 'हल्का कंपन',

    privacy: 'निजता',
    hideBalances: 'राशि छिपाएँ',
    hideBalancesHint: 'राशि की जगह बिंदु दिखेंगे, दबाने पर सामने आएँगे।',

    about: 'ऐप के बारे में',
    version: 'संस्करण',

    unavailable: 'अभी उपलब्ध नहीं',

    account: 'खाता',
    signedIn: 'साइन इन हैं',
    signOut: 'साइन आउट',
    signOutTitle: 'साइन आउट करें?',
    signOutBody: 'आपकी पसंद इसी फ़ोन पर रहेगी। आप जब चाहें दोबारा साइन इन कर सकते हैं।',
  },

  auth: {
    signInTitle: 'अपने खाते में वापस आएँ',
    signInSubtitle: 'साइन इन करें और अपना खाता वहीं से जारी रखें।',
    signUpTitle: 'आवाज़ खाता में आपका स्वागत है',
    signUpSubtitle: 'अपने पैसों का हिसाब, बस बोलकर।',

    continueWithGoogle: 'गूगल के साथ जारी रखें',
    connectingGoogle: 'जुड़ रहे हैं…',
    dividerOr: 'या',

    email: 'ईमेल',
    emailPlaceholder: 'you@example.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'आपका पासवर्ड',
    passwordHint: 'कम से कम 8 अक्षर।',

    signIn: 'साइन इन करें',
    signingIn: 'साइन इन हो रहा है…',
    createAccount: 'खाता बनाएँ',
    creatingAccount: 'खाता बन रहा है…',

    noAccount: 'खाता नहीं है?',
    signUpLink: 'खाता बनाएँ',
    haveAccount: 'पहले से खाता है?',
    signInLink: 'साइन इन करें',

    verifyTitle: 'अपना ईमेल देखें',
    verifySubtitle: 'हमने {email} पर 6 अंकों का कोड भेजा है।',
    code: 'सत्यापन कोड',
    codePlaceholder: '123456',
    verify: 'ईमेल सत्यापित करें',
    verifying: 'सत्यापन हो रहा है…',
    resend: 'नया कोड भेजें',
    resent: 'नया कोड भेज दिया गया है।',

    googleNeedsBuild:
      'गूगल साइन इन के लिए ऐप का इंस्टॉल किया हुआ संस्करण चाहिए, Expo Go नहीं। फ़िलहाल ईमेल इस्तेमाल करें।',

    errorEmailRequired: 'अपना ईमेल पता लिखें।',
    errorEmailInvalid: 'यह ईमेल पता सही नहीं लगता।',
    errorPasswordRequired: 'अपना पासवर्ड लिखें।',
    errorPasswordShort: 'कम से कम 8 अक्षर इस्तेमाल करें।',
    errorCodeRequired: '6 अंकों का कोड लिखें।',
    errorCredentials: 'ईमेल या पासवर्ड सही नहीं है।',
    errorEmailTaken: 'इस ईमेल पर पहले से खाता मौजूद है।',
    errorPasswordWeak: 'ज़्यादा मज़बूत पासवर्ड चुनें।',
    errorCodeInvalid: 'यह कोड सही नहीं है।',
    errorCodeExpired: 'इस कोड की अवधि ख़त्म हो गई। नया कोड मँगवाएँ।',
    errorGoogleCancelled: 'गूगल साइन इन रद्द कर दिया गया।',
    errorGoogleFailed: 'गूगल से साइन इन नहीं हो सका। दोबारा कोशिश करें।',
    errorNetwork: 'सर्वर तक नहीं पहुँच सके। अपना इंटरनेट देखें।',
    errorTooManyAttempts: 'बहुत ज़्यादा कोशिशें। थोड़ी देर बाद दोबारा कोशिश करें।',
    errorGeneric: 'कुछ ग़लत हो गया। दोबारा कोशिश करें।',

    a11yShowPassword: 'पासवर्ड दिखाएँ',
    a11yHidePassword: 'पासवर्ड छिपाएँ',
    a11yErrorLabel: 'त्रुटि',
    a11yLoading: 'प्रतीक्षा करें',
  },

  onboarding: {
    skip: 'छोड़ें',
    next: 'आगे',
    start: 'शुरू करें',
    welcomeTitle: 'आवाज़ खाता',
    welcomeBody: 'अपने पैसों का हिसाब बस बोलकर रखें — न फ़ॉर्म, न लिखाई।',
    languageTitle: 'अपनी भाषा चुनें',
    languageBody: 'आप इसे बाद में सेटिंग्स से बदल सकते हैं।',
    micTitle: 'बस बोलकर बताएँ',
    micBody:
      'माइक दबाएँ और बताएँ कि आपने क्या खर्च किया, क्या कमाया, किसे दिया या किससे लिया। आवाज़ खाता उर्दू, रोमन उर्दू और अंग्रेज़ी समझता है।',
    tryTitle: 'यह कहकर देखें',
    tryBody: 'माइक दबाएँ और इनमें से कोई एक बोलें।',
  },

  empty: {
    transactionsTitle: 'आपका खाता खाली है',
    transactionsBody: 'पहले मुझे अपना पहला हिसाब बताएँ।',
    transactionsAction: 'अभी बोलें',
    peopleTitle: 'अभी कोई नाम नहीं',
    peopleBody: 'जब आप किसी को पैसे देंगे या किसी से लेंगे, उनका खाता यहाँ आ जाएगा।',
    searchTitle: 'कुछ नहीं मिला',
    searchBody: 'कोई और शब्द आज़माएँ या छँटाई हटा दें।',
    spendingTitle: 'इस महीने कोई खर्च नहीं',
    spendingBody: 'खर्च दर्ज करते ही श्रेणियों का विवरण यहाँ आ जाएगा।',
    historyTitle: 'कोई बातचीत नहीं',
    historyBody: 'इस दौरान की गई बातचीत यहाँ दिखेगी।',
  },

  error: {
    generic: 'कुछ गड़बड़ हो गई, फिर कोशिश करें।',
    network: 'सर्वर से संपर्क नहीं हो सका।',
    offline: 'इंटरनेट से संपर्क नहीं है।',
    offlineBody: 'आवाज़ खाता को आपकी बात समझने और सहेजने के लिए इंटरनेट चाहिए।',
    loadFailed: 'खाता खुल नहीं सका।',
  },

  a11y: {
    micIdle: 'रिकॉर्डिंग शुरू करें',
    micRecording: 'रिकॉर्डिंग रोकें',
    micBusy: 'प्रतीक्षा करें, काम चल रहा है',
    back: 'वापस जाएँ',
    close: 'बंद करें',
    tabHome: 'होम',
    tabAwaz: 'आवाज़',
    tabKhata: 'खाता',
    tabSettings: 'सेटिंग्स',
    expense: '{amount} खर्च',
    income: '{amount} आय',
    given: '{person} को {amount} दिए',
    received: '{person} से {amount} मिले',
    revealBalance: 'राशि दिखाएँ',
    hideBalance: 'राशि छिपाएँ',
    selected: 'चयनित',
  },

  suggestions: {
    todaySpend: 'आज मैंने कितने पैसे खर्च किए?',
    monthSummary: 'इस महीने का हिसाब बताओ',
    topCategory: 'सबसे ज़्यादा खर्च किस चीज़ पर हुआ?',
  },
};

export default hi;
