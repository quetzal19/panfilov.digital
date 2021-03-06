import './../../assets/styles/sign.scss';
const logoWhiteSVG = require('./../../assets/ico/logo/logo-white.svg');
const logoBlackSVG = require('./../../assets/ico/logo/logo-black.svg');

const defaultOptions = {
  url: 'https://panfilov.digital',
  mode: 'medium',
  darkTheme: false,
  text: 'Разработка сайта',
  colors: {
    text: {
      current: '#262934',
      hover: '#010101',
    },
    svg: {
      current: '#262934',
      hover: '#7248BD',
    },
  }
}

interface IColors {
  text: {
    current: string;
    hover: string;
  },
  svg: {
    current: string;
    hover: string;
  },
}

interface IOptions {
  url?: string;
  mode?: 'small' | 'medium' | 'large';
  darkTheme?: boolean;
  colors?: IColors;
  text?: string;
}

interface IProps {
  el: HTMLElement;
  options: IOptions;
}

const smallHtml = ({ text }: IOptions) => (`
  <span class="text">${text}</span>
  <span class="icon">panfilov.<span class="icon-anim">digital</span></span>
`);
const mediumHtml = ({ text }: IOptions) => (`
  <span class="text">${text} &mdash;&nbsp;</span>
  <span class="icon">panfilov.<span class="icon-anim">digital</span></span>
`);
const largeHtml = ({ darkTheme, text }: IOptions) => (`
  ${!darkTheme ? logoWhiteSVG : ''}  
  ${darkTheme ? logoBlackSVG : ''}
  <div class="wrapper">
    <span class="text">${text}</span>
    <span class="icon">panfilov.<span class="icon-anim">digital</span></span>
  </div>
`);

const html = ({ url, mode, darkTheme, text }: IOptions) => (`
  <a href="${url}" target="_blank" class="panfilov-digital-sign" :class="[\`_${mode}\`]">
    ${mode === 'small' ? smallHtml({ text }) : ''}
    ${mode === 'medium' ? mediumHtml({ text }) : ''}
    ${mode === 'large' ? largeHtml({ darkTheme, text }) : ''}
  </a>
`);

export default ({ el, options }: IProps) => {
  const currentOptions = {
    ...defaultOptions,
    ...options
  } as IOptions;
  el.innerHTML = html(currentOptions);
  const root = document.documentElement;
  root.style.setProperty('--panfilov-digital-sign__currentTextColor', currentOptions.colors.text.current);
  root.style.setProperty('--panfilov-digital-sign__hoverTextColor', currentOptions.colors.text.hover);
  root.style.setProperty('--panfilov-digital-sign__currentSVGColor', currentOptions.colors.svg.current);
  root.style.setProperty('--panfilov-digital-sign__hoverSVGColor', currentOptions.colors.svg.hover);
}