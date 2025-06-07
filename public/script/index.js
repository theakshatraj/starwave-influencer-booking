$(document).ready(function() {
  // Existing jQuery AJAX code
  $("#sgnup").click(function() {
    let obj = {
      type: "get",
      url: "/signup-process",
      data: {
        txtEmail: $("#txtEmail").val(),
        pwd: $("#pwd").val(),
        combo: $("#combo").val()
      }
    };
    $.ajax(obj).done(function(resp) {
      $("#msgSignup").html(resp);
    }).fail(function(err) {
      alert(err.statusText);
    });
  });

  $("#login").click(function() {
    let obj = {
      type: "get",
      url: "/login-process",
      data: {
        txtEmaill: $("#txtEmaill").val(),
        txtPwd: $("#txtPwd").val(),
      }
    };
    $.ajax(obj).done(function(resp) {
      alert(resp);
    }).fail(function(err) {
      alert(err.statusText);
    });
  });

  // Vanilla JS code inside jQuery ready block

  // Creator Filter Functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const creatorItems = document.querySelectorAll('.creator-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      const filterValue = this.getAttribute('data-category');

      creatorItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 100);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Navbar background change on scroll
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.9)';
    }
  });

  // Animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe service cards for animation
  document.querySelectorAll('.service-card, .creator-card, .team-member').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });

  // Creator filter links in footer
  const creatorFilterLinks = document.querySelectorAll('.creator-filter-link');
  creatorFilterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const filterCategory = this.getAttribute('data-filter');
      const creatorsSection = document.querySelector('#creators');

      // Scroll to creators section
      creatorsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Wait for scroll to complete, then apply filter
      setTimeout(() => {
        // Find and click the corresponding filter button
        const filterButton = document.querySelector(`[data-category="${filterCategory}"]`);
        if (filterButton) {
          // Remove active class from all buttons
          filterButtons.forEach(btn => btn.classList.remove('active'));
          // Add active class to target button
          filterButton.classList.add('active');

          // Apply the filter
          creatorItems.forEach(item => {
            if (item.getAttribute('data-category') === filterCategory) {
              item.style.display = 'block';
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, 100);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'translateY(20px)';
              setTimeout(() => {
                item.style.display = 'none';
              }, 300);
            }
          });
        }
      }, 800); // Wait for scroll animation to complete
    });
  });

  // Contact form submission
  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We\'ll get back to you soon.');
      this.reset();
    });
  }

  // Modal form submissions
  const signupModal = document.querySelector('#signupModal form');
  const loginModal = document.querySelector('#loginModal form');

  if (signupModal) {
    signupModal.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Account created successfully! Please check your email for verification.');
      bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
    });
  }

  if (loginModal) {
    loginModal.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Login successful! Redirecting to dashboard...');
      bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
    });
  }

  // Interactive hover effect on service cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.service-icon').style.transform = 'scale(1.1) rotate(5deg)';
    });

    card.addEventListener('mouseleave', function() {
      this.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
    });
  });

  // Typing effect for hero title (optional)
  function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  window.addEventListener('load', function() {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    typeWriter(heroTitle, originalText, 150);
  });
});
