const STORAGE_KEY = 'roteiro-palco-prototipo-quermesse-home-v1';
const RESTORE_POINT_KEY = 'roteiro-palco-ponto-restauracao';
const CLOUD_TOKEN_KEY = 'roteiro-palco-sync-token';
const CLOUD_SYNC_KEY = 'roteiro-palco-ultimo-sync';
const URGENT_SEEN_KEY = 'roteiro-palco-urgentes-vistos';
const OFFLINE_CACHE_NAME = 'palco-offline-v31';
const OFFLINE_FILES = ['index.html', 'styles.css', 'app.js', 'manifest.json', 'service-worker.js', 'icon.svg'];

const defaultTopics = [
  'Informes',
  'Programação',
  'Agradecer',
  'Patrocínio 1',
  'Patrocínio 2',
  'Patrocínio 3',
  'Patrocínio 4',
  'Apresentação',
];

const defaultSpeeches = [
  {
    topic: 'Informes',
    text: 'Aproveita que você está aqui no UniSALESIANO! As inscrições para o Vestibular de Medicina estão abertas até 19 de junho. A prova será no dia 27 de junho, um sábado.',
    target: 4,
    remaining: 4,
  },
  {
    topic: 'Informes',
    text: 'Em breve divulgaremos também as vagas abertas para os Cursos Tradicionais. Fique de olho no site unisalesiano.com.br e nas redes sociais do UniSALESIANO.',
    target: 3,
    remaining: 3,
  },
  {
    topic: 'Programação',
    text: 'Dia 22 de maio, sexta-feira, 18h30: abertura dos portões. Sejam muito bem-vindos! Temos Área Kids gratuita, com roda gigante, infláveis e pipoca.',
    target: 1,
    remaining: 1,
  },
  {
    topic: 'Programação',
    text: 'Às 20h teremos a Procissão e Coroação de Nossa Senhora Auxiliadora. Convidamos todos a participarem com respeito, fé e devoção.',
    target: 1,
    remaining: 1,
  },
  {
    topic: 'Programação',
    text: 'Às 20h30, teremos a Quadrilha Universitária com mais de 150 casais! Vamos receber essa apresentação com muita energia e uma grande salva de palmas.',
    target: 1,
    remaining: 1,
  },
  {
    topic: 'Programação',
    text: 'Às 21h30 começa o show Violada 360, com Pedro Sanchez & Thiago e Matheus & Turelli. Preparem-se para curtir uma grande noite!',
    target: 1,
    remaining: 1,
  },
  {
    topic: 'Agradecer',
    text: 'Toda a renda desta noite é 100% destinada ao Projeto Social Oratório Dom Bosco. Cada ingresso, cada consumação, tudo vira impacto real na vida de muitas pessoas. Obrigado por estar aqui e fazer parte dessa história!',
    target: 3,
    remaining: 3,
  },
  {
    topic: 'Agradecer',
    text: 'Nosso muito obrigado à equipe de organização, aos colaboradores, voluntários, apoiadores e a todos que estão prestigiando a Quermesse UniSALESIANO.',
    target: 2,
    remaining: 2,
  },
  {
    topic: 'Patrocínio 1',
    text: 'Um agradecimento muito especial à Unimed Araçatuba, nosso maior patrocínio. Muito obrigado por apoiar este evento e esta causa tão importante.',
    target: 5,
    remaining: 5,
  },
  {
    topic: 'Patrocínio 2',
    text: 'Antes da próxima atração, nosso agradecimento especial aos patrocinadores VIP e Ouro da Quermesse UniSALESIANO 2026. Esse apoio é fundamental para a realização do evento.',
    target: 3,
    remaining: 3,
  },
  {
    topic: 'Patrocínio 3',
    text: 'Agradecemos também aos nossos apoiadores. Muito obrigado pela parceria, pela presença e por fazerem parte da Quermesse UniSALESIANO.',
    target: 2,
    remaining: 2,
  },
  {
    topic: 'Patrocínio 4',
    text: 'Agradecemos aos apoiadores Arquiteto e Pneu ATA-kar. Muito obrigado pela parceria e pelo apoio à nossa festa.',
    target: 2,
    remaining: 2,
  },
  {
    topic: 'Apresentação',
    text: 'Boa noite! Sejam todos muito bem-vindos à Quermesse UniSALESIANO 2026. Eu sou Edvan Santos e é uma alegria receber vocês aqui para essa noite especial.',
    target: 1,
    remaining: 1,
  },
  {
    topic: 'Apresentação',
    text: 'Vamos receber agora, com muito carinho e uma grande salva de palmas, a próxima atração da nossa noite!',
    target: 2,
    remaining: 2,
  },
  {
    topic: 'Apresentação',
    text: 'A seguir, teremos Open Farra. Continuem conosco e aproveitem a programação preparada para esta noite.',
    target: 1,
    remaining: 1,
  },
];

let state = loadState();
let activePlaylistId = '';
let activeTopic = currentRoute().topics[0] || 'Informes';
activePlaylistId = currentRoute().activePlaylistId || currentRoute().playlists?.[0]?.id || '';
let presentationMode = 'topic';
let currentIndex = 0;
let editingIndex = null;
let routeNameMode = 'new';
let playlistNameMode = 'new';
let urgentMessages = [];
let savedEditorRange = null;
let playlistDrag = null;

const views = {
  home: document.querySelector('#homeView'),
  present: document.querySelector('#presentView'),
  edit: document.querySelector('#editView'),
  transfer: document.querySelector('#transferView'),
};

const topicGrid = document.querySelector('#topicGrid');
const playlistGrid = document.querySelector('#playlistGrid');
const playlistSelect = document.querySelector('#playlistSelect');
const playlistItems = document.querySelector('#playlistItems');
const scriptList = document.querySelector('#scriptList');
const topicFilter = document.querySelector('#topicFilter');
const noteSearch = document.querySelector('#noteSearch');
const presentTopic = document.querySelector('#presentTopic');
const presentRouteName = document.querySelector('#presentRouteName');
const presentCounter = document.querySelector('#presentCounter');
const presentText = document.querySelector('#presentText');
const repeatText = document.querySelector('#repeatText');
const editCurrentBtn = document.querySelector('#editCurrentBtn');
const speechDialog = document.querySelector('#speechDialog');
const topicDialog = document.querySelector('#topicDialog');
const topicModeDialog = document.querySelector('#topicModeDialog');
const renameTopicDialog = document.querySelector('#renameTopicDialog');
const reorderDialog = document.querySelector('#reorderDialog');
const editTopic = document.querySelector('#editTopic');
const editTopicField = document.querySelector('#editTopicField');
const editTopicSummary = document.querySelector('#editTopicSummary');
const showTopicBtn = document.querySelector('#showTopicBtn');
const editTitle = document.querySelector('#editTitle');
const editTarget = document.querySelector('#editTarget');
const editKind = document.querySelector('#editKind');
const editText = document.querySelector('#editText');
const editVisual = document.querySelector('#editVisual');
const textEditorPanel = document.querySelector('#textEditorPanel');
const tableEditorPanel = document.querySelector('#tableEditorPanel');
const editTable = document.querySelector('#editTable');
const dialogTitle = document.querySelector('#dialogTitle');
const newTopicName = document.querySelector('#newTopicName');
const topicModeName = document.querySelector('#topicModeName');
const topicModeValue = document.querySelector('#topicModeValue');
const renameTopicFrom = document.querySelector('#renameTopicFrom');
const renameTopicTo = document.querySelector('#renameTopicTo');
const backupText = document.querySelector('#backupText');
const backupScope = document.querySelector('#backupScope');
const syncTokenInput = document.querySelector('#syncTokenInput');
const urgentLinkInput = document.querySelector('#urgentLinkInput');
const cloudStatus = document.querySelector('#cloudStatus');
const reorderList = document.querySelector('#reorderList');
const offlineStatus = document.querySelector('#offlineStatus');
const restorePointStatus = document.querySelector('#restorePointStatus');
const currentRouteName = document.querySelector('#currentRouteName');
const routeDialog = document.querySelector('#routeDialog');
const routeList = document.querySelector('#routeList');
const routeNameDialog = document.querySelector('#routeNameDialog');
const routeNameTitle = document.querySelector('#routeNameTitle');
const routeNameInput = document.querySelector('#routeNameInput');
const routeColorDialog = document.querySelector('#routeColorDialog');
const playlistDialog = document.querySelector('#playlistDialog');
const playlistDialogTitle = document.querySelector('#playlistDialogTitle');
const playlistNameInput = document.querySelector('#playlistNameInput');
const urgentBtn = document.querySelector('#urgentBtn');
const urgentCount = document.querySelector('#urgentCount');
const urgentDialog = document.querySelector('#urgentDialog');
const urgentList = document.querySelector('#urgentList');
const urgentHint = document.querySelector('#urgentHint');

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

document.querySelectorAll('[data-view-button]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.viewButton));
});

