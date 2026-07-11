(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scroll for [data-scroll]
  document.querySelectorAll('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = document.getElementById(el.getAttribute('data-scroll'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Service card expand/collapse
  document.querySelectorAll('.service-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-service');
      var panel = document.querySelector('[data-service-panel="' + id + '"]');
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.querySelector('span').textContent = expanded ? 'View details' : 'Hide details';
      if (panel) panel.classList.toggle('open', !expanded);
    });
  });

  // FAQ accordion (single-open)
  var faqList = document.getElementById('faqList');
  if (faqList) {
    var questions = faqList.querySelectorAll('.faq-question');
    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        var isOpen = q.getAttribute('aria-expanded') === 'true';
        questions.forEach(function (other) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.classList.remove('open');
        });
        if (!isOpen) {
          q.setAttribute('aria-expanded', 'true');
          q.nextElementSibling.classList.add('open');
        }
      });
    });
  }

  // Contact form
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      try {
        var leads = JSON.parse(localStorage.getItem('dgs_leads') || '[]');
        leads.push(Object.assign({}, data, { timestamp: new Date().toISOString() }));
        localStorage.setItem('dgs_leads', JSON.stringify(leads));
      } catch (err) { /* storage unavailable, ignore */ }

      form.style.display = 'none';
      success.style.display = 'block';
      setTimeout(function () {
        form.reset();
        form.style.display = 'block';
        success.style.display = 'none';
      }, 3000);
    });
  }

  // Chat widget
  var chatToggle = document.getElementById('chatToggle');
  var chatWindow = document.getElementById('chatWindow');
  var chatIconOpen = document.getElementById('chatIconOpen');
  var chatIconClose = document.getElementById('chatIconClose');
  var chatMessages = document.getElementById('chatMessages');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');

  var quickResponses = {
    hours: 'We are available daily from 8 AM to 9 PM to answer your questions and provide quotes.',
    location: 'We are based in St. Petersburg, Florida, but serve clients throughout the state and handle out-of-state title processing.',
    services: 'We offer: New/Used Florida Deals, Out of State Duplicate Titles, Out of State Titles, and Wholesale Services. Which service are you interested in?',
    pricing: 'Our pricing varies based on the type of service and complexity. Please fill out our contact form or call us for a personalized quote.',
    time: 'Processing times vary: Florida titles typically take 5-10 business days, out-of-state titles 2-4 weeks. Expedited services are available.',
    contact: 'You can reach us by phone at (800) 555-1234 or fill out our contact form below. We respond quickly during business hours (8 AM - 9 PM daily).',
    experience: 'We have over 19 years of experience in auto title processing and are proficient in CVR, Title Tech, DLRDMV, CDK, Reynolds & Reynolds, and ADP systems.',
    states: 'Yes! We handle title processing from all 50 states. Our extensive experience means we know the specific requirements for each state.'
  };

  function getResponse(message) {
    var m = message.toLowerCase();
    if (m.indexOf('hour') > -1 || m.indexOf('open') > -1 || m.indexOf('available') > -1) return quickResponses.hours;
    if (m.indexOf('where') > -1 || m.indexOf('location') > -1) return quickResponses.location;
    if (m.indexOf('service') > -1 || m.indexOf('what do you') > -1) return quickResponses.services;
    if (m.indexOf('price') > -1 || m.indexOf('cost') > -1 || m.indexOf('fee') > -1) return quickResponses.pricing;
    if (m.indexOf('how long') > -1 || m.indexOf('time') > -1 || m.indexOf('fast') > -1) return quickResponses.time;
    if (m.indexOf('contact') > -1 || m.indexOf('call') > -1 || m.indexOf('email') > -1) return quickResponses.contact;
    if (m.indexOf('experience') > -1 || m.indexOf('software') > -1 || m.indexOf('system') > -1) return quickResponses.experience;
    if (m.indexOf('state') > -1) return quickResponses.states;
    return 'Thank you for your question! For detailed information specific to your needs, please fill out our contact form or call us at (800) 555-1234. We’re available daily from 8 AM to 9 PM.';
  }

  function addMessage(text, sender) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatToggle && chatWindow) {
    chatToggle.addEventListener('click', function () {
      var open = chatWindow.classList.toggle('open');
      chatIconOpen.style.display = open ? 'none' : 'block';
      chatIconClose.style.display = open ? 'block' : 'none';
      chatToggle.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    });

    function send() {
      var val = chatInput.value.trim();
      if (!val) return;
      addMessage(val, 'user');
      chatInput.value = '';
      setTimeout(function () { addMessage(getResponse(val), 'bot'); }, 500);
    }

    chatSend.addEventListener('click', send);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
  }
})();
