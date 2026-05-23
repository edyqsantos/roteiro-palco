const STORAGE_KEY = 'roteiro-palco-prototipo-quermesse-home-v1';
const RESTORE_POINT_KEY = 'roteiro-palco-ponto-restauracao';
const OFFLINE_CACHE_NAME = 'palco-offline-v8';
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
let activeTopic = currentRoute().topics[0] || 'Informes';
let currentIndex = 0;
let editingIndex = null;
let routeNameMode = 'new';

const views = {
  home: document.querySelector('#homeView'),
  present: document.querySelector('#presentView'),
  edit: document.querySelector('#editView'),
  transfer: document.querySelector('#transferView'),
};

const topicGrid = document.querySelector('#topicGrid');
const scriptList = document.querySelector('#scriptList');
const topicFilter = document.querySelector('#topicFilter');
const presentTopic = document.querySelector('#presentTopic');
const presentCounter = document.querySelector('#presentCounter');
const presentText = document.querySelector('#presentText');
const repeatText = document.querySelector('#repeatText');
const speechDialog = document.querySelector('#speechDialog');
const topicDialog = document.querySelector('#topicDialog');
const renameTopicDialog = document.querySelector('#renameTopicDialog');
const reorderDialog = document.querySelector('#reorderDialog');
const editTopic = document.querySelector('#editTopic');
const editTarget = document.querySelector('#editTarget');
const editText = document.querySelector('#editText');
const dialogTitle = document.querySelector('#dialogTitle');
const newTopicName = document.querySelector('#newTopicName');
const renameTopicFrom = document.querySelector('#renameTopicFrom');
const renameTopicTo = document.querySelector('#renameTopicTo');
const backupText = document.querySelector('#backupText');
const reorderList = document.querySelector('#reorderList');
const offlineStatus = document.querySelector('#offlineStatus');
const restorePointStatus = document.querySelector('#restorePointStatus');
const currentRouteName = document.querySelector('#currentRouteName');
const routeDialog = document.querySelector('#routeDialog');
const routeList = document.querySelector('#routeList');
const routeNameDialog = document.querySelector('#routeNameDialog');
const routeNameTitle = document.querySelector('#routeNameTitle');
const routeNameInput = document.querySelector('#routeNameInput');

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

document.querySelectorAll('[data-view-button]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.viewButton));
});

document.querySelector('#homeBtn').addEventListener('click', () => setView('home'));
document.querySelector('#routeSelectorBtn').addEventListener('click', openRouteDialog);
document.querySelector('#newRouteBtn').addEventListener('click', () => openRouteNameDialog('new'));
document.querySelector('#duplicateRouteBtn').addEventListener('click', duplicateCurrentRoute);
document.querySelector('#renameRouteBtn').addEventListener('click', () => openRouteNameDialog('rename'));
document.querySelector('#addTopicBtn').addEventListener('click', openTopicDialog);
document.querySelector('#renameTopicBtn').addEventListener('click', () => {
  const topic = topicFilter.value === 'todos' ? activeTopic : topicFilter.value;
  openRenameTopicDialog(topic);
});
document.querySelector('#reorderTopicsBtn').addEventListener('click', openReorderDialog);
document.querySelector('#addSpeechBtn').addEventListener('click', () => openSpeechDialog());
document.querySelector('#editCurrentBtn').addEventListener('click', editCurrentSpeech);
document.querySelector('#prevBtn').addEventListener('click', () => movePresenter(-1));
document.querySelector('#nextBtn').addEventListener('click', () => movePresenter(1));
document.querySelector('#doneBtn').addEventListener('click', markCurrentSpoken);
document.querySelector('#resetBtn').addEventListener('click', resetDefault);
document.querySelector('#fontRange').addEventListener('input', (event) => {
  const maxSize = window.innerWidth <= 460 ? 46 : 60;
  const size = Math.min(Number(event.target.value), maxSize);
  presentText.style.fontSize = `${size}px`;
});
document.querySelector('#exportBtn').addEventListener('click', exportBackup);
document.querySelector('#copyBackupBtn').addEventListener('click', copyBackup);
document.querySelector('#importBackupBtn').addEventListener('click', importBackup);
document.querySelector('#saveRestorePointBtn').addEventListener('click', saveRestorePoint);
document.querySelector('#restorePointBtn').addEventListener('click', restoreSavedPoint);

