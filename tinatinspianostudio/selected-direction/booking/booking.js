(() => {
  const root = document.querySelector('[data-booking]');
  if (!root) return;

  const state = { lesson: '', duration: '', price: '', day: 'Tuesday, August 11', time: '', student: '', email: '', age: '', experience: '', goals: '' };
  const panels = [...root.querySelectorAll('[data-panel]')];
  const markers = [...root.querySelectorAll('[data-step-marker]')];

  function show(step) {
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === String(step)));
    markers.forEach(marker => marker.classList.toggle('active', Number(marker.dataset.stepMarker) <= Math.min(step, 4)));
    root.querySelector('.scheduler').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  root.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
    state.lesson = button.dataset.lesson;
    state.duration = button.dataset.duration;
    state.price = button.dataset.price;
    show(2);
  }));

  root.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-day]').forEach(day => day.classList.remove('active'));
    button.classList.add('active');
    state.day = button.dataset.day;
    state.time = '';
    root.querySelectorAll('[data-time]').forEach(time => time.classList.remove('selected'));
  }));

  root.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-time]').forEach(time => time.classList.remove('selected'));
    button.classList.add('selected');
    state.time = button.dataset.time;
    setTimeout(() => show(3), 180);
  }));

  root.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => show(button.dataset.back)));

  root.querySelector('[data-details]').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    for (const [key, value] of data.entries()) state[key] = value;
    root.querySelector('[data-summary]').innerHTML = `
      <span>LESSON</span><b>${state.lesson} · ${state.duration}</b>
      <span>TIME</span><b>${state.day} · ${state.time}</b>
      <span>STUDENT</span><b>${state.student}</b>
      <span>PRICE</span><b>${state.price}</b>`;
    document.querySelector('[data-owner-name]').textContent = state.student;
    document.querySelector('[data-owner-slot]').textContent = `${state.day} · ${state.time}`;
    show(4);
  });

  root.querySelector('[data-submit-request]').addEventListener('click', () => show(5));
})();
