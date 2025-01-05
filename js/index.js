document.addEventListener('DOMContentLoaded', function () {
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarlinks = document.querySelector('.navbar-links');
  const navbar = document.querySelector('.navbar');

  if (navbarToggle && navbar && navbarlinks) {
    navbarToggle.addEventListener('click', function () {
      navbarlinks.classList.toggle('show');
      navbar.classList.toggle('show');
    });
  } else {
    console.error("Navbar toggle or navbar elements not found!");
  }
});
