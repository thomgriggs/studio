(() => {
  function initializeListeningRoom() {
    const room = document.querySelector('[data-listening-room]');
    if (!room || room.dataset.ready === 'true') return;

    const tracks = Array.from(room.querySelectorAll('[data-video-id]'));
    const player = room.querySelector('[data-player]');
    const count = room.querySelector('[data-track-count]');
    const title = room.querySelector('[data-track-title]');
    const meta = room.querySelector('[data-track-meta]');
    const note = room.querySelector('[data-track-note]');
    let current = 0;

    function select(index, autoplay) {
      current = (index + tracks.length) % tracks.length;
      const track = tracks[current];

      tracks.forEach((item, itemIndex) => {
        item.setAttribute('aria-current', itemIndex === current ? 'true' : 'false');
      });

      player.src = `https://www.youtube.com/embed/${track.dataset.videoId}${autoplay ? '?autoplay=1' : ''}`;
      player.title = track.dataset.title;
      count.textContent = String(current + 1).padStart(2, '0');
      title.textContent = track.dataset.title;
      meta.textContent = track.dataset.meta;
      note.textContent = track.dataset.note;
      track.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }

    room.addEventListener('click', event => {
      const track = event.target.closest('[data-video-id]');
      if (track && room.contains(track)) {
        select(tracks.indexOf(track), true);
        return;
      }
      if (event.target.closest('[data-previous]')) select(current - 1, true);
      if (event.target.closest('[data-next]')) select(current + 1, true);
      if (event.target.closest('[data-shuffle]')) {
        let next = current;
        while (tracks.length > 1 && next === current) next = Math.floor(Math.random() * tracks.length);
        select(next, true);
      }
    });

    room.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') select(current - 1, true);
      if (event.key === 'ArrowRight') select(current + 1, true);
    });

    room.dataset.ready = 'true';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeListeningRoom, {once: true});
  } else {
    initializeListeningRoom();
  }
})();
