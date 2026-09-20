import { ClipItem, VideoSource } from '../types';

export const PRESET_VIDEOS: Array<{
  source: VideoSource;
  clips: ClipItem[];
}> = [
  {
    source: {
      id: 'preset-lex-mark',
      type: 'preset',
      title: 'Lex Fridman & Mark Zuckerberg - The Future of AI & Mixed Reality',
      author: 'Lex Fridman Podcast #398',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 360,
      summary: 'Mark Zuckerberg shares insights on photorealistic avatars, AI companion integration, and the upcoming decade of spatial computing.',
    },
    clips: [
      {
        id: 'clip-lex-1',
        title: 'Why Holograms Will Replace Phones',
        hook: 'In 5 years, carrying a glass rectangle will look medieval.',
        startTime: 12,
        endTime: 48,
        duration: 36,
        viralityScore: 97,
        viralityReason: 'Strong contrarian future vision with immediate hook. Triggers high comment debate on mobile obsolescence.',
        speakerCropMode: 'auto_tracker',
        aspectRatio: '9:16',
        captionStyle: 'parallax_layers',
        suggestedHashtags: ['#ai', '#futuretech', '#metaverse', '#shorts', '#techtrends'],
        description: 'Mark Zuckerberg predicts the end of smartphones. Do you think AR glasses will replace mobile devices by 2030?',
        subtitles: [
          {
            start: 12.0,
            end: 16.5,
            text: 'Why would you want to carry around a physical rectangle in your pocket?',
            words: [
              { word: 'Why', start: 12.0, end: 12.4 },
              { word: 'would', start: 12.4, end: 12.8 },
              { word: 'you', start: 12.8, end: 13.1 },
              { word: 'want', start: 13.1, end: 13.6 },
              { word: 'to', start: 13.6, end: 13.9 },
              { word: 'carry', start: 13.9, end: 14.5 },
              { word: 'around', start: 14.5, end: 15.0 },
              { word: 'a', start: 15.0, end: 15.2 },
              { word: 'physical', start: 15.2, end: 15.8 },
              { word: 'rectangle?', start: 15.8, end: 16.5 }
            ]
          },
          {
            start: 17.0,
            end: 22.0,
            text: 'When every surface, every wall, can instantly become an infinite display.',
            words: [
              { word: 'When', start: 17.0, end: 17.4 },
              { word: 'every', start: 17.4, end: 17.8 },
              { word: 'surface,', start: 17.8, end: 18.5 },
              { word: 'every', start: 18.5, end: 19.0 },
              { word: 'wall,', start: 19.0, end: 19.6 },
              { word: 'can', start: 19.6, end: 20.0 },
              { word: 'instantly', start: 20.0, end: 20.7 },
              { word: 'become', start: 20.7, end: 21.2 },
              { word: 'an', start: 21.2, end: 21.4 },
              { word: 'infinite', start: 21.4, end: 21.8 },
              { word: 'display.', start: 21.8, end: 22.0 }
            ]
          },
          {
            start: 22.5,
            end: 28.5,
            text: 'The feeling of physical presence with another human is the fundamental holy grail.',
            words: [
              { word: 'The', start: 22.5, end: 22.8 },
              { word: 'feeling', start: 22.8, end: 23.4 },
              { word: 'of', start: 23.4, end: 23.7 },
              { word: 'physical', start: 23.7, end: 24.3 },
              { word: 'presence', start: 24.3, end: 25.0 },
              { word: 'with', start: 25.0, end: 25.3 },
              { word: 'another', start: 25.3, end: 25.8 },
              { word: 'human', start: 25.8, end: 26.4 },
              { word: 'is', start: 26.4, end: 26.7 },
              { word: 'the', start: 26.7, end: 27.0 },
              { word: 'holy', start: 27.0, end: 27.6 },
              { word: 'grail.', start: 27.6, end: 28.5 }
            ]
          },
          {
            start: 29.0,
            end: 35.0,
            text: 'And once people experience it once, you can never go back to flat video calls.',
            words: [
              { word: 'And', start: 29.0, end: 29.3 },
              { word: 'once', start: 29.3, end: 29.7 },
              { word: 'people', start: 29.7, end: 30.2 },
              { word: 'experience', start: 30.2, end: 31.0 },
              { word: 'it,', start: 31.0, end: 31.5 },
              { word: 'you', start: 31.5, end: 31.8 },
              { word: 'can', start: 31.8, end: 32.2 },
              { word: 'never', start: 32.2, end: 32.7 },
              { word: 'go', start: 32.7, end: 33.1 },
              { word: 'back', start: 33.1, end: 33.6 },
              { word: 'to', start: 33.6, end: 33.9 },
              { word: 'flat', start: 33.9, end: 34.4 },
              { word: 'screens.', start: 34.4, end: 35.0 }
            ]
          }
        ]
      },
      {
        id: 'clip-lex-2',
        title: 'The AI Companion Revolution',
        hook: 'Everyone will have 10 AI agents working for them.',
        startTime: 65,
        endTime: 104,
        duration: 39,
        viralityScore: 93,
        viralityReason: 'Direct actionable career/tech forecast that appeals to entrepreneurs and creators.',
        speakerCropMode: 'split',
        aspectRatio: '9:16',
        captionStyle: 'camera_follow',
        suggestedHashtags: ['#aiagents', '#automation', '#business', '#reels'],
        description: 'How AI agents will fundamentally restructure team sizes and solo entrepreneurs.',
        subtitles: [
          {
            start: 65.0,
            end: 69.5,
            text: 'In the future, every creator will have an AI version of themselves.',
            words: [
              { word: 'In', start: 65.0, end: 65.3 },
              { word: 'the', start: 65.3, end: 65.6 },
              { word: 'future,', start: 65.6, end: 66.2 },
              { word: 'every', start: 66.2, end: 66.7 },
              { word: 'creator', start: 66.7, end: 67.4 },
              { word: 'will', start: 67.4, end: 67.8 },
              { word: 'have', start: 67.8, end: 68.2 },
              { word: 'an', start: 68.2, end: 68.5 },
              { word: 'AI', start: 68.5, end: 68.9 },
              { word: 'avatar.', start: 68.9, end: 69.5 }
            ]
          },
          {
            start: 70.0,
            end: 75.0,
            text: 'It talks to your community while you sleep and preserves your unique voice.',
            words: [
              { word: 'It', start: 70.0, end: 70.3 },
              { word: 'talks', start: 70.3, end: 70.8 },
              { word: 'to', start: 70.8, end: 71.1 },
              { word: 'your', start: 71.1, end: 71.4 },
              { word: 'community', start: 71.4, end: 72.3 },
              { word: 'while', start: 72.3, end: 72.7 },
              { word: 'you', start: 72.7, end: 73.0 },
              { word: 'sleep.', start: 73.0, end: 75.0 }
            ]
          }
        ]
      }
    ]
  },
  {
    source: {
      id: 'preset-huberman',
      type: 'preset',
      title: 'Dr. Andrew Huberman - Master Your Dopamine & Motivation',
      author: 'Huberman Lab Podcast',
      url: 'https://www.youtube.com/watch?v=QmOF0crdyRU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 320,
      summary: 'Neuroscience protocol to prevent dopamine crashes, boost baseline motivation, and eliminate afternoon brain fog.',
    },
    clips: [
      {
        id: 'clip-huberman-1',
        title: 'The Dopamine Reset Protocol',
        hook: 'Do NOT check your phone the first 30 minutes of waking up.',
        startTime: 15,
        endTime: 52,
        duration: 37,
        viralityScore: 99,
        viralityReason: 'Direct warning hook followed by immediate zero-cost biological protocol. Ranked in top 1% virality for wellness.',
        speakerCropMode: 'auto_tracker',
        aspectRatio: '9:16',
        captionStyle: 'vox_annotate',
        suggestedHashtags: ['#dopamine', '#hubermanlab', '#morningroutine', '#shorts', '#healthhacks'],
        description: 'The exact neurobiology why morning phone checking ruins your willpower for the entire day.',
        subtitles: [
          {
            start: 15.0,
            end: 19.5,
            text: 'The absolute worst thing you can do when you open your eyes is check your phone.',
            words: [
              { word: 'The', start: 15.0, end: 15.3 },
              { word: 'absolute', start: 15.3, end: 15.9 },
              { word: 'worst', start: 15.9, end: 16.4 },
              { word: 'thing', start: 16.4, end: 16.8 },
              { word: 'you', start: 16.8, end: 17.1 },
              { word: 'can', start: 17.1, end: 17.4 },
              { word: 'do', start: 17.4, end: 17.7 },
              { word: 'is', start: 17.7, end: 18.0 },
              { word: 'check', start: 18.0, end: 18.6 },
              { word: 'your', start: 18.6, end: 18.9 },
              { word: 'phone.', start: 18.9, end: 19.5 }
            ]
          },
          {
            start: 20.0,
            end: 25.0,
            text: 'You are spiking dopamine with zero effort, which guarantees a massive trough later.',
            words: [
              { word: 'You', start: 20.0, end: 20.3 },
              { word: 'spike', start: 20.3, end: 20.8 },
              { word: 'dopamine', start: 20.8, end: 21.6 },
              { word: 'with', start: 21.6, end: 22.0 },
              { word: 'zero', start: 22.0, end: 22.5 },
              { word: 'effort.', start: 22.5, end: 23.3 },
              { word: 'That', start: 23.3, end: 23.7 },
              { word: 'guarantees', start: 23.7, end: 24.5 },
              { word: 'a', start: 24.5, end: 24.7 },
              { word: 'crash.', start: 24.7, end: 25.0 }
            ]
          },
          {
            start: 25.5,
            end: 32.0,
            text: 'Instead, get natural sunlight into your eyes for 10 minutes. It resets your biological clock.',
            words: [
              { word: 'Instead,', start: 25.5, end: 26.2 },
              { word: 'get', start: 26.2, end: 26.5 },
              { word: 'natural', start: 26.5, end: 27.2 },
              { word: 'sunlight', start: 27.2, end: 27.9 },
              { word: 'in', start: 27.9, end: 28.2 },
              { word: 'your', start: 28.2, end: 28.5 },
              { word: 'eyes.', start: 28.5, end: 29.3 }
            ]
          }
        ]
      }
    ]
  },
  {
    source: {
      id: 'preset-mkbhd',
      type: 'preset',
      title: 'MKBHD - Is This The End of Normal Apps?',
      author: 'Marques Brownlee',
      url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 280,
      summary: 'Marques breaks down why conversational AI and autonomous intent models are making individual app icons obsolete.',
    },
    clips: [
      {
        id: 'clip-mkbhd-1',
        title: 'Why Apps Will Disappear',
        hook: 'You won’t open Uber, DoorDash, or Spotify in 3 years.',
        startTime: 8,
        endTime: 44,
        duration: 36,
        viralityScore: 95,
        viralityReason: 'High shock-value prediction from authoritative tech reviewer. Instant click-through rate.',
        speakerCropMode: 'center',
        aspectRatio: '9:16',
        captionStyle: 'editorial_emphasis',
        suggestedHashtags: ['#mkbhd', '#techreview', '#smartphones', '#ai', '#shorts'],
        description: 'MKBHD explains why the app store model as we know it is about to change completely.',
        subtitles: [
          {
            start: 8.0,
            end: 13.0,
            text: 'Think about how weird it is that we have 90 different icons on our phone.',
            words: [
              { word: 'Think', start: 8.0, end: 8.4 },
              { word: 'about', start: 8.4, end: 8.8 },
              { word: 'how', start: 8.8, end: 9.2 },
              { word: 'weird', start: 9.2, end: 9.8 },
              { word: 'it', start: 9.8, end: 10.1 },
              { word: 'is.', start: 10.1, end: 10.8 }
            ]
          },
          {
            start: 13.5,
            end: 19.0,
            text: 'You just want a ride home or food delivered. You do not care about opening an app.',
            words: [
              { word: 'You', start: 13.5, end: 13.8 },
              { word: 'just', start: 13.8, end: 14.2 },
              { word: 'want', start: 14.2, end: 14.6 },
              { word: 'the', start: 14.6, end: 15.0 },
              { word: 'outcome.', start: 15.0, end: 16.0 }
            ]
          }
        ]
      }
    ]
  }
];
