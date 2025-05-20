// public/js/utils/sanitize.js
// Fungsi untuk escape HTML (jika allowHTML=false)
export function sanitizeResponse(input, allowHTML = false) {
  if (allowHTML) return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