document.querySelector('#homeBtn').addEventListener('click', () => setView('home'));
document.querySelector('#routeSelectorBtn').addEventListener('click', openRouteDialog);
document.querySelectorAll('[data-open-routes]').forEach((button) => {
  button.addEventListener('click', openRouteDialog);
});
document.querySelector('#newRouteBtn').addEventListener('click', () => openRouteNameDialog('new'));
document.querySelector('#duplicateRouteBtn').addEventListener('click', duplicateCurrentRoute);
document.querySelector('#renameRouteBtn').addEventListener('click', () => openRouteNameDialog('rename'));
document.querySelector('#routeColorBtn').addEventListener('click', () => routeColorDialog.showModal());
document.querySelector('#addTopicBtn').addEventListener('click', openTopicDialog);
document.querySelector('#topicModeBtn').addEventListener('click', openTopicModeDialog);
document.querySelector('#renameTopicBtn').addEventListener('click', () => {
  const topic = topicFilter.value === 'todos' ? activeTopic : topicFilter.value;
  openRenameTopicDialog(topic);
});
document.querySelector('#reorderTopicsBtn').addEventListener('click', openReorderDialog);
document.querySelector('#addSpeechBtn').addEventListener('click', () => openSpeechDialog());
document.querySelector('#quickPlaylistBtn').addEventListener('click', () => openPlaylistDialog('new'));
document.querySelector('#newPlaylistBtn').addEventListener('click', () => openPlaylistDialog('new'));
document.querySelector('#duplicatePlaylistBtn').addEventListener('click', duplicateActivePlaylist);
document.querySelector('#renamePlaylistBtn').addEventListener('click', () => openPlaylistDialog('rename'));
document.querySelector('#presentPlaylistBtn').addEventListener('click', () => openPlaylist(activePlaylistId));
editCurrentBtn.addEventListener('click', editCurrentSpeech);
document.querySelector('#prevBtn').addEventListener('click', () => movePresenter(-1));
document.querySelector('#nextBtn').addEventListener('click', () => movePresenter(1));
document.querySelector('#doneBtn').addEventListener('click', markCurrentSpoken);
const presenterCard = document.querySelector('.presenter-card');
presenterCard.addEventListener('pointerdown', startPresenterSwipe);
presenterCard.addEventListener('pointermove', movePresenterSwipe);
presenterCard.addEventListener('pointerup', finishPresenterSwipe);
presenterCard.addEventListener('pointercancel', cancelPresenterSwipe);
document.querySelector('#fontRange').addEventListener('input', (event) => {
  const maxSize = window.innerWidth <= 460 ? 46 : 60;
  const size = Math.min(Number(event.target.value), maxSize);
  applyPresentFontSize(size);
});
document.querySelectorAll('[data-highlight-color]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    applyHighlightToSelection(button.dataset.highlightColor);
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.detail === 0) applyHighlightToSelection(button.dataset.highlightColor);
  });
});
document.querySelectorAll('[data-highlight-clear]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clearHighlightSelection();
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.detail === 0) clearHighlightSelection();
  });
});
document.querySelector('[data-uppercase]').addEventListener('pointerdown', (event) => {
  event.preventDefault();
  uppercaseEditorSelection();
});
document.querySelector('[data-uppercase]').addEventListener('click', (event) => {
  event.preventDefault();
  if (event.detail === 0) uppercaseEditorSelection();
});
document.querySelector('#exportBtn').addEventListener('click', exportBackup);
document.querySelector('#copyBackupBtn').addEventListener('click', copyBackup);
document.querySelector('#importBackupBtn').addEventListener('click', importBackup);
document.querySelector('#saveRestorePointBtn').addEventListener('click', saveRestorePoint);
document.querySelector('#restorePointBtn').addEventListener('click', restoreSavedPoint);
document.querySelector('#pushCloudBtn').addEventListener('click', pushCloudState);
document.querySelector('#pullCloudBtn').addEventListener('click', pullCloudState);
document.querySelector('#copyUrgentLinkBtn').addEventListener('click', copyUrgentLink);

topicFilter.addEventListener('change', renderEditList);
noteSearch.addEventListener('input', renderEditList);
playlistSelect.addEventListener('change', () => {
  activePlaylistId = playlistSelect.value;
  currentRoute().activePlaylistId = activePlaylistId;
  saveAndRender();
});
document.querySelectorAll('[data-edit-section]').forEach((button) => {
  button.addEventListener('click', () => setEditSection(button.dataset.editSection));
});
syncTokenInput.addEventListener('input', () => {
  saveSyncToken();
  renderUrgentLink();
  fetchUrgentMessages();
});
document.addEventListener('selectionchange', rememberEditorSelection);
editTopic.addEventListener('change', updateSpeechTopicSummary);
editKind.addEventListener('change', updateSpeechKindUI);
document.querySelector('#clearTableBtn').addEventListener('click', clearTableEditor);
showTopicBtn.addEventListener('click', () => setTopicPickerVisible(editTopicField.hidden));
urgentBtn.addEventListener('click', openUrgentDialog);
document.querySelector('#refreshUrgentBtn').addEventListener('click', fetchUrgentMessages);

document.querySelector('#saveSpeechBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveSpeechFromDialog();
});

document.querySelector('#saveTopicBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveTopicFromDialog();
});

document.querySelector('#saveTopicModeBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveTopicModeFromDialog();
});
topicModeName.addEventListener('change', () => {
  topicModeValue.value = currentRoute().topicModes?.[topicModeName.value] || 'normal';
});

document.querySelector('#saveRenameTopicBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveRenameTopicFromDialog();
});

document.querySelector('#saveRouteNameBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveRouteNameFromDialog();
});

document.querySelector('#savePlaylistBtn').addEventListener('click', (event) => {
  event.preventDefault();
  savePlaylistFromDialog();
});

document.querySelectorAll('[data-route-color]').forEach((button) => {
  button.addEventListener('click', () => {
    currentRoute().color = button.dataset.routeColor;
    routeColorDialog.close();
    saveAndRender();
  });
});

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeState(JSON.parse(stored));
  } catch {
    // Use defaults when stored data is unavailable.
  }

  return normalizeState({
    routes: [
      {
        id: createId(),
        name: 'Roteiro Principal',
        topics: defaultTopics,
        speeches: defaultSpeeches,
        playlists: [],
      },
    ],
  });
}

function normalizeState(nextState) {
  const normalizeTopicName = (topic) => (topic === 'Agradecimentos' ? 'Agradecer' : topic);

  const normalizeRoute = (route, index = 0) => {
    const hasSpeechList = Array.isArray(route.speeches);
    const baseSpeeches = hasSpeechList ? route.speeches : defaultSpeeches;
    const baseTopics = Array.isArray(route.topics) && route.topics.length ? route.topics : defaultTopics;
    const topics = [...new Set([...baseTopics, ...baseSpeeches.map((speech) => speech.topic)].map(normalizeTopicName))].filter(Boolean);
    const speeches = baseSpeeches.map((speech, speechIndex) => {
      const target = Math.max(1, Number(speech.target || 1));
      const remaining = Math.min(target, Math.max(0, Number(speech.remaining ?? target)));
      return {
        id: speech.id || createId(),
        title: speech.title || createSpeechTitle(speech, speechIndex),
        topic: normalizeTopicName(speech.topic || topics[0] || 'Informes'),
        kind: speech.kind === 'table' ? 'table' : 'text',
        text: speech.text || '',
        table: normalizeSpeechTable(speech.table),
        target,
        remaining,
      };
    });
    const speechIds = new Set(speeches.map((speech) => speech.id));
    const playlists = Array.isArray(route.playlists)
      ? route.playlists.map((playlist, playlistIndex) => ({
          id: playlist.id || createId(),
          name: playlist.name || `Playlist ${playlistIndex + 1}`,
          items: Array.isArray(playlist.items) ? playlist.items.filter((speechId) => speechIds.has(speechId)) : [],
        }))
      : [];

    if (!playlists.length && speeches.length) {
      playlists.push({
        id: createId(),
        name: 'Entrada principal',
        items: speeches.map((speech) => speech.id),
      });
    }

    return {
      id: route.id || createId(),
      name: route.name || `Roteiro ${index + 1}`,
      color: route.color || '#f4f2ec',
      topics,
      speeches,
      playlists,
      activePlaylistId: playlists.some((playlist) => playlist.id === route.activePlaylistId) ? route.activePlaylistId : playlists[0]?.id || '',
      topicModes: route.topicModes || {},
    };
  };

  let routes = [];
  if (Array.isArray(nextState.routes)) {
    routes = nextState.routes.map(normalizeRoute);
  } else {
    routes = [
      normalizeRoute({
        id: createId(),
        name: 'Roteiro Principal',
        topics: nextState.topics || defaultTopics,
        speeches: nextState.speeches || defaultSpeeches,
      }),
    ];
  }

  const activeRouteId = routes.some((route) => route.id === nextState.activeRouteId) ? nextState.activeRouteId : routes[0].id;
  return { activeRouteId, routes };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentRoute() {
  let route = state.routes.find((item) => item.id === state.activeRouteId);
  if (!route) {
    route = state.routes[0];
    state.activeRouteId = route.id;
  }
  if (!route.playlists?.some((playlist) => playlist.id === route.activePlaylistId)) {
    route.activePlaylistId = route.playlists?.[0]?.id || '';
  }
  activePlaylistId = route.activePlaylistId || activePlaylistId || route.playlists?.[0]?.id || '';
  if (!route.topics?.length) route.topics = [...defaultTopics];
  if (!Array.isArray(route.speeches)) route.speeches = [];
  if (!Array.isArray(route.playlists)) route.playlists = [];
  return route;
}

function setView(name) {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });

  Object.entries(views).forEach(([viewName, view]) => {
    view.classList.toggle('active', viewName === name);
  });

  if (name === 'present' && presentationMode === 'topic') focusFirstAvailableInTopic();
  render();
}

