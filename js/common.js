/*
 *  Vox Libera
 *  Common service functions and definitions
 */

// common data

const app_code_ver = '2.9.3';

const courses = [
  {"ref": "course.ar1", "code": "ع", "title": "Arabic Basics"},
  {"ref": "course.he1", "code": "א", "title": "Hebrew Basics"}
];

// Conver custom markdown to divs with class name
// usage:  html = parseCustomDivs('##text-center## some prompt: ##stat-value## 12%');
function parseCustomDivs(text) {
    // ##className## content
    const regex = /##([^#\n]+)##\s+(.*)$/gim;

    return text.replace(regex, (match, className, content) => {
        // call the function recursively for the rest of string (content)
        let parsedContent = parseCustomDivs(content);
        
        return `<div class="${className}">${parsedContent}</div>`;
    });
}

// Convert "Markdown" text to HTML using conf (optional)
// usage: markdownConf = buildMarkdownConf(courseTargetLanguage, targetDir, userLang, userDir);
// domElm.innerHTML = parseMarkdown(text, markdownConf);
function parseMarkdown(text, conf={}) {
  const nestedProcessed = parseCustomDivs(text);
  return nestedProcessed

      // Images ![alt-text](/path/to/picture.jpg)
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="guide-img">')

      // Links [display text](https://some.url/with/endpoint)
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')

      // Headers (### Text)
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')

      // Bold (**text**)
      .replace(/\*\*([^*]+)\*\*/gim, '<b>$1</b>')

      // Italic (__text__)
      .replace(/__([^_]+)__/gim, '<i>$1</i>')

      // Target language ('''text''')
      .replace(/'''([^']+)'''/gim, '<span ' + conf["targetTags"] +'>$1</span>')

      // Newlines
      .replace(/\n/gim, '<br>')

      // Avoid newline after div
      .replace(/div><br>/gim, 'div>')

      // Avoid newline around header
      .replace(/h3><br>/gim, 'h3>')
      .replace(/<br><h3/gim, '<h3');
}

// replace links like href="#repeat" with functions from actions dictionary
// usage: injectActionsToLinks(container, actions) 
function injectActionsToLinks(container, actions) {
    const links = container.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        const action = link.getAttribute('href').substring(1);
        
        link.classList.add('action-link');
        link.removeAttribute('href'); // avoid link-like behavior
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if ( actions[action] ) {
                actions[action]();
            } else {
                console.log(`ERROR: unsupported action "${action}" in link`);
            }
        });
    });
}

// Generate SVG icon from character
function charToSvg(code, className='', id='') {

    return `
        <svg xmlns="http://www.w3.org/2000/svg" class="${className}" id="${id}" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="#0600f9" />
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
                  fill="white" font-family="Arial" font-size="60">
                ${code}
            </text>
        </svg>`;
}

// Set favicon by language letter
function updateFavicon(langCode) {
    const link = document.querySelector("link[rel='icon']");
    
    /* // Alternative - hard-coded icons (?)
    link.href = `img/favicons/${langCode}.svg`;
    */

    // Generate SVG on the fly in Base64
    const svgIcon = charToSvg(langCode);

    const encoded = new TextEncoder().encode(svgIcon);
    const binString = Array.from(encoded, (byte) => String.fromCharCode(byte)).join("");
    link.href = 'data:image/svg+xml;base64,' + btoa(binString);
}

const narratorNeutralEmotion = ['left-eye', 'right-eye', 'left-eyebrow', 'right-eyebrow', 'neutral-mouth'];
const narratorSmileEmotion = ['left-eye', 'right-eye', 'left-eyebrow', 'right-eyebrow', 'smile-mouth'];

// usage: initNarrator(JS_OBJECT, 'narrator-wrapper');
async function initNarrator(imageCode, containerId) {
    const wrapper = document.getElementById(containerId);
    if (!wrapper) return;

    wrapper.innerHTML = imageCode;
}

// Usage: setNarratorEmotion('narrator-svg', ['right-eye', 'left-eye']);
function setNarratorEmotion(narratorId, emotionIds) {
    const narratorSvg = document.getElementById(narratorId);
    if (!narratorSvg) return;

    // 1. collect objects by class
    const allEmotions = narratorSvg.querySelectorAll('.emotion-layer');
    
    allEmotions.forEach(layer => {
        if (!layer.classList.contains('animation')) {
          layer.style.visibility = 'hidden'; // Or opacity = '0'
          layer.style.display = 'none';      // in case it should not be rendered at all
        }
    });

    // 2. enable only desired layer
    [...emotionIds].forEach(emotionId => {
      const target = narratorSvg.querySelector(`#emotion-${emotionId}`);
      if (target) {
        target.style.visibility = 'visible';
        target.style.display = 'inline'; // Or use 'block'
      }
    });
}

const allEyelids = [
  'left-lower-eyelid', 'right-lower-eyelid',
  'left-upper-eyelid', 'right-upper-eyelid'];

const getEyelidsByPattern = (pattern) => {
    return allEyelids.filter(id => id.includes(pattern));
};

