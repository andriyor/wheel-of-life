export type SphereId =
  | 'health'
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
  // Tiny, 5-minute actions: small enough to start without overthinking.
  tinySteps: string[]
}

export const SPHERES: Sphere[] = [
  {
    id: 'health',
    name: 'Health',
    emoji: '🌿',
    color: '#5bb88a',
    question: 'How rested and cared-for does your body feel?',
    tinySteps: ['Drink a glass of water', 'Walk for 10 minutes', 'Go to bed 20 minutes earlier tonight'],
  },
  {
    id: 'career',
    name: 'Work',
    emoji: '💼',
    color: '#5a8dd6',
    question: 'How okay do you feel about your work or studies?',
    tinySteps: ['Write down the one task that matters most today', 'Do 15 minutes of it with a timer', 'Close tabs you are not using'],
  },
  {
    id: 'money',
    name: 'Money',
    emoji: '🪙',
    color: '#d6a74a',
    question: 'How calm do you feel when you think about money?',
    tinySteps: ['Look at your balance — just look', 'Cancel one subscription you forgot about', 'Write down one bill and its due date'],
  },
  {
    id: 'love',
    name: 'Friends & love',
    emoji: '💗',
    color: '#e07a9a',
    question: 'How connected do you feel to the people you care about?',
    tinySteps: ['Send one “thinking of you” message', 'Reply to a message you have been avoiding', 'Plan one short call this week'],
  },
  {
    id: 'family',
    name: 'Family',
    emoji: '🏡',
    color: '#c47fd0',
    question: 'How do things feel with your family right now?',
    tinySteps: ['Share one small update with a family member', 'Ask someone how their week is going', 'Put one family date in the calendar'],
  },
  {
    id: 'fun',
    name: 'Fun & rest',
    emoji: '🎈',
    color: '#ef9a5a',
    question: 'How much do you get to play and truly switch off?',
    tinySteps: ['Do something just for joy for 15 minutes', 'Put on one song you love', 'Take a break without your phone'],
  },
  {
    id: 'growth',
    name: 'Growth',
    emoji: '🌱',
    color: '#58b6c0',
    question: 'How much are you learning or becoming who you want to be?',
    tinySteps: ['Read 5 pages of something', 'Write 3 lines in a journal', 'Note one thing you learned today'],
  },
  {
    id: 'home',
    name: 'Home & space',
    emoji: '🪴',
    color: '#9a8fd6',
    question: 'How does your space feel — calm, or cluttered and loud?',
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
  { id: 'calm', name: 'Calm', hint: 'a quieter mind', feeds: ['health', 'home', 'fun'] },
  { id: 'growth', name: 'Learning', hint: 'getting better at things', feeds: ['growth', 'career'] },
  { id: 'freedom', name: 'Freedom', hint: 'choosing my own path', feeds: ['money', 'fun', 'growth'] },
  { id: 'health', name: 'Vitality', hint: 'having energy in my body', feeds: ['health', 'fun'] },
  { id: 'creativity', name: 'Creativity', hint: 'making and playing', feeds: ['fun', 'growth'] },
  { id: 'care', name: 'Caring', hint: 'looking after others', feeds: ['family', 'love', 'home'] },
  { id: 'achievement', name: 'Achievement', hint: 'finishing what matters', feeds: ['career', 'growth', 'money'] },
]

// Fewer choices = less decision paralysis.
export const MAX_VALUES = 3
// A week only has so much energy: every point given to one area is taken from another.
export const ENERGY = 10
