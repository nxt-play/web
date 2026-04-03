const footerData = {
  logo: "https://nxt-play.github.io/web/assets/nxtplay.png",
  sections: [
    {
      title: "Company",
      links: [
        { text: "About Us", url: "#" },
        { text: "Careers", url: "#" }
      ]
    },
    {
      title: "View Website in",
      content: '<span class="active-lang">✓ English</span>'
    },
    {
      title: "Need Help?",
      links: [
        { text: "Visit Help Center", url: "#" },
        { text: "Share Feedback", url: "#" }
      ]
    },
    {
      title: "Connect with Us",
      socials: [
        { img: "https://nxt-play.github.io/web/assets/icons/facebook0.png", url: "https://www.facebook.com/profile.php?id=61574479352916" },
        { img: "https://nxt-play.github.io/web/assets/icons/whatsapp.png", url: "https://whatsapp.com/channel/0029VaZrHSl3gvWa2H6x2A2f" }
      ]
    }
  ],
  bottom: {
    copyright: `© ${new Date().getFullYear()} NXT PLAY. All Rights Reserved.`,
    legal: [
      { text: "Terms Of Use", url: "#" },
      { text: "Privacy Policy", url: "#" },
      { text: "FAQ", url: "#" }
    ]
  },
  badge: "https://nxt-play.github.io/web/assets/cnxtplay.png"
};

function renderFooter() {
  const container = document.getElementById('footer-container');
  
  let html = `
    <div class="app-main">
      <img src="${footerData.logo}" alt="Logo">
    </div>
  `;

  // Generate Sections
  footerData.sections.forEach(section => {
    html += `
      <div class="footer-section">
        <h3>${section.title}</h3>
        <div class="footer-links">
          ${section.links ? section.links.map(l => `<a href="${l.url}">${l.text}</a>`).join('') : ''}
          ${section.content ? section.content : ''}
          ${section.socials ? `
            <div class="social-icons">
              ${section.socials.map(s => `<a href="${s.url}" class="social-icon"><img src="${s.img}"></a>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  // Generate Bottom Bar
  html += `
    <div class="footer-bottom">
      <p>${footerData.bottom.copyright}</p>
      <div class="legal-links">
        ${footerData.bottom.legal.map(l => `<a href="${l.url}">${l.text}</a>`).join('')}
      </div>
    </div>
    <div class="app-badges">
      <img src="${footerData.badge}" alt="Badge">
    </div>
  `;

  container.innerHTML = html;
}

// Initialize
renderFooter();
