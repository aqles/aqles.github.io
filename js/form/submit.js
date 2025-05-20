// public/js/form/submit.js
// AJAX form submission & thank-you popup
export function initFormSubmit() {
  const form = document.getElementById('contact-form');
  const popup = document.getElementById('thank-you-popup');
  const closeBtn = document.getElementById('close-popup');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    fetch('https://formspree.io/f/xzzrrjbj', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(res => {
      if (res.ok) {
        popup.style.display = 'flex';
        form.reset();
      } else {
        alert('Maaf, terjadi kesalahan. Coba lagi nanti.');
      }
    }).catch(() => {
      alert('Maaf, terjadi kesalahan jaringan.');
    });
  });

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });
}
