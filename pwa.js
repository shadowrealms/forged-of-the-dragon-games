/* Installation only: no offline caching or changes to game progress. */
(() => {
  const button = document.getElementById('installApp');
  const hint = document.getElementById('installHint');
  let pendingPrompt;
  if (window.matchMedia('(display-mode: standalone)').matches) {
    hint.textContent = 'Running as an installed app. Internet is required for the 3D game.';
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    pendingPrompt = event;
    button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!pendingPrompt) return;
    button.hidden = true;
    try {
      await pendingPrompt.prompt();
      await pendingPrompt.userChoice;
    } finally { pendingPrompt = null; }
  });
  window.addEventListener('appinstalled', () => {
    button.hidden = true;
    hint.textContent = 'Installed! Open Forged Dragon from your Android home screen.';
  });
})();
