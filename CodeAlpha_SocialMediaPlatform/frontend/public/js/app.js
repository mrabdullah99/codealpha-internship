// === PULSE — FRONTEND APP ===

const API = '/api';
let currentUser = null;
let currentView = 'feed';

// ─── API HELPERS ────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('pulse_token');

async function apiRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  const token = getToken();
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
  });
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  try {
    const data = await apiRequest('POST', '/auth/login', {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    });
    localStorage.setItem('pulse_token', data.token);
    currentUser = data.user;
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('register-error');
  errEl.classList.add('hidden');
  try {
    const data = await apiRequest('POST', '/auth/register', {
      username: document.getElementById('reg-username').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
      displayName: document.getElementById('reg-displayname').value
    });
    localStorage.setItem('pulse_token', data.token);
    currentUser = data.user;
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('pulse_token');
  currentUser = null;
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
});

// ─── APP ENTRY ───────────────────────────────────────────────────────────────

async function enterApp() {
  if (!currentUser) {
    try {
      currentUser = await apiRequest('GET', '/auth/me');
    } catch {
      localStorage.removeItem('pulse_token');
      return;
    }
  }

  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  updateSidebarUser();
  navigateTo('feed');
  loadSuggestions();
}

function updateSidebarUser() {
  document.getElementById('sidebar-displayname').textContent = currentUser.displayName || currentUser.username;
  document.getElementById('sidebar-username').textContent = '@' + currentUser.username;
  setAvatar(document.getElementById('sidebar-avatar'), currentUser);
  setAvatar(document.getElementById('compose-avatar'), currentUser);
}

function setAvatar(el, user) {
  if (!el) return;
  if (user.avatar) {
    el.style.backgroundImage = `url(${user.avatar})`;
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.textContent = (user.displayName || user.username || '?')[0].toUpperCase();
  }
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.view));
});

function navigateTo(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');

  if (view === 'feed') loadFeed();
  if (view === 'explore') loadExplore();
  if (view === 'profile') loadProfile(currentUser.username);
}

// ─── COMPOSE ─────────────────────────────────────────────────────────────────

const composeText = document.getElementById('compose-text');
const charCount = document.getElementById('char-count');

composeText.addEventListener('input', () => {
  charCount.textContent = `${composeText.value.length} / 1000`;
});

document.getElementById('post-btn').addEventListener('click', async () => {
  const content = composeText.value.trim();
  if (!content) return;

  try {
    const post = await apiRequest('POST', '/posts', { content });
    composeText.value = '';
    charCount.textContent = '0 / 1000';
    showToast('✓ Posted!');
    prependPost(post, 'feed-posts');
  } catch (err) {
    showToast('Failed to post: ' + err.message);
  }
});

// ─── FEED ────────────────────────────────────────────────────────────────────

