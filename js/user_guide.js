/*
 *   "Vox-Libera" - Learn Any Language
 *   User Guide engine
 */

"use strict";

const settings = new Settings({
    "userInterfaceLanguage": {"default": "en"}
});

const i18n = new I18nManager(locales);
const userLang = settings.getUserInterfaceLanguage();
i18n.setLanguage(userLang);

const langSelect = document.getElementById('ui-lang-select');
// Configure UI selector
langSelect.innerHTML = '';
Object.keys(locales).forEach(langCode => {
    const langName = locales[langCode].__title__ || langCode;
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = langCode;
    if (langCode === userLang) option.selected = true;
    langSelect.appendChild(option);
});
langSelect.value = userLang;

// Callback for UI language change
langSelect.addEventListener('change', (event) => {
    const newLang = event.target.value;

    settings.setUserInterfaceLanguage(newLang);

    i18n.setLanguage(newLang);

    location.reload();
});

const userDir = langDirection(userLang);
// TODO: apply direction to the document (?)

const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove "active" class for all, excluding the visible one
            document.querySelectorAll('.nav-item').forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        }
    });
}, { threshold: 0.2 }); // Fire up when the half of section is visible


// narrator controller
const narratorController = {
  isAutoScroll: true,

  update(slide) {
    const hint = slide.dataset.hint?.trim();
    
    // highlight current slide only
    document.querySelector('.guide-slide.active')?.classList.remove('active');
    slide.classList.add('active');

    const bubble = document.getElementById('speech-bubble');
    if (hint) {
        bubble.dataset.enabled = 1;
        updateCharacterBubble(hint);
        setNarratorEmotion('narrator-svg', narratorSmileEmotion);
        // show bubble
        bubble.classList.remove('hidden');
    } else {
      bubble.dataset.enabled = '';
      setNarratorEmotion('narrator-svg', narratorNeutralEmotion);
      bubble.classList.add('hidden');
    }
  }
};

// configure the Observer
const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Activate when the slide is shown
    if (entry.isIntersecting) {
      narratorController.update(entry.target);
    }
  });
}, { threshold: 0.7, rootMargin: "-10% 0px -10% 0px" }); 

// fill sections in app_container
/*
<section id="intro">
</section>
*/

var guideSlides = locales['en'].guide_slides;
if ( locales[userLang] && locales[userLang]['guide_slides'] )
  guideSlides = locales[userLang].guide_slides;

const appContainerElm = document.getElementById('app-container');
[...guideSlides].forEach(section => {
  const sectionObj = document.createElement('section');
  sectionObj.setAttribute('id', section.anchor);
  if (section['content']) {
    sectionObj.innerHTML = parseMarkdown(section.content);
  }
  if (section['slides']) {
    [...section.slides].forEach(slide => {
      const slideElement = document.createElement('div');
      slideElement.innerHTML = parseMarkdown(slide.content);
      slideElement.className = 'guide-slide';
      let hint = slide.hint;
      if ( hint.startsWith('\n') ) hint = hint.replace('\n', '');
      slideElement.setAttribute('data-hint', hint);
      sectionObj.appendChild(slideElement);
      slideObserver.observe(slideElement);
    });
  }
  appContainerElm.appendChild(sectionObj);
  chapterObserver.observe(sectionObj);
  // Add listener for Hover
  document.querySelectorAll('.guide-slide').forEach(slide => {
    slide.addEventListener('mouseenter', () => narratorController.update(slide));
  });

});

window.addEventListener('DOMContentLoaded', async () => {
  initNarrator(getRandomNarrator(), 'narrator-wrapper');
  const bubble = document.getElementById('speech-bubble');
  const narrator = document.getElementById('narrator-wrapper');
  bubble.addEventListener('click', toggleBubble);
  narrator.addEventListener('click', toggleBubble);
  setNarratorEmotion('narrator-svg', narratorNeutralEmotion);
  updateFavicon('🌐');
});
