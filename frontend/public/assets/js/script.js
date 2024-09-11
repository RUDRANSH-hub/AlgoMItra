'use strict';

/**
 * Add event on element
 */
var addEventOnElem = function (elem, type, callback) {
  if (!elem) {
    console.error('Element not found:', elem);
    return;
  }

  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

/**
 * Navbar toggle
 */
var navbar = document.querySelector("[data-navbar]");
var navbarLinks = document.querySelectorAll("[data-nav-link]");
var navToggler = document.querySelector("[data-nav-toggler]");

if (navbar && navToggler) {
  var toggleNavbar = function () {
    navbar.classList.toggle("active");
    navToggler.classList.toggle("active");
    document.body.classList.toggle("active");
  };

  addEventOnElem(navToggler, "click", toggleNavbar);

  var closeNavbar = function () {
    navbar.classList.remove("active");
    navToggler.classList.remove("active");
    document.body.classList.remove("active");
  };

  addEventOnElem(navbarLinks, "click", closeNavbar);
} else {
  console.error("Navbar or nav toggler not found.");
}

/**
 * Header active
 */
var header = document.querySelector("[data-header]");

if (header) {
  var activeHeader = function () {
    if (window.scrollY > 300) {
      header.classList.add("active");
    } else {
      header.classList.remove("active");
    }
  };

  addEventOnElem(window, "scroll", activeHeader);
} else {
  console.error("Header not found.");
}

/**
 * Toggle active on add to favorite
 */
var addToFavBtns = document.querySelectorAll("[data-add-to-fav]");

if (addToFavBtns.length > 0) {
  var toggleActive = function () {
    this.classList.toggle("active");
  };

  addEventOnElem(addToFavBtns, "click", toggleActive);
} else {
  console.error("Favorite buttons not found.");
}

/**
 * Scroll reveal effect
 */
var sections = document.querySelectorAll("[data-section]");

if (sections.length > 0) {
  var scrollReveal = function () {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top < window.innerHeight / 1.5) {
        sections[i].classList.add("active");
      } else {
        sections[i].classList.remove("active");
      }
    }
  };

  scrollReveal();
  addEventOnElem(window, "scroll", scrollReveal);
} else {
  console.error("Sections not found.");
}
