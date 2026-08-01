import { SALanguage, SALanguageCode } from '../types';

export const SA_LANGUAGES: SALanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇿🇦' },
  { code: 'zu', name: 'isiZulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'nso', name: 'Sepedi', nativeName: 'Sepedi (Northern Sotho)', flag: '🇿🇦' },
  { code: 'tn', name: 'Setswana', nativeName: 'Setswana', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'ts', name: 'Xitsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ss', name: 'siSwati', nativeName: 'siSwati', flag: '🇿🇦' },
  { code: 've', name: 'Tshivenda', nativeName: 'Tshivenda', flag: '🇿🇦' },
  { code: 'nr', name: 'isiNdebele', nativeName: 'isiNdebele', flag: '🇿🇦' },
];

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  tabQuestionnaire: string;
  tabMap: string;
  tabDatabase: string;
  tabPromptSpec: string;
  aiEngineBadge: string;
  supabaseConnected: string;
  supabaseLocal: string;
  resetDatabase: string;
  reportIncidentBtn: string;
  
  // Questionnaire Steps
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Subtitle: string;
  step4Title: string;
  step4Subtitle: string;
  step5Title: string;
  step5Subtitle: string;

  // Questionnaire Actions
  nextStep: string;
  prevStep: string;
  submitToSupabase: string;
  runQwenAnalysis: string;
  detectingLanguage: string;
  languageDetected: string;
  
  // Location Prompts
  addressLabel: string;
  addressPlaceholder: string;
  suburbLabel: string;
  suburbPlaceholder: string;
  landmarkLabel: string;
  landmarkPlaceholder: string;
  dragPinInstruction: string;
  useCurrentGps: string;
  
  // Categories
  catWaterLeak: string;
  catElectricity: string;
  catPothole: string;
  catDumping: string;
  catSewage: string;
  catFallenTree: string;
  catMissingManhole: string;

  // Urgency
  urgencyLow: string;
  urgencyMedium: string;
  urgencyHigh: string;

  // Status
  statusOpen: string;
  statusInProgress: string;
  statusResolved: string;
  statusDuplicate: string;
}