topicFilter.addEventListener('change', renderEditList);

document.querySelector('#saveSpeechBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveSpeechFromDialog();
});

document.querySelector('#saveTopicBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveTopicFromDialog();
});

document.querySelector('#saveRenameTopicBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveRenameTopicFromDialog();
});

document.querySelector('#saveRouteNameBtn').addEventListener('click', (event) => {
  event.preventDefault();
  saveRouteNameFromDialog();
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
      },
    ],
  });
}

function normalizeState(nextState) {
  const normalizeTopicName = (topic) => (topic === 'Agradecimentos' ? 'Agradecer' : topic);

  const normalizeRoute = (route, index = 0) => {
    const baseSpeeches = route.speeches || defaultSpeeches;
    const topics = [...new Set([...(route.topics || defaultTopics), ...baseSpeeches.map((speech) => speech.topic)].map(normalizeTopicName))];
    const speeches = baseSpeeches.map((speech) => {
      const target = Math.max(1, Number(speech.target || 1));
      const remaining = Math.min(target, Math.max(0, Number(speech.remaining ?? target)));
      return {
        topic: normalizeTopicName(speech.topic || topics[0] || 'Informes'),
        text: speech.text || '',
        target,
        remaining,
      };
    });

    return {
      id: route.id || createId(),
      name: route.name || `Roteiro ${index + 1}`,
      topics,
      speeches,
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
  return route;
}

function setView(name) {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });

  Object.entries(views).forEach(([viewName, view]) => {
    view.classList.toggle('active', viewName === name);
  });

  if (name === 'present') focusFirstAvailableInTopic();
  render();
}

function openTopic(topic) {
  activeTopic = topic;
  currentIndex = 0;
  setView('present');
}

function render() {
  currentRouteName.textContent = currentRoute().name;
  renderTopicOptions();
  renderHome();
  renderPresenter();
  renderEditList();
  renderSummary();
}

function renderTopicOptions() {
  const route = currentRoute();
  const selectedFilter = topicFilter.value || 'todos';
  const selectedEditTopic = editTopic.value || activeTopic || route.topics[0];
  const options = route.topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('');
  editTopic.innerHTML = options;
  renameTopicFrom.innerHTML = options;
  topicFilter.innerHTML = `<option value="todos">Todos os tópicos</option>${options}`;
  editTopic.value = route.topics.includes(selectedEditTopic) ? selectedEditTopic : route.topics[0];
  renameTopicFrom.value = route.topics.includes(activeTopic) ? activeTopic : route.topics[0];
  topicFilter.value = selectedFilter === 'todos' || route.topics.includes(selectedFilter) ? selectedFilter : 'todos';
}

function renderHome() {
  topicGrid.innerHTML = currentRoute().topics
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
  const speeches = getSpeechesByTopic(activeTopic);
  presentTopic.textContent = activeTopic || 'Sem tópico';

  if (!speeches.length) {
    presentCounter.textContent = '0/0';
    presentText.textContent = 'Nenhuma fala nesse botão ainda.';
    repeatText.textContent = 'Crie uma fala para este tópico.';
    return;
  }

  currentIndex = clamp(currentIndex, 0, speeches.length - 1);
  const speech = speeches[currentIndex];
  presentCounter.textContent = `${currentIndex + 1}/${speeches.length}`;
  presentText.textContent = speech.text;
  repeatText.textContent = `Restam ${speech.remaining} de ${speech.target}`;
}

