export function handleDropdownMenu(dropdownElementId, dropdownElement){
    var dropdownElement = document.getElementById(dropdownElementId);
    console.log(dropdownElement);
    if(dropdownElement.classList.contains(dropdownElementId + "--dropdown-active")) {
        dropdownElement.classList.remove(dropdownElementId + "--dropdown-active")
        dropdownElement.classList.add(dropdownElementId + "--dropdown-inactive")
    }
    else {
        dropdownElement.classList.remove(dropdownElementId + "--dropdown-inactive")
        dropdownElement.classList.add(dropdownElementId + "--dropdown-active")
    }

}


