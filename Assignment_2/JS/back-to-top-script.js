var link = document.getElementsByClassName("footer__back-to-top-button col-s__5 col-e__7 row-s__2 row-e__3")[0];
var footer = document.getElementsByTagName('footer')[0];

// this part is created to simply show we understand event propagation
function colorblue()
{
    link.style.color = 'blue';
}
function travelToTop(e){

    e.preventDefault();                             //preventdefault to make sure you don't get moved twice
    scroll(0,0);                                    //scroll to the top
    
}
footer.addEventListener("click", colorblue, true); //capturing 
link.addEventListener("click", travelToTop, false); //bubbling