function openTopic(topic) {
  activeTopic = topic;
  presentationMode = 'topic';
  currentIndex = 0;
  setView('present');
}

function openPlaylist(playlistId) {
  const route = currentRoute();
  const playlist = route.playlists.find((item) => item.id === playlistId) || route.playlists[0];
  if (!playlist) return;

  activePlaylistId = playlist.id;
  route.activePlaylistId = playlist.id;
  presentationMode = 'playlist';
  currentIndex = 0;
  setView('present');
}

function render() {
  const route = currentRoute();
  currentRouteName.textContent = route.name;
  currentRouteName.style.color = route.color || '';
  document.querySelectorAll('[data-current-route-label]').forEach((label) => {
    label.textContent = route.name;
    label.style.color = route.color || '';
  });
  presentRouteName.textContent = route.name;
  presentRouteName.style.color = route.color || '';
  renderTopicOptions();
  renderPlaylistOptions();
  renderHome();
  renderPresenter();
  renderPlaylistItems();
  renderEditList();
  renderUrgentButton();
  renderSummary();
}

function renderTopicOptions() {
  const route = currentRoute();
  const selectedFilter = topicFilter.value || 'todos';
  const selectedEditTopic = editTopic.value || activeTopic || route.topics[0];
  const options = route.topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('');
  editTopic.innerHTML = options;
  topicModeName.innerHTML = options;
  renameTopicFrom.innerHTML = options;
  topicFilter.innerHTML = `<option value="todos">Todos os tópicos</option>${options}`;
  editTopic.value = route.topics.includes(selectedEditTopic) ? selectedEditTopic : route.topics[0];
  topicModeName.value = route.topics.includes(activeTopic) ? activeTopic : route.topics[0];
  renameTopicFrom.value = route.topics.includes(activeTopic) ? activeTopic : route.topics[0];
  topicFilter.value = selectedFilter === 'todos' || route.topics.includes(selectedFilter) ? selectedFilter : 'todos';
}

function renderPlaylistOptions() {
  const route = currentRoute();
  if (!route.playlists.length) {
    playlistSelect.innerHTML = '<option value="">Nenhuma playlist</option>';
    playlistSelect.value = '';
    return;
  }

  const selectedPlaylist = route.playlists.some((playlist) => playlist.id === activePlaylistId)
    ? activePlaylistId
    : route.activePlaylistId || route.playlists[0].id;
  playlistSelect.innerHTML = route.playlists
    .map((playlist) => `<option value="${escapeHtml(playlist.id)}">${escapeHtml(playlist.name)}</option>`)
    .join('');
  playlistSelect.value = selectedPlaylist;
  activePlaylistId = selectedPlaylist;
  route.activePlaylistId = selectedPlaylist;
}

function renderHome() {
  const route = currentRoute();
  playlistGrid.innerHTML = route.playlists.length
    ? route.playlists
        .map(
          (playlist) => `
            <button class="playlist-button" type="button" data-playlist-open="${escapeHtml(playlist.id)}">
              <span>${escapeHtml(playlist.name)}</span>
              <strong>${playlist.items.length} notas</strong>
            </button>
          `,
        )
        .join('')
    : '<p class="status">Crie uma playlist para montar sua entrada de palco.</p>';

  playlistGrid.querySelectorAll('[data-playlist-open]').forEach((button) => {
    button.addEventListener('click', () => openPlaylist(button.dataset.playlistOpen));
  });

  topicGrid.innerHTML = route.topics
    .map((topic) => {
      const speeches = getSpeechesByTopic(topic);
      const remaining = speeches.reduce((sum, speech) => sum + speech.remaining, 0);
      const total = speeches.reduce((sum, speech) => sum + speech.target, 0);
      const empty = speeches.length === 0;

      return `
        <button class="topic-button ${empty ? 'empty' : ''}" type="button" data-topic="${escapeHtml(topic)}">
          <span>${escapeHtml(topic)}</span>
          <strong>${empty ? 'Sem fala' : `${remaining}/${total}`}</strong>
        </button>
      `;
    })
    .join('');

  topicGrid.querySelectorAll('[data-topic]').forEach((button) => {
    button.addEventListener('click', () => openTopic(button.dataset.topic));
  });

}

function renderPresenter() {
  const entries = getPresentationEntries();
  const contextName = getPresentationContextName();
  presentTopic.textContent = contextName;

  if (!entries.length) {
    presentCounter.textContent = '0/0';
    presentText.classList.remove('list-mode', 'sponsor-mode', 'rich-mode', 'table-mode');
    presentText.textContent = presentationMode === 'playlist' ? 'Essa playlist ainda não tem notas.' : 'Nenhuma fala nesse botão ainda.';
    repeatText.textContent = presentationMode === 'playlist' ? 'Adicione notas em EDITAR.' : 'Crie uma fala para este tópico.';
    editCurrentBtn.textContent = presentationMode === 'playlist' ? 'Montar' : 'Editar';
    return;
  }

  currentIndex = clamp(currentIndex, 0, entries.length - 1);
  const { speech } = entries[currentIndex];
  presentCounter.textContent = `${currentIndex + 1}/${entries.length}`;
  renderPresentText(speech);
  repeatText.textContent = `Restam ${speech.remaining} de ${speech.target}`;
  editCurrentBtn.textContent = 'Editar';
}

function getPresentationEntries() {
  const route = currentRoute();
  if (presentationMode !== 'playlist') {
    return getSpeechesByTopic(activeTopic).map((speech) => ({
      speech,
      speechIndex: route.speeches.indexOf(speech),
    }));
  }

  const playlist = getActivePlaylist();
  if (!playlist) return [];

  return playlist.items
    .map((speechId) => {
      const speechIndex = route.speeches.findIndex((speech) => speech.id === speechId);
      if (speechIndex < 0) return null;
      return {
        speech: route.speeches[speechIndex],
        speechIndex,
      };
    })
    .filter(Boolean);
}

function getPresentationContextName() {
  if (presentationMode === 'playlist') return getActivePlaylist()?.name || 'Playlist';
  return activeTopic || 'Sem tópico';
}

function renderPresentText(speech) {
  if (speech.kind === 'table') {
    renderTableText(speech);
    return;
  }

  const text = speech.text || '';
  const topic = speech.topic || activeTopic;
  if (currentRoute().topicModes?.[topic] === 'sponsor') {
    renderSponsorText(text);
    return;
  }

  const rawLines = text.split('\n');
  const lines = rawLines.map((line) => line.trim()).filter(Boolean);
  const hasBlankLines = rawLines.some((line) => line.trim() === '');
  const isList = lines.length >= 5 && !hasBlankLines;
  presentText.classList.toggle('list-mode', isList);
  presentText.classList.remove('sponsor-mode', 'table-mode');
  presentText.classList.toggle('rich-mode', text.includes('[['));

  presentText.innerHTML = rawLines.map(renderPresentLine).join('');

  const sliderValue = Number(document.querySelector('#fontRange').value || 28);
  const maxSize = window.innerWidth <= 460 ? 46 : 60;
  applyPresentFontSize(Math.min(sliderValue, maxSize));
}

function applyPresentFontSize(size) {
  presentText.style.fontSize = `${size}px`;
  fitListText();
}

function renderPresentLine(line) {
  if (!line.trim()) return '<div class="present-gap" aria-hidden="true"></div>';
  return `<div class="present-line">${formatHighlights(line)}</div>`;
}

function renderTableText(speech) {
  const table = normalizeSpeechTable(speech.table);
  presentText.classList.remove('list-mode', 'sponsor-mode', 'rich-mode');
  presentText.classList.add('table-mode');
  presentText.innerHTML = renderBasicTable(table);

  const sliderValue = Number(document.querySelector('#fontRange').value || 28);
  const maxSize = window.innerWidth <= 460 ? 34 : 42;
  applyPresentFontSize(Math.min(sliderValue, maxSize));
}

function renderBasicTable(table) {
  const headers = normalizeTableRow(table.headers, ['Coluna 1', 'Coluna 2', 'Coluna 3']);
  const rows = table.rows.filter((row) => row.some((cell) => cell.trim()));
  const safeRows = rows.length ? rows : [['', '', '']];

  return `
    <div class="basic-table" role="table">
      <div class="basic-table-row basic-table-header" role="row">
        ${headers.map((cell) => `<div role="columnheader">${formatHighlights(cell)}</div>`).join('')}
      </div>
      ${safeRows
        .map(
          (row) => `
            <div class="basic-table-row" role="row">
              ${normalizeTableRow(row).map((cell) => `<div role="cell">${formatHighlights(cell)}</div>`).join('')}
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function rememberEditorSelection() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (editVisual.contains(range.commonAncestorContainer)) {
    savedEditorRange = range.cloneRange();
  }
}

function applyHighlightToSelection(color) {
  const selection = window.getSelection();
  const activeRange = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
  const range =
    activeRange && editVisual.contains(activeRange.commonAncestorContainer)
      ? activeRange.cloneRange()
      : savedEditorRange?.cloneRange();

  if (!range || !editVisual.contains(range.commonAncestorContainer)) {
    editVisual.focus();
    insertHighlightNode(color, 'texto');
    return;
  }

  const span = createEditorHighlight(color);
  if (range.collapsed) {
    span.textContent = 'texto';
    range.insertNode(span);
    editVisual.focus();
    selectNodeContents(span);
  } else {
    span.textContent = range.toString();
    range.deleteContents();
    range.insertNode(span);
    editVisual.focus();
    placeCaretAfter(span);
  }
  savedEditorRange = null;
}

