'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const navigationHome = navigation.parentElement;
const navigationDrawer = document.querySelector('.nav-drawer');
const menuClose = document.querySelector('.menu-close');
const mobileViewport = window.matchMedia('(max-width: 1024px)');

function closeMenu() {
  navigationDrawer.close();
  document.documentElement.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  if (!mobileViewport.matches || navigationDrawer.open) return;
  navigationDrawer.showModal();
  document.documentElement.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
});

menuClose.addEventListener('click', closeMenu);

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

navigationDrawer.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeMenu();
});

navigationDrawer.addEventListener('click', (event) => {
  if (event.target !== navigationDrawer) return;
  const bounds = navigationDrawer.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    closeMenu();
  }
});

function syncNavigation() {
  const focusWasInNavigation = navigation.contains(document.activeElement);
  const focusWasOnControl =
    document.activeElement === menuToggle ||
    navigationDrawer.contains(document.activeElement);
  closeMenu();
  menuToggle.hidden = !mobileViewport.matches;
  // Keep one set of links as navigation moves between the header and drawer.
  if (mobileViewport.matches) {
    navigationDrawer.append(navigation);
    if (focusWasInNavigation) menuToggle.focus();
  } else {
    navigationHome.append(navigation);
    if (focusWasOnControl) navigation.querySelector('a').focus();
  }
}

mobileViewport.addEventListener('change', syncNavigation);
syncNavigation();

const navigationLinks = [...document.querySelectorAll('.nav-link')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navigationLinks) {
          if (link.hash === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        }
      }
    },
    { rootMargin: '-15% 0px -55% 0px', threshold: 0 },
  );

  document
    .querySelectorAll('main > section[id]')
    .forEach((section) => sectionObserver.observe(section));
}

const examples = {
  travel: {
    kicker: 'Somewhere slower',
    cardTitle: 'Take the\nscenic route.',
    cardDescription:
      'Fresh air. Open trails. A little distance from the everyday.',
    bottom: 'Alpine escape',
    number: 'Study 01 / Travel',
    title: 'Keep the destination\nin the picture.',
    description:
      'A frosted panel gives the story a place to live without hiding the landscape that makes you want to go.',
    material: 'One calm, translucent overlay',
    purpose: 'Bring the view into the experience',
  },
  weather: {
    kicker: 'An imagined alpine morning',
    cardTitle: '18°\nMostly clear.',
    cardDescription:
      'A cool breeze, a quiet valley, and a little sunshine on the way.',
    bottom: 'High 21° / Low 12°',
    number: 'Study 02 / Weather',
    title: 'Feel the day\nbefore you step out.',
    description:
      'The scenery sets the mood while the forecast stays crisp. A translucent surface connects a simple reading to the atmosphere around it.',
    material: 'A soft blue, frosted surface',
    purpose: 'Connect information to its environment',
  },
  focus: {
    kicker: 'A quiet space to begin',
    cardTitle: '25:00\nOne thing at a time.',
    cardDescription:
      'Settle into the moment. Give your next idea a little room to grow.',
    bottom: 'Focus session / Interface concept',
    number: 'Study 03 / Focus',
    title: 'A little separation.\nA lot more space.',
    description:
      'A single glass surface brings the essential information forward. The softer landscape stays present without competing for your attention.',
    material: 'One centered, quiet focal plane',
    purpose: 'Separate the task from the surroundings',
  },
};

const examplePicker = document.querySelector('.example-picker');
const exampleScene = document.querySelector('.example-scene');

function setLines(element, value) {
  const lines = value.split('\n');
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index) element.append(document.createElement('br'));
    element.append(document.createTextNode(line));
  });
}

