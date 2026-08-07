(() => {
  const wired = new WeakSet();

  const start = (video) => {
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('muted', '');
    if (video.paused) video.play().catch(() => {});
  };

  const ensurePlayback = () => {
    const video = document.getElementById('home-background-video') || document.querySelector('video[autoplay]');
    if (!video) return;
    if (!wired.has(video)) {
      wired.add(video);
      video.addEventListener('canplay', () => start(video));
      video.addEventListener('pause', () => {
        if (!document.hidden) start(video);
      });
    }
    start(video);
  };

  document.addEventListener('DOMContentLoaded', ensurePlayback);
  window.addEventListener('pageshow', ensurePlayback);
  window.addEventListener('focus', ensurePlayback);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensurePlayback();
  });
  new MutationObserver(ensurePlayback).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
