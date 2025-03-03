"use strict";

// Configuration constants
const CONFIG = {
  VIEWPORT: {
    DESKTOP: 768,
    MOBILE: 480,
  },
  ANIMATION: {
    DURATION: 500,
    SUN_ROTATION: 20,
  },
  COUNTRIES: ["senegal", "nigeria", "drc"],
};

// State management
const state = {
  currentCountryIndex: 0,
  isAnimating: false,
  sunRotationDegrees: 0,
  statsAreVisible: false,
  previousScrollPosition: window.scrollY,
};

/**
 * Class to handle country statistics animations and interactions
 */
class StatisticsManager {
  constructor() {
    this.stats = document.getElementById("stats-facts");
    this.sun = document.getElementById("sun-top");
    this.initializeObservers();
    this.bindEvents();
  }

  initializeObservers() {
    const observerOptions = {
      root: this.stats,
      rootMargin: "0px",
      threshold: [1.0],
    };

    const observerCallback = (entries) => {
      if (window.innerWidth > CONFIG.VIEWPORT.DESKTOP) {
        return;
      }
      entries.forEach((entry) => {
        const country = entry.target.id.split("-")[0];
        const countryIndex = CONFIG.COUNTRIES.indexOf(country);
        if (entry.isIntersecting) {
          // Slides in back from the left
          if (countryIndex < state.currentCountryIndex) {
            this.toggleCountryTitle(countryIndex);
            state.currentCountryIndex = countryIndex;
          }
        } else {
          // Slides out to the left
          if (
            countryIndex == state.currentCountryIndex &&
            countryIndex < CONFIG.COUNTRIES.length - 1
          ) {
            this.toggleCountryTitle(countryIndex + 1);
            state.currentCountryIndex = countryIndex + 1;
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    document.querySelectorAll(".stats-display").forEach((item) => {
      observer.observe(item);
    });

    // Only when the stats section is fully visible we want to listen to scroll events
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio == 1.0) {
            state.statsAreVisible = true;
          } else {
            state.statsAreVisible = false;
          }
        });
      },
      {
        root: null,
        threshold: [1.0],
      }
    );

    statsObserver.observe(this.stats);
  }

  bindEvents() {
    window.addEventListener("wheel", this.handleScroll.bind(this), {
      passive: false,
    });
    window.addEventListener("scroll", this.handleScroll.bind(this), {
      passive: false,
    });
  }

  toggleCountryTitle(newCountryIndex) {
    state.sunRotationDegrees =
      newCountryIndex > state.currentCountryIndex
        ? state.sunRotationDegrees + CONFIG.ANIMATION.SUN_ROTATION
        : state.sunRotationDegrees - CONFIG.ANIMATION.SUN_ROTATION;
    this.sun.style.transition = "transform 1s ease-in-out";
    this.sun.style.transform = `translate(-15%, -50%) rotate(${state.sunRotationDegrees}deg)`;
    const currentCountry = CONFIG.COUNTRIES[state.currentCountryIndex];
    const nextCountry = CONFIG.COUNTRIES[newCountryIndex];

    const currentElement = document.querySelector(
      `.stats-display #${currentCountry}`
    );
    const nextElement = document.querySelector(
      `.stats-display #${nextCountry}`
    );

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

  handleScroll(event) {
    if (window.innerWidth <= CONFIG.VIEWPORT.DESKTOP) {
      return;
    }
    if (state.isAnimating) {
      event.preventDefault();
      return;
    }
    if (!state.statsAreVisible) {
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
        currentScrollPosition > state.previousScrollPosition ? "down" : "up";
      state.previousScrollPosition = currentScrollPosition;
    }

    if (scrollDirection === undefined) {
      return;
    }

    const increment = scrollDirection === "down" ? 1 : -1;
    const nextCountryIndex = state.currentCountryIndex + increment;
    if (nextCountryIndex < 0 || nextCountryIndex >= CONFIG.COUNTRIES.length) {
      return;
    }
    event.preventDefault();
    state.isAnimating = true;

    const currentCountry = CONFIG.COUNTRIES[state.currentCountryIndex];
    const nextCountry = CONFIG.COUNTRIES[nextCountryIndex];

    const currentElement = document.getElementById(currentCountry);
    const nextElement = document.getElementById(nextCountry);

    const degreeChange = scrollDirection === "down" ? -20 : 20;
    state.sunRotationDegrees = state.sunRotationDegrees + degreeChange;
    this.sun.style.transition = "transform 1s ease-in-out";
    this.sun.style.transform = `translate(-25%, -50%) rotate(${state.sunRotationDegrees}deg)`;

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
        state.isAnimating = false;
        currentCountryStats.classList.remove("animate-slide-out");
        nextCountryStats.classList.remove("animate-slide-in");
        state.currentCountryIndex = nextCountryIndex;
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
}

/**
 * Class to handle modal and form functionality
 */
class ContactFormManager {
  constructor() {
    this.modal = document.getElementById("modal");
    this.closeButton = document.getElementById("close-modal");
    this.form = document.getElementById("contactForm");
    this.sendButton = document.getElementById("sendMessageBtn");
    this.contactButtons = document.querySelectorAll(
      "#contact-button, button.button"
    );
    this.GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbyWUPb75FqXJCAuWR9qT85OdjjfldDyeWLJ3HcZDfBFPZdVQ8HR71aP1xMWSJlDKhgM/exec";

    this.bindEvents();
  }

  bindEvents() {
    this.contactButtons.forEach((button) => {
      button.addEventListener("click", this.openModal.bind(this));
    });

    this.closeButton.addEventListener("click", this.closeModal.bind(this));
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeModal();
    });

    // Replace form submit with button click
    this.sendButton.addEventListener("click", this.handleSubmit.bind(this));
  }

