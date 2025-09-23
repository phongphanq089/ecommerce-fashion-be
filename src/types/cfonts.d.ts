// global.d.ts
declare module 'cfonts' {
  interface CFontsOptions {
    font?: string;
    align?: 'left' | 'center' | 'right';
    colors?: string[];
    background?: string;
    letterSpacing?: number;
    lineHeight?: number;
    space?: boolean;
    maxLength?: string;
    gradient?: string[];
    independentGradient?: boolean;
    transitionGradient?: boolean;
    env?: 'node' | 'browser';
  }

  interface CFontsInstance {
    say(text: string, options?: CFontsOptions): void;
    render(text: string, options?: CFontsOptions): void;
  }

  const CFonts: CFontsInstance;
  export default CFonts;
}
