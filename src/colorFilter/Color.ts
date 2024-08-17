export class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;

    this.toString = this.toString.bind(this);
    this.hueRotate = this.hueRotate.bind(this);
    this.grayscale = this.grayscale.bind(this);
    this.sepia = this.sepia.bind(this);
    this.saturate = this.saturate.bind(this);
    this.multiply = this.multiply.bind(this);
    this.brightness = this.brightness.bind(this);
    this.contrast = this.contrast.bind(this);
    this.linear = this.linear.bind(this);
    this.invert = this.invert.bind(this);
    this.hsl = this.hsl.bind(this);
    this.clamp = this.clamp.bind(this);
  }

  set(r: number, g: number, b: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  
  toString(): string {
    return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }

  hueRotate(angle: number = 0): void {
    angle = angle / 180 * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.140,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }

  grayscale(value: number = 1): void {
    this.multiply([
      0.2126 + 0.7874 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 + 0.2848 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 + 0.9278 * (1 - value),
    ]);
  }

  sepia(value: number = 1): void {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  saturate(value: number = 1): void {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }

  multiply(vector: number[]): void {
    const newR = this.clamp(this.r * vector[0] + this.g * vector[1] + this.b * vector[2]);
    const newG = this.clamp(this.r * vector[3] + this.g * vector[4] + this.b * vector[5]);
    const newB = this.clamp(this.r * vector[6] + this.g * vector[7] + this.b * vector[8]);
    this.r = newR;
    this.g = newG;
    this.b = newB;
  }

  brightness(value: number = 1): void {
    this.linear(value);
  }
  contrast(value: number = 1): void {
    this.linear(value, -(0.5 * value) + 0.5);
  }

  linear(slope: number = 1, intercept: number = 0): void {
    this.r = this.clamp(this.r * slope + intercept * 255);
    this.g = this.clamp(this.g * slope + intercept * 255);
    this.b = this.clamp(this.b * slope + intercept * 255);
  }

  invert(value: number = 1): void {
    this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
  }

  hsl(): { h: number, s: number, l: number } {
    // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        case b:
          h = (r - g) / d + 4;
          break;
      }
      (h as number) /= 6;
    }

    return {
      h: (h as number) * 100,
      s: s * 100,
      l: l * 100,
    };
  }

  clamp(value: number): number {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }
}
