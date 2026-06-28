// content.js — Tokyo Doorway authoritative content bundle.
//
// This ES module is the single source of truth for what the app shows. It is
// imported by app.js (to render the picker + step-through views) and by the
// dev-only validate-content.mjs script (to gate field presence at deploy time).
//
// Data shape (the contract every screen and the validator depend on):
//
//   export const situations = {
//     <situationId>: {
//       label: string,        // display name shown on the picker card
//       steps: Step[]         // 6–12 ordered steps; soft bound, not enforced
//     }
//   }
//
//   Step = {
//     whatHappens:        string,  // REQUIRED — plain-English "what's going on"
//     staffPhraseRomaji:  string,  // REQUIRED — what staff likely say, romaji
//     staffPhraseKanji:   string,  // REQUIRED — same, in kana/kanji
//     visitorResponse:    string,  // REQUIRED — what YOU can say/do back
//     tip?:               string   // OPTIONAL — cultural note; non-empty if present
//   }
//
// situations MUST have EXACTLY these three keys:
//   'convenience_store' | 'izakaya' | 'ramen_ticket_machine'
//
// SITUATION_ORDER fixes the picker card order (Tokyo is implicit).
//
// IMPORTANT — correctness vs. presence: this file is authored for a first-time
// traveler and is intentionally informal/approximate. The validator checks only
// that REQUIRED fields are present and non-empty — NOT that the Japanese is
// correct. Correctness is the native-speaker review's job (see content/REVIEW.md).
// A user could swap this whole object for their own situations to retarget the app.

export const SITUATION_ORDER = ['convenience_store', 'izakaya', 'ramen_ticket_machine'];

export const situations = {
  convenience_store: {
    label: 'Convenience Store',
    steps: [
      {
        whatHappens:
          'You bring your items to the counter and set them down. The clerk greets you and starts scanning. You do not need to say anything yet — a nod or a small "hello" is plenty.',
        staffPhraseRomaji: 'Irasshaimase. Konnichiwa.',
        staffPhraseKanji: 'いらっしゃいませ。こんにちは。',
        visitorResponse: 'Smile and nod, or say: "Konnichiwa." (こんにちは.)',
        tip:
          '"Irasshaimase" is just "welcome." It is not a question and needs no reply — staff say it to everyone who walks in.'
      },
      {
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
    steps: [
      {
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
        whatHappens:
          'The server leads you to a table or counter seat. They may ask if a counter seat or a table is okay, especially if it is busy.',
        staffPhraseRomaji: 'Kauntaa-seki demo yoroshii desu ka?',
        staffPhraseKanji: 'カウンター席でもよろしいですか？',
        visitorResponse: 'Fine: "Hai, daijoubu desu." (はい、大丈夫です.)',
        tip:
          'Counter seats are great for solo diners — you can watch the cooking and it is easy to order.'
      },
      {
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
        whatHappens:
          'The "otoshi" appetizer appears on your bill as a small fee (often 300–600 yen per person). It is normal and not a scam — think of it as a table charge.',
        staffPhraseRomaji: 'Kochira otoshi desu.',
        staffPhraseKanji: 'こちらお通しです。',
        visitorResponse: 'Just receive it and say: "Arigatou." (ありがとう.)',
        tip:
          'You generally cannot decline the otoshi — it covers your seat. It is part of the izakaya experience.'
      },
      {
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
        whatHappens:
          'Dishes are meant to be shared and arrive whenever they are ready, not in courses. The server may set a plate down and name it.',
        staffPhraseRomaji: 'Omatase shimashita.',
        staffPhraseKanji: 'お待たせしました。',
        visitorResponse: 'Say: "Arigatou gozaimasu." (ありがとうございます.)',
        tip:
          'Order a few small plates to start and add more as you go — that is how izakaya are designed to work.'
      },
      {
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
    steps: [
      {
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
        whatHappens:
          'The machine prints one small paper ticket per item and returns your change. Take all the tickets and your coins.',
        staffPhraseRomaji: 'Shokken to otsuri o otori kudasai.',
        staffPhraseKanji: '食券とお釣りをお取りください。',
        visitorResponse: 'Collect every ticket and your change from the slots.',
        tip:
          'Grab change from the lower tray and tickets from the dispenser — it is easy to forget the change, so check both.'
      },
      {
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
        whatHappens:
          'Some shops also ask about broth richness or garlic. A simple "normal / standard" answer keeps it easy.',
        staffPhraseRomaji: 'Aji no ko_sa wa ikaga shimasu ka?',
        staffPhraseKanji: '味の濃さはいかがしますか？',
        visitorResponse: 'Standard: "Futsuu de onegaishimasu." (普通でお願いします.)',
        tip:
          'For garlic ("ninniku", にんにく) you can say "sukoshi" (少し = a little) or "nashi de" (なしで = none).'
      },
      {
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
