const countries = ["senegal", "nigeria", "drc"];
let currentCountryIndex = 0;
let isAnimating = false;
let sunRotationDegrees = 0;
let statsAreVisible = false;
let previousTouchY = 0; // Initialize with a default value
let previousScrollPosition = 0; // Initialize with a default value

previousScrollPosition = window.scrollY;
const nav = document.getElementById("nav");
const tagline = document.getElementById("tagline");
const stats = document.getElementById("stats");

observeHeroAnimation(nav);
observeHeroAnimation(tagline);

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio == 1.0) {
        statsAreVisible = true;
      } else {
        statsAreVisible = false;
      }
    });
  },
  {
    root: null,
    threshold: [1.0],
  }
);

statsObserver.observe(stats);

window.addEventListener("wheel", handleScroll, { passive: false });
window.addEventListener("touchmove", handleScroll, { passive: false });
window.addEventListener("scroll", handleScroll, { passive: false });

function handleScroll(event) {
  if (isAnimating) {
    event.preventDefault();
    return;
  }
  if (!statsAreVisible) {
    return;
  }

  let scrollDirection;
  if (event.type === "wheel") {
    if (event.deltaY === 0) {
      return;
    }
    scrollDirection = event.deltaY > 0 ? "down" : "up";
  } else if (event.type === "touchmove") {
    const touch = event.touches[0];
    const currentTouchY = touch.clientY;
    scrollDirection = currentTouchY < previousTouchY ? "down" : "up";
    previousTouchY = currentTouchY;
  } else if (event.type === "scroll") {
    const currentScrollPosition = window.scrollY;
    scrollDirection =
      currentScrollPosition > previousScrollPosition ? "down" : "up";
    previousScrollPosition = currentScrollPosition;
  }

  if (scrollDirection === undefined) {
    return;
  }

  const increment = scrollDirection === "down" ? 1 : -1;
  const nextCountryIndex = currentCountryIndex + increment;
  if (nextCountryIndex < 0 || nextCountryIndex >= countries.length) {
    return;
  }
  event.preventDefault();
  isAnimating = true;

  const currentCountry = countries[currentCountryIndex];
  const nextCountry = countries[nextCountryIndex];

  const currentElement = document.getElementById(currentCountry);
  const nextElement = document.getElementById(nextCountry);

  const sun = document.getElementById("sun-top");
  const degreeChange = scrollDirection === "down" ? -20 : 20;
  sunRotationDegrees = sunRotationDegrees + degreeChange;
  sun.style.transition = "transform 1s ease-in-out";
  sun.style.transform = `translate(-25%, -50%) rotate(${sunRotationDegrees}deg)`;

  currentElement.classList.remove("title80");
  currentElement.classList.add("title56", "light");
  nextElement.classList.remove("title56", "light");
  nextElement.classList.add(
    "transition-all",
    "title80",
    "ease-in",
    "duration-500"
  );

  const currentCountryStats = document.getElementById(
    `${currentCountry}-stats`
  );
  const nextCountryStats = document.getElementById(`${nextCountry}-stats`);

  // Add transitionend event listener
  nextCountryStats.addEventListener(
    "animationend",
    () => {
      console.log("animationend");
      isAnimating = false;
      currentCountryStats.classList.remove("animate-slide-out");
      nextCountryStats.classList.remove("animate-slide-in");
      currentCountryIndex = nextCountryIndex;
    },
    { once: true }
  );

  currentCountryStats.classList.add("animate-slide-out");
  nextCountryStats.classList.remove("hidden");
  nextCountryStats.classList.add("animate-slide-in");
  // nextCountryStats.classList.add("flex");
  setTimeout(() => {
    currentCountryStats.classList.add("hidden");
  }, 500);
}

function observeHeroAnimation(element) {
  const hero = document.querySelector("#hero");
  const elementBottom = element.getBoundingClientRect().bottom;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.style.zIndex = "30";
        }
        if (!entry.isIntersecting) {
          element.style.zIndex = "-1";
        }
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `${elementBottom * -1}px`,
    }
  );

  observer.observe(hero);
  return () => {
    observer.disconnect();
  };
}
