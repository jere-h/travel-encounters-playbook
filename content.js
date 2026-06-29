// content.js — Travel Encounters Playbook authoritative content bundle.
//
// This ES module is the single source of truth for what the app shows. It is
// imported by app.js (to render the overview + step-through views) and by the
// dev-only validate-content.mjs script (to gate field presence at deploy time).
//
// The app is built for NEURODIVERGENT travelers who want to (a) know exactly
// what will happen before it happens, and (b) jump straight to the moment they
// are in right now. Two structures serve that: per-situation `summary`/`expect`
// (the "what to expect" overview) and per-step `title`/`yourTurn` (a scannable,
// jumpable step list + a clear "do I need to act here?" marker).
//
// Data shape (the contract every screen and the validator depend on):
//
//   export const situations = {
//     <situationId>: {
//       label:   string,        // display name shown on the situation card
//       summary: string,        // REQUIRED — one sentence: the whole arc, start to finish
//       expect:  string[],      // REQUIRED — 2–5 short "what to expect" heads-up lines
//       steps:   Step[]         // 6–12 ordered steps; soft bound, not enforced
//     }
//   }
//
//   Step = {
//     title:              string,  // REQUIRED — short scannable label for the jump list
//     yourTurn:           boolean, // REQUIRED — true if YOU must say/decide/do something
//                                  //            here; false if you can just observe/receive
//     whatHappens:        string,  // REQUIRED — plain-English "what's going on"
//     staffPhraseRomaji:  string,  // REQUIRED — what staff likely say, romaji
//     staffPhraseKanji:   string,  // REQUIRED — same, in kana/kanji
//     visitorResponse:    string,  // REQUIRED — what YOU can say/do back
//     tip?:               string   // OPTIONAL — cultural note; non-empty if present
//   }
//
//   export const rescuePhrases = RescuePhrase[]   // always-available anchor lines
//   RescuePhrase = { en: string, romaji: string, kanji: string }  // all REQUIRED
//
// situations MUST have EXACTLY these three keys:
//   'convenience_store' | 'izakaya' | 'ramen_ticket_machine'
//
// SITUATION_ORDER fixes the situation-card order. Tokyo is the current scope.
//
// IMPORTANT — correctness vs. presence: this file is authored for a first-time
// traveler and is intentionally informal/approximate. The validator checks only
// that REQUIRED fields are present and well-shaped — NOT that the Japanese is
// correct. Correctness (including the Japanese in `rescuePhrases`) is the
// native-speaker review's job (see content/REVIEW.md).

export const SITUATION_ORDER = ['convenience_store', 'izakaya', 'ramen_ticket_machine'];

// Always-available "rescue" phrases — situation-independent anchor lines for when
// an interaction goes off-script. Reachable from every screen via the Phrases
// button. The Japanese here is subject to the same review gate as `situations`.
export const rescuePhrases = [
  {
    en: 'Excuse me / Sorry',
    romaji: 'Sumimasen',
    kanji: 'すみません'
  },
  {
    en: 'Please wait a moment',
    romaji: 'Chotto matte kudasai',
    kanji: 'ちょっと待ってください'
  },
  {
    en: "I don't understand",
    romaji: 'Wakarimasen',
    kanji: 'わかりません'
  },
  {
    en: 'Do you speak English?',
    romaji: 'Eigo wa hanasemasu ka?',
    kanji: '英語は話せますか？'
  },
  {
    en: "I'm fine / No thank you",
    romaji: 'Daijoubu desu',
    kanji: '大丈夫です'
  },
  {
    en: 'Thank you',
    romaji: 'Arigatou gozaimasu',
    kanji: 'ありがとうございます'
  }
];

