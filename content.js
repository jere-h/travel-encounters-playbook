// content.js — Travel Encounters Playbook authoritative content bundle.
//
// This ES module is the single source of truth for what the app shows. It is
// imported by app.js (to render the region/situation/overview/step views) and by
// the dev-only validate-content.mjs script (to gate field presence at deploy
// time).
//
// The app is built for NEURODIVERGENT travelers who want to (a) know exactly
// what will happen before it happens, and (b) jump straight to the moment they
// are in right now. Per-situation `summary`/`expect` give the "what to expect"
// overview; per-step `title`/`yourTurn` give a scannable, jumpable step list and
// a clear "do I need to act here?" marker.
//
// MULTI-CITY: content is organised by city/region. Each city ships its own
// situations AND its own language's rescue phrases. The two debut cities are
// Tokyo (Japanese) and Seoul (Korean). The phrase fields are language-NEUTRAL
// (`staffPhraseRomanized` = latin-letter pronunciation, `staffPhraseNative` =
// the local script) so the same shape serves any language.
//
// Data shape (the contract every screen and the validator depend on):
//
//   export const cities = {
//     <cityId>: {
//       label:          string,    // display name (e.g. "Tokyo")
//       language:       string,    // human-readable language name (e.g. "Japanese")
//       langCode:       string,    // BCP-47 code for the native script (e.g. "ja", "ko")
//       situationOrder: string[],  // fixes the situation-card order for this city
//       rescuePhrases:  RescuePhrase[],   // language-specific anchor lines
//       situations: {
//         <situationId>: {
//           label:   string,       // situation-card name
//           summary: string,       // one sentence: the whole arc, start to finish
//           expect:  string[],     // 2–5 short "what to expect" heads-up lines
//           steps:   Step[]        // 6–12 ordered steps; soft bound, not enforced
//         }
//       }
//     }
//   }
//   export const CITY_ORDER = string[]   // fixes the region-picker order
//
//   Step = {
//     title:                 string,  // short scannable label for the jump list
//     yourTurn:              boolean, // true if YOU must say/decide/do something here
//     whatHappens:           string,  // plain-English "what's going on"
//     staffPhraseRomanized:  string,  // what staff likely say, in latin letters
//     staffPhraseNative:     string,  // same, in the local script
//     visitorResponse:       string,  // what YOU can say/do back
//     tip?:                  string   // OPTIONAL cultural note; non-empty if present
//   }
//
//   RescuePhrase = { en: string, romanized: string, native: string }  // all REQUIRED
//
// IMPORTANT — correctness vs. presence: this file is authored for a first-time
// traveler and is intentionally informal/approximate. The validator checks only
// that REQUIRED fields are present and well-shaped — NOT that the Japanese or
// Korean is correct. Correctness is the native-speaker review's job (see
// content/REVIEW.md).

export const CITY_ORDER = ['tokyo', 'seoul'];

