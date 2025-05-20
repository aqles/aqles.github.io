// public/js/terminal/core.js
import { sanitizeResponse } from '../utils/sanitize.js';
import { commands, getCoords, gmailDotTrick, weatherCodeMap, startTime, quotes } from './commands.js';

export function initTerminal() {
  const termInput  = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');

  termInput.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    const raw = termInput.value.trim();
    termOutput.innerHTML += `<p><span class="prompt">$></span> ${raw}</p>`;

    const thinkingEl = document.createElement('p');
    thinkingEl.classList.add('thinking');
    thinkingEl.textContent = 'thinking.';
    termOutput.appendChild(thinkingEl);
    termOutput.scrollTop = termOutput.scrollHeight;

    const [cmd, ...args] = raw.toLowerCase().split(' ');
    let output = null;

    try {
      if (cmd === 'clear') {
        termOutput.innerHTML = '';
      } else if (commands[cmd]) {
        output = await commands[cmd](args);
      } else {
        output = await commands.ask([raw]);
      }
      thinkingEl.remove();
      if (output !== null) {
        const respEl = document.createElement('p');
        const isHTML = ['dottrick','weather'].includes(cmd);
        let parsed;
        if (isHTML) {
          parsed = output;
        } else if (/[\s\S]{3,}/.test(output) && !output.includes('<') && output.includes('\n')) {
          parsed = `<pre>${sanitizeResponse(output)}</pre>`;
        } else {
          parsed = DOMPurify ? DOMPurify.sanitize(output) : sanitizeResponse(output);
        }
        respEl.innerHTML = parsed;
        termOutput.appendChild(respEl);
      }
    } catch (err) {
      thinkingEl.remove();
      const errEl = document.createElement('p');
      errEl.textContent = `Error: ${err.message}`;
      termOutput.appendChild(errEl);
      console.error(err);
    }
    termOutput.scrollTop = termOutput.scrollHeight;
    termInput.value = '';
  });
}
