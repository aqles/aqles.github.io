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
		const isTrustedHTML = ['dottrick', 'weather','ask'].includes(cmd); // HTML yang kamu percaya
		let parsedHTML;
		if (isTrustedHTML) {
		  parsedHTML = output; // Langsung render HTML dari command (tanpa sanitize)
		} else if (/[\s\S]{3,}/.test(output) && !output.includes('<') && output.includes('\n')) {
		  parsedHTML = `<pre>${sanitizeResponse(output)}</pre>`;
		} else {
		  parsedHTML = marked.parse(sanitizeResponse(output));
		}

			respEl.innerHTML = parsedHTML;
			termOutput.appendChild(respEl);
	  } 
	  } catch (err) {
	    thinkingEl.remove();
	    const errEl = document.createElement('p');
	    errEl.textContent = `Error: ${err.message}`;
	    termOutput.appendChild(errEl);
	    console.error('Command execution error:', err);
	  }
    termOutput.scrollTop = termOutput.scrollHeight;
    termInput.value = '';
  });
}