export const cities = {
  // =========================================================================
  // TOKYO (Japanese)
  // =========================================================================
  tokyo: {
    label: 'Tokyo',
    language: 'Japanese',
    langCode: 'ja',
    situationOrder: ['convenience_store', 'izakaya', 'ramen_ticket_machine'],
    rescuePhrases: [
      { en: 'Excuse me / Sorry', romanized: 'Sumimasen', native: 'すみません' },
      { en: 'Please wait a moment', romanized: 'Chotto matte kudasai', native: 'ちょっと待ってください' },
      { en: "I don't understand", romanized: 'Wakarimasen', native: 'わかりません' },
      { en: 'Do you speak English?', romanized: 'Eigo wa hanasemasu ka?', native: '英語は話せますか？' },
      { en: "I'm fine / No thank you", romanized: 'Daijoubu desu', native: '大丈夫です' },
      { en: 'Thank you', romanized: 'Arigatou gozaimasu', native: 'ありがとうございます' }
    ],
    situations: {
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
            staffPhraseRomanized: 'Irasshaimase. Konnichiwa.',
            staffPhraseNative: 'いらっしゃいませ。こんにちは。',
            visitorResponse: 'Smile and nod, or say: "Konnichiwa." (こんにちは.)',
            tip:
              '"Irasshaimase" is just "welcome." It is not a question and needs no reply — staff say it to everyone who walks in.'
          },
          {
            title: 'Heat up the food?',
            yourTurn: true,
            whatHappens:
              'The clerk asks if you would like your hot food or boxed meal heated up in the microwave. This is very common for bento, buns, and fried chicken.',
            staffPhraseRomanized: 'Atatamemasu ka?',
            staffPhraseNative: '温めますか？',
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
            staffPhraseRomanized: 'Ohashi wa otsuke shimasu ka?',
            staffPhraseNative: 'お箸はお付けしますか？',
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
            staffPhraseRomanized: 'Fukuro wa irimasu ka?',
            staffPhraseNative: '袋はいりますか？',
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
            staffPhraseRomanized: 'Goukei … en ni narimasu.',
            staffPhraseNative: '合計　…　円になります。',
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
            staffPhraseRomanized: 'Okaikei wa torei ni onegaishimasu.',
            staffPhraseNative: 'お会計はトレイにお願いします。',
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
            staffPhraseRomanized: 'Otsuri to reshiito desu. Arigatou gozaimashita.',
            staffPhraseNative: 'お釣りとレシートです。ありがとうございました。',
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
            staffPhraseRomanized: 'Irasshaimase. Nanmei-sama desu ka?',
            staffPhraseNative: 'いらっしゃいませ。何名様ですか？',
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
            staffPhraseRomanized: 'Kauntaa-seki demo yoroshii desu ka?',
            staffPhraseNative: 'カウンター席でもよろしいですか？',
            visitorResponse: 'Fine: "Hai, daijoubu desu." (はい、大丈夫です.)',
            tip:
              'Counter seats are great for solo diners — you can watch the cooking and it is easy to order.'
          },
          {
            title: 'Your first drink',
            yourTurn: true,
            whatHappens:
              'Soon after sitting, the server brings a small dish you did not order and asks for your first drink. The small dish is "otoshi," a seat-charge appetizer.',
            staffPhraseRomanized: 'Onomimono wa nani ni nasaimasu ka?',
            staffPhraseNative: 'お飲み物は何になさいますか？',
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
            staffPhraseRomanized: 'Kochira otoshi desu.',
            staffPhraseNative: 'こちらお通しです。',
            visitorResponse: 'Just receive it and say: "Arigatou." (ありがとう.)',
            tip:
              'You generally cannot decline the otoshi — it covers your seat. It is part of the izakaya experience.'
          },
          {
            title: 'Ordering food',
            yourTurn: true,
            whatHappens:
              'When you are ready to order food, get the server\'s attention. In many izakaya it is fine to call out politely or press a call button on the table.',
            staffPhraseRomanized: 'Sumimasen, chuumon onegaishimasu.',
            staffPhraseNative: 'すみません、注文お願いします。',
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
            staffPhraseRomanized: 'Omatase shimashita.',
            staffPhraseNative: 'お待たせしました。',
            visitorResponse: 'Say: "Arigatou gozaimasu." (ありがとうございます.)',
            tip:
              'Order a few small plates to start and add more as you go — that is how izakaya are designed to work.'
          },
          {
            title: 'Ask for the bill',
            yourTurn: true,
            whatHappens:
              'You are full and want the bill. At many izakaya you pay at the front register, not the table. Ask the server for the check.',
            staffPhraseRomanized: 'Okaikei onegaishimasu.',
            staffPhraseNative: 'お会計お願いします。',
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
            staffPhraseRomanized: 'Otsutae no hou de oshiharai onegaishimasu.',
            staffPhraseNative: 'お会計はレジでお願いします。',
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
            staffPhraseRomanized: 'Arigatou gozaimashita. Mata okoshi kudasaimase.',
            staffPhraseNative: 'ありがとうございました。またお越しくださいませ。',
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
            staffPhraseRomanized: 'Saki ni shokkenki de onegaishimasu.',
            staffPhraseNative: '先に食券機でお願いします。',
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
            staffPhraseRomanized: 'Osaki ni okane o irete kudasai.',
            staffPhraseNative: 'お先にお金を入れてください。',
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
            staffPhraseRomanized: 'Ramen wa hidari-ue no botan desu.',
            staffPhraseNative: 'ラーメンは左上のボタンです。',
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
            staffPhraseRomanized: 'Toppingu mo erabemasu.',
            staffPhraseNative: 'トッピングも選べます。',
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
            staffPhraseRomanized: 'Shokken to otsuri o otori kudasai.',
            staffPhraseNative: '食券とお釣りをお取りください。',
            visitorResponse: 'Collect every ticket and your change from the slots.',
            tip:
              'Grab change from the lower tray and tickets from the dispenser — it is easy to forget the change, so check both.'
          },
          {
            title: 'Hand over tickets',
            yourTurn: true,
            whatHappens:
              'Take a seat (often a counter) and hand your tickets to the staff, or place them on the counter where indicated. They may ask how firm you want the noodles.',
            staffPhraseRomanized: 'Menno katasa wa dou shimasu ka?',
            staffPhraseNative: '麺の硬さはどうしますか？',
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
            staffPhraseRomanized: 'Aji no ko_sa wa ikaga shimasu ka?',
            staffPhraseNative: '味の濃さはいかがしますか？',
            visitorResponse: 'Standard: "Futsuu de onegaishimasu." (普通でお願いします.)',
            tip:
              'For garlic ("ninniku", にんにく) you can say "sukoshi" (少し = a little) or "nashi de" (なしで = none).'
          },
          {
            title: 'Your bowl arrives',
            yourTurn: false,
            whatHappens:
              'Your bowl is served, usually quickly. Staff set it down and may say "enjoy." Slurping the noodles is welcome and considered normal here.',
            staffPhraseRomanized: 'Omatase shimashita. Douzo.',
            staffPhraseNative: 'お待たせしました。どうぞ。',
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
            staffPhraseRomanized: 'Arigatou gozaimashita.',
            staffPhraseNative: 'ありがとうございました。',
            visitorResponse:
              'Say: "Gochisousama deshita." (ごちそうさまでした.) as you leave.',
            tip:
              'No need to wait for a bill — the ticket was your payment. Returning your tray/bowl if there is a station is a nice touch.'
          }
        ]
      }
    }
  },

  // =========================================================================
  // SEOUL (Korean)
  // =========================================================================
  seoul: {
    label: 'Seoul',
    language: 'Korean',
    langCode: 'ko',
    situationOrder: ['convenience_store', 'korean_bbq', 'kiosk'],
    rescuePhrases: [
      { en: 'Excuse me (to get attention)', romanized: 'Jeogiyo', native: '저기요' },
      { en: 'Please wait a moment', romanized: 'Jamsimanyo', native: '잠시만요' },
      { en: "I don't understand", romanized: 'Jal moreugesseoyo', native: '잘 모르겠어요' },
      { en: 'Do you speak English?', romanized: 'Yeongeo haseyo?', native: '영어 하세요?' },
      { en: "I'm fine / No thank you", romanized: 'Gwaenchanayo', native: '괜찮아요' },
      { en: 'Thank you', romanized: 'Gamsahamnida', native: '감사합니다' }
    ],
    situations: {
      convenience_store: {
        label: 'Convenience Store (편의점)',
        summary:
          'You bring your items to the counter; the clerk may offer to heat your food, asks about a bag and loyalty points, tells you the total, you pay (usually by card), and take your receipt.',
        expect: [
          'Quick — usually a minute or two.',
          'Staff greet everyone with "eoseo oseyo" (welcome) — no reply needed.',
          'Card works for any amount, even tiny ones; just tap or insert. There is no tipping in Korea.',
          'Plastic bags cost a small fee and some stores no longer give them — you may need to carry items by hand.'
        ],
        steps: [
          {
            title: 'Greeting at the counter',
            yourTurn: false,
            whatHappens:
              'You set your items on the counter. The clerk greets you and starts scanning. You do not need to say anything — a nod is plenty.',
            staffPhraseRomanized: 'Eoseo oseyo.',
            staffPhraseNative: '어서 오세요.',
            visitorResponse: 'Smile and nod, or say: "Annyeonghaseyo." (안녕하세요 = hello.)',
            tip:
              '"Eoseo oseyo" just means "welcome." It is said to everyone and needs no reply.'
          },
          {
            title: 'Heat up the food?',
            yourTurn: true,
            whatHappens:
              'If you bought something hot like a lunchbox (dosirak) or bun, the clerk asks whether to microwave it for you. Many stores also have a microwave you can use yourself.',
            staffPhraseRomanized: 'Dewo deurilkkayo?',
            staffPhraseNative: '데워 드릴까요?',
            visitorResponse:
              'Yes please: "Ne, haejuseyo." (네, 해주세요.)  No thanks: "Aniyo, gwaenchanayo." (아니요, 괜찮아요.)',
            tip:
              'If you would rather do it yourself, the microwave (전자레인지, jeonjarenji) is usually free to use by the hot-water station.'
          },
          {
            title: 'Do you need a bag?',
            yourTurn: true,
            whatHappens:
              'The clerk asks if you want a bag. Bags cost a small fee, and many convenience stores have stopped giving out plastic bags entirely.',
            staffPhraseRomanized: 'Bongtu piryohaseyo?',
            staffPhraseNative: '봉투 필요하세요?',
            visitorResponse:
              'Yes: "Ne, juseyo." (네, 주세요.)  No: "Aniyo, gwaenchanayo." (아니요, 괜찮아요.)',
            tip:
              'A bag is usually 50–100 won, if available at all. If you can carry your items by hand, just say "gwaenchanayo."'
          },
          {
            title: 'Loyalty points?',
            yourTurn: true,
            whatHappens:
              'The clerk may ask if you want to collect membership/loyalty points. These are for local phone-linked accounts, so as a visitor you can simply decline.',
            staffPhraseRomanized: 'Jeongnip haseyo?',
            staffPhraseNative: '적립하세요?',
            visitorResponse:
              'No thanks: "Aniyo, gwaenchanayo." (아니요, 괜찮아요.)',
            tip:
              'Point programs (like OK Cashbag or telecom memberships) need a Korean account — declining is completely normal.'
          },
          {
            title: 'The total',
            yourTurn: false,
            whatHappens:
              'The clerk tells you the total and points to the card reader. The amount also shows on the small screen on the counter.',
            staffPhraseRomanized: 'Samcheon won-imnida.',
            staffPhraseNative: '삼천 원입니다.',
            visitorResponse:
              'Glance at the screen for the number. To confirm: "Ne." (네 = yes / okay.)',
            tip:
              'You do not need to catch the spoken number — it always appears on the little display by the register.'
          },
          {
            title: 'Paying',
            yourTurn: true,
            whatHappens:
              'The clerk asks how you will pay. Card is by far the most common, accepted for any amount. You can hand or tap the card at the reader yourself.',
            staffPhraseRomanized: 'Kadeu-ro hasigesseoyo?',
            staffPhraseNative: '카드로 하시겠어요?',
            visitorResponse:
              'Card: "Kadeu-ro halgeyo." (카드로 할게요.)  Cash: "Hyeon-geum-iyo." (현금이요.)',
            tip:
              'Cards (including foreign ones) work even for tiny purchases — tap or insert and wait for the beep. No tipping in Korea.'
          },
          {
            title: 'Receipt — done',
            yourTurn: false,
            whatHappens:
              'The clerk asks if you want the receipt, hands you your things, and you are done.',
            staffPhraseRomanized: 'Yeongsujeung piryohaseyo?',
            staffPhraseNative: '영수증 필요하세요?',
            visitorResponse:
              'Yes: "Ne, juseyo." (네, 주세요.)  No: "Aniyo, gwaenchanayo." (아니요, 괜찮아요.)  Then: "Gamsahamnida." (감사합니다.)',
            tip:
              'Receipts are often offered rather than given automatically. Either answer is fine.'
          }
        ]
      },

      korean_bbq: {
        label: 'Korean BBQ (고깃집)',
        summary:
          "You're seated, free side dishes (banchan) appear, you order grilled meat by the serving plus drinks, staff often help grill and cut it at your table, and you pay at the front counter on the way out.",
        expect: [
          'Lively and social — the side dishes (banchan) are free and refillable; just ask for more.',
          'Meat is ordered by the serving (인분, inbun), and many places have a 2-serving minimum.',
          'Staff often grill the meat at your table and cut it with scissors.',
          'You pay at the counter by the door, not at the table. There is no tipping.'
        ],
        steps: [
          {
            title: 'How many people?',
            yourTurn: true,
            whatHappens:
              'You step in and a server asks how many people are in your group. Holding up fingers always works.',
            staffPhraseRomanized: 'Myeot bun-iseyo?',
            staffPhraseNative: '몇 분이세요?',
            visitorResponse:
              'Hold up fingers, or say the count: "Han myeong" (한 명 = 1), "Du myeong" (두 명 = 2).',
            tip:
              '"Myeong" counts people. For any number, fingers are the safe move.'
          },
          {
            title: 'Getting seated',
            yourTurn: false,
            whatHappens:
              'The server leads you to a table, often one with a built-in grill in the middle, and tells you where to sit.',
            staffPhraseRomanized: 'Ijjogeuro anjeuseyo.',
            staffPhraseNative: '이쪽으로 앉으세요.',
            visitorResponse: 'Follow and sit: "Ne, gamsahamnida." (네, 감사합니다.)',
            tip:
              'The grill in the table will be lit by staff. Bags often go in a basket under your seat.'
          },
          {
            title: 'Side dishes & water appear',
            yourTurn: false,
            whatHappens:
              'A spread of small free side dishes (banchan) and often water and cups are set down or are self-serve. You did not order these — they come with the meal.',
            staffPhraseRomanized: 'Banchaneun selpeu-yeyo.',
            staffPhraseNative: '반찬은 셀프예요.',
            visitorResponse:
              'Just receive them. Water and cups are usually self-serve at the table or a nearby station.',
            tip:
              'Banchan refills are free — when something runs low, ask "banchan jom deo juseyo" (반찬 좀 더 주세요 = more side dishes, please).'
          },
          {
            title: 'Order the meat',
            yourTurn: true,
            whatHappens:
              'When ready, get the server\'s attention and order meat by the serving. Pointing at the menu works perfectly.',
            staffPhraseRomanized: 'Jumun hasigesseoyo?',
            staffPhraseNative: '주문하시겠어요?',
            visitorResponse:
              'Point and say: "Igeo i-inbun juseyo." (이거 2인분 주세요 = this, 2 servings, please.)',
            tip:
              'Many places need a 2-serving (2인분) minimum to order. Samgyeopsal (삼겹살, pork belly) is the classic first choice.'
          },
          {
            title: 'Order drinks',
            yourTurn: true,
            whatHappens:
              'The server asks about drinks. Soju and beer are the classic pairing; water is always fine.',
            staffPhraseRomanized: 'Eumnyoneun mwo deusigesseoyo?',
            staffPhraseNative: '음료는 뭐 드시겠어요?',
            visitorResponse:
              'Soju: "Soju hana juseyo." (소주 하나 주세요.)  Water: "Mul juseyo." (물 주세요.)',
            tip:
              'Pour for others, not yourself, and hold the bottle with two hands. A common toast is "geonbae!" (건배 = cheers).'
          },
          {
            title: 'Staff grill & cut the meat',
            yourTurn: false,
            whatHappens:
              'Staff often grill the meat at your table and snip it into bite-size pieces with scissors, then tell you when it is ready to eat.',
            staffPhraseRomanized: 'Jega guwo deurilgeyo.',
            staffPhraseNative: '제가 구워 드릴게요.',
            visitorResponse:
              'Let them; say "ne, gamsahamnida" (네, 감사합니다). When they say "deuseyo" (드세요), dig in.',
            tip:
              'Wrap a piece of meat in a lettuce leaf with garlic and ssamjang sauce (a "ssam") — that is the classic way to eat it.'
          },
          {
            title: 'Ask for more',
            yourTurn: true,
            whatHappens:
              'Need more banchan, more meat, or another drink? Call a server — calling out politely is normal here, and many tables have a call button.',
            staffPhraseRomanized: 'Jeogiyo! Yeogi jom...',
            staffPhraseNative: '저기요! 여기 좀…',
            visitorResponse:
              'Call "Jeogiyo!" (저기요!) then: more sides "banchan jom deo juseyo" (반찬 좀 더 주세요), or more meat "igeo il-inbun deoyo" (이거 1인분 더요).',
            tip:
              'Pressing the table call button (호출벨) or a clear "jeogiyo!" both work. Staff expect to be flagged down.'
          },
          {
            title: 'Finish with a rice or noodle dish',
            yourTurn: true,
            whatHappens:
              'Many people end a BBQ meal with cold noodles, a stew, or fried rice cooked in the grill pan. The server may ask if you want one.',
            staffPhraseRomanized: 'Siksa hasigesseoyo?',
            staffPhraseNative: '식사 하시겠어요?',
            visitorResponse:
              'Cold noodles: "Naengmyeon hana juseyo." (냉면 하나 주세요.)  Or decline: "Gwaenchanayo." (괜찮아요.)',
            tip:
              'Bokkeum-bap (볶음밥, fried rice) made right in the grill pan is a popular, tasty way to finish.'
          },
          {
            title: 'Pay at the counter',
            yourTurn: true,
            whatHappens:
              'You pay at the front counter by the door on your way out, not at the table. Take any slip with you if one is on the table.',
            staffPhraseRomanized: 'Gyesaneun kaunteo-eseo haejuseyo.',
            staffPhraseNative: '계산은 카운터에서 해주세요.',
            visitorResponse:
              'At the counter: "Kadeu-ro halgeyo." (카드로 할게요 = I\'ll pay by card.)',
            tip:
              'No tipping. One person usually pays for the whole table; card is fine everywhere.'
          }
        ]
      },

      kiosk: {
        label: 'Self-Order Kiosk (키오스크)',
        summary:
          'You order and pay at a self-service touchscreen first — choosing dine-in or takeout — then take a number or buzzer and pick up your food at the counter yourself.',
        expect: [
          'You order and pay at the screen before you get any food.',
          'Many kiosks have an English-language button — look in a top corner.',
          'Most kiosks are card-only; cash is often not accepted.',
          "You'll get a number ticket or a buzzer (진동벨) and collect the food yourself."
        ],
        steps: [
          {
            title: 'Go to the kiosk',
            yourTurn: false,
            whatHappens:
              'At many casual restaurants and cafes there is no one to take your order — staff point you to a touchscreen kiosk near the entrance.',
            staffPhraseRomanized: 'Kioseukeu-eseo jumunhae juseyo.',
            staffPhraseNative: '키오스크에서 주문해 주세요.',
            visitorResponse:
              'Step to the screen and look for an English / "ENG" (영어) button, often in a top corner.',
            tip:
              'Tap the English-language button first if there is one — it switches the whole kiosk to English.'
          },
          {
            title: 'Dine in or takeout?',
            yourTurn: true,
            whatHappens:
              'The first question is usually whether you will eat there or take it away. Two big buttons appear: 매장 (dine-in) and 포장 (takeout).',
            staffPhraseRomanized: 'Maejang / Pojang',
            staffPhraseNative: '매장 / 포장',
            visitorResponse:
              'Tap "매장" (maejang = eat in) or "포장" (pojang = take out).',
            tip:
              '매장 (maejang) = eat here; 포장 (pojang) = to go. Pick before you choose your food.'
          },
          {
            title: 'Pick your items',
            yourTurn: true,
            whatHappens:
              'Browse the menu on screen — most have pictures. Tap a dish to add it; you may be asked for quantity or options.',
            staffPhraseRomanized: 'Hwamyeon-eseo menyu-reul seontaek-haseyo.',
            staffPhraseNative: '화면에서 메뉴를 선택하세요.',
            visitorResponse:
              'Tap the dish you want, then set quantity or options if asked.',
            tip:
              '추가 (chuga) = add / extra; 매운맛 (maeun-mat) = spicy. Pictures make it easy even in Korean.'
          },
          {
            title: 'Add or skip extras',
            yourTurn: true,
            whatHappens:
              'The kiosk may offer sides, drinks, or set-menu add-ons. You can add some or skip them all.',
            staffPhraseRomanized: 'Chuga menyu-reul seontaek-haseyo.',
            staffPhraseNative: '추가 메뉴를 선택하세요.',
            visitorResponse:
              'Add extras, or move on: tap "다음" (daeum = next) or "결제" (gyeolje = pay).',
            tip:
              'Nothing here is mandatory — if you do not want extras, just continue to payment.'
          },
          {
            title: 'Pay at the screen',
            yourTurn: true,
            whatHappens:
              'Tap to check out and choose a payment method. Insert or tap your card at the reader built into the kiosk.',
            staffPhraseRomanized: 'Gyeolje sudaneul seontaek-haseyo.',
            staffPhraseNative: '결제 수단을 선택하세요.',
            visitorResponse:
              'Tap "카드" (kadeu = card), then insert or tap your card in the reader.',
            tip:
              'Most kiosks are card-only — cash is often not accepted. Foreign cards usually work.'
          },
          {
            title: 'Take your number or buzzer',
            yourTurn: false,
            whatHappens:
              'After paying, the kiosk prints a receipt with an order number, or a buzzer is dispensed. Take it.',
            staffPhraseRomanized: 'Jumun-beonho-pyo-reul badeuseyo.',
            staffPhraseNative: '주문번호표를 받으세요.',
            visitorResponse:
              'Take the printed number ticket (and the buzzer, if one comes out).',
            tip:
              'A 진동벨 (jindongbel = vibrating buzzer) will light up and shake when your food is ready.'
          },
          {
            title: 'Collect your food',
            yourTurn: false,
            whatHappens:
              'When your number is shown or called — or your buzzer goes off — pick up your food at the counter yourself.',
            staffPhraseRomanized: 'Beonho-reul bureumyeon bada gaseyo.',
            staffPhraseNative: '번호를 부르면 받아 가세요.',
            visitorResponse:
              'Collect at the counter and say: "Gamsahamnida." (감사합니다.)',
            tip:
              'At many casual spots you also clear your own tray to the return station (퇴식구, toesikgu) when done.'
          }
        ]
      }
    }
  }
};