export const TRANSLATIONS: Record<SALanguageCode, TranslationDictionary> = {
  en: {
    appTitle: 'Municipal AI Dispatch Engine',
    appSubtitle: 'South African Utility Dispatch & Multi-lingual Incident Intelligence',
    tabQuestionnaire: 'AI Guided Dispatch Wizard',
    tabMap: 'Interactive Pin Map',
    tabDatabase: 'Supabase Incidents Vault',
    tabPromptSpec: 'Qwen 2.5 System Prompt Spec',
    aiEngineBadge: 'Groq Qwen 2.5 AI Active',
    supabaseConnected: 'Supabase DB Connected',
    supabaseLocal: 'Local DB (Supabase Fallback)',
    resetDatabase: 'Reset DB Seed',
    reportIncidentBtn: '+ Report Incident',

    step1Title: 'Language & Initial Report',
    step1Subtitle: 'Describe the issue in any of South Africa’s 11 official languages.',
    step2Title: 'Guided Questionnaire Details',
    step2Subtitle: 'Provide contextual details to assist municipal responders.',
    step3Title: 'Location Refinement & Map Pin',
    step3Subtitle: 'Search address or drag the pin on Google Maps to adjust perceived location.',
    step4Title: 'Groq Qwen AI Analysis & Duplicate Check',
    step4Subtitle: 'AI extracts structure, checks duplicate history, and translates content.',
    step5Title: 'Review & Dispatch Ticket',
    step5Subtitle: 'Confirm ticket and dispatch to Supabase municipal vault.',

    nextStep: 'Continue to Next Step →',
    prevStep: '← Back',
    submitToSupabase: 'Dispatch to Supabase DB',
    runQwenAnalysis: 'Run Groq Qwen AI Analysis',
    detectingLanguage: 'Detecting language...',
    languageDetected: 'Detected Language',

    addressLabel: 'Street Address or Road',
    addressPlaceholder: 'e.g. 142 Jan Smuts Ave, Rosebank',
    suburbLabel: 'Suburb / Township / Ward',
    suburbPlaceholder: 'e.g. Sandton, Soweto Ward 12, Braamfontein',
    landmarkLabel: 'Nearest Landmark or Intersection',
    landmarkPlaceholder: 'e.g. Opposite Shell Garage near corner 5th St',
    dragPinInstruction: 'Click or drag the marker on the map to pinpoint the exact location.',
    useCurrentGps: 'Use My Current GPS Pin',

    catWaterLeak: 'Water Leak / Burst Pipe',
    catElectricity: 'Electricity Outage / Cable Theft',
    catPothole: 'Pothole / Road Damage',
    catDumping: 'Illegal Dumping',
    catSewage: 'Sewage Overflow',
    catFallenTree: 'Fallen Tree / Debris',
    catMissingManhole: 'Missing Manhole Cover',

    urgencyLow: 'Low Urgency',
    urgencyMedium: 'Medium Urgency',
    urgencyHigh: 'High Emergency',

    statusOpen: 'Open Report',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    statusDuplicate: 'Duplicate Linked',
  },
  zu: {
    appTitle: 'Injini ye-AI yoMnyango kaMasipala',
    appSubtitle: 'Ukubikwa kwezidingo zomphakathi eNingizimu Afrika ngezimi ezili-11',
    tabQuestionnaire: 'Umsizi we-AI wemibuzo',
    tabMap: 'Imephu Enolwazi',
    tabDatabase: 'I-Database ye-Supabase',
    tabPromptSpec: 'I-Spec yezinkomba ze-Qwen 2.5',
    aiEngineBadge: 'I-AI ye-Groq Qwen 2.5 iyasebenza',
    supabaseConnected: 'I-Supabase Ixhunywe',
    supabaseLocal: 'I-Database yasemkhathini',
    resetDatabase: 'Qala kabusha i-DB',
    reportIncidentBtn: '+ Bika Inkinga',

    step1Title: 'Ulimi Nombiko Wokuqala',
    step1Subtitle: 'Chaza inkinga ngolimi lwakho phakathi kwezilimi ezisemthethweni ezi-11.',
    step2Title: 'Imibuzo Eqondisayo',
    step2Subtitle: 'Nikeza imininingwane ukusiza abasebenzi bakamasipala.',
    step3Title: 'Ukucacisa Indawo ne-Pin ye-Map',
    step3Subtitle: 'Sesha ikheli noma uhambise i-pin kumephu ye-Google.',
    step4Title: 'Ukuhlaziya kwe-Groq Qwen AI',
    step4Subtitle: 'I-AI ikhipha imininingwane futhi ibheka izimbiko ezifanayo.',
    step5Title: 'Buyekeza Futhi Thumela',
    step5Subtitle: 'Qinisekisa ithikithi futhi ulithumele ku-Supabase.',

    nextStep: 'Qhubeka kwesilandelayo →',
    prevStep: '← Emuva',
    submitToSupabase: 'Thumela ku-Supabase DB',
    runQwenAnalysis: 'Hlaziya nge-Groq Qwen AI',
    detectingLanguage: 'Ihlaziya ulimi...',
    languageDetected: 'Ulimi Olutholakele',

    addressLabel: 'Ikheli Lomgwaqo',
    addressPlaceholder: 'isbr. 142 Jan Smuts Ave, Rosebank',
    suburbLabel: 'Isifunda / Ilokishi',
    suburbPlaceholder: 'isbr. Sandton, Soweto Ward 12',
    landmarkLabel: 'Indawo Eyaziwayo Eduze',
    landmarkPlaceholder: 'isbr. Mshaye ngaseduze kwegaraji',
    dragPinInstruction: 'Cindezela noma uhambise i-marker kumephu ukuze ukhethe indawo impela.',
    useCurrentGps: 'Sebenzisa i-GPS Yami yamanje',

    catWaterLeak: 'Ukuvuza kwamanzi / Iphayiphi eliqhumile',
    catElectricity: 'Ukucima kukagesi / Ukwebiwa kwezintambo',
    catPothole: 'Igidla emgwaqweni',
    catDumping: 'Ukulahlwa kodoti okungekho emthethweni',
    catSewage: 'Ukuphuphuma kwendle',
    catFallenTree: 'Isihlahla esiwile',
    catMissingManhole: 'Isifonyo semanhole esingekho',

    urgencyLow: 'Ukushesha Okuncane',
    urgencyMedium: 'Ukushesha Okumaphakathi',
    urgencyHigh: 'Isimo Esibucayi Sokushesha',

    statusOpen: 'Imbiko Evulekile',
    statusInProgress: 'Iziyasebenziseka',
    statusResolved: 'Isixazululiwe',
    statusDuplicate: 'Iphindwe kabili',
  },
  xh: {
    appTitle: 'Injini ye-AI ye-Dispatch kaMasipala',
    appSubtitle: 'Ukunika ingxelo ngezinto zikamasipala ngazilimini ezili-11 eMzantsi Afrika',
    tabQuestionnaire: 'Umsizi we-AI Wemibuzo',
    tabMap: 'Imephu yoNxibelelwano',
    tabDatabase: 'I-Database ye-Supabase',
    tabPromptSpec: 'Spec ye-Qwen 2.5',
    aiEngineBadge: 'Groq Qwen 2.5 AI IyaSebenza',
    supabaseConnected: 'Supabase Inxulumene',
    supabaseLocal: 'I-Database Yasekhaya',
    resetDatabase: 'Cima i-DB',
    reportIncidentBtn: '+ Bika Inkinga',

    step1Title: 'Ulwimi neNgxelo yokuQala',
    step1Subtitle: 'Cacisa ingxaki ngazo zonke iilwimi ezisemthethweni ezili-11.',
    step2Title: 'Imibuzo eKhokelayo',
    step2Subtitle: 'Nika iinkcukacha ezincedisa abasebenzi bamasipala.',
    step3Title: 'Ucoceko lwaIndawo ne-Pin kwiMephu',
    step3Subtitle: 'Khangela idilesi okanye uhambise i-pin kwi-Google Map.',
    step4Title: 'Uhlalutyo lwe-Groq Qwen AI',
    step4Subtitle: 'I-AI ikhupha ulwazi ibe ihlola iingxelo eziphindwe kabini.',
    step5Title: 'Hlaziya uze Uthumele',
    step5Subtitle: 'Qinisekisa ithikithi uze uyithumele kwi-Supabase.',

    nextStep: 'Gqithela phambili →',
    prevStep: '← Emva',
    submitToSupabase: 'Thumela kwi-Supabase DB',
    runQwenAnalysis: 'Hlalutya nge-Groq Qwen AI',
    detectingLanguage: 'Ulubona olu lwimi...',
    languageDetected: 'Ulwimi Olufunyenweyo',

    addressLabel: 'Idilesi yeSitalato',
    addressPlaceholder: 'umz. 142 Jan Smuts Ave, Rosebank',
    suburbLabel: 'Iloxishi / Suburb',
    suburbPlaceholder: 'umz. Sandton, Soweto Ward 12',
    landmarkLabel: 'Indawo eyaziwayo eKufupi',
    landmarkPlaceholder: 'umz. Ngaphesheya kwegaraji',
    dragPinInstruction: 'Cofa okanye unyuse i-marker kwi-map ukucacisa indawo.',
    useCurrentGps: 'Sebenzisa i-GPS Yam Yakutshanje',

    catWaterLeak: 'Ukuvuza kwamanzi / Iphayiphi eliqhuma',
    catElectricity: 'Ukucima kombane / Ubusela bentambo',
    catPothole: 'Igodide endleleni',
    catDumping: 'Ukulahlwa kwasendle kwenkunkuma',
    catSewage: 'Ukumpompoza kwelindle',
    catFallenTree: 'Umthi owileyo',
    catMissingManhole: 'Isiciko somhadi esulahlekileyo',

    urgencyLow: 'Ukhawulezo Oluphantsi',
    urgencyMedium: 'Ukhawulezo Olulingeneyo',
    urgencyHigh: 'Ingxakeko Enkulu',

    statusOpen: 'Ingxelo Evulekileyo',
    statusInProgress: 'Isebenza Kuyo',
    statusResolved: 'Isonjululwe',
    statusDuplicate: 'Ingxelo Ephindiweyo',
  },
  af: {
    appTitle: 'Munisipale AI Versendingsenjin',
    appSubtitle: 'Suid-Afrikaanse Nutsverslagdoening in al 11 Amptelike Tale',
    tabQuestionnaire: 'AI Vraelys-Assistent',
    tabMap: 'Interaktiewe Kaart',
    tabDatabase: 'Supabase Databasis',
    tabPromptSpec: 'Qwen 2.5 Stelselspesifikasie',
    aiEngineBadge: 'Groq Qwen 2.5 AI Aktief',
    supabaseConnected: 'Supabase DB Gekoppel',
    supabaseLocal: 'Plaaslike DB (Supabase Terugval)',
    resetDatabase: 'Herstel Databasis',
    reportIncidentBtn: '+ Meld insident aan',

    step1Title: 'Taal en Aanvanklike Verslag',
    step1Subtitle: 'Beskryf die probleem in enige van Suid-Afrika se 11 amptelike tale.',
    step2Title: 'Geleide Vraelys Besonderhede',
    step2Subtitle: 'Verskaf konteks om munisipale spanne te help.',
    step3Title: 'Ligging Verbetering & Kaart Speld',
    step3Subtitle: 'Soek adres of sleep die speld op Google Maps om ligging aan te pas.',
    step4Title: 'Groq Qwen AI Ontleding & Duplikaat Kontrole',
    step4Subtitle: 'AI onttrek struktuur en kontroleer geskiedenis vir duplikate.',
    step5Title: 'Hersien en Stuur Verslag',
    step5Subtitle: 'Bevestig kaartjie en stuur na Supabase munisipale databasis.',

    nextStep: 'Gaan voort na volgende stap →',
    prevStep: '← Terug',
    submitToSupabase: 'Stuur na Supabase DB',
    runQwenAnalysis: 'Voer Groq Qwen AI Ontleding uit',
    detectingLanguage: 'Bespeur tans taal...',
    languageDetected: 'Bespeurde Taal',

    addressLabel: 'Straatadres',
    addressPlaceholder: 'bv. Jan Smutslaan 142, Rosebank',
    suburbLabel: 'Voorstad / Woonbuurt',
    suburbPlaceholder: 'bv. Sandton, Soweto Wyk 12',
    landmarkLabel: 'Naaste Baken of Kruising',
    landmarkPlaceholder: 'bv. Teenoor Shell Vulstasie nabyt 5de Straat',
    dragPinInstruction: 'Klik of sleep die merker op die kaart om presiese ligging aan te dui.',
    useCurrentGps: 'Gebruik Huidige GPS Ligging',

    catWaterLeak: 'Waterlek / Gebarste Pyp',
    catElectricity: 'Kragonderbreking / Kabeldiefstal',
    catPothole: 'Slaggat / Padskade',
    catDumping: 'Onwettige Storting',
    catSewage: 'Riool Oorloop',
    catFallenTree: 'Omgevalle Boom',
    catMissingManhole: 'Vermiste Riooldeksel',

    urgencyLow: 'Lae Dringendheid',
    urgencyMedium: 'Medium Dringendheid',
    urgencyHigh: 'Hoë Noodgeval',

    statusOpen: 'Oop Verslag',
    statusInProgress: 'Besig Met Hantering',
    statusResolved: 'Opgelos',
    statusDuplicate: 'Duplikaat Gekoppel',
  },
  nso: {
    appTitle: 'Enjene ya AI ya Masepala',
    appSubtitle: 'Pego ya Ditirelo tsa Masepala ka Dpolelo tse 11 tsa Afrika Borwa',
    tabQuestionnaire: 'Wizarde ya Dipotšišo ya AI',
    tabMap: 'Mmapa wa Interaktiviti',
    tabDatabase: 'Dathafeisi ya Supabase',
    tabPromptSpec: 'Tlhahlobo ya Qwen 2.5',
    aiEngineBadge: 'Groq Qwen 2.5 AI e a Shoma',
    supabaseConnected: 'Supabase e Kopantšwe',
    supabaseLocal: 'Dathafeisi ya Gae',
    resetDatabase: 'Vuseltša DB',
    reportIncidentBtn: '+ Bega Taba',

    step1Title: 'Polelo le Pego ya Mathomo',
    step1Subtitle: 'Hlalosa thabane ka polelo efe kapa efe ho tse 11 tsa semmuso.',
    step2Title: 'Dipotšišo tsa go Hlahla',
    step2Subtitle: 'Neeletša dintlha go thuša bashomi ba masepala.',
    step3Title: 'Go Ntlhafatsa Lefelo le Pin ya Mmapa',
    step3Subtitle: 'Nyaka aterese kapa goga pini mmapeng wa Google.',
    step4Title: 'Tshekatsheko ya Groq Qwen AI',
    step4Subtitle: 'AI e ntšha tshedimosetso le go lekola dipego tse di tswanang.',
    step5Title: 'Tekolo le go Romela',
    step5Subtitle: 'Netefatsa tekethe ka go e romela ho Supabase.',

    nextStep: 'Tswela pele go e latelang →',
    prevStep: '← Morago',
    submitToSupabase: 'Romela go Supabase DB',
    runQwenAnalysis: 'Hlahloba ka Groq Qwen AI',
    detectingLanguage: 'E hwetša polelo...',
    languageDetected: 'Polelo e Hwetšwego',

    addressLabel: 'Aterese ya Setrata',
    addressPlaceholder: 'msh. 142 Jan Smuts Ave',
    suburbLabel: 'Motse / Loko',
    suburbPlaceholder: 'msh. Sandton, Soweto',
    landmarkLabel: 'Lefelo le Lezibegang Kgauswi',
    landmarkPlaceholder: 'msh. Kgauswi le karache',
    dragPinInstruction: 'Kanya kapa o goge sela sa mmapa go kgetha lefelo la nnete.',
    useCurrentGps: 'Shomiša GPS ya Bjale',

    catWaterLeak: 'Kutllo ya mezi / Peipi e thubegileng',
    catElectricity: 'Tima ga mohlagase / Bogodu bwa dikable',
    catPothole: 'Mosele tseleng',
    catDumping: 'Go lahla matlakala ka ntle ga molao',
    catSewage: 'Khufele ya dikhuphe',
    catFallenTree: 'Mohlare o weleng',
    catMissingManhole: 'Sekwahelo sa manhole se sego gona',

    urgencyLow: 'Gape le Potlako',
    urgencyMedium: 'Potlako ya Magareng',
    urgencyHigh: 'Potlako e Kgolo ya Tshohetso',

    statusOpen: 'Pego e Buletsweng',
    statusInProgress: 'E a Shomwa',
    statusResolved: 'E Feleditse',
    statusDuplicate: 'E Phetilwego',
  },
  tn: {
    appTitle: 'Enjene ya AI ya Masepala',
    appSubtitle: 'Pego ya ditirelo ka dipuo di le 11 tsa semmuso mo Aforika Borwa',
    tabQuestionnaire: 'Mothusi wa Dipotso tsa AI',
    tabMap: 'Mmapa wa go Tsamaya',
    tabDatabase: 'Polokelo ya Supabase',
    tabPromptSpec: 'Ditaelo tsa Qwen 2.5',
    aiEngineBadge: 'Groq Qwen 2.5 AI e a Dira',
    supabaseConnected: 'Supabase e Golagantswe',
    supabaseLocal: 'Polokelo ya Gae',
    resetDatabase: 'Vusetsa DB',
    reportIncidentBtn: '+ Begela Tshotlego',

    step1Title: 'Puo le Pego ya Ntlha',
    step1Subtitle: 'Tlhalosa mathata ka puo efe kapa efe mo di le 11.',
    step2Title: 'Dipotso tsa go Kaela',
    step2Subtitle: 'Naya dintlha go thusa badiri ba masepala.',
    step3Title: 'Tlhaloso ya Lefelo le Pin ya Mmapa',
    step3Subtitle: 'Batla aterese kgotsa goga pini mo mmapeng wa Google.',
    step4Title: 'Tshekatsheko ya Groq Qwen AI',
    step4Subtitle: 'AI e ntsha dintlha mme e tlhola dipego tse di tshwanang.',
    step5Title: 'Sekaseka mme o Romele',
    step5Subtitle: 'Tlhomamisa thikithi o e romele go Supabase.',

    nextStep: 'Tswelela pele →',
    prevStep: '← Morago',
    submitToSupabase: 'Romela mo Supabase DB',
    runQwenAnalysis: 'Sekaseka ka Groq Qwen AI',
    detectingLanguage: 'Go utlwa puo...',
    languageDetected: 'Puo e e Bonweng',

    addressLabel: 'Aterese ya Seterata',
    addressPlaceholder: 'stg. 142 Jan Smuts Ave',
    suburbLabel: 'Lefelo / Motse',
    suburbPlaceholder: 'stg. Sandton, Soweto',
    landmarkLabel: 'Lefelo le le Itsege gaufi',
    landmarkPlaceholder: 'stg. Gaufi le karache',
    dragPinInstruction: 'Kanya kgotsa o goge pin mo mmapeng go kgetha lefelo.',
    useCurrentGps: 'Dirisa GPS ya Me ya Swana',

    catWaterLeak: 'Kutlo ya metsi / Peipi e thubegileng',
    catElectricity: 'Kgaogo ya motlakase / Bogodu jwa megala',
    catPothole: 'Goti mo tseleng',
    catDumping: 'Go latlha matlakala ka fa ntle ga molao',
    catSewage: 'Go tshologa ga mefufutso',
    catFallenTree: 'Setlhare se se weleng',
    catMissingManhole: 'Sekhurumelo sa manhole se se seyong',

    urgencyLow: 'Bonako bo bo Kwa Tlase',
    urgencyMedium: 'Bonako jwa Magareng',
    urgencyHigh: 'Tshoganyetso e e Kgolo',

    statusOpen: 'Pego e e Bula',
    statusInProgress: 'E a Dirwa',
    statusResolved: 'E Siamisitswe',
    statusDuplicate: 'E Phindilweng',
  },
  st: {
    appTitle: 'Enjene ya AI ya Masepala',
    appSubtitle: 'Tlaleho ya ditshebeletso ka dipuo tse 11 tsa Aferika Borwa',
    tabQuestionnaire: 'Mothusi wa Dipotso wa AI',
    tabMap: 'Mmapa o Sebetsang',
    tabDatabase: 'Polokelo ya Supabase',
    tabPromptSpec: 'Ditaelo tsa Qwen 2.5',
    aiEngineBadge: 'Groq Qwen 2.5 AI e ya Sebetsa',
    supabaseConnected: 'Supabase e Hoketswe',
    supabaseLocal: 'Polokelo ya Lapeng',
    resetDatabase: 'Seta DB Hape',
    reportIncidentBtn: '+ Tlaleha Taba',

    step1Title: 'Puo le Tlaleho ya Pele',
    step1Subtitle: 'Hlalosa bothata ka puo efe kapa efe ho tse 11.',
    step2Title: 'Dipotso tse Tataisang',
    step2Subtitle: 'Fana ka dintlha ho mephephetsa basebeletsi ba masepala.',
    step3Title: 'Hlakisa Sebaka le Pin ya Mmapa',
    step3Subtitle: 'Batla aterese kapa goga pini mmapeng wa Google.',
    step4Title: 'Tshekatsheko ya Groq Qwen AI',
    step4Subtitle: 'AI e ntsha tlhaloso mme e hlahloba ditlaleho tse tshanang.',
    step5Title: 'Hlahloba mme o Romele',
    step5Subtitle: 'Netefatsa thekethe o e romele ho Supabase.',

    nextStep: 'Tswela pele →',
    prevStep: '← Kutu',
    submitToSupabase: 'Romela ho Supabase DB',
    runQwenAnalysis: 'Hlahloba ka Groq Qwen AI',
    detectingLanguage: 'E utlwa puo...',
    languageDetected: 'Puo e Utlwilweng',

    addressLabel: 'Aterese ya Seterata',
    addressPlaceholder: 'mohl. 142 Jan Smuts Ave',
    suburbLabel: 'Motse / Sebaka',
    suburbPlaceholder: 'mohl. Sandton, Soweto',
    landmarkLabel: 'Sebaka se Tsebahalang Haufi',
    landmarkPlaceholder: 'mohl. Bapile le karache',
    dragPinInstruction: 'Kanya kapa o goge pini mmapeng ho kgetha sebaka sa nnete.',
    useCurrentGps: 'Sebelisa GPS ya me ya Yona',

    catWaterLeak: 'Ho dutla ha mete / Peipi e phatlohileng',
    catElectricity: 'Qhaqhollo ya motlakase / Bohloko bo matla',
    catPothole: 'Moti tseleng',
    catDumping: 'Ho lahla ditshila kantle ho molao',
    catSewage: 'Ho phalla ha sephiri',
    catFallenTree: 'Sefate se oeleng',
    catMissingManhole: 'Sekwahelo sa manhole se le siege',

    urgencyLow: 'Potlako e Tlase',
    urgencyMedium: 'Potlako e Mahareng',
    urgencyHigh: 'Tshoganyetso e Kgolo',

    statusOpen: 'Tlaleho e Buletsweng',
    statusInProgress: 'E ya Sebetswa',
    statusResolved: 'E Tharollotswe',
    statusDuplicate: 'E Phetilweng',
  },
  ts: {
    appTitle: 'Yindjini ya AI ya Masipala',
    appSubtitle: 'Maviko ya vukorhokeri hi tindzimi hinkwato ta 11 ta Afrika Dzonga',
    tabQuestionnaire: 'Mupfuni wa Swivutiso swa AI',
    tabMap: 'Mepe wa ku Tlangela',
    tabDatabase: 'Dhadhabheyisi ya Supabase',
    tabPromptSpec: 'Qwen 2.5 Specs',
    aiEngineBadge: 'Groq Qwen 2.5 AI Yi Tirha',
    supabaseConnected: 'Supabase I Yilinkiwile',
    supabaseLocal: 'Dhadhabheyisi ya le Kaya',
    resetDatabase: 'Cinca DB',
    reportIncidentBtn: '+ Vika Mhaka',

    step1Title: 'Ririmi na Mviko wo Sungula',
    step1Subtitle: 'Hlamusela xiphiqo hi ririmi rini na rini eka ta 11.',
    step2Title: 'Swivutiso swo Kongomisa',
    step2Subtitle: 'Nyika vuxokoxoko ku pfuna vatirhi va masipala.',
    step3Title: 'Tiyisisa Ndhawu na Pin ya Mepe',
    step3Subtitle: 'Lava kheli kumbe u kokela pini eka mepe wa Google.',
    step4Title: 'Kambelo ka Groq Qwen AI',
    step4Subtitle: 'AI yi humesa vuxokoxoko yi tlhela yi languta maviko lama fanaka.',
    step5Title: 'Kambela u Rhumela',
    step5Subtitle: 'Tiyisisa thikithi u rhumela eka Supabase.',

    nextStep: 'Yana mahlweni →',
    prevStep: '← Endzhaku',
    submitToSupabase: 'Rhumela eka Supabase DB',
    runQwenAnalysis: 'Kambela hi Groq Qwen AI',
    detectingLanguage: 'Yi kamba ririmi...',
    languageDetected: 'Ririmi Leri Kumekeke',

    addressLabel: 'Kheli ra Xitarata',
    addressPlaceholder: 'xik. 142 Jan Smuts Ave',
    suburbLabel: 'Muganga / Loko',
    suburbPlaceholder: 'xik. Sandton, Soweto',
    landmarkLabel: 'Ndhawu yo Tiviwa Kusuhi',
    landmarkPlaceholder: 'xik. Kusuhani na garaji',
    dragPinInstruction: 'Tshikelela kumbe u koka pini eka mepe ku kombisa ndhawu.',
    useCurrentGps: 'Tirhisa GPS ya Sweswi',

    catWaterLeak: 'Kukhalaka ka mati / Phaiphi leri ku buluka',
    catElectricity: 'Kutsemeka ka gezi / Vukhamba bya ti-cable',
    catPothole: 'Godi endleleni',
    catDumping: 'Kulahla thyaka hi ndlela leyi nga riki enawini',
    catSewage: 'Kuxika ka thyaka ra le xihambukelweni',
    catFallenTree: 'Muri lowu waka',
    catMissingManhole: 'Xipfalo xa manhole lexi kumiwiki xi ri hava',

    urgencyLow: 'Ku Hatlisa ka le Hansi',
    urgencyMedium: 'Ku Hatlisa ka le Xikarhi',
    urgencyHigh: 'Xihlamariso xikulu',

    statusOpen: 'Mviko lowu Pfuleke',
    statusInProgress: 'Swi le ku Tirhiweni',
    statusResolved: 'Swi Lulamisiwile',
    statusDuplicate: 'Mviko lowu Phindhiweke',
  },
  ss: {
    appTitle: 'Yindjini te-AI yaMasipala',
    appSubtitle: 'Kubika kwetinsita ngatitimi leti-11 tasemthethweni eNingizimu Afrika',
    tabQuestionnaire: 'Umsiti wetibuto te-AI',
    tabMap: 'Lelibalave Lelisebentako',
    tabDatabase: 'Idathabheyisi ye-Supabase',
    tabPromptSpec: 'Qwen 2.5 Spec',
    aiEngineBadge: 'Groq Qwen 2.5 AI Iyasebenta',
    supabaseConnected: 'Supabase Ixhumekile',
    supabaseLocal: 'Idathabheyisi Yasekhaya',
    resetDatabase: 'Sethula DB',
    reportIncidentBtn: '+ Bika Inkinga',

    step1Title: 'Lulwimi Nombiko Wekucala',
    step1Subtitle: 'Chaza inkinga ngelulwimi lwakho etimini leti-11.',
    step2Title: 'Tibuto Leticondzisako',
    step2Subtitle: 'Nika iminingwane kutaftisa basebenti bamasipala.',
    step3Title: 'Cacisa Indzawo ne-Pin yelibalave',
    step3Subtitle: 'Sesha ikheli noma uhambise i-pin kubalave te-Google.',
    step4Title: 'Kuhlatiya kwa-Groq Qwen AI',
    step4Subtitle: 'I-AI ikhipha iminingwane ibuye ihlole imibiko lefanako.',
    step5Title: 'Buyeketa Bese Utfumela',
    step5Subtitle: 'Qinisekisa ithikithi bese ulitfumela e-Supabase.',

    nextStep: 'Chubeka kulandzelako →',
    prevStep: '← Emuva',
    submitToSupabase: 'Tfumela ku-Supabase DB',
    runQwenAnalysis: 'Hlatiya nge-Groq Qwen AI',
    detectingLanguage: 'Ihlole lulwimi...',
    languageDetected: 'Lulwimi Lolutfolakele',

    addressLabel: 'Ikheli Lesigodzi',
    addressPlaceholder: 'isbr. 142 Jan Smuts Ave',
    suburbLabel: 'Indzawo / Lokishi',
    suburbPlaceholder: 'isbr. Sandton, Soweto',
    landmarkLabel: 'Indzawo Letatiwako Edvute',
    landmarkPlaceholder: 'isbr. Edvute neligala',
    dragPinInstruction: 'Cindzetela noma uhambise marker kubalave kukhetsa indzawo.',
    useCurrentGps: 'Sebentisa i-GPS Yami Yanyalo',

    catWaterLeak: 'Kuvuza kwanti / Ipayipi lelecaphukile',
    catElectricity: 'Kucima kwaggesi / Kwebiwa kwetintsambo',
    catPothole: 'Ingodzi emgwacweni',
    catDumping: 'Kulahla kudoti lekungemthetho',
    catSewage: 'Kukhuphuka kwesibi',
    catFallenTree: 'Sihlahla lesiwele phansi',
    catMissingManhole: 'Sivalo semanhole lesingekho',

    urgencyLow: 'Kutsatsa Kancane',
    urgencyMedium: 'Kutsatsa Emkhatsini',
    urgencyHigh: 'Simo Lesiphutfumako',

    statusOpen: 'Imbiko Levulekile',
    statusInProgress: 'Iyasebentiseka',
    statusResolved: 'Isacatululwe',
    statusDuplicate: 'Iphindviwe',
  },
  ve: {
    appTitle: 'Inzhini ya AI ya Masipala',
    appSubtitle: 'Muvhigo wa tshumelo nga nyambo dzoothe dza 11 dza Afrika Tshipembe',
    tabQuestionnaire: 'Muthusi wa Mbudziso wa AI',
    tabMap: 'Mavupa a Nyito',
    tabDatabase: 'Dathabeisi ya Supabase',
    tabPromptSpec: 'Ndila dza Qwen 2.5',
    aiEngineBadge: 'Groq Qwen 2.5 AI I khou Shuma',
    supabaseConnected: 'Supabase Yo Tumanedzwa',
    supabaseLocal: 'Dathabeisi ya Hayani',
    resetDatabase: 'Vuyedza DB',
    reportIncidentBtn: '+ Vhiga Thaidzo',

    step1Title: 'Luambo na Muvhigo wa U Thoma',
    step1Subtitle: 'Talutshedza thaidzo nga luambo lufhio na lufhio lwa 11.',
    step2Title: 'Mbudziso dza U Vha Vhulungeli',
    step2Subtitle: 'Nekedza zwidodombedzwa u thupha vhashumi vha masipala.',
    step3Title: 'Khakhathi ya Fhethu na Pin ya Mmapa',
    step3Subtitle: 'Toda diresi kana u kokodza pini kha mmapa wa Google.',
    step4Title: 'Tshenkhenyo ya Groq Qwen AI',
    step4Subtitle: 'AI i bvisa zwidodombedzwa ya sedza mivhigo i fanaho.',
    step5Title: 'Sedzulusa u Rumela',
    step5Subtitle: 'Tanganedza thekithe u e rumele kha Supabase.',

    nextStep: 'Bvela phanda →',
    prevStep: '← Murahu',
    submitToSupabase: 'Rumela kha Supabase DB',
    runQwenAnalysis: 'Toluwa nga Groq Qwen AI',
    detectingLanguage: 'I khou pfa luambo...',
    languageDetected: 'Luambo Lwo Wanala',

    addressLabel: 'Diresi ya Tshitarata',
    addressPlaceholder: 'tsum. 142 Jan Smuts Ave',
    suburbLabel: 'Khavhu / Motse',
    suburbPlaceholder: 'tsum. Sandton, Soweto',
    landmarkLabel: 'Fhethu Hano Divhea Tsini',
    landmarkPlaceholder: 'tsum. Tsini na garadji',
    dragPinInstruction: 'Kanya kana u kokodze pini kha mmapa u sumbedza fhethu.',
    useCurrentGps: 'Shumisa GPS ya Zwino',

    catWaterLeak: 'U bva ha madi / Phaiphi yo bvelelaho',
    catElectricity: 'Dzamusi la mudagasi / U tswa ha dzinthambo',
    catPothole: 'Mugodi ndilani',
    catDumping: 'U lata maratha u si mulayoni',
    catSewage: 'U elana ha tshila dza tshimbilani',
    catFallenTree: 'Me muri wo waho',
    catMissingManhole: 'Tshikhavho tsha manhole tshi si ho',

    urgencyLow: 'U Tavhanya Ku Thukhi',
    urgencyMedium: 'U Tavhanya Ha Vhukati',
    urgencyHigh: 'Shango la U Tavhanya Vhukuma',

    statusOpen: 'Muvhigo Wo Vulelaho',
    statusInProgress: 'I Khou Shumiwa',
    statusResolved: 'Dzo Lugiswa',
    statusDuplicate: 'Muvhigo Wo Vhavhalelwaho',
  },
  nr: {
    appTitle: 'Injini ye-AI kaMasipala',
    appSubtitle: 'Ukubikwa kwezinsiza ngamalimi woke am-11 womthetho eSewula Afrika',
    tabQuestionnaire: 'Umsizi wemibuzo ye-AI',
    tabMap: 'Imephe eyenzakalako',
    tabDatabase: 'Idatabase ye-Supabase',
    tabPromptSpec: 'Qwen 2.5 Specification',
    aiEngineBadge: 'Groq Qwen 2.5 AI Iyasebenza',
    supabaseConnected: 'I-Supabase Ihlanganisiwe',
    supabaseLocal: 'Idatabase yekhaya',
    resetDatabase: 'Reset DB',
    reportIncidentBtn: '+ Bika Inkinga',

    step1Title: 'Ilimi Nombiko Wokuthoma',
    step1Subtitle: 'Hlathulula inkinga ngelimi lakho elimini am-11.',
    step2Title: 'Imibuzo Eqondisako',
    step2Subtitle: 'Nika imininingwana ukusiza abasebenzi bakamasipala.',
    step3Title: 'Hlathulula Indawo ne-Pin ye-Map',
    step3Subtitle: 'Rhubulula ikheli namkha uhambise i-pin kumephe ye-Google.',
    step4Title: 'Ukuhlaziya kwe-Groq Qwen AI',
    step4Subtitle: 'I-AI ikhipha imininingwana beka ihlole imibiko efanako.',
    step5Title: 'Buyekeza Be Uthumele',
    step5Subtitle: 'Qinisekisa ithikithi be uyithumele ku-Supabase.',

    nextStep: 'Ragela phambili →',
    prevStep: '← Emva',
    submitToSupabase: 'Thumela ku-Supabase DB',
    runQwenAnalysis: 'Hlaziya nge-Groq Qwen AI',
    detectingLanguage: 'Irhubulula ilimi...',
    languageDetected: 'Ilimi Elifumanekileko',

    addressLabel: 'Ikheli Lesitaladi',
    addressPlaceholder: 'isb. 142 Jan Smuts Ave',
    suburbLabel: 'Indawo / Lokishi',
    suburbPlaceholder: 'isb. Sandton, Soweto',
    landmarkLabel: 'Indawo Eyaziwako Eduze',
    landmarkPlaceholder: 'isb. Eduze kwegaraji',
    dragPinInstruction: 'Ganda namkha uhambise i-marker kumephe ukukhetha indawo impela.',
    useCurrentGps: 'Sebenzisa i-GPS Yam yanje',

    catWaterLeak: 'Ukuvuza kwamanzi / Iphayiphi eliphulekileko',
    catElectricity: 'Ukucima gezi / Ukwebiwa kweentambo',
    catPothole: 'Umhadi endleleni',
    catDumping: 'Ukulahlwa kwendle okungasisemthethweni',
    catSewage: 'Ukukhuphuka kwesibi',
    catFallenTree: 'Isihlahla esiwele phansi',
    catMissingManhole: 'Isifonyo semanhole esingekho',

    urgencyLow: 'Ukurhaba Okuncani',
    urgencyMedium: 'Ukurhaba Okusemakhathini',
    urgencyHigh: 'Isimo Sokushesha Esikhulu',

    statusOpen: 'Ibiko Evulekileko',
    statusInProgress: 'Iyasetjenzwa',
    statusResolved: 'Isirarululiwe',
    statusDuplicate: 'Iphindwe kabili',
  },
};

