/**
 * AudioService - Handles background music and sound effects
 */
class AudioService {
  constructor() {
    // Initialize audio settings with default values
    this.settings = {
      musicVolume: 0.015, // Decreased to 1.5% (previously 15%, reduced by factor of 10)
      sfxVolume: 0.21,   // Keeping SFX at same level
      musicEnabled: true,
      sfxEnabled: true
    };
    
    this.backgroundMusic = null;
    this.sounds = {};
    this.soundBuffers = {}; // Pre-loaded sound buffers
    this.audioContext = null; // Web Audio API context
    this.isInitialized = false;
  }
  
  // Initialize audio service and load all sounds
  init() {
    if (this.isInitialized) return;
    
    // Load settings from localStorage if available
    this.loadSettings();
    
    // Create Audio Context for better performance
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser. Falling back to standard Audio elements.');
    }
    
    // Initialize background music
    this.backgroundMusic = new Audio('/audio/background-music.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.settings.musicVolume;
    
    // Sound effect paths
    const soundPaths = {
      buttonClick: '/audio/button-click.mp3',
      trade: '/audio/trade-complete.mp3',
      dayAdvance: '/audio/day-advance.mp3',
      report: '/audio/report-open.mp3'
    };
    
    // Initialize standard Audio objects as fallback
    this.sounds = {
      buttonClick: new Audio(soundPaths.buttonClick),
      trade: new Audio(soundPaths.trade),
      dayAdvance: new Audio(soundPaths.dayAdvance),
      report: new Audio(soundPaths.report)
    };
    
    // Set volumes for all sound effects
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.settings.sfxVolume;
      
      // Preload audio files
      sound.load();
    });
    
    // If Web Audio API is supported, preload and buffer all sounds for faster playback
    if (this.audioContext) {
      this.preloadSounds(soundPaths);
    }
    
    this.isInitialized = true;
  }
  
  // Preload sounds using Web Audio API for faster playback
  async preloadSounds(soundPaths) {
    const fetchAndDecode = async (url) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error(`Error loading sound ${url}:`, error);
        return null;
      }
    };
    
    // Load all sounds in parallel
    const loadPromises = Object.entries(soundPaths).map(async ([name, path]) => {
      const buffer = await fetchAndDecode(path);
      if (buffer) {
        this.soundBuffers[name] = buffer;
      }
    });
    
    // Wait for all sounds to be loaded
    await Promise.all(loadPromises);
    console.log('All sound effects preloaded');
  }
  
  // Play background music
  playMusic() {
    if (!this.isInitialized) this.init();
    
    if (this.settings.musicEnabled && this.backgroundMusic) {
      // Resume Audio Context if it was suspended (browser policy)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Using catch to handle autoplay restrictions in browsers
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play prevented. User interaction needed to play music.');
        });
      }
    }
  }
  
  // Pause background music
  pauseMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    }
  }
  
  // Play a sound effect with minimal latency
  playSound(soundName) {
    if (!this.isInitialized) this.init();
    if (!this.settings.sfxEnabled) return;
    
    // Resume Audio Context if it was suspended (browser policy)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Use Web Audio API if available (lower latency)
    if (this.audioContext && this.soundBuffers[soundName]) {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundBuffers[soundName];
      
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      
      // Set volume based on sound type
      if (soundName === 'buttonClick') {
        gainNode.gain.value = this.settings.sfxVolume * 0.25; // 25% of current sfx volume
      } else {
        gainNode.gain.value = this.settings.sfxVolume;
      }
      
      // Connect nodes: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play immediately (zero second delay)
      source.start(0);
      return;
    }
    
    // Fallback to standard Audio API
    if (this.sounds[soundName]) {
      // Reset the audio to the beginning if it's already playing
      const sound = this.sounds[soundName];
      sound.pause();
      sound.currentTime = 0;
      
      // Set volume based on sound type
      if (soundName === 'buttonClick') {
        sound.volume = this.settings.sfxVolume * 0.25; // 25% of current sfx volume
      } else {
        sound.volume = this.settings.sfxVolume;
      }
      
      // Play immediately
      sound.play().catch(error => {
        console.log(`Error playing sound ${soundName}:`, error);
      });
    }
  }
  
  // Set music volume (0-1)
  setMusicVolume(volume) {
    // Adjust displayed volume vs actual volume (1:10 ratio)
    // This means 50% on the slider is actually 5% volume
    this.settings.musicVolume = Math.max(0, Math.min(1, volume * 0.1));
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.settings.musicVolume;
    }
    
    this.saveSettings();
  }
  
  // Set sound effects volume (0-1)
  setSfxVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    
    // Update volumes for all sound effects
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.settings.sfxVolume;
    });
    
    this.saveSettings();
  }
  
  // Toggle background music on/off
  toggleMusic(enabled) {
    this.settings.musicEnabled = enabled;
    
    if (enabled) {
      this.playMusic();
    } else {
      this.pauseMusic();
    }
    
    this.saveSettings();
  }
  
  // Toggle sound effects on/off
  toggleSfx(enabled) {
    this.settings.sfxEnabled = enabled;
    this.saveSettings();
  }
  
  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }
  
  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('audioSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }
  
  // Get current audio settings - adjust the music volume for display purposes
  getSettings() {
    return {
      ...this.settings,
      // Convert the actual volume back to display volume (multiply by 10)
      // So 0.015 actual volume appears as 0.15 (15%) on the slider
      musicVolume: Math.min(1, this.settings.musicVolume * 10)
    };
  }
}

// Create a singleton instance
const audioService = new AudioService();

export default audioService; 