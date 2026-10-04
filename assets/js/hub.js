// 노는사람 한국어화 아카이브: data/*.json을 읽어 화면을 그립니다.
// 프로젝트를 추가하거나 고칠 때는 이 파일이 아니라 data/projects.json만 수정하면 됩니다.

const $ = selector => document.querySelector(selector);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style') node.style.cssText = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter(child => child !== undefined && child !== null && child !== false));
  return node;
}

async function readJSON(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${path}를 불러오지 못했습니다 (${response.status}).`);
  return response.json();
}

const formatDate = iso => iso ? iso.replaceAll('-', '.') : '';
const external = url => /^https?:/.test(url) && !url.startsWith(location.origin);
const linkAttrs = url => external(url) ? { href: url, target: '_blank', rel: 'noopener' } : { href: url };

const STATUS = {
  released: { label: '배포 중', class: 'status-released' },
  beta: { label: '베타', class: 'status-beta' },
  alpha: { label: '알파', class: 'status-alpha' },
  wip: { label: '작업 중', class: 'status-wip' },
};

const ICONS = {
  github: 'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z',
  x: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z',
};
const icon = name => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ICONS[name] ?? '');
  svg.append(path);
  return svg;
};

/* ── 사이트 정보 ─────────────────────────── */
function renderSite(site) {
  for (const node of document.querySelectorAll('[data-site]')) {
    const value = site[node.dataset.site];
    if (value) node.textContent = value;
  }
  for (const target of ['#channels', '#footer-channels']) {
    $(target).replaceChildren(...site.channels.filter(channel => channel.url).map(channel =>
      el('a', { class: `channel channel-${channel.id}`, ...linkAttrs(channel.url), 'aria-label': `노는사람 ${channel.label}`, title: channel.label }, icon(channel.id))));
  }
}

/* ── 프로젝트 ────────────────────────────── */
function projectMedia(project, platform) {
  const media = el('div', { class: `media${project.image ? '' : ' no-image'}`, style: `--platform:${platform.color}` },
    el('span', { class: 'media-title', 'aria-hidden': 'true' }, project.originalTitle));
  if (project.image) {
    const image = el('img', { src: project.image, alt: '', loading: 'lazy', decoding: 'async', class: project.imageFit === 'contain' ? 'contain' : '' });
    image.addEventListener('error', () => { image.remove(); media.classList.add('no-image'); });
    media.prepend(image);
  }
  if (project.logo) { media.classList.add('has-logo'); media.append(el('img', { src: project.logo, alt: '', loading: 'lazy', class: 'media-logo' })); }
  media.append(el('span', { class: 'platform-pill' }, platform.label));
  return media;
}

function projectCard(project, platforms, byId) {
  const platform = platforms[project.platform] ?? { label: project.platform, color: '#1259d6' };
  const status = STATUS[project.status] ?? STATUS.released;
  const links = project.links ?? {};
  const actions = el('div', { class: 'actions' },
    links.download && el('a', { class: 'btn primary', ...linkAttrs(links.download) }, /gamebanana\.com/.test(links.download) ? 'GameBanana' : '다운로드'),
    links.guide && el('a', { class: 'btn', ...linkAttrs(links.guide) }, '설치 안내'),
    links.site && el('a', { class: 'btn', ...linkAttrs(links.site) }, '소개·매뉴얼'),
    links.issues && el('a', { class: 'btn', ...linkAttrs(links.issues) }, '문제 제보'),
    links.repo && el('a', { class: 'btn icon-only', ...linkAttrs(links.repo), 'aria-label': `${project.title} GitHub 저장소`, title: 'GitHub 저장소' }, icon('github')),
  );
  const related = (project.related ?? []).map(id => byId.get(id)).filter(Boolean);
  return el('article', { class: 'project', id: project.id, 'data-platform': project.platform },
    projectMedia(project, platform),
    el('div', { class: 'project-body' },
      el('div', { class: 'project-meta' },
        el('span', { class: `badge ${status.class}` }, status.label),
        project.version && el('span', { class: 'version' }, project.version),
        project.updated && el('span', { class: 'updated' }, `${formatDate(project.updated)} 업데이트`)),
      el('h3', {}, project.title),
      el('p', { class: 'original' }, project.originalTitle),
      el('p', { class: 'summary' }, project.summary),
      el('ul', { class: 'facts' },
        el('li', {}, el('span', {}, '대상'), project.base),
        project.highlights?.length > 0 && el('li', {}, el('span', {}, '특징'), project.highlights.join(' · ')),
        related.length > 0 && el('li', {}, el('span', {}, '관련'), ...related.map((item, index) => [index ? ', ' : '', el('a', { href: `#${item.id}` }, item.title)]))),
      actions));
}

