// js/auth.js — shared across ALL pages

function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getLoginPath() {
  return window.location.pathname.includes('/pages/') ? '../login.html' : 'login.html'
}

function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  window.location.href = getLoginPath()
}

function loadUserUI() {
  const user = getUser()
  if (!user) { window.location.href = getLoginPath(); return }

  document.querySelectorAll('[data-initials]').forEach(el => el.textContent = getInitials(user.name))
  document.querySelectorAll('[data-username]').forEach(el => el.textContent = user.name)
  document.querySelectorAll('[data-firstname]').forEach(el => el.textContent = user.name.split(' ')[0])
  document.querySelectorAll('[data-company]').forEach(el => el.textContent = user.company || user.name)
  document.querySelectorAll('[data-role]').forEach(el => {
    const labels = { seeker: 'Job seeker', employer: 'Employer', admin: 'Admin' }
    el.textContent = labels[user.role] || user.role
  })
  document.querySelectorAll('[data-email]').forEach(el => {
    if (el.tagName === 'INPUT') el.value = user.email
    else el.textContent = user.email
  })
}

document.addEventListener('DOMContentLoaded', loadUserUI)