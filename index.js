const widthMd = 768;
const widthSM = 480;

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
const stats = document.getElementById("stats-facts");
const sun = document.getElementById("sun-top");

observeHeroAnimation(nav);
observeHeroAnimation(tagline);

// Horizontal scroll oberver stats
const scrollContainer = document.getElementById("stats-facts");
const observerOptions = {
  root: scrollContainer,
  rootMargin: "0px",
  threshold: [1.0],
};

const observerCallback = (entries) => {
  if (window.innerWidth > widthMd) {
    return;
  }
  entries.forEach((entry) => {
    const country = entry.target.id.split("-")[0];
    const countryIndex = countries.indexOf(country);
    if (entry.isIntersecting) {
      // Slides in back from the left
      if (countryIndex < currentCountryIndex) {
        toggleCountryTitle(countryIndex);
        currentCountryIndex = countryIndex;
      }
    } else {
      // Slides out to the left
      if (
        countryIndex == currentCountryIndex &&
        countryIndex < countries.length - 1
      ) {
        toggleCountryTitle(countryIndex + 1);
        currentCountryIndex = countryIndex + 1;
      }
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

document.querySelectorAll(".stats-display").forEach((item) => {
  observer.observe(item);
});

// Only when the stats section is fully visible we want to listen to scroll events
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

const totalScrollWidth = stats.scrollWidth - stats.clientWidth;
statsObserver.observe(stats);
window.addEventListener("wheel", handleScroll, { passive: false });
window.addEventListener("scroll", handleScroll, { passive: false });

function toggleCountryTitle(newCountryIndex) {
  sunRotationDegrees =
    newCountryIndex > currentCountryIndex
      ? sunRotationDegrees + 20
      : sunRotationDegrees - 20;
  sun.style.transition = "transform 1s ease-in-out";
  sun.style.transform = `translate(-15%, -50%) rotate(${sunRotationDegrees}deg)`;
  const currentCountry = countries[currentCountryIndex];
  const nextCountry = countries[newCountryIndex];

  const currentElement = document.querySelector(
    `.stats-display #${currentCountry}`
  );
  const nextElement = document.querySelector(`.stats-display #${nextCountry}`);

  currentElement.classList.remove("title80");
  currentElement.classList.add("title56", "light");
  nextElement.classList.remove("title56", "light");
  nextElement.classList.add(
    "transition-all",
    "title80",
    "ease-in",
    "duration-500"
  );
}

function handleScroll(event) {
  if (window.innerWidth <= widthMd) {
    return;
  }
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
  const hero = document.querySelector("#grass");
  const offset = window.innerWidth > widthMd ? 150 : 0;
  const elementBottom = element.getBoundingClientRect().bottom + offset;

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

let swiper = null;

function initSwiper() {
  if (window.innerWidth <= widthSM) {
    if (!swiper) {
      swiper = new Swiper(".stats-swiper", {
        on: {
          slideChange: function () {
            handleSlideChange(this.activeIndex);
          },
        },
      });
    }
  } else if (swiper) {
    swiper.destroy();
    swiper = null;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSwiper();
  window.addEventListener("resize", initSwiper);
});

function handleSlideChange(activeIndex) {
  const countries = ["senegal", "nigeria", "drc"];
  const currentCountry = countries[activeIndex];
  const sun = document.getElementById("sun-top");

  // Update sun rotation based on the active index
  const sunRotationDegrees = activeIndex * 20; // Adjust the rotation degree as needed
  sun.style.transition = "transform 1s ease-in-out";
  sun.style.transform = `translate(-15%, -50%) rotate(${sunRotationDegrees}deg)`;

  // Update country titles
  countries.forEach((country, index) => {
    const element = document.querySelector(`#stats-countries #${country}`);
    if (index !== activeIndex) {
      element.classList.remove("title80");
      element.classList.add("title56", "light");
      if (index < activeIndex) {
        element.classList.add("hidden");
      }
    }
    if (index === activeIndex) {
      element.classList.remove("title56", "light", "hidden");
      element.classList.add(
        "transition-all",
        "title80",
        "ease-in",
        "duration-1000"
      );
    }
  });
}
