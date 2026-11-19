export type SphereId =
  | 'health'
  | 'mind'
  | 'career'
  | 'money'
  | 'love'
  | 'family'
  | 'fun'
  | 'growth'
  | 'home'

export type Sphere = {
  id: SphereId
  name: string
  emoji: string
  color: string
  question: string
  // A kind answer to the "I'm not enough here" voice.
  reframe: string
  // One step small enough for a low-energy or bad-health day, even from bed.
  restStep: string
  // Tiny, 5-minute actions: small enough to start without overthinking.
  tinySteps: string[]
}

export const SPHERES: Sphere[] = [
  {
    id: 'health',
    name: 'Body',
    emoji: '🌿',
    color: '#5bb88a',
    question: 'How is your body — energy, pain, sleep, illness?',
    reframe: "Your body is carrying you through a hard time. Resting counts as care, not laziness.",
    restStep: "Drink some water, wherever you are",
    tinySteps: ['Drink a glass of water', 'Walk or stretch for 10 minutes', 'Go to bed 20 minutes earlier tonight'],
  },
  {
    id: 'mind',
    name: 'Mind & mood',
    emoji: '☁️',
    color: '#8fa6c4',
    question: 'How is your mind — mood, worry, overwhelm?',
    reframe: "A struggling mind is not a weak one. You are carrying something heavy, and you're still here.",
    restStep: "Breathe out slowly, five times",
    tinySteps: ['Take 5 slow breaths, out longer than in', 'Name one feeling without judging it', "Tell someone “I'm having a rough day”"],
  },
  {
    id: 'career',
    name: 'Work',
    emoji: '💼',
    color: '#5a8dd6',
    question: 'How okay do you feel about your work or studies?',
    reframe: "Your worth is not your output. A hard day's best looks smaller — it still counts.",
    restStep: "Write down one thing that can wait",
    tinySteps: ['Write down the one task that matters most today', 'Do 15 minutes of it with a timer', 'Close tabs you are not using'],
  },
  {
    id: 'money',
    name: 'Money',
    emoji: '🪙',
    color: '#d6a74a',
    question: 'How calm do you feel when you think about money?',
    reframe: "Money stress is a situation, not a verdict on you. Even looking at it is brave.",
    restStep: "Write one money worry on paper, then put it away",
    tinySteps: ['Look at your balance — just look', 'Cancel one subscription you forgot about', 'Write down one bill and its due date'],
  },
  {
    id: 'love',
    name: 'Friends & love',
    emoji: '💗',
    color: '#e07a9a',
    question: 'How connected do you feel to the people you care about?',
    reframe: "You don't have to be perfect to be loved. Showing up imperfectly is enough.",
    restStep: "Send one emoji to someone you like",
    tinySteps: ['Send one “thinking of you” message', 'Reply to a message you have been avoiding', 'Plan one short call this week'],
  },
  {
    id: 'family',
    name: 'Family',
    emoji: '🏡',
    color: '#c47fd0',
    question: 'How do things feel with your family right now?',
    reframe: "You can love your family and still have limits. Both are allowed.",
    restStep: "Let someone know you're having a low day",
    tinySteps: ['Share one small update with a family member', 'Ask someone how their week is going', 'Put one family date in the calendar'],
  },
  {
    id: 'fun',
    name: 'Fun & rest',
    emoji: '🎈',
    color: '#ef9a5a',
    question: 'How much do you get to play and truly switch off?',
    reframe: "Joy is not a reward you have to earn first. You're allowed to rest now.",
    restStep: "Listen to one song you love, lying down",
    tinySteps: ['Do something just for joy for 15 minutes', 'Put on one song you love', 'Take a break without your phone'],
  },
  {
    id: 'growth',
    name: 'Growth',
    emoji: '🌱',
    color: '#58b6c0',
    question: 'How much are you learning or becoming who you want to be?',
    reframe: "Growing slowly is still growing. Getting through a hard season is growth too.",
    restStep: "Notice one thing you got through today",
    tinySteps: ['Read 5 pages of something', 'Write 3 lines in a journal', 'Note one thing you learned today'],
  },
  {
    id: 'home',
    name: 'Home & space',
    emoji: '🪴',
    color: '#9a8fd6',
    question: 'How does your space feel — calm, or cluttered and loud?',
    reframe: "A messy home means a tired or busy person, not a bad one. Done beats perfect.",
    restStep: "Open a curtain or a window",
    tinySteps: ['Clear one surface', 'Put 5 things back where they belong', 'Open a window for fresh air'],
  },
]

export type CoreValue = {
  id: string
  name: string
  hint: string
  feeds: SphereId[]
}

export const VALUES: CoreValue[] = [
  { id: 'security', name: 'Security', hint: 'feeling safe and steady', feeds: ['money', 'career', 'home'] },
  { id: 'connection', name: 'Connection', hint: 'being close to people', feeds: ['love', 'family'] },
  { id: 'calm', name: 'Calm', hint: 'a quieter mind', feeds: ['mind', 'health', 'home'] },
  { id: 'growth', name: 'Learning', hint: 'getting better at things', feeds: ['growth', 'career'] },
  { id: 'freedom', name: 'Freedom', hint: 'choosing my own path', feeds: ['money', 'fun', 'growth'] },
  { id: 'health', name: 'Vitality', hint: 'having energy in my body', feeds: ['health', 'fun'] },
  { id: 'creativity', name: 'Creativity', hint: 'making and playing', feeds: ['fun', 'growth'] },
  { id: 'care', name: 'Caring', hint: 'looking after others — and myself', feeds: ['family', 'love', 'mind'] },
  { id: 'achievement', name: 'Achievement', hint: 'finishing what matters', feeds: ['career', 'growth', 'money'] },
]

// Fewer choices = less decision paralysis.
export const MAX_VALUES = 3
// A week only has so much energy: every point given to one area is taken from another.
export const ENERGY = 10
// On a low-energy / bad-health stretch you simply have less to give.
export const LOW_ENERGY = 5