function uppercaseEditorSelection() {
  const range = getEditorRange();
  if (!range || range.collapsed) {
    uppercaseTextNodes(editVisual);
    editVisual.focus();
    savedEditorRange = null;
    return;
  }

  const text = range.toString().toUpperCase();
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  editVisual.focus();
  savedEditorRange = null;
}

function uppercaseTextNodes(node) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      child.nodeValue = child.nodeValue.toUpperCase();
      return;
    }

    uppercaseTextNodes(child);
  });
}

function clearHighlightSelection() {
  const range = getEditorRange();
  if (!range) {
    editVisual.focus();
    return;
  }

  const targets = getHighlightsInRange(range);
  if (!targets.length) {
    const highlight = closestHighlight(range.startContainer);
    if (highlight) targets.push(highlight);
  }

  if (!targets.length) return;

  const selectionRange = document.createRange();
  selectionRange.setStartBefore(targets[0]);
  selectionRange.setEndAfter(targets[targets.length - 1]);
  targets.forEach(unwrapElement);
  editVisual.focus();
  savedEditorRange = null;
  selectRange(selectionRange);
}

function getEditorRange() {
  const selection = window.getSelection();
  const activeRange = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
  const range =
    activeRange && editVisual.contains(activeRange.commonAncestorContainer)
      ? activeRange.cloneRange()
      : savedEditorRange?.cloneRange();

  if (!range || !editVisual.contains(range.commonAncestorContainer)) return null;
  return range;
}

function getHighlightsInRange(range) {
  return [...editVisual.querySelectorAll('[data-highlight-color]')].filter((node) => rangeIntersectsNode(range, node));
}

function rangeIntersectsNode(range, node) {
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

function closestHighlight(node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return element?.closest?.('[data-highlight-color]');
}

function unwrapElement(element) {
  const fragment = document.createDocumentFragment();
  while (element.firstChild) fragment.append(element.firstChild);
  element.replaceWith(fragment);
}

function renderSponsorText(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  presentText.classList.remove('list-mode', 'rich-mode', 'table-mode');
  presentText.classList.add('sponsor-mode');
  presentText.innerHTML = `<div class="sponsor-list">${lines.map(renderSponsorLine).join('')}</div>`;

  const sliderValue = Number(document.querySelector('#fontRange').value || 28);
  const maxSize = window.innerWidth <= 460 ? 42 : 54;
  applyPresentFontSize(Math.min(sliderValue, maxSize));
}

function renderSponsorLine(line) {
  const commaIndex = line.indexOf(',');
  const name = commaIndex >= 0 ? line.slice(0, commaIndex).trim() : line;
  const copy = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : '';

  return `
    <div class="sponsor-item">
      <div class="sponsor-name">${formatHighlights(name)}</div>
      ${copy ? `<div class="sponsor-copy">${formatHighlights(copy)}</div>` : ''}
    </div>
  `;
}

function fitListText() {
  const minSize = 18;
  let size = Number.parseFloat(presentText.style.fontSize) || 28;
  const lines = [...presentText.querySelectorAll('.present-line')];
  if (!lines.length) return;

  while (size > minSize && lines.some((line) => line.scrollWidth > presentText.clientWidth)) {
    size -= 1;
    presentText.style.fontSize = `${size}px`;
  }
}

function renderEditList() {
  const selected = topicFilter.value || 'todos';
  const search = normalizeForSearch(noteSearch.value);
  const visible = currentRoute().speeches
    .map((speech, index) => ({ ...speech, index }))
    .filter((speech) => selected === 'todos' || speech.topic === selected)
    .filter((speech) => {
      if (!search) return true;
      return normalizeForSearch(`${speech.title || ''} ${speech.topic || ''} ${stripHighlightMarkup(speech.text || '')}`).includes(search);
    });

  if (!visible.length) {
    scriptList.innerHTML = '<p class="status">Nenhuma nota encontrada.</p>';
    return;
  }

  scriptList.innerHTML = visible
    .map(
      (speech) => `
        <article class="script-item ${speech.remaining === 0 ? 'done' : ''}">
          <div class="script-head">
            <div>
              <strong class="script-title">${escapeHtml(speech.title || createSpeechTitle(speech, speech.index))}</strong>
              <span class="category">${escapeHtml(speech.topic)}</span>
            </div>
            <span class="status">${speech.remaining}/${speech.target} restantes</span>
          </div>
          <div class="script-text">${renderEditPreview(speech)}</div>
          <div class="script-actions three">
            <button class="primary-button" type="button" data-add-playlist="${speech.index}">Adicionar</button>
            <button class="secondary-button" type="button" data-edit="${speech.index}">Editar</button>
            <button class="secondary-button" type="button" data-present="${speech.index}">Abrir</button>
            <button class="secondary-button" type="button" data-reset="${speech.index}">Repor</button>
            <button class="danger-button" type="button" data-delete="${speech.index}">Excluir</button>
          </div>
        </article>
      `,
    )
    .join('');

  scriptList.querySelectorAll('[data-add-playlist]').forEach((button) => {
    button.addEventListener('click', () => addSpeechToActivePlaylist(Number(button.dataset.addPlaylist)));
  });

  scriptList.querySelectorAll('[data-present]').forEach((button) => {
    button.addEventListener('click', () => {
      const speech = currentRoute().speeches[Number(button.dataset.present)];
      activeTopic = speech.topic;
      currentIndex = getSpeechesByTopic(activeTopic).findIndex((item) => item === speech);
      setView('present');
    });
  });

  scriptList.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => openSpeechDialog(Number(button.dataset.edit)));
  });

  scriptList.querySelectorAll('[data-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      const speech = currentRoute().speeches[Number(button.dataset.reset)];
      speech.remaining = speech.target;
      saveAndRender();
    });
  });

  scriptList.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteSpeech(Number(button.dataset.delete)));
  });
}

function renderPlaylistItems() {
  const playlist = getActivePlaylist();
  if (!playlist) {
    playlistItems.innerHTML = '<p class="status">Crie uma playlist para começar.</p>';
    return;
  }

  if (!playlist.items.length) {
    playlistItems.innerHTML = '<p class="status">Abra NOTAS e toque em ADICIONAR para montar esta playlist.</p>';
    return;
  }

  playlistItems.innerHTML = playlist.items
    .map((speechId, index) => {
      const speech = currentRoute().speeches.find((item) => item.id === speechId);
      if (!speech) return '';

      return `
        <article class="playlist-item" data-playlist-index="${index}">
          <div class="playlist-item-head">
            <button class="move-handle" type="button" data-playlist-drag="${index}">Mover</button>
            <div>
              <strong>${escapeHtml(index + 1)}. ${escapeHtml(speech.title || speech.topic)}</strong>
              <span>${escapeHtml(speech.topic)}</span>
            </div>
            <span>${speech.remaining}/${speech.target}</span>
          </div>
          <div class="playlist-item-actions">
            <button class="secondary-button" type="button" data-playlist-up="${index}">Subir</button>
            <button class="secondary-button" type="button" data-playlist-down="${index}">Descer</button>
            <button class="secondary-button" type="button" data-playlist-edit="${index}">Editar</button>
            <button class="danger-button" type="button" data-playlist-remove="${index}">Tirar</button>
          </div>
        </article>
      `;
    })
    .join('');

  playlistItems.querySelectorAll('[data-playlist-up]').forEach((button) => {
    button.addEventListener('click', () => movePlaylistItem(Number(button.dataset.playlistUp), -1));
  });
  playlistItems.querySelectorAll('[data-playlist-down]').forEach((button) => {
    button.addEventListener('click', () => movePlaylistItem(Number(button.dataset.playlistDown), 1));
  });
  playlistItems.querySelectorAll('[data-playlist-edit]').forEach((button) => {
    button.addEventListener('click', () => editPlaylistItem(Number(button.dataset.playlistEdit)));
  });
  playlistItems.querySelectorAll('[data-playlist-remove]').forEach((button) => {
    button.addEventListener('click', () => removePlaylistItem(Number(button.dataset.playlistRemove)));
  });
  playlistItems.querySelectorAll('[data-playlist-drag]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => startPlaylistDrag(event, Number(button.dataset.playlistDrag)));
  });
}

function renderEditPreview(speech) {
  if (speech.kind !== 'table') return formatHighlights(speech.text);

  const table = normalizeSpeechTable(speech.table);
  const rows = table.rows.filter((row) => row.some((cell) => cell.trim())).slice(0, 4);
  const preview = [normalizeTableRow(table.headers), ...rows]
    .map((row) => normalizeTableRow(row).filter(Boolean).join(' | '))
    .filter(Boolean)
    .join('\n');

  return `<strong class="table-preview-label">Tabela</strong>${escapeHtml(preview || 'Tabela vazia')}`;
}

function setEditSection(section) {
  document.querySelectorAll('[data-edit-section]').forEach((button) => {
    button.classList.toggle('active', button.dataset.editSection === section);
  });
  document.querySelectorAll('[data-edit-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.editPanel === section);
  });
}

function normalizeForSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function startPlaylistDrag(event, index) {
  event.preventDefault();
  const item = event.target.closest('[data-playlist-index]');
  if (!item) return;

  playlistDrag = {
    from: index,
    to: index,
    pointerId: event.pointerId,
  };
  item.classList.add('dragging');
  item.setPointerCapture?.(event.pointerId);
  document.addEventListener('pointermove', movePlaylistDrag);
  document.addEventListener('pointerup', finishPlaylistDrag, { once: true });
  document.addEventListener('pointercancel', cancelPlaylistDrag, { once: true });
}

function movePlaylistDrag(event) {
  if (!playlistDrag || event.pointerId !== playlistDrag.pointerId) return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-playlist-index]');
  if (!target || !playlistItems.contains(target)) return;

  playlistItems.querySelectorAll('.drop-target').forEach((item) => item.classList.remove('drop-target'));
  target.classList.add('drop-target');
  playlistDrag.to = Number(target.dataset.playlistIndex);
}

function finishPlaylistDrag(event) {
  if (!playlistDrag || event.pointerId !== playlistDrag.pointerId) return;
  const { from, to } = playlistDrag;
  clearPlaylistDragMarks();
  playlistDrag = null;

  if (from === to || Number.isNaN(to)) return;
  reorderPlaylistItem(from, to);
}

function cancelPlaylistDrag() {
  clearPlaylistDragMarks();
  playlistDrag = null;
}

function clearPlaylistDragMarks() {
  playlistItems.querySelectorAll('.dragging, .drop-target').forEach((item) => {
    item.classList.remove('dragging', 'drop-target');
  });
  document.removeEventListener('pointermove', movePlaylistDrag);
}

function getActivePlaylist() {
  const route = currentRoute();
  return route.playlists.find((playlist) => playlist.id === activePlaylistId || playlist.id === route.activePlaylistId) || route.playlists[0] || null;
}

function openPlaylistDialog(mode) {
  playlistNameMode = mode;
  const playlist = getActivePlaylist();
  playlistDialogTitle.textContent = mode === 'rename' ? 'Renomear playlist' : 'Nova playlist';
  playlistNameInput.value = mode === 'rename' && playlist ? playlist.name : '';
  playlistDialog.showModal();
}

function savePlaylistFromDialog() {
  const name = playlistNameInput.value.trim();
  if (!name) return;

  const route = currentRoute();
  if (playlistNameMode === 'rename') {
    const playlist = getActivePlaylist();
    if (playlist) playlist.name = name;
  } else {
    const playlist = {
      id: createId(),
      name,
      items: [],
    };
    route.playlists.push(playlist);
    route.activePlaylistId = playlist.id;
    activePlaylistId = playlist.id;
  }

  playlistDialog.close();
  saveAndRender();
}

function duplicateActivePlaylist() {
  const route = currentRoute();
  const playlist = getActivePlaylist();
  if (!playlist) return;

  const copy = {
    id: createId(),
    name: `${playlist.name} - cópia`,
    items: [...playlist.items],
  };
  route.playlists.push(copy);
  route.activePlaylistId = copy.id;
  activePlaylistId = copy.id;
  saveAndRender();
}

function addSpeechToActivePlaylist(speechIndex) {
  const route = currentRoute();
  let playlist = getActivePlaylist();
  if (!playlist) {
    playlist = {
      id: createId(),
      name: 'Playlist rápida',
      items: [],
    };
    route.playlists.push(playlist);
    route.activePlaylistId = playlist.id;
    activePlaylistId = playlist.id;
  }

  const speech = route.speeches[speechIndex];
  if (!speech) return;
  playlist.items.push(speech.id);
  saveAndRender();
}

function movePlaylistItem(index, direction) {
  const playlist = getActivePlaylist();
  if (!playlist) return;

  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= playlist.items.length) return;
  reorderPlaylistItem(index, nextIndex);
}

function reorderPlaylistItem(fromIndex, toIndex) {
  const playlist = getActivePlaylist();
  if (!playlist) return;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= playlist.items.length || toIndex >= playlist.items.length) return;

  const [item] = playlist.items.splice(fromIndex, 1);
  playlist.items.splice(toIndex, 0, item);
  saveAndRender();
}

function removePlaylistItem(index) {
  const playlist = getActivePlaylist();
  if (!playlist) return;
  playlist.items.splice(index, 1);
  saveAndRender();
}

function editPlaylistItem(index) {
  const playlist = getActivePlaylist();
  if (!playlist) return;
  const speechId = playlist.items[index];
  const speechIndex = currentRoute().speeches.findIndex((speech) => speech.id === speechId);
  if (speechIndex >= 0) openSpeechDialog(speechIndex);
}

function renderSummary() {
  return;
}

function openSpeechDialog(index = null) {
  editingIndex = index;
  dialogTitle.textContent = index === null ? 'Nova fala' : 'Editar fala';
  renderTopicOptions();

  const speech = index === null ? null : currentRoute().speeches[index];
  const text = normalizeHighlightMarkup(speech?.text || '');
  editTitle.value = speech?.title || '';
  editTopic.value = speech?.topic || activeTopic || currentRoute().topics[0];
  updateSpeechTopicSummary();
  setTopicPickerVisible(false);
  editTarget.value = speech?.target || 1;
  editKind.value = speech?.kind === 'table' ? 'table' : 'text';
  editText.value = text;
  editVisual.innerHTML = markupToEditorHtml(text);
  renderTableEditor(speech?.table);
  updateSpeechKindUI();
  savedEditorRange = null;
  speechDialog.showModal();
}

function updateSpeechTopicSummary() {
  editTopicSummary.textContent = editTopic.value || 'Sem tópico';
}

function setTopicPickerVisible(visible) {
  editTopicField.hidden = !visible;
  showTopicBtn.textContent = visible ? 'Ocultar tópicos' : 'Trocar tópico';
}

function updateSpeechKindUI() {
  const isTable = editKind.value === 'table';
  textEditorPanel.hidden = isTable;
  tableEditorPanel.hidden = !isTable;
}

function renderTableEditor(tableData = null) {
  const table = normalizeSpeechTable(tableData);
  const rows = [normalizeTableRow(table.headers, ['Apresentação', 'Atração', 'Horário']), ...table.rows];

  editTable.innerHTML = rows
    .map((row, rowIndex) =>
      normalizeTableRow(row)
        .map(
          (cell, colIndex) => `
            <input
              type="text"
              data-table-row="${rowIndex}"
              data-table-col="${colIndex}"
              value="${escapeHtml(cell)}"
              placeholder="${rowIndex === 0 ? `Coluna ${colIndex + 1}` : ''}"
              aria-label="${rowIndex === 0 ? `Cabeçalho ${colIndex + 1}` : `Linha ${rowIndex}, coluna ${colIndex + 1}`}"
            />
          `,
        )
        .join(''),
    )
    .join('');
}

function readTableEditor() {
  const rows = Array.from({ length: 16 }, () => ['', '', '']);
  editTable.querySelectorAll('input[data-table-row]').forEach((input) => {
    const row = Number(input.dataset.tableRow);
    const col = Number(input.dataset.tableCol);
    if (rows[row] && col >= 0 && col < 3) rows[row][col] = input.value.trim();
  });

  return normalizeSpeechTable({
    headers: rows[0],
    rows: rows.slice(1),
  });
}

function clearTableEditor() {
  renderTableEditor({
    headers: ['Apresentação', 'Atração', 'Horário'],
    rows: [],
  });
}

function normalizeSpeechTable(table = null) {
  const headers = normalizeTableRow(table?.headers, ['Apresentação', 'Atração', 'Horário']);
  const sourceRows = Array.isArray(table?.rows) ? table.rows : [];
  const rows = Array.from({ length: 15 }, (_, index) => normalizeTableRow(sourceRows[index]));
  return { headers, rows };
}

function normalizeTableRow(row = [], fallback = ['', '', '']) {
  return Array.from({ length: 3 }, (_, index) => String(row?.[index] ?? fallback[index] ?? '').trim());
}

function tableToPlainText(table) {
  const rows = [normalizeTableRow(table.headers), ...table.rows.map((row) => normalizeTableRow(row))];
  return rows
    .filter((row, index) => index === 0 || row.some((cell) => cell.trim()))
    .map((row) => row.join(' | '))
    .join('\n')
    .trim();
}

function editCurrentSpeech() {
  const entry = getPresentationEntries()[currentIndex];
  if (entry?.speechIndex >= 0) {
    openSpeechDialog(entry.speechIndex);
    return;
  }

  if (presentationMode === 'playlist') {
    setView('edit');
  }
}

function saveSpeechFromDialog() {
  const kind = editKind.value === 'table' ? 'table' : 'text';
  let text = '';
  let table = normalizeSpeechTable();

  if (kind === 'table') {
    table = readTableEditor();
    text = tableToPlainText(table);
  } else {
    editText.value = normalizeHighlightMarkup(editorHtmlToMarkup(editVisual));
    text = editText.value.trim();
  }

  if (!text) return;

  const target = clamp(Number(editTarget.value || 1), 1, 20);
  const route = currentRoute();
  const topic = editTopic.value || route.topics[0];
  const previous = editingIndex === null ? null : route.speeches[editingIndex];
  const title = editTitle.value.trim() || createSpeechTitle({ topic, text }, route.speeches.length);
  const spoken = previous ? previous.target - previous.remaining : 0;
  const nextSpeech = {
    id: previous?.id || createId(),
    title,
    topic,
    kind,
    text,
    table,
    target,
    remaining: clamp(target - spoken, 0, target),
  };

  if (editingIndex === null) {
    route.speeches.push(nextSpeech);
  } else {
    route.speeches[editingIndex] = nextSpeech;
  }

  if (!route.topics.includes(topic)) route.topics.push(topic);
  activeTopic = topic;
  speechDialog.close();
  saveAndRender();
}

