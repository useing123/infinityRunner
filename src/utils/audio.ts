import { Howl } from 'howler';

// Audio context for background music and sound effects
class AudioManager {
  private sounds: Record<string, Howl> = {};
  private musicPlaying: boolean = false;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;

  constructor() {
    // Initialize sounds
    this.sounds = {
      // Background music
      bgMusic: new Howl({
        src: ['https://assets.codepen.io/21542/howler-demo-bg-music.mp3'],
        loop: true,
        volume: this.musicVolume,
        autoplay: false,
        preload: true,
      }),
      
      // Sound effects
      jump: new Howl({
        src: ['https://assets.codepen.io/21542/howler-push.mp3'],
        volume: this.sfxVolume,
      }),
      
      coin: new Howl({
        src: ['https://assets.codepen.io/21542/howler-sfx-levelup.mp3'],
        volume: this.sfxVolume,
      }),
      
      collision: new Howl({
        src: ['https://assets.codepen.io/21542/howler-sfx-exp.mp3'],
        volume: this.sfxVolume,
      }),
      
      gameOver: new Howl({
        src: ['https://assets.codepen.io/21542/howler-sfx-death.mp3'],
        volume: this.sfxVolume,
      }),
    };
  }

  // Play a sound
  play(sound: 'jump' | 'coin' | 'collision' | 'gameOver'): void {
    if (this.soundEnabled && this.sounds[sound]) {
      this.sounds[sound].play();
    }
  }

  // Start background music
  startMusic(): void {
    if (this.musicEnabled && !this.musicPlaying) {
      this.sounds.bgMusic.play();
      this.musicPlaying = true;
    }
  }

  // Stop background music
  stopMusic(): void {
    this.sounds.bgMusic.stop();
    this.musicPlaying = false;
  }

  // Toggle sound effects
  toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  // Toggle music
  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    
    return this.musicEnabled;
  }

  // Set music volume
  setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    this.sounds.bgMusic.volume(volume);
  }

  // Set sound effects volume
  setSfxVolume(volume: number): void {
    this.sfxVolume = volume;
    
    // Update volume for all sound effects
    ['jump', 'coin', 'collision', 'gameOver'].forEach(sound => {
      this.sounds[sound].volume(volume);
    });
  }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager;