document.addEventListener("DOMContentLoaded", function(){



/*
 MOBILE MENU
*/

const nav =
document.querySelector("nav");


const header =
document.querySelector("header");


if(nav && header){


let button =
document.createElement("button");


button.innerHTML="Menu";

button.className="menu-button";
button.setAttribute("type", "button");
button.setAttribute("aria-label", "Open website menu");
button.setAttribute("aria-expanded", "false");


header.insertBefore(button, nav);



button.addEventListener(
"click",
function(){

nav.classList.toggle("open");
button.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");

});


}



/*
 SEASON STATUS
*/

const seasonBox =
document.querySelector("#season-status");


if(seasonBox){


const today =
new Date();


const open =
new Date(
today.getFullYear(),
6,
7
);


const close =
new Date(
today.getFullYear(),
8,
4
);



if(today >= open && today <= close){

seasonBox.innerHTML =
"Open for the season - July 7 to September 4";


}

else{


seasonBox.innerHTML =
"Closed for the season — visits available by appointment";


}


}



/*
 PHOTO CREDIT INFO BUTTONS
*/

function setupPhotoCreditButtons() {
  document.body.classList.add("credits-as-info-buttons");

  document.querySelectorAll(".photo-placeholder + .photo-credit").forEach((credit, index) => {
    const photo = credit.previousElementSibling;
    if (!photo || !photo.classList.contains("photo-placeholder")) return;
    if (photo.querySelector(".credit-info-button")) return;

    const button = document.createElement("button");
    const popup = document.createElement("div");
    const id = `photo-credit-${index + 1}`;

    button.type = "button";
    button.className = "credit-info-button";
    button.textContent = "i";
    button.setAttribute("aria-label", "Show photo credit");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id);

    popup.id = id;
    popup.className = "credit-popover";
    popup.setAttribute("role", "note");
    popup.textContent = credit.textContent.trim();

    photo.append(button, popup);

    button.addEventListener("click", function(event) {
      event.stopPropagation();
      const willOpen = !popup.classList.contains("open");

      document.querySelectorAll(".credit-popover.open").forEach(openPopup => {
        openPopup.classList.remove("open");
        const openButton = openPopup.previousElementSibling;
        if (openButton) openButton.setAttribute("aria-expanded", "false");
      });

      popup.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });
}

setupPhotoCreditButtons();

document.addEventListener("click", function() {
  document.querySelectorAll(".credit-popover.open").forEach(popup => {
    popup.classList.remove("open");
    const button = popup.previousElementSibling;
    if (button) button.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", function(event) {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".credit-popover.open").forEach(popup => {
    popup.classList.remove("open");
    const button = popup.previousElementSibling;
    if (button) button.setAttribute("aria-expanded", "false");
  });
});


/*
 FADE IN
*/


const elements =
document.querySelectorAll(
".page-header,.card,.support-box,.timeline div,.info-box,.short-info-box,.wide-photo"
);


elements.forEach(
(el)=>{

el.style.opacity="0";

el.style.transform="translateY(20px)";


setTimeout(()=>{

el.style.transition=
"all .6s ease";

el.style.opacity="1";

el.style.transform=
"translateY(0)";


},200);


});



});