examplePicker.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-example]');
  if (!button) return;
  const example = examples[button.dataset.example];
  if (!example) return;

  examplePicker.querySelectorAll('button').forEach((item) => {
    item.setAttribute('aria-pressed', String(item === button));
  });
  exampleScene.dataset.mood = button.dataset.example;
  document.querySelector('#example-kicker').textContent = example.kicker;
  setLines(document.querySelector('#example-card-title'), example.cardTitle);
  document.querySelector('#example-card-description').textContent =
    example.cardDescription;
  const bottom = document.querySelector('#example-card-bottom');
  bottom.replaceChildren(document.createTextNode(example.bottom));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  bottom.append(arrow);
  document.querySelector('#study-number').textContent = example.number;
  setLines(document.querySelector('#study-title'), example.title);
  document.querySelector('#study-description').textContent =
    example.description;
  document.querySelector('#study-material').textContent = example.material;
  document.querySelector('#study-purpose').textContent = example.purpose;
});
examplePicker.hidden = false;

const controls = document.querySelector('#glass-controls');
const blurInput = document.querySelector('#blur');
const opacityInput = document.querySelector('#opacity');
const liveGlass = document.querySelector('#live-glass');
const playgroundScene = document.querySelector('#playground-scene');
const cssOutput = document.querySelector('#css-output');
const copyButton = document.querySelector('#copy-css');
const copyStatus = document.querySelector('#copy-status');
const tints = {
  blue: { rgb: '15 32 57', solid: '#0f2039' },
  orange: { rgb: '65 35 24', solid: '#412318' },
  white: { rgb: '42 47 56', solid: '#2a2f38' },
};

function updateGlass() {
  const blur = blurInput.valueAsNumber;
  const opacity = opacityInput.valueAsNumber;
  const tint = controls.querySelector('input[name="tint"]:checked').value;
  const color = tints[tint];

  liveGlass.style.setProperty('--preview-blur', `${blur}px`);
  liveGlass.style.setProperty('--preview-opacity', `${opacity}%`);
  liveGlass.style.setProperty('--preview-rgb', color.rgb);
  liveGlass.style.setProperty('--preview-solid', color.solid);
  playgroundScene.dataset.tone = tint;
  document.querySelector('#blur-value').value = `${blur}px`;
  document.querySelector('#opacity-value').value = `${opacity}%`;
  blurInput.setAttribute('aria-valuetext', `${blur} pixels`);
  opacityInput.setAttribute('aria-valuetext', `${opacity} percent`);
  document.querySelector('#preview-caption').textContent =
    `${blur}px blur · ${opacity}% opacity · ${tint} tint`;

  cssOutput.textContent = `.glass {
  background: ${color.solid};
  color: #f5f7ff;
  border: 1px solid rgb(185 214 255 / 30%);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 32%);
}

@supports (backdrop-filter: blur(1px)) or
  (-webkit-backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(${color.rgb} / ${opacity}%);
    -webkit-backdrop-filter: blur(${blur}px);
    backdrop-filter: blur(${blur}px);
  }
}

@media (prefers-reduced-transparency: reduce),
  (prefers-contrast: more) {
  .glass {
    background: ${color.solid};
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (forced-colors: active) {
  .glass {
    background: Canvas;
    color: CanvasText;
    border-color: CanvasText;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}`;
  copyStatus.textContent = 'A small recipe. Ready for your next idea.';
}

controls.addEventListener('input', updateGlass);
controls.addEventListener('submit', (event) => event.preventDefault());
controls.addEventListener('reset', () => {
  requestAnimationFrame(() => {
    updateGlass();
    copyStatus.textContent = 'Back to the original recipe.';
  });
});

copyButton.addEventListener('click', async () => {
  const recipe = cssOutput.textContent;
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(recipe);
    copyStatus.textContent = 'CSS copied. Make something thoughtful.';
  } catch {
    document.querySelector('.code-details').open = true;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(cssOutput);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent =
      'Clipboard unavailable. Select the CSS below to copy it.';
  } finally {
    copyButton.disabled = false;
  }
});

controls.querySelectorAll('[disabled]').forEach((element) => {
  element.disabled = false;
});
updateGlass();