function renderEditList() {
  const selected = topicFilter.value || 'todos';
  const visible = currentRoute().speeches
    .map((speech, index) => ({ ...speech, index }))
    .filter((speech) => selected === 'todos' || speech.topic === selected);

  if (!visible.length) {
    scriptList.innerHTML = '<p class="status">Nenhuma fala nesse tópico.</p>';
    return;
  }

  scriptList.innerHTML = visible
    .map(
      (speech) => `
        <article class="script-item ${speech.remaining === 0 ? 'done' : ''}">
          <div class="script-head">
            <span class="category">${escapeHtml(speech.topic)}</span>
            <span class="status">${speech.remaining}/${speech.target} restantes</span>
          </div>
          <div class="script-text">${escapeHtml(speech.text)}</div>
          <div class="script-actions three">
            <button class="secondary-button" type="button" data-present="${speech.index}">Abrir</button>
            <button class="secondary-button" type="button" data-edit="${speech.index}">Editar</button>
            <button class="secondary-button" type="button" data-reset="${speech.index}">Repor</button>
            <button class="danger-button" type="button" data-delete="${speech.index}">Excluir</button>
          </div>
        </article>
      `,
    )
    .join('');

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

function renderSummary() {
  return;
}

function openSpeechDialog(index = null) {
  editingIndex = index;
  dialogTitle.textContent = index === null ? 'Nova fala' : 'Editar fala';
  renderTopicOptions();

  const speech = index === null ? null : currentRoute().speeches[index];
  editTopic.value = speech?.topic || activeTopic || currentRoute().topics[0];
  editTarget.value = speech?.target || 1;
  editText.value = speech?.text || '';
  speechDialog.showModal();
}

function editCurrentSpeech() {
  const speech = getSpeechesByTopic(activeTopic)[currentIndex];
  const globalIndex = currentRoute().speeches.indexOf(speech);
  if (globalIndex >= 0) openSpeechDialog(globalIndex);
}

function saveSpeechFromDialog() {
  const text = editText.value.trim();
  if (!text) return;

  const target = clamp(Number(editTarget.value || 1), 1, 20);
  const route = currentRoute();
  const topic = editTopic.value || route.topics[0];
  const previous = editingIndex === null ? null : route.speeches[editingIndex];
  const spoken = previous ? previous.target - previous.remaining : 0;
  const nextSpeech = {
    topic,
    text,
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
  activeTopic = topic;
  topicDialog.close();
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
      topics: [...defaultTopics],
      speeches: [],
    };
    state.routes.push(route);
    state.activeRouteId = route.id;
    activeTopic = route.topics[0] || 'Informes';
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
    topics: [...source.topics],
    speeches: source.speeches.map((speech) => ({ ...speech })),
  };
  state.routes.push(route);
  state.activeRouteId = route.id;
  activeTopic = route.topics[0] || 'Informes';
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
  }

  saveAndRender();
  renderRouteList();
}

function exportBackup() {
  const payload = {
    app: 'roteiro-palco',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
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

function importBackup() {
  const raw = backupText.value.trim();
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const nextState = parsed.data ? parsed.data : parsed;
    state = normalizeState(nextState);
    activeTopic = currentRoute().topics[0] || 'Informes';
    currentIndex = 0;
    saveAndRender();
    setView('home');
    alert('BACKUP IMPORTADO.');
  } catch {
    alert('NÃO CONSEGUI IMPORTAR. CONFIRA SE O BACKUP FOI COLADO INTEIRO.');
  }
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

function movePresenter(direction) {
  const speeches = getSpeechesByTopic(activeTopic);
  if (!speeches.length) return;
  currentIndex = clamp(currentIndex + direction, 0, speeches.length - 1);
  renderPresenter();
}

function markCurrentSpoken() {
  const speeches = getSpeechesByTopic(activeTopic);
  if (!speeches.length) return;

  const speech = speeches[currentIndex];
  speech.remaining = Math.max(0, speech.remaining - 1);
  if (currentIndex < speeches.length - 1) currentIndex += 1;
  saveAndRender();
}

function focusFirstAvailableInTopic() {
  const speeches = getSpeechesByTopic(activeTopic);
  const next = speeches.findIndex((speech) => speech.remaining > 0);
  currentIndex = next >= 0 ? next : 0;
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
        topics: defaultTopics,
        speeches: defaultSpeeches.map((speech) => ({ ...speech })),
      },
    ],
  });
  activeTopic = currentRoute().topics[0];
  currentIndex = 0;
  saveAndRender();
}

function saveAndRender() {
  saveState();
  render();
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

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

render();
renderRestorePointStatus();
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
      await registration.update();
      await navigator.serviceWorker.ready;
      await prepareOfflineCache();
      offlineStatus.textContent = 'Offline pronto';
    })
    .catch(() => {
      offlineStatus.textContent = 'Offline ainda não pronto';
    });
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