function renderProjects(projects, platforms) {
  // 최근 업데이트 순으로 정렬하고, 날짜가 없는 항목은 관련 프로젝트 바로 뒤에 둡니다.
  const dated = projects.filter(project => project.updated).sort((a, b) => b.updated.localeCompare(a.updated));
  const sorted = [...dated];
  for (const project of projects.filter(item => !item.updated)) {
    const anchor = sorted.findIndex(item => (project.related ?? []).includes(item.id));
    sorted.splice(anchor < 0 ? sorted.length : anchor + 1, 0, project);
  }
  const byId = new Map(sorted.map(project => [project.id, project]));
  const cards = sorted.map(project => projectCard(project, platforms, byId));
  $('#project-list').replaceChildren(...cards);

  const counts = new Map();
  for (const project of sorted) counts.set(project.platform, (counts.get(project.platform) ?? 0) + 1);
  const options = [['all', '전체', sorted.length], ...[...counts].map(([id, count]) => [id, platforms[id]?.label ?? id, count])];
  const apply = selected => {
    for (const button of $('#filters').children) button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
    let shown = 0;
    for (const card of cards) {
      const visible = selected === 'all' || card.dataset.platform === selected;
      card.hidden = !visible;
      shown += visible;
    }
    $('#projects-status').textContent = `${shown}개의 한국어 패치 · 최근 업데이트 순`;
  };
  $('#filters').replaceChildren(...options.map(([id, label, count]) => {
    const button = el('button', { type: 'button', class: 'chip', 'data-filter': id, 'aria-pressed': 'false' }, label, el('span', { class: 'count' }, String(count)));
    button.onclick = () => apply(id);
    return button;
  }));
  apply('all');

  $('#stat-projects').textContent = `${sorted.length}개`;
  $('#stat-updated').textContent = formatDate(dated[0]?.updated) || '-';
}

/* ── 매뉴얼 ──────────────────────────────── */
async function renderManuals(collections) {
  let total = 0;
  const sections = await Promise.all(collections.map(async collection => {
    const base = new URL(collection.base, location.href);
    const header = el('div', { class: 'collection-head' },
      el('h3', {}, collection.title),
      el('a', { ...linkAttrs(base.href), class: 'more' }, '전체 보기 →'));
    try {
      const catalog = await readJSON(new URL(collection.catalog, base).href);
      total += catalog.manuals.length;
      const grid = el('div', { class: 'manuals' }, ...catalog.manuals.map(book => {
        const href = new URL(`${collection.viewer}?book=${encodeURIComponent(book.id)}&page=1`, base).href;
        return el('a', { class: 'manual', href },
          el('span', { class: 'manual-cover' }, el('img', { src: new URL(book.cover, base).href, alt: '', loading: 'lazy', decoding: 'async' })),
          el('span', { class: 'manual-title' }, book.title),
          el('span', { class: 'manual-meta' }, `${book.pageCount}페이지 · ${book.sourceEdition}`));
      }));
      return el('div', { class: 'collection' }, header, grid);
    } catch {
      return el('div', { class: 'collection' }, header,
        el('p', { class: 'muted' }, '매뉴얼 목록을 불러오지 못했습니다. ', el('a', linkAttrs(base.href), '매뉴얼 사이트에서 직접 보기')));
    }
  }));
  $('#manual-list').replaceChildren(...sections);
  $('#stat-manuals').textContent = total ? `${total}종` : '-';
}

try {
  const [site, platforms, data, manuals] = await Promise.all([
    readJSON('data/site.json'), readJSON('data/platforms.json'), readJSON('data/projects.json'), readJSON('data/manuals.json'),
  ]);
  renderSite(site);
  renderProjects(data.projects, platforms);
  await renderManuals(manuals.collections);
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
} catch (error) {
  $('#projects-status').textContent = error.message;
  $('#projects-status').classList.add('error');
}
