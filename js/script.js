/* ---------------------------------------------------------
   Bouncing smiley — full viewport width, bounces only
   vertically (up/down) between the header and the bottom
   of the screen.
--------------------------------------------------------- */
const logo = document.querySelector('.logo-icon');
const face = logo.querySelector('ellipse');

function updateLogo() {
  const w = window.innerWidth;

  // Bereich: ab 400px Breite beginnt das Oval flacher zu werden, ab 1600px ist es am flachsten
  const minW = 400, maxW = 600;
  const t = Math.min(Math.max((w - minW) / (maxW - minW), 0), 1);

  // ry: 45 auf kleinen Screens (hoch), 22 auf großen Screens (flach)
  const ry = 45 - t * (45 - 22);
  face.setAttribute('ry', ry);

  // viewBox mitwachsen lassen, damit das Oval nicht abgeschnitten wird
  const pad = 3;
  logo.setAttribute('viewBox', `0 ${33 - ry - pad} 120 ${2 * (ry + pad)}`);
}

updateLogo();
window.addEventListener('resize', updateLogo);

window.addEventListener('load', async () => {
  const ball = document.querySelector('.smiley')?.getAnimations()[0];
  if (!ball) return;                                  // z. B. bei reduced motion

  const pops = [...document.querySelectorAll('.command, .command-img')]
    .flatMap(el => el.getAnimations());

  await Promise.all([ball, ...pops].map(a => a.ready));

  // alle "pop"-Animationen auf denselben Startzeitpunkt wie den Ball setzen
  pops.forEach(a => { a.startTime = ball.startTime; });
});

