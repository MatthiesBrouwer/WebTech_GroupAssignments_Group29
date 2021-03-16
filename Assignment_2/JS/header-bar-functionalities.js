

function handleDropdownMenu(dropdownElementId, dropdownElement){
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


function fillModificationMenuSemanticPicker() {
    var semanticPicker = document.getElementById("page-editor__semantic-selector");

    var semanticElements = ["BODY", "HEADER", "ASIDE", "FOOTER", "ARTICLE", "SECTION"];

    for (let i = 0; i < semanticElements.length; i++) {
        semanticList = document.getElementsByTagName(semanticElements[i])
        for (let j = 0; j < semanticList.length; j++){
            var newOption = document.createElement("option");
            newOption.value = semanticElements[i] + "-" + j;

            if (semanticList.length > 1){
                if (j == 0){
                    var newOptgroup = document.createElement("OPTGROUP");
                    newOptgroup.label = semanticElements[i].toLocaleLowerCase();
                }
                newOption.text = semanticElements[i].toLocaleLowerCase() + "-" + j;
                semanticPicker.add(newOption);
                newOptgroup.appendChild(newOption);   
            }
            else{
                newOption.text = semanticElements[i].toLocaleLowerCase();
                semanticPicker.add(newOption);
            }
        }
        if (semanticList.length > 1){
            semanticPicker.insertBefore(newOptgroup, semanticPicker.options[semanticPicker.length - semanticList.length -i]);
        }
    }

    console.log(semanticPicker);
}


function processStyleModifications(event) {
    event.preventDefault();

    /* get the picked semantic element */
    var pickedSemantic = document.getElementById("page-editor__semantic-selector").value.split("-");

    /* Get the selected style changes from the user */
    var newBackgroundColor = document.forms["page-editor"]["page-editor__background-color-selector"].value;
    var newFontSize = document.forms["page-editor"]["page-editor__font-size-selector"].value;


    var pickedSemanticElement = document.getElementsByTagName(pickedSemantic[0])[pickedSemantic[1]];

    console.log("setting font size for " + pickedSemantic[0] + " to " + newFontSize + "px");
    pickedSemanticElement.style.fontSize = newFontSize + "px";

    console.log("setting background color for " + pickedSemantic[0] + "from " + pickedSemanticElement.style.backgroundColor + "to " + newBackgroundColor);
    pickedSemanticElement.style.backgroundColor = newBackgroundColor;

}


function registerEvents(){

    window.addEventListener('load', fillModificationMenuSemanticPicker, false);

    var modificationMenu = document.forms["page-editor"].addEventListener('submit', processStyleModifications, false);

    var stylePickerDropdownButton =  document.getElementById("page-editor__dropdown-button");
    stylePickerDropdownButton.addEventListener("click", function(){ handleDropdownMenu("page-editor__menu");}, true);
    
    var menubarDropdownButton = document.getElementById("header-bar__dropdown-menu-button");
    menubarDropdownButton.addEventListener("click", function(){ handleDropdownMenu("header-bar__menu");}, true);

}


registerEvents()


