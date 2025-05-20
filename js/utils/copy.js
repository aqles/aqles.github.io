// public/js/utils/copy.js
export function copyToClipboard(text) {
  if (!navigator.clipboard) {
    // fallback untuk browser lawas
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      console.log('Copied with fallback:', text);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(ta);
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => console.log('Copied to clipboard:', text))
    .catch(err => console.error('Copy failed:', err));
}
