import { readFileSync, writeFileSync } from 'fs';

const companies = JSON.parse(readFileSync('src/data/companies.json', 'utf-8'));

// All data extracted from GÖSTA 2026 PDF catalog
const catalogData = {
  "akavia": {
    booth: 9,
    contacts: [{ name: "Axel Klofsten", role: "Kontaktperson", email: "axel.klofsten@akavia.se" }],
    description: "Akavia är fackförbundet för akademiker inom ekonomi, IT, juridik och samhällsvetenskap. Med 144 000 medlemmar erbjuder de karriärrådgivning, lönestatistik och juridisk hjälp. Som student kan du bli medlem kostnadsfritt och rivstarta din karriär.",
    seeking: ["Studentmedlemmar", "IT-akademiker"],
    hiringTypes: ["Extrajobb"],
  },
  "bots": {
    name: "Bots & friends",
    booth: 13,
    contacts: [{ name: "Lukas Fonsell", role: "Kontaktperson", email: "lukas.fonsell@bots.se" }],
    description: "Bots & friends är ett svenskt automationskonsultbolag som bygger 'Digitala Kollegor' – intelligenta automationslösningar med RPA. De hjälper organisationer inom finans, HR och offentlig sektor att automatisera arbetsflöden med Microsoft Power Platform och UiPath.",
    seeking: ["Utvecklare", "Automationskonsulter", "RPA-utvecklare"],
    tags: ["automation", "rpa", "power-platform", "ai", "tech"],
    hiringTypes: ["Heltid", "Deltid", "Examensarbete"],
  },
  "capgemini": {
    booth: 12,
    contacts: [{ name: "Ina Tran", role: "Rekryterare", email: "ina.tran@capgemini.com" }],
    description: "Capgemini är en global partner inom affärs- och teknikstransformation med 420 000 medarbetare i 50+ länder. De levererar AI-drivna lösningar inom strategi, teknik, design och verksamhet. I Sverige kör de IgnITe Graduate Program – ett 12 månaders traineeprogram.",
    hiringTypes: ["Trainee (IgnITe Program)"],
  },
  "centiro": {
    booth: 2,
    contacts: [{ name: "Nino Muftic", role: "HR", email: "hr@centiro.com" }],
    description: "Centiro är ett globalt techbolag med 650+ medarbetare i 8 länder. Deras plattform gör leveransnätverk smartare – leveranser spåras och kontrolleras i 175+ länder. Great Place to Work sedan 2010. Platt organisation där allas åsikt räknas.",
    hiringTypes: ["Heltid", "Sommarjobb", "Praktik", "Examensarbete"],
  },
  "cgi": {
    booth: 8,
    contacts: [{ name: "Elin Varga", role: "Talent Acquisition", email: "elin.varga@cgi.com" }],
    description: "CGI är ett av världens största IT- och managementkonsultbolag med 90 000+ medarbetare i 40+ länder. I Sverige har de 3 800 anställda och erbjuder talangprogrammet 'Selected'. Platt organisation med stort ansvar redan som junior. Alla anställda kan bli delägare via Share Partner Program.",
    hiringTypes: ["Heltid"],
  },
  "deloitte": {
    booth: 30,
    contacts: [{ name: "Dennis Leach", role: "Rekryterare", email: "deleach@deloitte.se" }],
    description: "Deloitte är en global ledare inom konsulttjänster med 470 000+ medarbetare i 150+ länder. De erbjuder revision, rådgivning, cybersecurity och tech-consulting. I Sverige 1 800 anställda. Lunchföreläsning om cybersecurity på GÖSTA!",
    website: "https://deloitte.se/student",
    hiringTypes: ["Deltid"],
  },
  "dirsys": {
    booth: 11,
    contacts: [{ name: "Malin Rosenqvist", role: "Kontaktperson", email: "malin.rosenqvist@dirsys.com" }],
    description: "DirSys hjälper kunder navigera IT- och cybersäkerhetslandskapet. Deras egenutvecklade SaaS-plattform ger organisationer realtidsöverblick över cyberrisk och säkerhetsstatus. 12 anställda – litet bolag med stort inflytande och direkt påverkan.",
    seeking: ["Utvecklare", "IT-konsulter", "Cybersäkerhetsspecialister"],
    tags: ["cybersecurity", "saas", "plattform", "säkerhet"],
    hiringTypes: ["Heltid", "Deltid", "Examensarbete"],
  },
  "enqore": {
    booth: 33,
    contacts: [{ name: "Maja Nilsson", role: "Kontaktperson", email: "maja.nilsson@enqore.se" }],
    description: "Enqore är summan av Two och Absfront – specialister på ERP, avancerad dataanalys och CRM. De kombinerar hela bredden av Microsofts affärsapplikationer med djup affärsinsikt och starka kapabiliteter inom dataanalys och systemintegration. Nu lanseras deras första traineeprogram!",
    seeking: ["Traineer", "ERP-konsulter", "CRM-utvecklare", "Dataanalytiker"],
    tags: ["erp", "crm", "microsoft", "data", "trainee"],
    hiringTypes: ["Trainee"],
  },
  "ericsson": {
    booth: 4,
    contacts: [{ name: "Victoria Halvardsson", role: "Studentrekrytering", email: "student.sweden@ericsson.com" }],
    description: "Ericsson uppfann mobilen, Bluetooth och alla G:n (3G, 4G, 5G). Med nästan 150 års historia och 60 000+ patent arbetar 100 000+ medarbetare i 180 länder. I Sverige 13 000 anställda. Teknik som miljarder människor förlitar sig på varje dag.",
    hiringTypes: ["Heltid", "Deltid", "Sommarjobb", "Praktik", "Trainee", "Examensarbete"],
  },
  "evidi": {
    booth: 21,
    contacts: [{ name: "Ida Thedin", role: "Rekryterare", email: "ida.thedin@evidi.com" }],
    description: "Evidi skapar digital affärsnytta med mänskligt värde. Som Nordens ledande Microsoft-partner levererar de CRM, ERP, Power Platform, Azure och säkerhet. 100 anställda i Sverige, 350 i Norden. Modern teknik, inte legacy-lösningar.",
    hiringTypes: ["Heltid"],
  },
  "exsitec": {
    booth: 15,
    contacts: [{ name: "Kajsa Thorsen", role: "Rekryterare", email: "kajsa.thorsen@exsitec.se" }],
    description: "Exsitec är ett nordiskt IT-konsultbolag med 450 anställda som specialiserar sig på affärssystem, digitalisering och datadrivna lösningar. Kör ett av Nordens största traineeprogram – deras VD Niklas Ek började själv som trainee för bara 10 år sedan!",
    hiringTypes: ["Heltid", "Deltid", "Sommarjobb", "Praktik", "Examensarbete", "Trainee"],
  },
  "st": {
    booth: 1,
    contacts: [{ name: "Leelou Lewis", role: "Kontaktperson", email: "leelou.lewis@st.org" }],
    description: "Fackförbundet ST har i över 100 år varit experter på det statliga uppdraget. Genom rättssäker handläggning, forskning och utbildning bidrar medlemmarna till ett samhälle för alla. 100 000+ medlemmar. Studentmedlemskap är gratis och ger stöd genom hela arbetslivet.",
    hiringTypes: [],
  },
  "hogia": {
    booth: 14,
    contacts: [{ name: "Malin Bergström", role: "Rekryterare", email: "malin.bergstrom@hogia.se" }],
    description: "Hogia-gruppen har 650 medarbetare med huvudkontor i Stenungsund. Tre affärsområden: ekonomi/affärssystem, HR-system och transportsystem. Visste du att ~90% av alla kollektivtrafikresenärer i Sverige får reseinformation via ett Hogia-system? 4 miljoner resor hanteras dagligen!",
    hiringTypes: ["Heltid"],
  },
  "kpmg": {
    booth: 27,
    contacts: [{ name: "Robin Andreasson", role: "Rekryterare", email: "robin.andreasson@kpmg.se" }],
    description: "KPMG är ledande inom revision, rådgivning och skatt med 2 000 anställda i Sverige och 276 000 globalt. Deras IT-tjänster inkluderar Cyber Security, ServiceNow, IT-revision och Technology Transformation. Kul fakta: KPMG har ett Guinness-rekord för världens största cybersäkerhetslektion!",
    hiringTypes: ["Heltid", "Deltid", "Sommarjobb", "Praktik", "Trainee", "Examensarbete"],
  },
  "lime-technologies": {
    booth: 5,
    contacts: [{ name: "Therese Boutayeb", role: "Rekryterare", email: "therese.boutayeb@lime.tech" }],
    description: "Lime Technologies har i 30+ år byggt användarvänliga CRM-lösningar som de utvecklar, säljer och supportar själva. 500 medarbetare, ledande CRM-leverantör i Norden. Grundades av 3 studenter i en källare i Lund 1990. Tar in nya traineer två gånger per år.",
    website: "https://lime.tech",
    hiringTypes: ["Trainee"],
  },
  "lansstyrelserna": {
    booth: 16,
    contacts: [{ name: "Carmen Claesson", role: "Rekryterare", email: "carmen.claesson@lansstyrelsen.se" }],
    description: "Länsstyrelsernas IT-avdelning utvecklas för att möta digitaliseringsbehoven hos alla 21 länsstyrelser. De stödjer demokrati, hållbarhet och säkerhet i samhället. Jobbar med IT-säkerhet, systemutveckling, automation och integration. Central roll i Sveriges civila försvar.",
    hiringTypes: ["Heltid", "Sommarjobb", "Praktik"],
  },
  "new-minds": {
    booth: 24,
    contacts: [{ name: "Olivia Lilja", role: "Rekryterare", email: "olivia.lilja@newminds.se" }],
    description: "New Minds grundades för att erbjuda ingenjörer en mer personlig rekryteringsupplevelse. Genom att fokusera på dina mål, motivationer och värderingar hjälper de dig hitta rätt roll och rätt arbetsgivare. 40 anställda med starkt fokus på kvalitet och långsiktiga relationer.",
    seeking: ["IT-konsulter", "Utvecklare", "Systemutvecklare"],
    tags: ["rekrytering", "konsult", "it", "karriär"],
    hiringTypes: ["Heltid", "Examensarbete"],
  },
  "peab": {
    booth: 29,
    contacts: [{ name: "Karl-Viktor Pettersson", role: "IT-rekryterare", email: "karl-viktor.pettersson@peab.se" }],
    description: "PEAB är Nordens ledande bygg- och anläggningsföretag med 13 000 medarbetare. PEAB IT använder modern molnteknik, AI, IoT och cybersäkerhet. De digitaliserar byggindustrin med cloud/hybrid-tjänster och state-of-the-art säkerhetslösningar.",
    hiringTypes: ["Heltid", "Sommarjobb", "Praktik", "Examensarbete"],
  },
  "redeploy": {
    booth: 19,
    contacts: [{ name: "Francisca Andersson", role: "Rekryterare", email: "francisca.andersson@redeploy.com" }],
    description: "Redeploy är ett techkonsultbolag inom Cloud, Data och AI. De designar, bygger, skalar och underhåller moderna lösningar och är partner med Microsoft, AWS och Databricks. 100 anställda med fokus på ny teknik, hög teknisk standard och ägarskap.",
    seeking: ["Cloud Engineers", "Data Engineers", "AI-specialister", "Utvecklare"],
    tags: ["cloud", "data", "ai", "konsult", "aws", "azure"],
    hiringTypes: ["Heltid", "Sommarjobb", "Praktik", "Examensarbete"],
  },
  "security-solution": {
    booth: 26,
    contacts: [{ name: "Anders Möller", role: "Kontaktperson", email: "info@securitysolution.se" }],
    description: "Security Solution (del av Aderian Group) är ett konsultbolag specialiserat på informationssäkerhet, dataskydd, riskhantering och säkerhetsskydd. Grundat 2008, 750 anställda. Seniora konsulter med bred kompetens som skräddarsyr lösningar för långsiktiga partnerskap.",
    seeking: ["Informationssäkerhetskonsulter", "Riskhanteringskonsulter", "Dataskyddsspecialister"],
    tags: ["informationssäkerhet", "dataskydd", "riskhantering", "konsult"],
    hiringTypes: ["Heltid", "Trainee", "Examensarbete"],
  },
  "sendify": {
    booth: 20,
    contacts: [{ name: "Erik Öhrn", role: "Kontaktperson", email: "erik.ohrn@sendify.com" }],
    description: "Sendify är ett Göteborgsbaserat logtech-bolag med 62 anställda. Deras plattform hjälper företag att jämföra, boka och hantera frakter. Integrerar med affärssystem och webshoppar. Bygger API:er och integrationer som gör komplex logistik snabb och enkel.",
    hiringTypes: ["Heltid", "Sommarjobb", "Praktik"],
  },
  "skatteverket": {
    booth: 25,
    contacts: [{ name: "Jörgen Hansson", role: "Rekryterare", email: "jorgen.hansson@skatteverket.se" }],
    description: "Skatteverkets IT-avdelning har 1 700+ medarbetare som utvecklar och driftar system som berör alla i Sverige. Med den senaste tekniken bygger de ett fungerande samhälle. Nyexad inom IT? Deras traineeprogram är ett bra sätt att prova på många roller.",
    website: "https://skatteverket.se/traineeprogram",
    hiringTypes: ["Heltid", "Trainee", "Examensarbete"],
  },
  "sopra-steria": {
    booth: 17,
    contacts: [{ name: "Elin Jerström", role: "Rekryterare", email: "elin.jerstroem@soprasteria.com" }],
    description: "Sopra Steria är ett av Europas ledande konsultbolag inom digital transformation med 50 000+ medarbetare. 600 i Sverige. Great Place to Work år efter år. Deras Accelerate Program ger nyexade en flygande start i konsultkarriären med lön från dag ett.",
    hiringTypes: ["Heltid", "Trainee (Accelerate Program)"],
  },
  "stretch-evolve": {
    booth: 22,
    contacts: [{ name: "Ulrica Wincent", role: "Kontaktperson", email: "ulrica.wincent@stretch.se" }],
    description: "Stretch Evolve är SAP Gold Partner sedan 20+ år med 100 specialister. De hjälper företag med SAP-implementationer, modernisering av affärssystem och processutveckling. Agilt, kundnära och med direkta resultat. Fredagsfrukost, quiz-kvällar och Stafettvasan varje år!",
    seeking: ["SAP-konsulter", "Utvecklare", "Affärssystemskonsulter"],
    tags: ["sap", "erp", "affärssystem", "konsult"],
    website: "https://stretch.se",
    hiringTypes: [],
  },
  "trafikverket": {
    booth: 10,
    contacts: [{ name: "Kent Vahlén", role: "Rekryterare", email: "kent.vahlen@trafikverket.se" }],
    description: "Trafikverkets vision: 'Alla kommer fram smidigt, grönt och tryggt.' 12 000 medarbetare som ansvarar för alla trafikslag – tåg, väg, sjö och flyg. Jobbar med digitalisering och hållbar tillgänglighet. En av Sveriges största rederier!",
    hiringTypes: ["Heltid", "Deltid", "Sommarjobb", "Praktik", "Trainee", "Examensarbete"],
  },
  "tullverket": {
    booth: 7,
    contacts: [{ name: "Christina Medin", role: "Rekryterare", email: "christina.medin@tullverket.se" }],
    description: "Tullverkets IT-avdelning är tekniskt avancerad och satsar hårt på digitalisering. 350 IT-medarbetare i Luleå – norra Sveriges största IT-arbetsgivare. Tillsammans med EU digitaliseras alla tullprocesser – en stor transformation med många möjligheter.",
    hiringTypes: ["Heltid", "Trainee"],
  },
  "twoday": {
    name: "Twoday INSIKT",
    booth: 6,
    contacts: [{ name: "Tintin Almqvist", role: "Rekryterare", email: "tintin.almqvist@twoday.com" }],
    description: "Twoday INSIKT specialiserar sig på data, analytics och datadrivet beslutsfattande. De hjälper organisationer att omvandla komplex data till tydliga insikter. 90 anställda i Sverige. Erbjuder 'Hive Jumping' – jobba från valfritt twoday-land!",
    hiringTypes: ["Heltid", "Trainee"],
  },
  "unionen-student": {
    booth: 23,
    contacts: [{ name: "Julia Engman", role: "Kontaktperson", email: "julia.engman@unionen.se" }],
    description: "Unionen är Sveriges största fackförbund på privata arbetsmarknaden med 700 000 medlemmar. Gratis studentmedlemskap med CV-hjälp, karriärrådgivning och rabatter. 96% rabatt på medlemsavgiften hela första året efter examen!",
    hiringTypes: [],
  },
  "webbhuset": {
    booth: 18,
    contacts: [{ name: "Johanna Book", role: "Kontaktperson", email: "johanna@webbhuset.se" }],
    description: "Webbhuset är en e-handelspartner med 30 års erfarenhet som bygger skräddarsydda lösningar för ambitiösa företag. Utvecklar i det funktionella programmeringsspråket Elm. 20 anställda. CTO nominerad till 'CTO of the Year' 2023. Har en kontorshund som heter Fisk!",
    seeking: ["Utvecklare", "E-handelsutvecklare", "Elm-utvecklare"],
    tags: ["e-handel", "elm", "frontend", "webbutveckling"],
    hiringTypes: ["Heltid", "Examensarbete"],
  },
  "xenit": {
    booth: 3,
    contacts: [{ name: "Carl Ekener", role: "Rekryterare", email: "carl.ekener@xenit.se" }],
    description: "Xenit är ett tillväxtbolag med 140 tekniskt kompetenta medarbetare som vill vara Sveriges snällaste och mest kompetenta molnpartner. Utnämnda till Karriärföretag tre år i rad. Tydliga karriärvägar, innovativa lösningar och en värdriven kultur med Microsoft-teknik.",
    hiringTypes: ["Heltid"],
  },
};

let updated = 0;
for (const company of companies) {
  const data = catalogData[company.id];
  if (!data) {
    console.log(`No catalog data for: ${company.id}`);
    continue;
  }

  // Update name if different
  if (data.name) company.name = data.name;

  // Add booth number
  if (data.booth) company.booth = data.booth;

  // Update contacts
  if (data.contacts) company.contacts = data.contacts;

  // Update description from catalog
  if (data.description) company.description = data.description;

  // Update seeking if provided
  if (data.seeking) company.seeking = data.seeking;

  // Update tags if provided
  if (data.tags) company.tags = data.tags;

  // Update website if provided
  if (data.website) company.website = data.website;

  updated++;
}

writeFileSync('src/data/companies.json', JSON.stringify(companies, null, 2) + '\n');
console.log(`Updated ${updated}/${companies.length} companies with catalog data`);
