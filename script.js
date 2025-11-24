document.addEventListener("DOMContentLoaded", () => {  //I sought help from AI to implement this page system
  const botao = document.querySelector('a[href="#about"]');
  if (botao) {
    botao.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "projeto.html";
    });
  }
});



