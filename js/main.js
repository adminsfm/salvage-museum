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
 FADE IN
*/


const elements =
document.querySelectorAll(
".card,.support-box,.timeline div"
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
