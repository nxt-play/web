const footerConfig = {
  logos: [
    { src: "assets/cnxtplay.png", alt: "NXT Play" },
    { src: "assets/avindia.png", alt: "AV India" }
  ],
  links: [
    { text: "About Us", href: "#" },
    { text: "Contact Us", href: "#" },
    { text: "Terms & Policy", href: "#" }
  ],
  copyright: "AV INDIA & NXT Play"
};

function renderFooter() {
  const container = document.getElementById('main-footer');
  container.className = "footer"; // Applies your existing CSS class

  // 1. Create Logo Section
  const mainLogo = document.createElement('img');
  mainLogo.src = footerConfig.logos[0].src;
  container.appendChild(mainLogo);

  const bySpan = document.createElement('span');
  bySpan.textContent = " by ";
  container.appendChild(bySpan);

  const imDiv = document.createElement('div');
  imDiv.className = "im";
  const subLogo = document.createElement('img');
  subLogo.src = footerConfig.logos[1].src;
  imDiv.appendChild(subLogo);
  container.appendChild(imDiv);

  // 2. Add Spacing Helper
  const addSpace = () => {
    const space = document.createElement('div');
    space.className = "space1";
    container.appendChild(space);
  };

  addSpace();

  // 3. Generate Links
  footerConfig.links.forEach(linkItem => {
    const a = document.createElement('a');
    a.href = linkItem.href;
    a.textContent = linkItem.text;
    container.appendChild(a);
    
    container.appendChild(document.createElement('br'));
    addSpace();
  });

  // 4. Copyright Section
  const copyA = document.createElement('a');
  const year = new Date().getFullYear();
  copyA.textContent = `© ${year} ${footerConfig.copyright} • All Rights Reserved`;
  container.appendChild(copyA);

  // Final spacing
  addSpace();
  addSpace();
}

// Execute the render
document.addEventListener('DOMContentLoaded', renderFooter);
