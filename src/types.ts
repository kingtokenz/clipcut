export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:5';

export type AppView = 'dashboard' | 'editor' | 'library' | 'guide' | 'settings';

export type SpeakerCropMode = 'auto_tracker' | 'center' | 'left' | 'right' | 'split';

export type CaptionStyle =
  | 'parallax_layers'
  | 'camera_follow'
  | 'editorial_emphasis'
  | 'neon_accent'
  | 'neon_glow'
  | 'blend_difference'
  | 'vox_annotate'
  | 'hormozi'
  | 'mrbeast'
  | 'karaoke'
  | 'neon'
  | 'minimal';

export type VoxMarkerStyle = 'highlight' | 'circle' | 'underline' | 'scribble';
export type CameraFollowAccent = 'gold' | 'green' | 'blue' | 'violet';
export type BlendDifferenceMode = 'difference' | 'exclusion' | 'screen';
export type CaptionPosition = 'bottom' | 'middle' | 'top' | 'upper_middle' | 'lower_third';
export type CaptionFontSize = 'sm' | 'md' | 'lg' | 'xl';
export type CaptionCasing = 'uppercase' | 'capitalize' | 'normal';
export type CaptionDisplayLimit =
  | 'one_word'
  | '10_letters'
  | '15_letters'
  | '20_letters'
  | '25_letters'
  | '30_letters'
  | 'none';

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
  color?: string;
  isHighlighted?: boolean;
  originalIndex?: number;
}

export interface SubtitleLine {
  start: number;
  end: number;
  text: string;
  words?: SubtitleWord[];
}

export interface ClipItem {
  id: string;
  title: string;
  hook: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  viralityReason: string;
  speakerCropMode: SpeakerCropMode;
  aspectRatio: AspectRatio;
  captionStyle: CaptionStyle;
  captionPosition?: CaptionPosition;
  captionYOffset?: number;
  captionMaxWords?: number;
  captionFontSize?: CaptionFontSize;
  captionCasing?: CaptionCasing;
  captionAccentColor?: string;
  captionDisplayLimit?: CaptionDisplayLimit;
  blendDifferenceMode?: BlendDifferenceMode;
  suggestedHashtags: string[];
  description: string;
  subtitles: SubtitleLine[];
}

export interface VideoSource {
  id: string;
  type: 'youtube' | 'upload' | 'preset';
  title: string;
  author: string;
  url?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  summary?: string;
}

export interface GenerationSettings {
  targetDuration: '15-30s' | '30-60s' | '60-90s';
  clipFocus: 'viral_hooks' | 'funny' | 'educational' | 'controversial';
  defaultCaptionStyle: CaptionStyle;
  defaultCropMode: SpeakerCropMode;
}
