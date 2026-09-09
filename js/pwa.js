export function initAppMode({ showDialog, notify, isRoundActive }) {
  const fullscreenButton = document.querySelector('#fullscreen-button');
  const installButton = document.querySelector('#install-button');
  const updateButton = document.querySelector('#update-app');
  let installPrompt = null, registration = null, reloadForUpdate = false, offlineReady = false, installationConfirmed = false;
  const standalone = matchMedia('(display-mode: standalone)');
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fullscreenSupported = () => Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const installed = () => installationConfirmed || standalone.matches || navigator.standalone === true;

  function syncButtons() {
    const active = Boolean(fullscreenElement());
    fullscreenButton.setAttribute('aria-pressed', String(active));
    const label = active ? 'Vollbild beenden' : fullscreenSupported() ? 'Vollbild einschalten' : 'App ohne Browserleiste öffnen';
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.title = label;
    fullscreenButton.textContent = active ? '⊡' : '⛶';
    installButton.hidden = installed();
  }

  function showInstallHelp() {
    showDialog('Matheabenteuer als App', `<p>Öffne Matheabenteuer direkt vom Startbildschirm – in einem eigenen Fenster ohne die normale Browserleiste.</p>
      ${installPrompt ? '<button class="button primary" id="confirm-install">App installieren</button>' : '<ol class="install-steps"><li><strong>iPhone / iPad:</strong> Öffne das Teilen-Menü und wähle „Zum Home-Bildschirm“. Falls angeboten, aktiviere „Als Web-App öffnen“.</li><li><strong>Android / Computer:</strong> Öffne das Browsermenü und wähle „App installieren“, „Zum Startbildschirm hinzufügen“ oder das Installationssymbol in der Adressleiste.</li></ol>'}
      <p>${offlineReady ? 'Die Aufgaben und Fine sind auf diesem Gerät für das Üben ohne Internet bereit.' : 'Lass die Seite einmal mit Internet vollständig laden. Danach kannst du auch offline üben.'}</p>
      <p class="fine-print">Nicht jeder Browser bietet dieselben Funktionen. Falls dein Startbildschirm einen eigenen Spielstand öffnet, kannst du ihn unter „Für Eltern“ mit einer Sicherungsdatei übertragen.</p>`);
    const confirm = document.querySelector('#confirm-install');
    if (confirm) confirm.onclick = async () => {
      const prompt = installPrompt;
      if (!prompt) return;
      installPrompt = null;
      confirm.disabled = true;
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') {
          document.querySelector('#modal').close();
          notify('Die App wird hinzugefügt.');
        } else showInstallHelp();
      } catch {
        showInstallHelp();
      }
    };
  }

  fullscreenButton.onclick = async () => {
    if (!fullscreenSupported()) { showInstallHelp(); return; }
    try {
      if (fullscreenElement()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        await exit.call(document);
      } else {
        const request = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
        await request.call(document.documentElement);
      }
    } catch { notify('Vollbild ist hier gerade nicht verfügbar. Über „Als App installieren“ kannst du ohne Browserleiste üben.'); }
    syncButtons();
  };
  installButton.onclick = showInstallHelp;
  document.addEventListener('fullscreenchange', syncButtons);
  document.addEventListener('webkitfullscreenchange', syncButtons);
  standalone.addEventListener?.('change', syncButtons);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    syncButtons();
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; installationConfirmed = true; syncButtons(); });
  syncButtons();

  updateButton.onclick = () => {
    if (isRoundActive()) { notify('Beende zuerst deine Runde oder mache eine Pause. Danach kannst du die neue Version laden.'); return; }
    if (!registration?.waiting) { updateButton.hidden = true; return; }
    reloadForUpdate = true;
    updateButton.disabled = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadForUpdate) location.reload();
    });
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { updateViaCache: 'none' }).then(value => {
      registration = value;
      const checkUpdate = () => { updateButton.hidden = !registration.waiting; };
      checkUpdate();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', checkUpdate);
      });
      navigator.serviceWorker.ready.then(() => { offlineReady = true; });
    }).catch(() => {
      // Online exercises continue when a browser or privacy setting blocks caching.
      offlineReady = false;
    });
  }
}
