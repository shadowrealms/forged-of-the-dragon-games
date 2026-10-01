document.getElementById("year").textContent = new Date().getFullYear();

const buttons = document.querySelectorAll(".btn, .panel-header a");

buttons.forEach((button) => {
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
  });
});

const realmCards = document.querySelectorAll(".realm-card");
realmCards.forEach((card) => {
  card.addEventListener("click", () => {
    realmCards.forEach((node) => node.classList.remove("active"));
    card.classList.add("active");
  });
});

const activeCard = document.querySelector(".realm-card.active");
if (activeCard) {
  activeCard.style.borderColor = "rgba(247, 162, 30, 0.35)";
}
























































