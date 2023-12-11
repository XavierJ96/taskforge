function injectStyles() {
  const style = document.createElement("style");

style.textContent = `
  #addBtn {
    padding: 5px 10px;
    margin: 10px;
    cursor: pointer;
    gap: 6px;
  }
  
  .icon-container {
    display: inline-block;
    cursor: pointer;
  }
  
  .rotate {
    animation: rotateAnimation 1s forwards;
  }
  
  @keyframes rotateAnimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .fade-in {
    animation: fadeInAnimation 1s forwards;
  }
  
  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

  document.head.appendChild(style);
}

injectStyles();