// Usage:  blink('narrator-svg', 'left', 500);
function blink(narratorId, pattern, duration) {
    const narratorSvg = document.getElementById(narratorId);
    if (!narratorSvg) return;
    if (narratorSvg.dataset.animation) return;

    const targetIds = getEyelidsByPattern(pattern);
    narratorSvg.dataset.animation = true;
    targetIds.forEach(blinkId => {
      const target = narratorSvg.querySelector(`#emotion-${blinkId}`);
      if (target) {
        target.style.visibility = 'visible';
        target.style.display = 'inline';
        target.classList.add('animation');
        setTimeout(() => {
          target.style.visibility = 'hidden';
          target.style.display = 'none';
          target.classList.remove('animation');
          narratorSvg.dataset.animation = '';
        }, duration);
      }
    });
}

// usage: randomBlink('narrator-svg', 1500);
function randomBlink(narratorId, duration) {
    const blinkPatterns = [
      'left', 'right',
      'upper', 'lower',
      'left-lower', 'right-lower',
      'eyelid'
      ];
    const pattern = blinkPatterns[Math.floor(Math.random() * blinkPatterns.length)];
    blink(narratorId, pattern, duration);
}

// usage: setEyebrowExpression('narrator-svg', 'frown' / 'raised' / 'serious' / 'sad', 500);
function setEyebrowExpression(narratorId, type, duration) {
    const narratorSvg = document.getElementById(narratorId);
    const eyebrows = narratorSvg.querySelectorAll('.animation-eyebrow');
    
    const className = `eyebrow-${type}`;
    
    eyebrows.forEach(el => {
        el.classList.add('animation');
        el.classList.add(className);
        // Return back to normal
        setTimeout(() => {
          el.classList.remove(className);
          el.classList.remove('animation');
        }, duration);
    });
}

// usage: randomEyebrow('narrator-svg', 1200);
function randomEyebrow(narratorId, duration) {
  const eyebrowExprTypes = ['frown', 'raised', 'serious', 'sad'];
  const expr = eyebrowExprTypes[Math.floor(Math.random() * eyebrowExprTypes.length)];
  setEyebrowExpression(narratorId, expr, duration);
}

// callback for bubble hide/show
function toggleBubble(event) {
    event.stopPropagation();
    const bubble = document.getElementById('speech-bubble');
    const delay = Math.floor(Math.random()*1500);
    const duration = Math.floor(Math.random() * 500) + 200;
    setTimeout(() => {
      randomBlink('narrator-svg', duration);
      randomEyebrow('narrator-svg', duration);
    }, delay);
    if ( bubble.classList.contains('hidden') ) {
        if (bubble.dataset.enabled) {
          bubble.classList.remove('hidden');
          setNarratorEmotion('narrator-svg', narratorSmileEmotion);
        }
    } else {
        bubble.classList.add('hidden');
        setNarratorEmotion('narrator-svg', narratorNeutralEmotion);
    }
}

// usage: markdownConf = buildMarkdownConf(courseTargetLanguage, targetDir, userLang, userDir);
// updateCharacterBubble(newHint, markdownConf);
// optional: actions = {'repeat': () => {some code;}};
// injectActionsToLinks(document.getElementById('bubble-text'), actions);
function updateCharacterBubble(newHint, markdownConf={}, actions={}) {
    const bubble = document.getElementById('speech-bubble');
    const textTarget = document.getElementById('bubble-text');

    // Hide before update
    bubble.classList.add('hidden');

    if (!newHint || newHint.trim() === "") {
        bubble.dataset.enabled = "";
        return;
    }

    setTimeout(() => {
        textTarget.innerHTML = parseMarkdown(newHint, markdownConf);
        if ( actions ) injectActionsToLinks(textTarget, actions);
        bubble.dataset.enabled = true;
        // Show up after update
        bubble.classList.remove('hidden');
    }, 300);
}

// Narrators lookup

/**
 * Get a list of IDs for narrators matching a given tags set
 * @param {string[]} searchTags - search tags set
 * @param {boolean} matchAll - when True - all search tags should match
 */
function narratorIdsByTags(searchTags = [], matchAll = true) {
  if (searchTags.length === 0) {
    return NARRATORS.map(n => n.id);
  }

  return NARRATORS
    .filter(narrator => {
      if (matchAll) {
        return searchTags.every(tag => narrator.tags.includes(tag));
      } else {
        return searchTags.some(tag => narrator.tags.includes(tag));
      }
    })
    .map(narrator => narrator.id);
}

// Get random narrator according to search tags
function getRandomNarrator(searchTags = []) {
  let ids = narratorIdsByTags(searchTags);
  
  if (ids.length === 0) {
    // fallback to first as default
    ids = [NARRATORS[0].id];
  }
  
  const randomIndex = Math.floor(Math.random() * ids.length);
  return getNarratorById(ids[randomIndex]);
}

function getNarratorById(id) {
  return narratorsById.get(id).src || null;
}

// Narrators "database"