  /**
   * Opens the modal dialog
   * @param {Event} e - Click event
   */
  openModal(e) {
    e.preventDefault();
    const buttonText = e.target.textContent.trim().toLowerCase();
    if (buttonText.includes("contact") || buttonText.includes("write")) {
      this.modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal() {
    this.modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  /**
   * Handles form submission
   * @param {Event} e - Submit event
   */
  async handleSubmit() {
    // Validate form
    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    const formData = {
      name: this.form.name.value,
      email: this.form.email.value,
      message: this.form.message.value,
    };

    try {
      await this.submitForm(formData);
      this.form.reset();
      this.closeModal();
    } catch (error) {
      this.closeModal();
    }
  }

  /**
   * Submits form data to Google Scripts
   * @param {Object} data - Form data
   * @returns {Promise}
   */
  async submitForm(data) {
    const response = await fetch(this.GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  }
}

/**
 * Class to handle mobile swiper functionality
 */
class SwiperManager {
  constructor() {
    this.swiper = null;
    this.initializeSwiper();
    window.addEventListener("resize", this.initializeSwiper.bind(this));
  }

  initializeSwiper() {
    if (window.innerWidth <= CONFIG.VIEWPORT.MOBILE) {
      if (!this.swiper) {
        this.swiper = new Swiper(".stats-swiper", {
          on: { slideChange: this.handleSlideChange.bind(this) },
        });
      }
    } else if (this.swiper) {
      this.swiper.destroy();
      this.swiper = null;
    }
  }

  handleSlideChange(changeEvent) {
    const currentCountry = CONFIG.COUNTRIES[changeEvent.activeIndex];
    const sun = document.getElementById("sun-top");

    // Update sun rotation based on the active index
    const sunRotationDegrees =
      changeEvent.activeIndex * CONFIG.ANIMATION.SUN_ROTATION; // Adjust the rotation degree as needed
    sun.style.transition = "transform 1s ease-in-out";
    sun.style.transform = `translate(-15%, -50%) rotate(${sunRotationDegrees}deg)`;

    console.log("changeEvent.activeIndex", changeEvent.activeIndex);
    // Update country titles
    CONFIG.COUNTRIES.forEach((country, index) => {
      const element = document.querySelector(`#stats-countries #${country}`);
      if (index !== changeEvent.activeIndex) {
        element.classList.remove("title80");
        element.classList.add("title56", "light");
        if (index < changeEvent.activeIndex) {
          element.classList.add("hidden");
        }
      }
      if (index === changeEvent.activeIndex) {
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
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const statistics = new StatisticsManager();
  const contactForm = new ContactFormManager();
  const swiper = new SwiperManager();
});

function observeHeroAnimation(element) {
  const hero = document.querySelector("#grass");
  const offset = window.innerWidth > CONFIG.VIEWPORT.DESKTOP ? 150 : 0;
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

observeHeroAnimation(document.getElementById("nav"));
observeHeroAnimation(document.getElementById("tagline"));