function openTopicDialog() {
  newTopicName.value = '';
  topicDialog.showModal();
}

function saveTopicFromDialog() {
  const topic = newTopicName.value.trim();
  if (!topic) return;

  const route = currentRoute();
  if (!route.topics.includes(topic)) route.topics.push(topic);
  route.topicModes ||= {};
  activeTopic = topic;
  topicDialog.close();
  saveAndRender();
}

function openTopicModeDialog() {
  renderTopicOptions();
  topicModeName.value = currentRoute().topics.includes(activeTopic) ? activeTopic : currentRoute().topics[0];
  topicModeValue.value = currentRoute().topicModes?.[topicModeName.value] || 'normal';
  topicModeDialog.showModal();
}

function saveTopicModeFromDialog() {
  const route = currentRoute();
  const topic = topicModeName.value;
  const mode = topicModeValue.value;
  route.topicModes ||= {};

  if (mode === 'normal') {
    delete route.topicModes[topic];
  } else {
    route.topicModes[topic] = mode;
  }

  activeTopic = topic;
  topicModeDialog.close();
  saveAndRender();
}

function openRenameTopicDialog(topic) {
  activeTopic = topic;
  renderTopicOptions();
  renameTopicFrom.value = topic;
  renameTopicTo.value = topic;
  renameTopicDialog.showModal();
}

function saveRenameTopicFromDialog() {
  const oldTopic = renameTopicFrom.value;
  const newTopic = renameTopicTo.value.trim();
  if (!oldTopic || !newTopic) return;

  const route = currentRoute();
  route.topics = route.topics.map((topic) => (topic === oldTopic ? newTopic : topic));
  route.topics = [...new Set(route.topics)];
  route.topicModes ||= {};
  if (route.topicModes[oldTopic]) {
    route.topicModes[newTopic] = route.topicModes[oldTopic];
    delete route.topicModes[oldTopic];
  }
  route.speeches.forEach((speech) => {
    if (speech.topic === oldTopic) speech.topic = newTopic;
  });
  activeTopic = newTopic;
  renameTopicDialog.close();
  saveAndRender();
}

function deleteSpeech(index) {
  const route = currentRoute();
  const speech = route.speeches[index];
  if (!speech) return;

  const shouldDelete = confirm('EXCLUIR ESTA FALA?');
  if (!shouldDelete) return;

  route.speeches.splice(index, 1);
  route.playlists.forEach((playlist) => {
    playlist.items = playlist.items.filter((speechId) => speechId !== speech.id);
  });
  currentIndex = 0;
  saveAndRender();
}

function openReorderDialog() {
  renderReorderList();
  reorderDialog.showModal();
}

function renderReorderList() {
  reorderList.innerHTML = currentRoute().topics
    .map(
      (topic, index) => `
        <div class="reorder-item">
          <strong>${escapeHtml(topic)}</strong>
          <div>
            <button class="secondary-button" type="button" data-move-up="${index}">Subir</button>
            <button class="secondary-button" type="button" data-move-down="${index}">Descer</button>
          </div>
        </div>
      `,
    )
    .join('');

  reorderList.querySelectorAll('[data-move-up]').forEach((button) => {
    button.addEventListener('click', () => moveTopic(Number(button.dataset.moveUp), -1));
  });

  reorderList.querySelectorAll('[data-move-down]').forEach((button) => {
    button.addEventListener('click', () => moveTopic(Number(button.dataset.moveDown), 1));
  });
}

function moveTopic(index, direction) {
  const nextIndex = index + direction;
  const route = currentRoute();
  if (nextIndex < 0 || nextIndex >= route.topics.length) return;

  const moved = route.topics[index];
  route.topics[index] = route.topics[nextIndex];
  route.topics[nextIndex] = moved;
  saveState();
  render();
  renderReorderList();
}

function openRouteDialog() {
  renderRouteList();
  routeDialog.showModal();
}

function renderRouteList() {
  routeList.innerHTML = state.routes
    .map(
      (route) => `
        <div class="route-item">
          <strong>${escapeHtml(route.name)}</strong>
          <div>
            <button class="secondary-button" type="button" data-open-route="${route.id}">Abrir</button>
            <button class="secondary-button" type="button" data-delete-route="${route.id}">Excluir</button>
          </div>
        </div>
      `,
    )
    .join('');

  routeList.querySelectorAll('[data-open-route]').forEach((button) => {
    button.addEventListener('click', () => openRoute(button.dataset.openRoute));
  });

  routeList.querySelectorAll('[data-delete-route]').forEach((button) => {
    button.addEventListener('click', () => deleteRoute(button.dataset.deleteRoute));
  });
}

function openRoute(routeId) {
  const route = state.routes.find((item) => item.id === routeId);
  if (!route) return;

  state.activeRouteId = route.id;
  activeTopic = route.topics[0] || 'Informes';
  activePlaylistId = route.activePlaylistId || route.playlists?.[0]?.id || '';
  presentationMode = 'topic';
  currentIndex = 0;
  routeDialog.close();
  saveAndRender();
  setView('home');
}

function openRouteNameDialog(mode) {
  routeNameMode = mode;
  routeNameTitle.textContent = mode === 'rename' ? 'Renomear roteiro' : 'Novo roteiro';
  routeNameInput.value = mode === 'rename' ? currentRoute().name : '';
  routeNameDialog.showModal();
}

function saveRouteNameFromDialog() {
  const name = routeNameInput.value.trim();
  if (!name) return;

  if (routeNameMode === 'rename') {
    currentRoute().name = name;
  } else {
    const route = {
      id: createId(),
      name,
      color: currentRoute().color || '#f4f2ec',
      topics: [...defaultTopics],
      speeches: [],
      playlists: [],
      activePlaylistId: '',
      topicModes: {},
    };
    state.routes.push(route);
    state.activeRouteId = route.id;
    activeTopic = route.topics[0] || 'Informes';
    activePlaylistId = '';
    presentationMode = 'topic';
  }

  routeNameDialog.close();
  saveAndRender();
  setView('home');
}

function duplicateCurrentRoute() {
  const source = currentRoute();
  const route = {
    id: createId(),
    name: `${source.name} - Cópia`,
    color: source.color || '#f4f2ec',
    topics: [...source.topics],
    speeches: source.speeches.map((speech) => ({ ...speech })),
    playlists: (source.playlists || []).map((playlist) => ({
      ...playlist,
      id: createId(),
      items: [...playlist.items],
    })),
    activePlaylistId: '',
    topicModes: { ...(source.topicModes || {}) },
  };
  route.activePlaylistId = route.playlists[0]?.id || '';
  state.routes.push(route);
  state.activeRouteId = route.id;
  activeTopic = route.topics[0] || 'Informes';
  activePlaylistId = route.activePlaylistId || route.playlists?.[0]?.id || '';
  presentationMode = 'topic';
  saveAndRender();
  setView('home');
}

function deleteRoute(routeId) {
  if (state.routes.length <= 1) {
    alert('MANTENHA PELO MENOS UM ROTEIRO.');
    return;
  }

  const route = state.routes.find((item) => item.id === routeId);
  if (!route) return;

  const shouldDelete = confirm(`EXCLUIR O ROTEIRO "${route.name}"?`);
  if (!shouldDelete) return;

  state.routes = state.routes.filter((item) => item.id !== routeId);
  if (state.activeRouteId === routeId) {
    state.activeRouteId = state.routes[0].id;
    activeTopic = state.routes[0].topics[0] || 'Informes';
    activePlaylistId = state.routes[0].activePlaylistId || state.routes[0].playlists?.[0]?.id || '';
    presentationMode = 'topic';
  }

  saveAndRender();
  renderRouteList();
}

function exportBackup() {
  const scope = backupScope.value || 'current';
  const isCurrentOnly = scope === 'current';
  const payload = {
    app: 'roteiro-palco',
    version: 1,
    scope,
    exportedAt: new Date().toISOString(),
    data: isCurrentOnly ? { route: currentRoute() } : state,
  };
  backupText.value = JSON.stringify(payload, null, 2);
}

async function copyBackup() {
  if (!backupText.value.trim()) exportBackup();
  if (!backupText.value.trim()) return;

  try {
    await navigator.clipboard.writeText(backupText.value);
    alert('BACKUP COPIADO.');
  } catch {
    backupText.focus();
    backupText.select();
    backupText.setSelectionRange(0, backupText.value.length);

    const copied = document.execCommand && document.execCommand('copy');
    if (copied) {
      alert('BACKUP COPIADO.');
      return;
    }

    alert('O TEXTO FOI SELECIONADO. AGORA APERTE CTRL+C PARA COPIAR.');
  }
}

