import { createEventEmitter } from '../createEventEmitter';
import { SchemeOptions, MatchScheme } from './types';

/**
 * Creates a match scheme manager that allows setting and tracking the color scheme mode.
 *
 * @param config - Configuration options for the match scheme.
 * @returns An object with methods to manage and listen to scheme changes.
 */
export function createMatchScheme(config: SchemeOptions = {}): MatchScheme {
  const { defaultMode = 'auto' } = config;
  
  /**
   * Determines the dataset attribute name used for storing the color scheme.
   * Defaults to 'colorScheme' if a string is not provided.
   */
  const datasetName: string | false = config.datasetName 
    ? typeof config.datasetName === 'string' 
      ? config.datasetName 
      : 'colorScheme' 
    : false;

  /** Root HTML element */
  const root = document.querySelector(':root') as HTMLElement;
  /** Event emitter for handling mode changes */
  const emitter = createEventEmitter();

  /** Current mode setting (e.g., 'auto', 'light', 'dark') */
  let currentMode = defaultMode;
  /** System color scheme (determined by prefers-color-scheme media query) */
  let system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  /** Selected mode based on current mode and system preference */
  let selected = currentMode === 'auto' ? system : currentMode;
  /** Media query listener for system scheme changes */
  let modeMediaQuery: MediaQueryList | null = null;

  /**
   * Sets the current color mode.
   *
   * @param mode - The mode to set ('auto', 'light', or 'dark').
   */
  const setMode = (mode: string) => {
    const previous = selected;
    currentMode = mode;
    selected = mode === 'auto' ? system : mode;

    if (datasetName) {
      root.dataset[datasetName] = selected;
    } else {
      const removed = root.className.split(' ').filter(c => c !== previous).join(' ');
      root.className = `${selected}${removed.length ? ` ${removed}` : ''}`;
    }

    emitter.emit('modeChange', mode);
  };

  // Initialize dataset or class name for color scheme
  if (datasetName) {
    root.dataset[datasetName] = selected;
  } else {
    const classes = root.className.split(' ').join(' ');
    root.className = `${selected}${classes.length ? ` ${classes}` : ''}`;
  }

  return {
    /**
     * Retrieves the current scheme info.
     * @returns An object containing the mode, system scheme, and selected scheme.
     */
    getInfo: () => ({ mode: currentMode, system, selected }),
    
    /**
     * Updates the color mode.
     */
    setMode,
    
    /**
     * Registers a callback for when the mode changes.
     * @param fn - Callback function that receives the new mode.
     */
    onModeChange: (fn: (mode: string) => void) => emitter.on('modeChange', fn),
    
    /**
     * Registers a callback for when the system's preferred color scheme changes.
     * @param fn - Callback function that receives the new system scheme.
     */
    onSysSchemeChange: (fn: (mode: string) => void) => {
      if (!modeMediaQuery) {
        modeMediaQuery = window.matchMedia(`(prefers-color-scheme: ${system})`);
        modeMediaQuery.addEventListener('change', ({ matches }) => {
          system = matches ? 'light' : 'dark';
          
          if (currentMode === 'auto') selected = system;

          emitter.emit('sysChange', system);
        });
      }
      
      return emitter.on('sysChange', fn);
    },
  };
}