async function loadFeed() {
  const container = document.getElementById('feed-posts');
  container.innerHTML = '<div class="loading-state">Loading your feed...</div>';
  try {
    const posts = await apiRequest('GET', '/posts');
    renderPosts(posts, container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✦</div>
      <p>Follow some people to see their posts here.</p>
    </div>`;
  }
}

async function loadExplore() {
  const container = document.getElementById('explore-posts');
  container.innerHTML = '<div class="loading-state">Loading posts...</div>';
  try {
    const posts = await apiRequest('GET', '/posts/explore');
    renderPosts(posts, container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>No posts yet.</p></div>`;
  }
}

// ─── RENDER POSTS ────────────────────────────────────────────────────────────

function renderPosts(posts, container) {
  if (!posts.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✦</div>
      <p>Nothing here yet. Be the first to post!</p>
    </div>`;
    return;
  }
  container.innerHTML = posts.map(post => renderPostHTML(post)).join('');
  attachPostEvents(container);
}

function renderPostHTML(post) {
  const isLiked = post.likes && post.likes.includes(currentUser._id);
  const isOwn = post.author._id === currentUser._id;
  const timeAgo = formatTime(post.createdAt);

  return `
    <div class="post-card" data-post-id="${post._id}">
      <div class="post-avatar" 
           style="${post.author.avatar ? `background-image:url(${post.author.avatar})` : ''}"
           data-username="${post.author.username}"
           onclick="viewUserProfile('${post.author.username}')">
        ${!post.author.avatar ? (post.author.displayName || post.author.username)[0].toUpperCase() : ''}
      </div>
      <div class="post-body">
        <div class="post-header">
          <span class="post-author-name" onclick="viewUserProfile('${post.author.username}')">
            ${escHtml(post.author.displayName || post.author.username)}
          </span>
          <span class="post-author-handle">@${escHtml(post.author.username)}</span>
          <span class="post-time">${timeAgo}</span>
        </div>
        <div class="post-content">${escHtml(post.content)}</div>
        <div class="post-actions">
          <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="like-count">${post.likes ? post.likes.length : 0}</span>
          </button>
          <button class="action-btn comment-btn" data-post-id="${post._id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${post.comments ? post.comments.length : 0}</span>
          </button>
          ${isOwn ? `
          <button class="action-btn delete-btn" data-post-id="${post._id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function prependPost(post, containerId) {
  const container = document.getElementById(containerId);
  const emptyState = container.querySelector('.empty-state, .loading-state');
  if (emptyState) emptyState.remove();

  const div = document.createElement('div');
  div.innerHTML = renderPostHTML(post);
  const postEl = div.firstElementChild;
  container.insertBefore(postEl, container.firstChild);
  attachPostEvents(container);
}

function attachPostEvents(container) {
  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => handleLike(btn));
  });
  container.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', () => openPostModal(btn.dataset.postId));
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(btn));
  });
}

// ─── LIKE ────────────────────────────────────────────────────────────────────

async function handleLike(btn) {
  const postId = btn.dataset.postId;
  try {
    const res = await apiRequest('POST', `/posts/${postId}/like`);
    btn.classList.toggle('liked', res.liked);
    btn.querySelector('svg').setAttribute('fill', res.liked ? 'currentColor' : 'none');
    btn.querySelector('.like-count').textContent = res.likeCount;
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

async function handleDelete(btn) {
  if (!confirm('Delete this post?')) return;
  const postId = btn.dataset.postId;
  try {
    await apiRequest('DELETE', `/posts/${postId}`);
    const card = btn.closest('.post-card');
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.2s';
    setTimeout(() => card.remove(), 200);
    showToast('Post deleted');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// ─── POST MODAL ──────────────────────────────────────────────────────────────

async function openPostModal(postId) {
  const modal = document.getElementById('post-modal');
  const content = document.getElementById('post-modal-content');
  modal.classList.remove('hidden');
  content.innerHTML = '<div class="loading-state">Loading...</div>';

  try {
    const post = await apiRequest('GET', `/posts/${postId}`);
    renderPostModal(post, content);
  } catch (err) {
    content.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function renderPostModal(post, container) {
  const isLiked = post.likes && post.likes.includes(currentUser._id);

  container.innerHTML = `
    <div style="display:flex;gap:14px;margin-bottom:16px">
      <div class="post-avatar" style="${post.author.avatar ? `background-image:url(${post.author.avatar})` : ''}">
        ${!post.author.avatar ? (post.author.displayName || post.author.username)[0].toUpperCase() : ''}
      </div>
      <div>
        <div style="font-weight:600;font-size:.95rem">${escHtml(post.author.displayName || post.author.username)}</div>
        <div style="font-size:.82rem;color:var(--ink-muted)">@${escHtml(post.author.username)} · ${formatTime(post.createdAt)}</div>
      </div>
    </div>
    <div style="font-size:1.05rem;line-height:1.7;margin-bottom:16px;white-space:pre-wrap">${escHtml(post.content)}</div>
    <div style="display:flex;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--cream-dark)">
      <button class="action-btn like-btn-modal ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
        <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="modal-like-count">${post.likes ? post.likes.length : 0}</span>
      </button>
    </div>

    <div class="comments-section">
      <div class="comments-title">${post.comments.length} Comments</div>
      <div id="modal-comments">
        ${post.comments.length ? post.comments.map(c => renderCommentHTML(c, post._id)).join('') : '<p style="color:var(--ink-muted);font-size:.85rem;padding:10px 0">No comments yet.</p>'}
      </div>
      <div class="comment-form">
        <textarea id="modal-comment-input" rows="2" placeholder="Add a comment..." maxlength="500"></textarea>
        <button class="btn-primary" id="submit-comment" data-post-id="${post._id}">Post</button>
      </div>
    </div>
  `;

  const likeBtn = container.querySelector('.like-btn-modal');
  likeBtn.addEventListener('click', async () => {
    const res = await apiRequest('POST', `/posts/${post._id}/like`);
    likeBtn.classList.toggle('liked', res.liked);
    likeBtn.querySelector('svg').setAttribute('fill', res.liked ? 'currentColor' : 'none');
    likeBtn.querySelector('.modal-like-count').textContent = res.likeCount;
    // Sync in feed
    const feedLikeBtn = document.querySelector(`.like-btn[data-post-id="${post._id}"]`);
    if (feedLikeBtn) {
      feedLikeBtn.classList.toggle('liked', res.liked);
      feedLikeBtn.querySelector('svg').setAttribute('fill', res.liked ? 'currentColor' : 'none');
      feedLikeBtn.querySelector('.like-count').textContent = res.likeCount;
    }
  });

  container.querySelector('#submit-comment').addEventListener('click', async () => {
    const input = document.getElementById('modal-comment-input');
    const content = input.value.trim();
    if (!content) return;

    try {
      const comment = await apiRequest('POST', `/posts/${post._id}/comments`, { content });
      input.value = '';
      const commentsDiv = document.getElementById('modal-comments');
      const p = commentsDiv.querySelector('p');
      if (p) p.remove();
      commentsDiv.insertAdjacentHTML('beforeend', renderCommentHTML(comment, post._id));
      attachCommentDeleteEvents(commentsDiv, post._id);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  });

  attachCommentDeleteEvents(container.querySelector('#modal-comments'), post._id);
}

function renderCommentHTML(comment, postId) {
  const isOwn = comment.author._id === currentUser._id;
  return `
    <div class="comment-item" data-comment-id="${comment._id}">
      <div class="comment-avatar" style="${comment.author.avatar ? `background-image:url(${comment.author.avatar})` : ''}">
        ${!comment.author.avatar ? (comment.author.displayName || comment.author.username)[0].toUpperCase() : ''}
      </div>
      <div class="comment-body">
        <div class="comment-author">${escHtml(comment.author.displayName || comment.author.username)}
          <span style="font-weight:400;color:var(--ink-muted);font-size:.78rem"> @${escHtml(comment.author.username)}</span>
        </div>
        <div class="comment-text">${escHtml(comment.content)}</div>
        <div class="comment-time">${formatTime(comment.createdAt)}</div>
      </div>
      ${isOwn ? `<button class="action-btn delete-comment-btn" data-comment-id="${comment._id}" data-post-id="${postId}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>` : ''}
    </div>
  `;
}

function attachCommentDeleteEvents(container, postId) {
  container.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await apiRequest('DELETE', `/posts/${postId}/comments/${btn.dataset.commentId}`);
        btn.closest('.comment-item').remove();
      } catch (err) {
        showToast('Error: ' + err.message);
      }
    });
  });
}

document.getElementById('close-post-modal').addEventListener('click', () => {
  document.getElementById('post-modal').classList.add('hidden');
});

document.getElementById('post-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

// ─── EXPLORE SEARCH ──────────────────────────────────────────────────────────

let searchTimeout;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchUsers(e.target.value), 300);
});

async function searchUsers(query) {
  const results = document.getElementById('search-results');
  if (!query.trim()) { results.classList.add('hidden'); return; }

  try {
    const users = await apiRequest('GET', `/users?q=${encodeURIComponent(query)}`);
    results.classList.remove('hidden');
    if (!users.length) {
      results.innerHTML = '<p style="color:var(--ink-muted);font-size:.85rem;padding:8px">No users found.</p>';
      return;
    }
    results.innerHTML = users.map(u => `
      <div class="user-row" onclick="viewUserProfile('${u.username}')">
        <div class="comment-avatar" style="${u.avatar ? `background-image:url(${u.avatar})` : ''}">
          ${!u.avatar ? (u.displayName || u.username)[0].toUpperCase() : ''}
        </div>
        <div class="user-row-info">
          <div class="user-row-name">${escHtml(u.displayName || u.username)}</div>
          <div class="user-row-handle">@${escHtml(u.username)}</div>
        </div>
      </div>
    `).join('');
  } catch {}
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

function viewUserProfile(username) {
  navigateTo('profile');
  loadProfile(username);
}

async function loadProfile(username) {
  const content = document.getElementById('profile-content');
  content.innerHTML = '<div class="loading-state">Loading profile...</div>';

  try {
    const { user, posts } = await apiRequest('GET', `/users/${username}`);
    const isOwn = user._id === currentUser._id;
    const isFollowing = currentUser.following && currentUser.following.some(f => {
      return (typeof f === 'string' ? f : f._id) === user._id;
    });

    content.innerHTML = `
      <div class="profile-header">
        <div class="profile-top">
          <div class="profile-avatar-img" style="${user.avatar ? `background-image:url(${user.avatar})` : ''}">
            ${!user.avatar ? (user.displayName || user.username)[0].toUpperCase() : ''}
          </div>
          ${isOwn
            ? `<button class="btn-secondary" id="edit-profile-btn">Edit profile</button>`
            : `<button class="follow-btn ${isFollowing ? 'following' : ''}" id="follow-btn" data-user-id="${user._id}">
                ${isFollowing ? 'Following' : 'Follow'}
               </button>`
          }
        </div>
        <div class="profile-name">${escHtml(user.displayName || user.username)}</div>
        <div class="profile-handle">@${escHtml(user.username)}</div>
        <div class="profile-bio">${escHtml(user.bio || '')}</div>
        <div class="profile-stats">
          <div class="stat"><span class="stat-num">${posts.length}</span><span class="stat-label">Posts</span></div>
          <div class="stat"><span class="stat-num">${user.followers ? user.followers.length : 0}</span><span class="stat-label">Followers</span></div>
          <div class="stat"><span class="stat-num">${user.following ? user.following.length : 0}</span><span class="stat-label">Following</span></div>
        </div>
      </div>
      <div id="profile-posts" class="posts-container"></div>
    `;

    const profilePostsContainer = document.getElementById('profile-posts');
    renderPosts(posts, profilePostsContainer);

    if (isOwn) {
      document.getElementById('edit-profile-btn').addEventListener('click', openEditModal);
    } else {
      const followBtn = document.getElementById('follow-btn');
      followBtn.addEventListener('click', () => handleFollow(followBtn, user._id, username));
    }
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

async function handleFollow(btn, userId, username) {
  try {
    const res = await apiRequest('POST', `/users/${userId}/follow`);
    btn.classList.toggle('following', res.following);
    btn.textContent = res.following ? 'Following' : 'Follow';
    showToast(res.message);

    // Update currentUser's following list
    if (res.following) {
      if (!currentUser.following) currentUser.following = [];
      currentUser.following.push(userId);
    } else {
      currentUser.following = (currentUser.following || []).filter(id => {
        return (typeof id === 'string' ? id : id._id) !== userId;
      });
    }

    loadSuggestions();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// ─── EDIT PROFILE ────────────────────────────────────────────────────────────

function openEditModal() {
  const modal = document.getElementById('edit-profile-modal');
  document.getElementById('edit-displayname').value = currentUser.displayName || '';
  document.getElementById('edit-bio').value = currentUser.bio || '';
  document.getElementById('edit-avatar').value = currentUser.avatar || '';
  modal.classList.remove('hidden');
}

document.getElementById('close-edit-modal').addEventListener('click', () => {
  document.getElementById('edit-profile-modal').classList.add('hidden');
});

document.getElementById('edit-profile-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('edit-error');
  errEl.classList.add('hidden');
  try {
    const updated = await apiRequest('PUT', '/users/profile/update', {
      displayName: document.getElementById('edit-displayname').value,
      bio: document.getElementById('edit-bio').value,
      avatar: document.getElementById('edit-avatar').value
    });
    currentUser = { ...currentUser, ...updated };
    document.getElementById('edit-profile-modal').classList.add('hidden');
    showToast('Profile updated!');
    updateSidebarUser();
    loadProfile(currentUser.username);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

// ─── SUGGESTIONS ─────────────────────────────────────────────────────────────

async function loadSuggestions() {
  const list = document.getElementById('suggestions-list');
  try {
    const users = await apiRequest('GET', '/users');
    const suggestions = users.filter(u => {
      const isFollowing = (currentUser.following || []).some(f => {
        return (typeof f === 'string' ? f : f._id) === u._id;
      });
      return !isFollowing;
    }).slice(0, 5);

    if (!suggestions.length) {
      list.innerHTML = '<p style="color:var(--ink-muted);font-size:.82rem">No more suggestions.</p>';
      return;
    }

    list.innerHTML = suggestions.map(u => {
      const isFollowing = (currentUser.following || []).some(f => {
        return (typeof f === 'string' ? f : f._id) === u._id;
      });
      return `
        <div class="suggest-card">
          <div class="suggest-avatar" style="${u.avatar ? `background-image:url(${u.avatar})` : ''}">
            ${!u.avatar ? (u.displayName || u.username)[0].toUpperCase() : ''}
          </div>
          <div class="suggest-info">
            <div class="suggest-name">${escHtml(u.displayName || u.username)}</div>
            <div class="suggest-handle">@${escHtml(u.username)}</div>
          </div>
          <button class="follow-btn ${isFollowing ? 'following' : ''}" data-user-id="${u._id}" data-username="${u.username}">
            ${isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', () => handleFollow(btn, btn.dataset.userId, btn.dataset.username));
    });
  } catch {}
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── INIT ────────────────────────────────────────────────────────────────────

(async function init() {
  if (getToken()) {
    await enterApp();
  }
})();