async function copyUrgentLink() {
  renderUrgentLink();
  if (!urgentLinkInput.value.trim()) {
    alert('DIGITE O CÓDIGO DE SINCRONIZAÇÃO PRIMEIRO.');
    return;
  }

  try {
    await navigator.clipboard.writeText(urgentLinkInput.value);
    alert('LINK URGENTE COPIADO.');
  } catch {
    urgentLinkInput.focus();
    urgentLinkInput.select();
    urgentLinkInput.setSelectionRange(0, urgentLinkInput.value.length);
    alert('O LINK FOI SELECIONADO. AGORA COPIE.');
  }
}

function importBackup() {
  const raw = backupText.value.trim();
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const nextState = parsed.data ? parsed.data : parsed;

    if (nextState.route) {
      importSingleRoute(nextState.route);
    } else {
      state = normalizeState(nextState);
    }

    activeTopic = currentRoute().topics[0] || 'Informes';
    activePlaylistId = currentRoute().activePlaylistId || currentRoute().playlists?.[0]?.id || '';
    presentationMode = 'topic';
    currentIndex = 0;
    saveAndRender();
    setView('home');
    alert('BACKUP IMPORTADO.');
  } catch {
    alert('NÃO CONSEGUI IMPORTAR. CONFIRA SE O BACKUP FOI COLADO INTEIRO.');
  }
}

function importSingleRoute(routeData) {
  const importedRoute = normalizeState({ routes: [routeData] }).routes[0];
  const sameNameIndex = state.routes.findIndex((route) => route.name === importedRoute.name);

  if (sameNameIndex >= 0) {
    const replace = confirm(`JÁ EXISTE UM ROTEIRO CHAMADO "${importedRoute.name}". SUBSTITUIR?`);
    if (replace) {
      importedRoute.id = state.routes[sameNameIndex].id;
      state.routes[sameNameIndex] = importedRoute;
      state.activeRouteId = importedRoute.id;
      return;
    }

    importedRoute.id = createId();
    importedRoute.name = `${importedRoute.name} - Importado`;
  }

  state.routes.push(importedRoute);
  state.activeRouteId = importedRoute.id;
}

function saveRestorePoint() {
  const payload = {
    savedAt: new Date().toISOString(),
    data: state,
  };
  localStorage.setItem(RESTORE_POINT_KEY, JSON.stringify(payload));
  renderRestorePointStatus();
  alert('PONTO DE RESTAURAÇÃO SALVO.');
}

function restoreSavedPoint() {
  const stored = localStorage.getItem(RESTORE_POINT_KEY);
  if (!stored) {
    alert('NENHUM PONTO SALVO NESTE APARELHO.');
    return;
  }

  const shouldRestore = confirm('RESTAURAR O PONTO SALVO? AS ALTERAÇÕES ATUAIS SERÃO SUBSTITUÍDAS.');
  if (!shouldRestore) return;

  try {
    const parsed = JSON.parse(stored);
    state = normalizeState(parsed.data);
    activeTopic = currentRoute().topics[0] || 'Informes';
    activePlaylistId = currentRoute().activePlaylistId || currentRoute().playlists?.[0]?.id || '';
    presentationMode = 'topic';
    currentIndex = 0;
    saveAndRender();
    setView('home');
    alert('PONTO RESTAURADO.');
  } catch {
    alert('NÃO CONSEGUI RESTAURAR ESSE PONTO.');
  }
}

function renderRestorePointStatus() {
  const stored = localStorage.getItem(RESTORE_POINT_KEY);
  if (!stored) {
    restorePointStatus.textContent = 'Nenhum ponto salvo neste aparelho.';
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    const date = new Date(parsed.savedAt);
    restorePointStatus.textContent = `Ponto salvo em ${date.toLocaleString('pt-BR')}.`;
  } catch {
    restorePointStatus.textContent = 'Existe um ponto salvo, mas ele não pôde ser lido.';
  }
}