export const situations = {
  convenience_store: {
    label: 'Convenience Store',
    summary:
      'You bring your items to the counter; the clerk scans them, asks a few quick yes/no questions (heating, utensils, a bag), tells you the total, you pay, and you take your change and receipt.',
    expect: [
      'Quick — usually under two minutes.',
      'The clerk will say "irasshaimase" (welcome) the moment you walk in. It is not a question and needs no reply.',
      'You will get a short run of yes/no questions: heating, chopsticks, a bag.',
      'Pay by placing cash in the small tray, or tap an IC card. No tipping, anywhere.'
    ],
    steps: [
      {
        title: 'Greeting at the counter',
        yourTurn: false,
        whatHappens:
          'You bring your items to the counter and set them down. The clerk greets you and starts scanning. You do not need to say anything yet — a nod or a small "hello" is plenty.',
        staffPhraseRomaji: 'Irasshaimase. Konnichiwa.',
        staffPhraseKanji: 'いらっしゃいませ。こんにちは。',
        visitorResponse: 'Smile and nod, or say: "Konnichiwa." (こんにちは.)',
        tip:
          '"Irasshaimase" is just "welcome." It is not a question and needs no reply — staff say it to everyone who walks in.'
      },
      {
        title: 'Heat up the food?',
        yourTurn: true,
        whatHappens:
          'The clerk asks if you would like your hot food or boxed meal heated up in the microwave. This is very common for bento, buns, and fried chicken.',
        staffPhraseRomaji: 'Atatamemasu ka?',
        staffPhraseKanji: '温めますか？',
        visitorResponse:
          'Yes please: "Hai, onegaishimasu." (はい、お願いします.)  No thanks: "Daijoubu desu." (大丈夫です.)',
        tip:
          '"Daijoubu desu" politely means "I\'m fine / no need" here. A small wave of the hand reads as "no thanks" too.'
      },
      {
        title: 'Chopsticks or a spoon?',
        yourTurn: true,
        whatHappens:
          'If you bought a hot drink and a cold item, or chopsticks/a spoon are needed, the clerk may ask whether to bag them together or which utensil you want.',
        staffPhraseRomaji: 'Ohashi wa otsuke shimasu ka?',
        staffPhraseKanji: 'お箸はお付けしますか？',
        visitorResponse:
          'Yes: "Hai, onegaishimasu." (はい、お願いします.)  No: "Iie, daijoubu desu." (いいえ、大丈夫です.)',
        tip:
          'For a spoon say "supuun" (スプーン); for a fork say "fooku" (フォーク). They are usually free with food.'
      },
      {
        title: 'Do you need a bag?',
        yourTurn: true,
        whatHappens:
          'The clerk asks if you need a shopping bag. Bags are no longer automatic in Japan and usually cost a few yen.',
        staffPhraseRomaji: 'Fukuro wa irimasu ka?',
        staffPhraseKanji: '袋はいりますか？',
        visitorResponse:
          'Yes: "Hai, onegaishimasu." (はい、お願いします.)  No: "Iie, kekkou desu." (いいえ、結構です.)',
        tip:
          'A bag is typically 3–5 yen. If you have your own bag, hold it up — that is understood as "no bag needed."'
      },
      {
        title: 'The total',
        yourTurn: false,
        whatHappens:
          'The clerk tells you the total and gestures to the payment area. A small lit-up screen also shows the number.',
        staffPhraseRomaji: 'Goukei … en ni narimasu.',
        staffPhraseKanji: '合計　…　円になります。',
        visitorResponse:
          'Glance at the screen for the number. To confirm you understand: "Hai." (はい.)',
        tip:
          'You do not need to understand the spoken number — the amount always appears on the little display by the register.'
      },
      {
        title: 'Paying',
        yourTurn: true,
        whatHappens:
          'There is usually a small tray on the counter. For cash, place your money in the tray rather than into the clerk\'s hand. For card or IC, tap or insert at the reader.',
        staffPhraseRomaji: 'Okaikei wa torei ni onegaishimasu.',
        staffPhraseKanji: 'お会計はトレイにお願いします。',
        visitorResponse:
          'Set cash in the tray, or say: "Kaado de." (カードで.) / "IC de." (ICで.) and tap your card.',
        tip:
          'IC cards like Suica/Pasmo work at every convenience store — just tap and wait for the beep.'
      },
      {
        title: 'Change & receipt — done',
        yourTurn: false,
        whatHappens:
          'The clerk counts your change back, hands you the receipt and your bag, and thanks you. You are done.',
        staffPhraseRomaji: 'Otsuri to reshiito desu. Arigatou gozaimashita.',
        staffPhraseKanji: 'お釣りとレシートです。ありがとうございました。',
        visitorResponse:
          'Take your things and say: "Arigatou gozaimasu." (ありがとうございます.)',
        tip:
          'It is normal — and polite — to receive change and items with both hands. No tipping anywhere in Japan.'
      }
    ]
  },

  izakaya: {
    label: 'Izakaya (Pub-Restaurant)',
    summary:
      'A server seats you, brings a small unrequested appetizer (otoshi) and takes your drink order; you order shareable dishes as you go, then ask for the bill and usually pay at the front register.',
    expect: [
      'Relaxed and often loud — you can stay a while; there is no rush.',
      'A small dish (otoshi) you did not order will appear. It is a normal seat charge (~300–600 yen) and cannot be declined.',
      'Dishes are meant to be shared and arrive whenever they are ready, not in courses.',
      'You usually pay at the register by the entrance, not at the table. Some smaller places are cash-only.'
    ],
    steps: [
      {
        title: 'How many people?',
        yourTurn: true,
        whatHappens:
          'You step in and a server greets you and asks how many people are in your group. Hold up fingers to answer — it always works.',
        staffPhraseRomaji: 'Irasshaimase. Nanmei-sama desu ka?',
        staffPhraseKanji: 'いらっしゃいませ。何名様ですか？',
        visitorResponse:
          'Hold up fingers, or say the count: "Hitori" (一人 = 1), "Futari" (二人 = 2).',
        tip:
          'For 3+ people you can just hold up fingers. Counting words get tricky, so fingers are the safe move.'
      },
      {
        title: 'Counter or table?',
        yourTurn: true,
        whatHappens:
          'The server leads you to a table or counter seat. They may ask if a counter seat or a table is okay, especially if it is busy.',
        staffPhraseRomaji: 'Kauntaa-seki demo yoroshii desu ka?',
        staffPhraseKanji: 'カウンター席でもよろしいですか？',
        visitorResponse: 'Fine: "Hai, daijoubu desu." (はい、大丈夫です.)',
        tip:
          'Counter seats are great for solo diners — you can watch the cooking and it is easy to order.'
      },
      {
        title: 'Your first drink',
        yourTurn: true,
        whatHappens:
          'Soon after sitting, the server brings a small dish you did not order and asks for your first drink. The small dish is "otoshi," a seat-charge appetizer.',
        staffPhraseRomaji: 'Onomimono wa nani ni nasaimasu ka?',
        staffPhraseKanji: 'お飲み物は何になさいますか？',
        visitorResponse:
          'A beer: "Biiru o onegaishimasu." (ビールをお願いします.)  Water: "Omizu o onegaishimasu." (お水をお願いします.)',
        tip:
          'Most izakaya start with everyone ordering a drink. A common toast before drinking is "Kanpai!" (乾杯！ = cheers).'
      },
      {
        title: 'The otoshi appetizer',
        yourTurn: false,
        whatHappens:
          'The "otoshi" appetizer appears on your bill as a small fee (often 300–600 yen per person). It is normal and not a scam — think of it as a table charge.',
        staffPhraseRomaji: 'Kochira otoshi desu.',
        staffPhraseKanji: 'こちらお通しです。',
        visitorResponse: 'Just receive it and say: "Arigatou." (ありがとう.)',
        tip:
          'You generally cannot decline the otoshi — it covers your seat. It is part of the izakaya experience.'
      },
      {
        title: 'Ordering food',
        yourTurn: true,
        whatHappens:
          'When you are ready to order food, get the server\'s attention. In many izakaya it is fine to call out politely or press a call button on the table.',
        staffPhraseRomaji: 'Sumimasen, chuumon onegaishimasu.',
        staffPhraseKanji: 'すみません、注文お願いします。',
        visitorResponse:
          'Raise a hand and say: "Sumimasen!" (すみません！) then point at the menu and say "Kore o onegaishimasu." (これをお願いします.)',
        tip:
          '"Sumimasen" is your all-purpose "excuse me." Pointing at the menu plus "kore" (this) gets you almost anything.'
      },
      {
        title: 'Dishes arrive',
        yourTurn: false,
        whatHappens:
          'Dishes are meant to be shared and arrive whenever they are ready, not in courses. The server may set a plate down and name it.',
        staffPhraseRomaji: 'Omatase shimashita.',
        staffPhraseKanji: 'お待たせしました。',
        visitorResponse: 'Say: "Arigatou gozaimasu." (ありがとうございます.)',
        tip:
          'Order a few small plates to start and add more as you go — that is how izakaya are designed to work.'
      },
      {
        title: 'Ask for the bill',
        yourTurn: true,
        whatHappens:
          'You are full and want the bill. At many izakaya you pay at the front register, not the table. Ask the server for the check.',
        staffPhraseRomaji: 'Okaikei onegaishimasu.',
        staffPhraseKanji: 'お会計お願いします。',
        visitorResponse:
          'Catch the server: "Sumimasen, okaikei onegaishimasu." (すみません、お会計お願いします.)',
        tip:
          'Crossing your two index fingers into an "X" is a common gesture that means "check, please."'
      },
      {
        title: 'Pay at the register',
        yourTurn: true,
        whatHappens:
          'The server brings a small slip or directs you to the register at the entrance. You take the slip there and pay.',
        staffPhraseRomaji: 'Otsutae no hou de oshiharai onegaishimasu.',
        staffPhraseKanji: 'お会計はレジでお願いします。',
        visitorResponse:
          'Bring the slip to the front. Card: "Kaado wa tsukaemasu ka?" (カードは使えますか？ = can I use card?)',
        tip:
          'Smaller izakaya may be cash-only — it is wise to carry some yen. No tipping; the price on the slip is the price.'
      },
      {
        title: 'Leaving',
        yourTurn: false,
        whatHappens:
          'You pay, they thank you warmly, and you head out. A friendly farewell as you leave is normal.',
        staffPhraseRomaji: 'Arigatou gozaimashita. Mata okoshi kudasaimase.',
        staffPhraseKanji: 'ありがとうございました。またお越しくださいませ。',
        visitorResponse:
          'Say: "Gochisousama deshita." (ごちそうさまでした = thank you for the meal.)',
        tip:
          '"Gochisousama deshita" after eating is a small kindness that staff really appreciate.'
      }
    ]
  },

  ramen_ticket_machine: {
    label: 'Ramen Ticket Machine',
    summary:
      'You buy a meal ticket from a vending machine by the door first, hand the ticket to staff, answer a couple of quick questions about your noodles, then eat — there is no bill at the end.',
    expect: [
      'You pay first at the machine, before you sit down.',
      'Have a 1000-yen note ready — older machines do not take 5000 or 10000-yen bills.',
      'Staff may ask noodle firmness or broth strength — "futsuu" (normal) is always a safe answer.',
      'No bill at the end — the ticket was your payment. Slurping the noodles is welcome.'
    ],
    steps: [
      {
        title: 'Buy a ticket first',
        yourTurn: false,
        whatHappens:
          'Many ramen shops have a vending-style ticket machine near the door. You order and pay there FIRST, then hand the ticket to staff. The staff may point you to it.',
        staffPhraseRomaji: 'Saki ni shokkenki de onegaishimasu.',
        staffPhraseKanji: '先に食券機でお願いします。',
        visitorResponse:
          'Nod and step to the machine. If unsure, ask: "Koko de kaimasu ka?" (ここで買いますか？ = do I buy here?)',
        tip:
          'Buying first is the norm at ticket-machine shops — it keeps the line moving and the kitchen busy.'
      },
      {
        title: 'Insert your money',
        yourTurn: true,
        whatHappens:
          'Insert your money first. The machine usually takes coins and 1000-yen notes; some take larger bills or IC cards. Buttons light up once enough money is in.',
        staffPhraseRomaji: 'Osaki ni okane o irete kudasai.',
        staffPhraseKanji: 'お先にお金を入れてください。',
        visitorResponse:
          'Feed in coins or a 1000-yen note. Watch for the buttons to light up.',
        tip:
          'Have a 1000-yen note ready — older machines do not take 5000 or 10000-yen bills.'
      },
      {
        title: 'Choose your bowl',
        yourTurn: true,
        whatHappens:
          'Pick your bowl. The big top buttons are usually the main ramen. Pictures often help; the top-left button is frequently the shop\'s signature bowl.',
        staffPhraseRomaji: 'Ramen wa hidari-ue no botan desu.',
        staffPhraseKanji: 'ラーメンは左上のボタンです。',
        visitorResponse:
          'Press the button for the bowl you want. If you cannot read it, point and ask staff: "Kore wa nan desu ka?" (これは何ですか？)',
        tip:
          'When in doubt, choose the top-left button — it is very often the house special the shop is known for.'
      },
      {
        title: 'Add toppings (optional)',
        yourTurn: true,
        whatHappens:
          'Optional add-ons (toppings) have their own buttons: extra egg, extra pork (chashu), extra noodles, nori seaweed, corn. Press any you want; each prints its own ticket.',
        staffPhraseRomaji: 'Toppingu mo erabemasu.',
        staffPhraseKanji: 'トッピングも選べます。',
        visitorResponse:
          'Press topping buttons if you like. Common: "tamago" (egg, 玉子), "chashu" (pork, チャーシュー).',
        tip:
          'Toppings are optional — you can skip them all. "Nori" (海苔) is seaweed; "menma" (メンマ) is bamboo shoots.'
      },
      {
        title: 'Take tickets & change',
        yourTurn: true,
        whatHappens:
          'The machine prints one small paper ticket per item and returns your change. Take all the tickets and your coins.',
        staffPhraseRomaji: 'Shokken to otsuri o otori kudasai.',
        staffPhraseKanji: '食券とお釣りをお取りください。',
        visitorResponse: 'Collect every ticket and your change from the slots.',
        tip:
          'Grab change from the lower tray and tickets from the dispenser — it is easy to forget the change, so check both.'
      },
      {
        title: 'Hand over tickets',
        yourTurn: true,
        whatHappens:
          'Take a seat (often a counter) and hand your tickets to the staff, or place them on the counter where indicated. They may ask how firm you want the noodles.',
        staffPhraseRomaji: 'Menno katasa wa dou shimasu ka?',
        staffPhraseKanji: '麺の硬さはどうしますか？',
        visitorResponse:
          'Normal is fine: "Futsuu de." (普通で.)  Firmer: "Katame de." (硬めで.)  Softer: "Yawarakame de." (柔らかめで.)',
        tip:
          'If you are not sure, "futsuu" (normal) is always a safe answer. Not every shop asks this.'
      },
      {
        title: 'Broth & garlic',
        yourTurn: true,
        whatHappens:
          'Some shops also ask about broth richness or garlic. A simple "normal / standard" answer keeps it easy.',
        staffPhraseRomaji: 'Aji no ko_sa wa ikaga shimasu ka?',
        staffPhraseKanji: '味の濃さはいかがしますか？',
        visitorResponse: 'Standard: "Futsuu de onegaishimasu." (普通でお願いします.)',
        tip:
          'For garlic ("ninniku", にんにく) you can say "sukoshi" (少し = a little) or "nashi de" (なしで = none).'
      },
      {
        title: 'Your bowl arrives',
        yourTurn: false,
        whatHappens:
          'Your bowl is served, usually quickly. Staff set it down and may say "enjoy." Slurping the noodles is welcome and considered normal here.',
        staffPhraseRomaji: 'Omatase shimashita. Douzo.',
        staffPhraseKanji: 'お待たせしました。どうぞ。',
        visitorResponse:
          'Say: "Arigatou gozaimasu." (ありがとうございます.) before you dig in.',
        tip:
          'Slurping is fine and even shows you are enjoying it. Eat fairly promptly so the noodles stay firm.'
      },
      {
        title: 'Finishing & leaving',
        yourTurn: false,
        whatHappens:
          'You already paid at the machine, so when you finish you can simply leave. A word of thanks on the way out is the perfect ending.',
        staffPhraseRomaji: 'Arigatou gozaimashita.',
        staffPhraseKanji: 'ありがとうございました。',
        visitorResponse:
          'Say: "Gochisousama deshita." (ごちそうさまでした.) as you leave.',
        tip:
          'No need to wait for a bill — the ticket was your payment. Returning your tray/bowl if there is a station is a nice touch.'
      }
    ]
  }
};