const NARRATORS = [
{
  id: "Alice",
  tags: ["Alice", "human", "classic", "female"],
  src: `
<svg id="narrator-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="365 88 347 378">
  <!-- Generator: Adobe Illustrator 30.1.0, SVG Export Plug-In . SVG Version: 2.1.1 Build 136)  -->
  <defs>
    <style>
      .st0 {
        fill: #fff;
      }

      .st1 {
        fill: url(#linear-gradient1);
      }

      .st2 {
        fill: #cc2f33;
      }

      .st3 {
        fill: #b5614c;
      }

      .st4 {
        fill: #f9d84b;
      }

      .st5 {
        fill: #f8a279;
      }

      .st6 {
        fill: url(#linear-gradient);
      }

      .st7 {
        fill: #030202;
      }
    </style>
    <linearGradient id="linear-gradient" x1="474.26" y1="329.97" x2="474.26" y2="294.91" gradientTransform="translate(0 -54)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#000"/>
    </linearGradient>
    <linearGradient id="linear-gradient1" x1="612.97" y1="312.44" x2="612.97" y2="277.38" gradientTransform="translate(0 -54)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#000"/>
    </linearGradient>
  </defs>
  <g id="Layer_15">
    <g id="head">
      <path class="st5" d="M614.01,199.87c-2.71-3.64-3.62-3.84-6.45-1.38-4.41,3.82-5.46,2.44-5.74-7.52-.34-12.2-.65-13.2-4.34-14.01-.62-.14-2.7-.93-5.21-1.85-6.53.1-6.76-.03-7.29-2.5h0c-.32-1.45-1.38-4.66-2.36-7.13-.99-2.48-2.09-5.77-2.46-7.32-.37-1.57-1.2-2.65-1.87-2.42-.81.26-1.31,3.49-1.5,9.56-.27,8.51-.45,9.2-2.5,9.69-3.66.87-39.69-.09-40.69-1.09-.77-.76-1.82-9.59-1.99-16.67-.05-2.35-2.71-2.23-4,.18-.57,1.06-1.62,5.42-2.34,9.68l-1.31,7.76-5.03,1.13c-.55.12-1.16.19-1.82.22-3.67.17-7.29.91-10.68,2.33-2.62,1.1-5.77,2.3-6.82,3.42l-2.2,2.34s-15.38,23.14-18.24,40.19c-.88,5.22-5.47,19.51-4.84,20.14.74.74,15.39,17.2,17.14,18.52.88.66,6.52,2.11,7.42,15.56,1.03,15.36.82,25.26-.42,37.43-1.04,10.12-2.02,12.31-7.49,16.61-1.82,1.43-4.58,2.27-8.38,2.54l-5.67.41,2.07,2.61c7.64,9.56,22.06,19.82,31.8,22.62,2.9.84,8.88,2.17,13.28,2.95,4.4.79,8.23,1.46,8.5,1.5.28.04,4.78-.37,10-.92,23.91-2.5,40.02-13,42.46-27.66.54-3.22-.03-7.29-.03-7.29-4.44-.47-7.72-1.15-9.48-2.05-4.77-2.43-6.42-4.89-7.83-11.67-.33-1.61-.71-3.03-1.19-4.27.06-1.63-.21-3.8-.86-6.61.39-.47-.07-6.76.77-11.57.13-.74.28-1.45.48-2.09.67-1.06,2.08-1.34,3.38-2.77.71-.47.84-.5.86-.5,1.08-.59,2.07-1.16,2.98-1.72,1.27-.78,2.39-1.52,3.36-2.21,3.76-2.68,5.38-4.56,5.51-4.56.57,0,11-15.2,12.24-18.5,1.38-3.67,3.12-9.79,4.75-16.75.38-1.66,16.07-22.34,16.09-32.42.01-7.71-.31-9.61-2.05-11.94h0ZM595.95,177.91c.21-.06.35-.09.39-.09-.02.02-.15.05-.39.09Z"/>
      <path class="st7" d="M652.89,273.31c-1.65.78-3.22,1.72-3.5,2.1-1.05,1.43-17.81,8.78-24.5,10.74-13.69,4.01-18.05,5.15-22,5.76-2.2.34-6.92,1.25-10.5,2.03-6.14,1.34-20.28.14-26.16-.67.13-.74.28-1.45.48-2.09.67-1.06,2.08-1.34,3.38-2.77.71-.47.84-.5.86-.5,1.08-.59,2.07-1.16,2.98-1.72.14-.05.27-.11.36-.16.85-.48,1.92-1.13,3-2.05,3.76-2.68,5.38-4.56,5.51-4.56.57,0,11-15.2,12.24-18.5,1.38-3.67,3.12-9.79,4.75-16.75.38-1.66,16.07-22.34,16.09-32.42.01-7.71-.31-9.61-2.05-11.94-2.71-3.64-3.62-3.84-6.45-1.38-4.41,3.82-5.46,2.44-5.74-7.52-.34-12.2-.65-13.2-4.34-14.01-.61-.14-2.61-.89-5.04-1.79-.06-.02-.11-.04-.17-.06-3.14.05-4.83.04-5.79-.25h-.03c-1-.32-1.2-.97-1.47-2.24h0c-.32-1.45-1.38-4.66-2.36-7.13-.99-2.48-2.09-5.77-2.46-7.32-.37-1.57-1.2-2.65-1.87-2.42-.81.26-1.31,3.49-1.5,9.56-.27,8.51-.45,9.2-2.5,9.69-3.66.87-39.69-.09-40.69-1.09-.77-.76-1.82-9.59-1.99-16.67-.05-2.35-2.71-2.23-4,.18-.57,1.06-1.62,5.42-2.34,9.68l-1.31,7.76-5.03,1.13c-.13.03-.27.06-.42.09-.44.07-.9.11-1.4.13-2.24.11-4.45.42-6.61.97-.22.02-.44.04-.65.06-.02,0-.04.06-.05.14-1.15.32-2.28.7-3.38,1.16-2.62,1.1-5.77,2.3-6.82,3.42l-2.2,2.34s-15.38,23.14-18.24,40.19c-.88,5.22-5.47,19.51-4.84,20.14.74.74,15.38,17.21,17.14,18.52.88.66,6.52,2.11,7.42,15.56.36,5.37.56,10.07.63,14.43-1.1.2-2.27.38-3.53.56-.89.12-19.83.68-42.41-2.88-3.64-.57-8.3-1.97-10.5-2.4-5.18-1.01-15.66-4.7-16.92-5.95-.54-.54-1.67-.99-2.53-.99-.85-.01-4.02-1.34-7.05-2.96-3.02-1.62-6.73-3.51-8.25-4.21-3.54-1.62-3.46-2.82.56-8.58,1.83-2.61,3.6-5.49,3.94-6.42.35-.92,1.88-3.62,3.41-6,4.12-6.41,14.34-26.95,14.34-28.81,0-.88.46-2.07,1.02-2.63,1.14-1.14,4.32-9.25,6.62-16.88,2.81-9.34,5.55-18.98,6.94-24.5,3.39-13.44,8.27-27.77,9.3-29.8,1.03-2.04,2.95-5.93,4.25-8.66,8.68-18.14,23.07-31.33,42.37-38.82,7.54-2.92,11.24-3.69,22.74-4.72,7.56-.67,21.96.59,25.26,1.03,8.3,1.09,23.35,6.45,25.5,9.08.28.33,1.88,1.31,3.55,2.17,6.98,3.57,22.9,21.39,26.57,29.72.6,1.37,1.52,3.32,2.04,4.32,1.76,3.37,5.72,18.25,6.33,23.74,1.04,9.37,6.87,30.4,12.75,45.94,5.58,14.78,17.75,36.19,27.98,49.23,3.61,4.61,3.38,7.73-.72,9.66h0Z"/>
      <path class="st3" d="M603.82,222.81c-1.51-.61-1.7-10.03-.27-13.77,1.89-4.98,6.02-2.01,6.02,4.34,0,2.98-2.83,10.18-3.94,10.02-.31-.04-1.13-.31-1.81-.58h0Z"/>
      <path class="st4" d="M551.41,430.11c45.14-5.58,89.04-30.43,120.97-68.45,10.54-12.55,24-33.63,24-37.59,0-1.25-20.16-.58-36.95,1.22-13.94,1.49-57.59,3.8-73.22,3.87-1.18,0-1.87,1.25-2.37,4.26-2.45,14.71-18.57,25.25-42.36,27.69-9.81,1.01-20.06-.12-31.9-3.51-9.8-2.8-26.62-14.81-31.36-22.38l-40.91,10.14c-10.24,2.54-20.22,6.04-29.79,10.46l-22.78,10.51c2.2,2.68,5.34,6.16,9.18,10.14,3.57,3.71,7.18,7.24,10.83,10.59,26.33,22.14,59.5,37.72,91.62,42.57,10.58,1.6,43.68,1.89,55.03.49h.01Z"/>
      <path class="st3" d="M558.2,292.53c-11.21.05-20.44-2.74-24.46-3.84-4.41-1.21-7.74-1.08-7.6.28.32,3.17,19.74,10.32,31.29,11.52,7.99.83,8.88.54,8.92-2.87.06-6.38-.87-5.12-8.15-5.09h0Z"/>
      <path class="st3" d="M570.41,234.48c-3.88,1.13-5.9,1.24-6.73.38-1.17-1.22-.55-3.94,1.12-4.86.94-.52,3.11-.95,4.84-.95,2.77,0,3.14-.27,3.14-2.33,0-1.28-.71-3.45-1.58-4.82-7.65-12.06-10.68-21.43-7.76-23.96,1.97-1.71,4.06.22,4.06,3.75,0,3.1,2.22,8.51,6.6,16.09,5.13,8.86,3.88,14.52-3.69,16.71h0Z"/>
      <path class="st6" d="M474.26,240.91c-5.74,0-10.39,7.85-10.39,17.53s4.65,17.53,10.39,17.53,10.39-7.85,10.39-17.53-4.65-17.53-10.39-17.53ZM474.26,269.19c-3.52,0-6.37-4.81-6.37-10.74s2.85-10.74,6.37-10.74,6.37,4.81,6.37,10.74-2.85,10.74-6.37,10.74Z"/>
      <path class="st1" d="M612.97,223.38c-5.74,0-10.39,7.85-10.39,17.53s4.65,17.53,10.39,17.53,10.39-7.85,10.39-17.53-4.65-17.53-10.39-17.53ZM612.97,251.65c-3.52,0-6.37-4.81-6.37-10.74s2.85-10.74,6.37-10.74,6.37,4.81,6.37,10.74-2.85,10.74-6.37,10.74Z"/>
    </g>
  </g>
  <g id="Layer_14">
    <g id="emotion-neutral-mouth" class="emotion-layer">
      <path class="st2" d="M574.06,250.13l-.69-.05c-.28.19-.6.4-.82.7-1.38,1.92-4.18,3.21-6.96,4.07-4.67,1.45-9.99.51-13.5-2.36-.03-.02-.05-.04-.08-.06-2.12-1.75-3.49-3.17-4.11-4.28h.2c-.27-.95.22-1.6,1.46-1.93,1.19-.32,10.61.85,15.62.85.23,0,.46,0,.67,0,8.9-.23,10.23-.07,8.21,3.07h0Z"/>
    </g>
  </g>
  <g id="Layer_13">
    <g id="emotion-smile-mouth" class="emotion-layer">
      <path class="st0" d="M566.89,252.38c1.19-1.25,2.16-2.63,2.16-3.06s-2.62-.71-5.83-.6-7.75.25-9.42-.22c-4.05-1.16-3.48.65.59,3.71,4.07,3.05,9.69,3.13,12.5.18h0Z"/>
      <path class="st2" d="M565.37,244.6c-5.8.18-18.23-1.76-19.74-1.27-3.37,1.12-2.18,4.57,3.6,10.47.03.03.06.06.09.09,4.26,4.3,10.71,5.71,16.37,3.54,3.37-1.29,6.76-3.23,8.43-6.1,3.92-6.77,3.47-7.12-8.75-6.73h0ZM560.98,255.74c-4.9,0-11.17-4.76-11.77-8.23,3.92.53,11.3.89,14.15.89,5.2,0,5.99.22,5.99,1.66,0,2.49-4.7,5.68-8.37,5.68Z"/>
    </g>
  </g>
  <g id="Layer_12">
    <g id="emotion-right-eye" class="emotion-layer">
      <path class="st3" d="M537.97,199.62c-3.04-4.99-6.45-5.33-9.05-.89-2.14,3.65-2.2,6.07-.27,10.29,1.31,2.87,1.87,3.24,4.82,3.24s3.55-.43,4.67-2.71c1.76-3.54,1.7-6.86-.18-9.94h.01Z"/>
      <path class="st7" d="M537.37,208.07c-1.58,3.93-4.87,4.5-7.07,1.24-2.81-4.18-1.21-11.72,2.49-11.72,4.19,0,6.59,5.5,4.58,10.49h0Z"/>
    </g>
  </g>
  <g id="Layer_11">
    <g id="emotion-left-eye" class="emotion-layer">
      <path class="st3" d="M585.86,197.37c-2.75-2.86-3.35-2.83-6.82.4-3.69,3.43-4.01,8.81-.75,12.43,2.66,2.94,4.81,2.97,7.57.09,1.67-1.73,2.16-3.21,2.16-6.47s-.49-4.72-2.16-6.46h0Z"/>
      <path class="st7" d="M582.31,210.71c-1.18,0-2.71-.9-3.48-2.04-1.88-2.81-1.71-6.43.46-9.3,2.18-2.89,3.74-3.05,6.1-.59,3.49,3.65,1.36,11.93-3.08,11.93h0Z"/>
    </g>
  </g>
  <g id="Layer_10">
    <g id="emotion-left-eyebrow"  class="emotion-layer animation-eyebrow">
      <path class="st3" d="M595.68,184.47c.08.39-.26,1.04-1.1,1.73-1.13.94-18.72,1.39-21.69.56-4.23-1.17-2.25-7.43,3.19-10.16,5.35-2.66,16.08-1.57,18.85,1.94.81,1.03,1.61,4.83.75,5.93h0Z"/>
      <path class="st7" d="M595.7,181.66c0,1.14-.79,2.56-1.76,3.17-1.74,1.09-18.5,1.41-20.65.39-2.07-.98-1.17-4.43,1.81-6.93,5.54-4.64,20.6-2.18,20.6,3.37h0Z"/>
    </g>
  </g>
  <g id="Layer_9">
    <g id="emotion-right-eyebrow" class="emotion-layer animation-eyebrow">
      <path class="st3" d="M548.5,184.1c-.64-2.64-6.19-5.97-9.94-5.95-4.35.03-12.47,3.22-15.64,6.16-2.89,2.67-4.05,6.29-2.51,7.9,1.05,1.08,5.07.63,7.78-.86,2.03-1.13,4.1-1.34,8.99-.93,9.35.79,12.6-1.02,11.32-6.31h0Z"/>
      <path class="st7" d="M546.95,187.64c-.66,1.23-2.37,1.51-9.34,1.54-5.74.02-9.26.46-10.73,1.34-2.39,1.43-4.65,1.73-5.58.77-1.39-1.46-.36-4.06,2.52-6.35,1.71-1.36,5.41-2.64,7.46-3.51,8.51-3.63,18.78.44,15.68,6.21h-.01Z"/>
    </g>
  </g>
  <g id="Layer_8">
    <g id="emotion-right-lower-eyelid" class="emotion-layer">
      <path class="st5" d="M576.38,203.9c-.15,2.21.58,4.45,2.23,6.25,2.65,2.9,4.8,2.93,7.54.09,1.67-1.71,2.16-3.17,2.16-6.38"/>
    </g>
  </g>
  <g id="Layer_7">
    <g id="emotion-right-upper-eyelid" class="emotion-layer">
      <path class="st5" d="M588.3,203.84c0-3.21-.49-4.66-2.16-6.37h0c-2.74-2.82-3.34-2.79-6.8.4-1.82,1.68-2.82,3.83-2.97,6"/>
    </g>
  </g>
  <g id="Layer_6">
    <g id="emotion-left-lower-eyelid" class="emotion-layer">
      <path class="st5" d="M538.73,209.71c-1.15,2.34-1.92,2.78-4.78,2.78-3.03,0-3.59-.38-4.93-3.33-.94-2.04-1.41-3.68-1.43-5.22h12.43c.14,1.86-.3,3.78-1.28,5.77h0Z"/>
    </g>
  </g>
  <g id="Layer_5">
    <g id="emotion-left-upper-eyelid" class="emotion-layer">
      <path class="st5" d="M539.95,203.94h-12.43c-.02-1.73.54-3.36,1.7-5.35,2.66-4.56,6.14-4.21,9.26.91h0c.86,1.43,1.36,2.91,1.46,4.44h0Z"/>
    </g>
  </g>
</svg>`
},
{
  id: "Bob",
  tags: ["Bob", "human", "classic", "male"],
  src: `
<svg id="narrator-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:svg="http://www.w3.org/2000/svg" viewBox="15 0 350 480">
  <!-- Generator: Adobe Illustrator 30.1.0, SVG Export Plug-In . SVG Version: 2.1.1 Build 136)  -->
  <defs>
    <style>
      .st0, .st1 {
        fill: #fff;
      }

      .st2 {
        fill: #b5614c;
      }

      .st3 {
        fill: #fbaa84;
      }

      .st1 {
        stroke: #27a992;
        stroke-miterlimit: 10;
        stroke-width: .25px;
      }

      .st4 {
        fill: #27a992;
      }

      .st5 {
        fill: #030202;
      }
    </style>
  </defs>
  <g id="head">
    <path class="st3" d="M248.94,188.65c-5.75,19.58-18.14,33.48-32.52,36.48-2.06.42-3.14,1.36-3.56,3.08-.14.6-.25,1.05-.35,1.33.04.8-.33,1.88-.3,3.31.03,1.31-.32,1.49-.29,6.73.03,4.45,2.57,9.82,3.61,13.09,1.17,3.72,1.45,6.08.82,6.94-4.54,6.23-15.81,18.61-19.9,21.83-2.77,2.18-13.61,3.58-15.38,2.96-1.57-.55-5.95-2.91-9.75-5.25s-8.26-4.94-9.91-5.79c-7.21-3.69-25.53-17.76-25.49-19.58,0-.59-.16-13.45-.36-28.58l-.39-27.5-3.72-8.5c-2.04-4.67-5.11-9.95-6.83-11.72-2.69-2.8-3.74-3.22-7.87-3.12-5.68.12-11.95-3.15-18.07-9.46-5.05-5.2-7.31-9.65-8.84-17.36-1.32-6.72-.38-11.67,3.1-16.14,1.02-1.31,6.77-5.21,6.77-5.21,2.39-1.09,5.37-1.98,6.62-1.98,6.38,0,18.6,7.46,20.54,12.54,1.04,2.71,13.37-19.64,14.44-20.52.8-.67,1.76-2.16,2.13-3.32.36-1.16-8.27-7.28-6.49-9.83,4.31-6.12,4.33-9.98,2.93-20.49-.54-4.12,3.97-10.64,3.95-11.24-.02-.71,10.08-.93,15.56-1.03,4.73-.09,8.32.23,8.02.72-.3.48,2.7,1.2,6.66,1.59,3.96.39,7.88,1.08,8.73,1.53,2.12,1.13,26.82,3.32,36.53,3.23,4.4-.04,11.21-.37,15.14-.74,4.73-.43,7.37-.29,7.82.43.22.36.15-1.32,2.15,8.28,1.28,6.14,5.07,24.59,4.84,25.96-.34,2.02.15,9.85,1.1,17.39,2.37,18.76,1.63,49.55-1.42,59.93h-.02,0Z"/>
    <path id="path5" class="st2" d="M120.09,151.8c-1.33-6.44-3.86-10.76-7.38-12.63-3.52-1.88-11,.08-10.45,2.72.26,1.24,1.22,1.63,3.61,1.43,5.2-.41,6.82,1.05,7.59,6.88.38,2.86,1.35,6.48,2.16,8.04,3.26,6.31,6.22,2.04,4.46-6.44h.01ZM204.34,226.63c-11.36-1.07-20.57-2.64-24.53-4.14-4.34-1.65-7.73-1.86-7.73-.49,0,3.19,18.94,12.25,30.51,14.61,8.01,1.63,8.94,1.43,9.33-1.95.72-6.34-.2-7.32-7.57-8.03h-.01,0Z"/>
    <path class="st2" d="M220.36,163.96c-4.41,1.23-6.7,1.35-7.65.41-1.33-1.33-.62-4.29,1.27-5.3,1.07-.57,3.54-1.04,5.5-1.04,3.15,0,3.57-.29,3.57-2.54,0-1.39-.81-3.76-1.79-5.25-8.7-13.15-12.15-23.35-8.83-26.12,2.24-1.86,4.61.24,4.61,4.09,0,3.38,2.52,9.28,7.51,17.54,5.83,9.66,4.42,15.83-4.18,18.21h0Z"/>
    <path class="st5" d="M126.97,138.84c-7.01-7.53-11.67-10.09-18.4-10.08-3.57,0-9.72.62-12.48,0-.77-.17-1.75-2.69-2.32-4.75-.58-2.06-2.5-7.8-4.28-12.75-3.11-8.65-3.23-9.56-3.21-23.5.02-13.72.17-14.82,2.76-20.5,1.5-3.3,3.79-7.43,5.09-9.17,2.67-3.58,11.88-9.33,14.97-9.34,2.52,0,4.88-3.3,5.71-7.97.89-5.01,4.81-11.48,9.37-15.45,4.24-3.7,15.54-9.59,18.39-9.59.97,0,3.27-.76,5.11-1.7,4.88-2.48,34.04-2.5,39.59-.02,2.09.93,5.41,1.7,7.37,1.69,1.96,0,5.89.9,8.74,2,2.84,1.1,6.16,2,7.37,2s3.53.73,5.15,1.63c1.92,1.06,6.39,1.79,12.85,2.11,8.62.43,10.51.21,14.62-1.64,2.62-1.18,6.76-2.13,9.32-2.13,6.5,0,9.17,3.09,13.37,15.49,4.58,13.55,1.72,25.46-8.56,35.75-3.16,3.16-6.18,5.75-6.71,5.75-.56,0-.96,4.15-.95,9.94,0,5.47-2.24,10.39-2.76,10.71-.92.58-1.12-3.53-2.4-10.76-1.08-6.12-1.8-7.41-7.28-6.86-8.21.82-37.79.11-41.03-.98-1.7-.57-7.43-1.45-12.71-1.96s-10.24-1.45-11.01-2.1c-1.78-1.5-22.86-1.54-24.32-.05-.72.74-.69,2.97.13,7.44,2.79,15.38,1.31,23.64-6.21,34.66-2.22,3.25-3.55,6.98-4.8,13.4-2.08,10.76-3.09,13.62-4.73,13.55-.69-.03-3.26-2.21-5.71-4.85h0l-.04.03h0Z"/>
    <g>
      <polygon class="st1" points="218.09 253.65 241.29 263.78 226.85 321.71 157.87 337.02 110.48 265.22 134.15 247.97 187.34 284.52 218.09 253.65"/>
      <path id="path4" class="st4" d="M135.16,374.97c-39.03-8.05-70.86-26.01-100.31-56.61-7.77-8.07-12.72-14.09-12.72-15.48,0-1.04,19.13-11.84,27.99-15.81,6.74-3.02,22.29-9.73,52.81-19.48l9.18-3.57,3.41,4.13c1.15,1.39,4,4.98,6.33,7.96,7.78,9.95,35.96,36.82,38.61,36.82.89,0,2.4-1.24,3.36-2.75,1.66-2.64,13.79-17.77,18.84-23.5,1.42-1.61,3.64-2.85,5.37-3,2.57-.23,4.63,1.39,16.03,12.59,13.08,12.86,15.23,14.12,16.77,9.91.36-.98,2.06-4.02,3.78-6.77,3.74-5.96,10.05-20.64,12.92-30.56l1.74-6,19.45.94c10.94-.33,25.3-1.09,31.9-1.68s20.44-1.36,30.75-1.7c16.21-.55,18.75-.43,18.75.86,0,1.83-6.38,14.06-12.13,23.25-16.58,26.49-38.75,49.05-64.73,65.88-14.43,9.34-37.93,19.16-55.08,23.01-4.12.93-10.23,2.32-13.56,3.1-4.2.98-12.51,1.42-27.08,1.42-11.56,0-26.58-1.77-32.35-2.96h-.03Z"/>
    </g>
  </g>
  <g id="emotion-neutral-mouth" class="emotion-layer">
    <path class="st2" d="M220.61,181.73l-.69-.05c-.28.19-.6.4-.82.7-1.38,1.92-4.18,3.21-6.96,4.07-4.67,1.45-9.99.51-13.5-2.36-.03-.02-.05-.04-.08-.06-2.12-1.75-3.49-3.17-4.11-4.28h.2c-.27-.95.22-1.6,1.46-1.93,1.19-.32,10.61.85,15.62.85.23,0,.46,0,.67,0,8.9-.23,10.23-.07,8.21,3.07h0Z"/>
  </g>
  <g id="emotion-smile-mouth" class="emotion-layer">
    <g>
      <path class="st0" d="M215.56,184.16c1.35-1.36,2.45-2.86,2.45-3.34s-2.98-.77-6.63-.65-8.81.28-10.71-.24c-4.61-1.26-3.95.71.68,4.04,4.62,3.33,11.01,3.41,14.21.19h0Z"/>
      <path class="st2" d="M214,175.4c-6.59.2-20.72-1.91-22.43-1.37-3.83,1.22-2.48,4.98,4.1,11.41,2.03,1.99,6.21,3.72,9.22,4.79,2.46.87,5.12.96,7.63.23,3.63-1.05,8.73-3.26,11.43-7.73,4.45-7.38,3.94-7.76-9.94-7.34h-.01ZM209.01,187.54c-5.57,0-12.7-5.18-13.38-8.96,4.45.58,12.84.96,16.08.96,5.91,0,6.81.24,6.81,1.81,0,2.71-5.34,6.19-9.51,6.19Z"/>
    </g>
  </g>
  <g id="emotion-left-eye" class="emotion-layer">
    <g>
      <path class="st2" d="M237.27,123.91c-3.12-3.12-3.81-3.08-7.75.44-4.19,3.74-4.56,9.6-.84,13.55,3.02,3.21,5.47,3.24,8.6.1,1.9-1.89,2.46-3.5,2.46-7.05s-.56-5.15-2.46-7.04h-.01Z"/>
      <path class="st5" d="M233.23,138.45c-1.34,0-3.08-.98-3.95-2.22-2.14-3.06-1.94-7.01.52-10.14,2.48-3.15,4.25-3.32,6.93-.64,3.97,3.98,1.55,13-3.49,13h-.01Z"/>
    </g>
  </g>
  <g id="emotion-right-eye" class="emotion-layer">
    <g>
      <path class="st2" d="M182.83,126.38c-3.46-5.44-7.33-5.81-10.28-.97-2.43,3.98-2.5,6.62-.3,11.22,1.49,3.13,2.12,3.53,5.48,3.53,3.18,0,4.03-.47,5.31-2.95,2-3.86,1.93-7.48-.2-10.83h0Z"/>
      <path class="st5" d="M182.16,135.59c-1.79,4.28-5.54,4.91-8.04,1.35-3.19-4.56-1.39-12.78,2.82-12.78,4.76,0,7.49,5.99,5.22,11.43Z"/>
    </g>
  </g>
  <g id="emotion-left-eyebrow" class="emotion-layer animation-eyebrow">
    <g>
      <path class="st2" d="M248.42,109.84c.09.42-.29,1.13-1.25,1.89-1.28,1.02-21.27,1.52-24.65.62-4.81-1.28-2.56-8.1,3.62-11.07,6.08-2.9,18.28-1.72,21.42,2.1.92,1.12,1.83,5.26.85,6.46h.01Z"/>
      <path class="st5" d="M248.43,106.78c0,1.24-.89,2.79-1.99,3.45-1.97,1.19-21.02,1.55-23.47.44-2.36-1.06-1.33-4.83,2.05-7.55,6.29-5.06,23.41-2.39,23.41,3.66h0Z"/>
    </g>
  </g>
  <g id="emotion-right-eyebrow" class="emotion-layer animation-eyebrow">
    <g>
      <path class="st2" d="M194.8,109.46c-.73-2.88-7.04-6.51-11.3-6.48-4.94.03-14.17,3.52-17.78,6.72-3.29,2.91-4.6,6.86-2.85,8.61,1.19,1.18,5.76.69,8.84-.94,2.31-1.23,4.66-1.46,10.22-1.01,10.63.86,14.32-1.12,12.87-6.89h0Z"/>
      <path class="st5" d="M193.03,113.31c-.75,1.34-2.69,1.65-10.62,1.68-6.52.02-10.52.5-12.2,1.47-2.72,1.56-5.28,1.89-6.34.84-1.58-1.59-.41-4.43,2.86-6.92,1.94-1.48,6.15-2.88,8.48-3.83,9.67-3.96,21.34.47,17.82,6.76h0Z"/>
    </g>
  </g>
  <g id="emotion-left-lower-eyelid" class="emotion-layer">
    <path class="st3" d="M226.47,130.99c-.17,2.45.67,4.92,2.54,6.91,3.02,3.21,5.47,3.24,8.6.1,1.9-1.89,2.46-3.5,2.46-7.05"/>
  </g>
  <g id="emotion-left-upper-eyelid" class="emotion-layer">
    <path class="st3" d="M240.07,130.95c0-3.55-.56-5.15-2.46-7.04h-.01c-3.12-3.12-3.81-3.08-7.75.44-2.08,1.85-3.22,4.23-3.38,6.64"/>
  </g>
  <g id="emotion-right-lower-eyelid" class="emotion-layer">
    <path class="st3" d="M183.27,137.21c-1.28,2.48-2.13,2.95-5.31,2.95-3.36,0-3.99-.4-5.48-3.53-1.04-2.16-1.57-3.9-1.59-5.54h13.8c.15,1.97-.33,4.01-1.42,6.12Z"/>
  </g>
  <g id="emotion-right-upper-eyelid" class="emotion-layer">
    <path class="st3" d="M184.63,131.09h-13.8c-.02-1.84.6-3.57,1.89-5.68,2.95-4.84,6.82-4.47,10.28.97h.01c.96,1.52,1.51,3.09,1.62,4.71h0Z"/>
  </g>

</svg>`
}
];

// dictionary for direct access to narrator by ID
const narratorsById = new Map(NARRATORS.map(n => [n.id, n]));
