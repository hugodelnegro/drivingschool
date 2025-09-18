export const quizData: Q[] = [
   {
    question: "Sie nähern sich einem Kreisverkehr. Ein Radfahrer fährt bereits im Kreisverkehr. Wie verhalten Sie sich?",
    answers: [
      "Ich fahre langsam ein, da Radfahrer im Kreisverkehr immer Vorfahrt gewähren müssen.",
      "Ich warte, bis der Radfahrer vorbeigefahren ist, bevor ich einfahre.",
      "Ich hupe, um den Radfahrer auf mich aufmerksam zu machen.",
      "Ich fahre zügig hinein, um den Verkehrsfluss nicht zu behindern."
    ],
    correctAnswer: 2,
    explanation:
      "Im Kreisverkehr haben Fahrzeuge und Radfahrer, die sich bereits darin befinden, Vorfahrt. Sie dürfen erst einfahren, wenn die Fahrbahn frei ist.",
    okMsg: "Richtig! Radfahrer im Kreisverkehr haben Vorfahrt.",
    koMsg: "Falsch. Sie müssen den Radfahrer durchfahren lassen.",
    type: "single",
    point: 2,
    photo: "/images/fahrrad-im-kreisverkehr.jpg"
  },
  {
    question: "Ein Fußgänger steht sichtbar am Zebrastreifen und möchte die Straße überqueren. Wie reagieren Sie?",
    answers: [
      "Ich bremse ab und halte an, um den Fußgänger passieren zu lassen.",
      "Ich fahre weiter, solange der Fußgänger noch nicht auf der Fahrbahn ist.",
      "Ich blinke links und umfahre den Fußgänger.",
      "Ich hupe, um den Fußgänger zu warnen."
    ],
    correctAnswer: 1,
    explanation:
      "An Fußgängerüberwegen (Zebrastreifen) gilt: Fußgänger haben Vorrang. Sie müssen rechtzeitig bremsen und anhalten.",
    okMsg: "Richtig! Fußgänger am Zebrastreifen haben Vorrang.",
    koMsg: "Falsch. Sie müssen den Fußgänger passieren lassen.",
    type: "single",
    point: 2,
    photo: "/images/moto.png"
  },
  {
    question: "Sie fahren auf die Autobahn auf. Worauf müssen Sie besonders achten?",
    answers: [
      "Ich beschleunige kräftig, um mich dem fließenden Verkehr anzupassen.",
      "Ich bleibe langsam und warte, bis jemand Platz macht.",
      "Ich halte notfalls am Ende des Beschleunigungsstreifens an.",
      "Ich fahre rückwärts, wenn ich die Ausfahrt verpasst habe."
    ],
    correctAnswer: 1,
    explanation:
      "Beim Auffahren auf die Autobahn müssen Sie den Verkehr beobachten und Ihre Geschwindigkeit anpassen. Anhalten oder Rückwärtsfahren ist verboten.",
    okMsg: "Richtig! Sie müssen beschleunigen und sich einordnen.",
    koMsg: "Falsch. Sie müssen sich zügig und sicher einordnen.",
    type: "single",
    point: 3,
    photo: "/images/A2ost.jpg"
  },
  {
    question: "Sie stehen an einer Kreuzung ohne Ampel. Von rechts kommt ein Pkw, von links ein Fahrrad. Wer hat Vorfahrt?",
    answers: [
      "Ich fahre zuerst, da ich auf der Hauptstraße bin.",
      "Der Pkw von rechts fährt zuerst.",
      "Der Radfahrer von links fährt zuerst.",
      "Alle müssen gleichzeitig bremsen und sich verständigen."
    ],
    correctAnswer: 2,
    explanation:
      "An Kreuzungen ohne Ampeln oder Schilder gilt die Rechts-vor-Links-Regel. Der Pkw von rechts hat Vorfahrt.",
    okMsg: "Richtig! Rechts-vor-Links beachten.",
    koMsg: "Falsch. Fahrzeuge von rechts haben Vorrang.",
    type: "single",
    point: 2,
    photo: "/images/images.png"
  },
  {
    question: "Welche Verhaltensweisen sind beim Fahren mit dem Handy verboten?",
    answers: [
      "Telefonieren ohne Freisprechanlage während der Fahrt",
      "Tippen von Nachrichten während der Fahrt",
      "Navigation am Handy halten während der Fahrt",
      "Sprachsteuerung über Freisprechanlage"
    ],
    correctAnswer: [1, 2, 3],
    explanation:
      "Das Handy darf beim Fahren nicht in der Hand gehalten werden. Erlaubt sind nur Freisprechanlage und Sprachsteuerung.",
    okMsg: "Richtig! Handybenutzung ohne Freisprechanlage ist verboten.",
    koMsg: "Falsch. Nur Freisprechanlage oder Sprachsteuerung sind erlaubt.",
    type: "multiple",
    point: 3,
    photo: "/images/handy.jpg"
  }
];

export type Q = {
  question: string;
  answers: string[];
  correctAnswer: number | number[]; // 1-based
  explanation: string;
  okMsg: string;
  koMsg: string;
  type: 'single' | 'multiple';
  point: number;
  photo?: string; // Optional photo URL for visual questions
};