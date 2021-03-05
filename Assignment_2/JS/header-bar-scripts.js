function menubarDropdownHandler() {
    var menubar = document.getElementById("header-menu-bar");
    if(menubar.classList.contains("menu-bar__dropdown--active")) {
        menubar.classList.remove("menu-bar__dropdown--active")
        menubar.classList.add("menu-bar__dropdown--inactive")
    }
    else {
        menubar.classList.remove("menu-bar__dropdown--inactive")
        menubar.classList.add("menu-bar__dropdown--active")
    }

}

function registerEvents() {
    var menubarDropdownIcon = document.getElementById("menu-bar__dropdown-icon");
    menubarDropdownIcon.addEventListener("click", menubarDropdownHandler, false);
    
}


window.addEventListener('DOMContentLoaded', registerEvents, false);