// Client language detector based on SA language key phrases & words
export function detectSALanguage(text: string): SALanguageCode {
  if (!text || text.trim().length < 4) return 'en';

  const lower = text.toLowerCase();

  // isiZulu / isiXhosa / isiNdebele / siSwati key patterns
  if (/\b(amanzi|amanzi|indle|umgwaqo|imvura|inkinga|bika|ikheli|isikhashana|isihlahla|isimo|ipapa|umsebenzi)\b/i.test(lower)) {
    if (/\b(lulwimi|kutaftisa|kucala|lesiwele|lesingekho)\b/i.test(lower)) return 'ss';
    if (/\b(ilungana|isifonyo|ekhaya|isefeni|rhubulula)\b/i.test(lower)) return 'nr';
    if (/\b(ingxaki|idilesi|izonjululwe|isiciko|igodide)\b/i.test(lower)) return 'xh';
    return 'zu';
  }

  // Afrikaans key patterns
  if (/\b(water|krag|pad|slaggat|riool|boom|dringend|adres|straat|voorstad|baken|verslag|hulp|ons)\b/i.test(lower) && 
      /\b(die|is|het|nie|en|van|met|op|vir|om|geen)\b/i.test(lower)) {
    return 'af';
  }

  // Sepedi (Northern Sotho) / Setswana / Sesotho key patterns
  if (/\b(metsi|motlakase|tsela|go|lahla|peipi|masepala|sefeke|le|lephisa|dintlha|dipotso)\b/i.test(lower)) {
    if (/\b(dirisa|tswelela|setlhare|goti|sekhurumelo)\b/i.test(lower)) return 'tn';
    if (/\b(sebelisa|hlalosa|sephiri|moti|sekwahelo)\b/i.test(lower)) return 'st';
    return 'nso';
  }

  // Xitsonga key patterns
  if (/\b(mati|gezi|ndlela|godi|muri|mepe|ririmi|vuxokoxoko|swivutiso|yindjini)\b/i.test(lower)) {
    return 'ts';
  }

  // Tshivenda key patterns
  if (/\b(madi|mudagasi|ndila|mugodi|luambo|mmapa|masipala|tshila|muri|vhigo)\b/i.test(lower)) {
    return 've';
  }

  return 'en';
}

export function getTranslation(lang: SALanguageCode): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
