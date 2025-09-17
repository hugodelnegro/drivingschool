export const quizData: Q[] = [
  {
    question: 'What does this sign mean?',
    answers: ['Yield to oncoming traffic', 'Come to a complete stop', 'Slow down and proceed with caution', 'No entry allowed'],
    correctAnswer: 2,
    explanation: 'The stop sign requires drivers to come to a complete stop before proceeding.',
    okMsg: 'Correct! A stop sign means you must come to a complete stop.',
    koMsg: 'Incorrect. A stop sign means you must come to a complete stop.',
    type: 'single',
    point: 20,
    photo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop&crop=center',
  },
  {
    question: 'At this four-way intersection with no traffic signals, who has the right of way?',
    answers: ['The vehicle that arrives first', 'The vehicle on your right (if you arrive at the same time)', 'Vehicles going straight', 'The largest vehicle'],
    correctAnswer: [1, 2],
    explanation: 'At uncontrolled intersections, the first vehicle to arrive has the right of way. If vehicles arrive simultaneously, yield to the vehicle on your right.',
    okMsg: 'Correct! First to arrive, or yield to the right if at the same time.',
    koMsg: 'Incorrect. First to arrive, or yield to the right if at the same time.',
    type: 'multiple',
    point: 20,
    photo: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center',
  },
  {
    question: 'What is the maximum speed you should drive in this area?',
    answers: ['30 mph', '35 mph', '40 mph', '45 mph'],
    correctAnswer: 2,
    explanation: 'Always follow the posted speed limit signs.',
    okMsg: 'Correct! The speed limit shown is 35 mph.',
    koMsg: 'Incorrect. The speed limit shown is 35 mph.',
    type: 'single',
    point: 20,
    photo: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop&crop=center',
  },
  {
    question: 'When parallel parking, what should you do first?',
    answers: ['Signal your intention and check mirrors', 'Start backing up immediately', 'Turn the steering wheel fully to the right', 'Pull alongside the front car'],
    correctAnswer: 1,
    explanation: 'Safety first—always signal your intentions and check your surroundings before parking.',
    okMsg: 'Correct! Always signal and check mirrors before beginning any parking maneuver.',
    koMsg: 'Incorrect. Always signal and check mirrors before beginning any parking maneuver.',
    type: 'single',
    point: 20,
    photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
  },
  {
    question: 'When you see this sign, you should:',
    answers: ['Come to a complete stop', 'Slow down and yield to other traffic', 'Maintain your current speed', 'Honk your horn to alert other drivers'],
    correctAnswer: 2,
    explanation: 'The yield sign requires you to slow down and give the right of way to other traffic and pedestrians.',
    okMsg: 'Correct! Slow down and yield the right of way to other traffic.',
    koMsg: 'Incorrect. Slow down and yield the right of way to other traffic.',
    type: 'single',
    point: 20,
    photo: 'https://images.unsplash.com/photo-1630481854400-ad2ae26bd0bd?w=400&h=300&fit=crop&crop=center',
  },
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