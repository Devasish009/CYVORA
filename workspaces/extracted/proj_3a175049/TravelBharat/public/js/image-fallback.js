document.addEventListener('DOMContentLoaded', () => {
  const applyFallbackToImage = (img) => {
    const fallback = img.dataset.fallback;
    if (!fallback || img.dataset.fallbackApplied === 'true') return;

    if (img.src === fallback) {
      img.dataset.fallbackApplied = 'true';
      return;
    }

    img.dataset.fallbackApplied = 'true';
    img.src = fallback;
  };

  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      applyFallbackToImage(img);
    });

    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      applyFallbackToImage(img);
    }
  });

  document.querySelectorAll('img[data-hero-target]').forEach((img) => {
    const targetSelector = img.dataset.heroTarget;
    const fallback = img.dataset.fallback;
    const target = document.querySelector(targetSelector);
    if (!target || !fallback) return;

    const setHeroBackground = () => {
      if (img.currentSrc) {
        target.style.backgroundImage = `url('${img.currentSrc}')`;
      } else if (img.src) {
        target.style.backgroundImage = `url('${img.src}')`;
      } else {
        target.style.backgroundImage = `url('${fallback}')`;
      }
    };

    img.addEventListener('error', () => {
      target.style.backgroundImage = `url('${fallback}')`;
    });

    img.addEventListener('load', () => {
      setHeroBackground();
    });

    if (img.complete) {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        target.style.backgroundImage = `url('${fallback}')`;
      } else {
        setHeroBackground();
      }
    }
  });
});