function saveSyncToken() {
  const token = syncTokenInput.value.trim();
  if (token) {
    localStorage.setItem(CLOUD_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(CLOUD_TOKEN_KEY);
  }
}

function loadSyncToken() {
  syncTokenInput.value = localStorage.getItem(CLOUD_TOKEN_KEY) || '';
  renderUrgentLink();
}

function renderUrgentLink() {
  const token = syncTokenInput.value.trim();
  urgentLinkInput.value = token ? `${window.location.origin}/api/urgent-submit?token=${encodeURIComponent(token)}` : '';
}

function renderCloudStatus(message = null) {
  if (message) {
    cloudStatus.textContent = message;
    return;
  }

  const stored = localStorage.getItem(CLOUD_SYNC_KEY);
  if (!stored) {
    cloudStatus.textContent = 'Nuvem ainda não sincronizada neste aparelho.';
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    const date = new Date(parsed.syncedAt);
    cloudStatus.textContent = `${parsed.direction} em ${date.toLocaleString('pt-BR')}.`;
  } catch {
    cloudStatus.textContent = 'Existe um histórico de nuvem, mas ele não pôde ser lido.';
  }
}

async function pushCloudState() {
  const token = syncTokenInput.value.trim();
  renderCloudStatus('Enviando para a nuvem...');

  try {
    const response = await fetch('./api/sync', {
      method: 'PUT',
      headers: buildSyncHeaders(token),
      body: JSON.stringify({ state }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || 'Não consegui enviar para a nuvem.');
    saveCloudSync('Enviado para a nuvem', result.updatedAt);
    renderCloudStatus();
    alert('ROTEIRO ENVIADO PARA A NUVEM.');
  } catch (error) {
    renderCloudStatus(error.message || 'Não consegui enviar para a nuvem.');
  }
}

async function pullCloudState() {
  const shouldPull = confirm('BUSCAR DA NUVEM? O ROTEIRO DESTE APARELHO SERÁ SUBSTITUÍDO PELO QUE ESTÁ NA NUVEM.');
  if (!shouldPull) return;

  const token = syncTokenInput.value.trim();
  renderCloudStatus('Buscando da nuvem...');

  try {
    const response = await fetch('./api/sync', {
      method: 'GET',
      headers: buildSyncHeaders(token),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || 'Não consegui buscar da nuvem.');
    state = normalizeState(result.state);
    activeTopic = currentRoute().topics[0] || 'Informes';
    activePlaylistId = currentRoute().activePlaylistId || currentRoute().playlists?.[0]?.id || '';
    presentationMode = 'topic';
    currentIndex = 0;
    saveAndRender();
    saveCloudSync('Buscado da nuvem', result.updatedAt);
    renderCloudStatus();
    setView('home');
    alert('ROTEIRO BUSCADO DA NUVEM.');
  } catch (error) {
    renderCloudStatus(error.message || 'Não consegui buscar da nuvem.');
  }
}

function buildSyncHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Sync-Token'] = token;
  return headers;
}

function saveCloudSync(direction, serverDate = null) {
  localStorage.setItem(
    CLOUD_SYNC_KEY,
    JSON.stringify({
      direction,
      syncedAt: serverDate || new Date().toISOString(),
    }),
  );
}

async function fetchUrgentMessages() {
  const token = syncTokenInput.value.trim();
  if (!token) {
    urgentMessages = [];
    renderUrgentButton();
    return;
  }

  try {
    const response = await fetch('./api/urgent', {
      method: 'GET',
      headers: buildSyncHeaders(token),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não consegui buscar urgentes.');
    urgentMessages = Array.isArray(result.messages) ? result.messages : [];
    renderUrgentButton();
    renderUrgentList();
  } catch (error) {
    urgentHint.textContent = error.message || 'Não consegui buscar urgentes agora.';
  }
}

function renderUrgentButton() {
  const unseen = getUnseenUrgentMessages();
  urgentBtn.hidden = unseen.length === 0;
  urgentBtn.classList.toggle('has-urgent', unseen.length > 0);
  urgentCount.textContent = unseen.length;
}

function openUrgentDialog() {
  markUrgentsSeen();
  renderUrgentButton();
  renderUrgentList();
  urgentDialog.showModal();
}

function renderUrgentList() {
  if (!urgentMessages.length) {
    urgentList.innerHTML = '<p class="status">Nenhum recado urgente recebido.</p>';
    return;
  }

  urgentList.innerHTML = urgentMessages
    .map(
      (message) => `
        <article class="urgent-item">
          <div class="urgent-item-head">
            <strong>${escapeHtml(message.title || 'Recado urgente')}</strong>
            <span>${formatUrgentDate(message.createdAt)}</span>
          </div>
          <div class="script-text">${formatHighlights(message.text || '')}</div>
          <div class="urgent-item-actions">
            <button class="primary-button" type="button" data-urgent-note="${escapeHtml(message.id)}">Virar nota</button>
            <button class="secondary-button" type="button" data-urgent-playlist="${escapeHtml(message.id)}">Na playlist</button>
          </div>
        </article>
      `,
    )
    .join('');

  urgentList.querySelectorAll('[data-urgent-note]').forEach((button) => {
    button.addEventListener('click', () => createNoteFromUrgent(button.dataset.urgentNote, false));
  });
  urgentList.querySelectorAll('[data-urgent-playlist]').forEach((button) => {
    button.addEventListener('click', () => createNoteFromUrgent(button.dataset.urgentPlaylist, true));
  });
}

function createNoteFromUrgent(messageId, addToPlaylist) {
  const message = urgentMessages.find((item) => item.id === messageId);
  if (!message) return;

  const route = currentRoute();
  const topic = 'Urgente';
  if (!route.topics.includes(topic)) route.topics.push(topic);
  const speech = {
    id: createId(),
    title: message.title || 'Urgente',
    topic,
    text: message.text || '',
    target: 1,
    remaining: 1,
  };
  route.speeches.push(speech);

  if (addToPlaylist) {
    let playlist = getActivePlaylist();
    if (!playlist) {
      playlist = {
        id: createId(),
        name: 'Playlist rápida',
        items: [],
      };
      route.playlists.push(playlist);
      route.activePlaylistId = playlist.id;
      activePlaylistId = playlist.id;
    }
    playlist.items.push(speech.id);
  }

  saveAndRender();
  alert(addToPlaylist ? 'URGENTE SALVO E ADICIONADO À PLAYLIST.' : 'URGENTE SALVO COMO NOTA.');
}

function getUnseenUrgentMessages() {
  const seenIds = loadSeenUrgentIds();
  return urgentMessages.filter((message) => !seenIds.has(message.id));
}

function markUrgentsSeen() {
  const seenIds = loadSeenUrgentIds();
  urgentMessages.forEach((message) => seenIds.add(message.id));
  localStorage.setItem(URGENT_SEEN_KEY, JSON.stringify([...seenIds]));
}

function loadSeenUrgentIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(URGENT_SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function formatUrgentDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function movePresenter(direction) {
  const entries = getPresentationEntries();
  if (!entries.length) return;
  currentIndex = clamp(currentIndex + direction, 0, entries.length - 1);
  renderPresenter();
}

function markCurrentSpoken() {
  const entries = getPresentationEntries();
  if (!entries.length) return;

  const { speech } = entries[currentIndex];
  speech.remaining = Math.max(0, speech.remaining - 1);
  if (currentIndex < entries.length - 1) currentIndex += 1;
  saveAndRender();
}

function focusFirstAvailableInTopic() {
  const speeches = getSpeechesByTopic(activeTopic);
  const next = speeches.findIndex((speech) => speech.remaining > 0);
  currentIndex = next >= 0 ? next : 0;
}

const swipeState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  horizontalIntent: false,
};

function startPresenterSwipe(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest('button, input, textarea, select, dialog, [contenteditable="true"]')) return;

  swipeState.active = true;
  swipeState.pointerId = event.pointerId;
  swipeState.startX = event.clientX;
  swipeState.startY = event.clientY;
  swipeState.lastX = event.clientX;
  swipeState.lastY = event.clientY;
  swipeState.horizontalIntent = false;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function movePresenterSwipe(event) {
  if (!swipeState.active || event.pointerId !== swipeState.pointerId) return;

  swipeState.lastX = event.clientX;
  swipeState.lastY = event.clientY;

  const deltaX = event.clientX - swipeState.startX;
  const deltaY = event.clientY - swipeState.startY;
  if (Math.abs(deltaX) > 16 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
    swipeState.horizontalIntent = true;
    event.preventDefault();
  }
}

function finishPresenterSwipe(event) {
  if (!swipeState.active || event.pointerId !== swipeState.pointerId) return;

  const deltaX = event.clientX - swipeState.startX;
  const deltaY = event.clientY - swipeState.startY;
  const isSwipe = Math.abs(deltaX) >= 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1;

  cancelPresenterSwipe(event);
  if (isSwipe) movePresenter(deltaX < 0 ? 1 : -1);
}

function cancelPresenterSwipe(event) {
  if (event?.pointerId === swipeState.pointerId) {
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
  }
  swipeState.active = false;
  swipeState.pointerId = null;
  swipeState.horizontalIntent = false;
}

function getSpeechesByTopic(topic) {
  return currentRoute().speeches.filter((speech) => speech.topic === topic);
}

function resetDefault() {
  state = normalizeState({
    routes: [
      {
        id: createId(),
        name: 'Roteiro Principal',
        color: '#f4f2ec',
        topics: defaultTopics,
        speeches: defaultSpeeches.map((speech) => ({ ...speech })),
        playlists: [],
        topicModes: {},
      },
    ],
  });
  activeTopic = currentRoute().topics[0];
  activePlaylistId = currentRoute().activePlaylistId || currentRoute().playlists?.[0]?.id || '';
  presentationMode = 'topic';
  currentIndex = 0;
  saveAndRender();
}

function saveAndRender() {
  saveState();
  render();
}

function createSpeechTitle(speech, index = 0) {
  const source = String(speech.title || speech.text || speech.topic || '').trim();
  const firstLine = source.split('\n').map((line) => line.trim()).find(Boolean) || `Nota ${index + 1}`;
  const clean = firstLine.replace(/\[\[(?:amarelo|azul|verde|vermelho):(.+?)\]\]/gi, '$1');
  return clean.length > 42 ? `${clean.slice(0, 39).trim()}...` : clean;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function markupToEditorHtml(value) {
  const lines = normalizeHighlightMarkup(value).split('\n');
  return lines.map((line) => `<div>${line ? formatHighlights(line) : '<br>'}</div>`).join('') || '<div><br></div>';
}

function editorHtmlToMarkup(root) {
  const nodes = [...root.childNodes].filter((node) => node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim());
  const hasOnlyBlocks =
    nodes.length > 0 &&
    nodes.every((node) => node.nodeType === Node.ELEMENT_NODE && ['DIV', 'P'].includes(node.nodeName));

  const markup = hasOnlyBlocks
    ? nodes.map((node) => collectChildrenMarkup(node).replace(/\n+$/g, '')).join('\n')
    : collectEditorMarkup(root);

  return markup.replace(/\u00a0/g, ' ').replace(/\n{4,}/g, '\n\n\n').trim();
}

function collectEditorMarkup(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
  if (node.nodeName === 'BR') return '\n';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node;
  const color = element.dataset?.highlightColor;
  if (color) return `[[${color}:${collectChildrenMarkup(element)}]]`;

  const content = collectChildrenMarkup(element);
  if (element !== editVisual && ['DIV', 'P'].includes(element.nodeName)) return `${content}\n`;
  return content;
}

function collectChildrenMarkup(element) {
  return [...element.childNodes].map(collectEditorMarkup).join('');
}

function createEditorHighlight(color) {
  const span = document.createElement('span');
  const colors = highlightColors();
  span.className = 'text-highlight';
  span.dataset.highlightColor = color;
  span.style.color = colors[color] || colors.amarelo;
  return span;
}

function insertHighlightNode(color, text) {
  const span = createEditorHighlight(color);
  span.textContent = text;
  editVisual.append(span);
  selectNodeContents(span);
}

function selectNodeContents(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  selectRange(range);
}

function placeCaretAfter(node) {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selectRange(range);
}

function selectRange(range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function formatHighlights(value) {
  const colors = highlightColors();

  return escapeHtml(normalizeHighlightMarkup(value)).replace(/\[\[(?:(amarelo|azul|verde|vermelho):)?(.+?)\]\]/gi, (_, colorName, text) => {
    const normalizedColor = (colorName || 'amarelo').toLowerCase();
    const color = colors[normalizedColor] || colors.amarelo;
    return `<span class="text-highlight" data-highlight-color="${normalizedColor}" style="color: ${color}">${text}</span>`;
  });
}

function normalizeHighlightMarkup(value) {
  let next = String(value || '');
  let previous = '';

  while (next !== previous) {
    previous = next;
    next = next.replace(
      /\[\[(amarelo|azul|verde|vermelho):\s*\[\[(?:amarelo|azul|verde|vermelho):([^\]]+)\]\]\s*\]\]/gi,
      '[[$1:$2]]',
    );
  }

  return next;
}

function stripHighlightMarkup(value) {
  return normalizeHighlightMarkup(value).replace(/\[\[(?:(?:amarelo|azul|verde|vermelho):)?(.+?)\]\]/gi, '$1');
}

function highlightColors() {
  return {
    amarelo: '#f4c95d',
    azul: '#80c7ff',
    verde: '#78d39b',
    vermelho: '#ff9f9f',
  };
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

saveState();
render();
renderRestorePointStatus();
loadSyncToken();
renderCloudStatus();
fetchUrgentMessages();
setInterval(fetchUrgentMessages, 45000);
registerOfflineApp();

function registerOfflineApp() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    offlineStatus.textContent = 'Offline indisponível neste navegador';
    return;
  }

  navigator.serviceWorker
    .register('./service-worker.js')
    .then(async (registration) => {
      offlineStatus.textContent = 'Preparando offline...';
      await registration.update().catch(() => null);
      await waitForServiceWorkerReady();
      await prepareOfflineCache();
      offlineStatus.textContent = 'Offline pronto';
    })
    .catch(() => {
      offlineStatus.textContent = 'Offline ainda não pronto';
    });
}

function waitForServiceWorkerReady() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => {
      setTimeout(resolve, 3500);
    }),
  ]);
}

async function prepareOfflineCache() {
  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const urls = OFFLINE_FILES.map((file) => new URL(file, window.location.href).href);

  await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url, {
        cache: 'reload',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Falha ao preparar offline: ${url}`);
      }

      await cache.put(url, response.clone());
    }),
  );

  const currentPage = new URL('index.html', window.location.href).href;
  const homeResponse = await cache.match(currentPage);
  if (homeResponse) {
    await cache.put(new URL('./', window.location.href).href, homeResponse.clone());
  }
}
