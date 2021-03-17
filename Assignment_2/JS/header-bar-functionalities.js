
// Function to handle dropdown interactivity
function handleDropdownMenu(dropdownElementId, dropdownElement) {
    var dropdownElement = document.getElementById(dropdownElementId);
    console.log(dropdownElement);
    if (dropdownElement.classList.contains(dropdownElementId + "--dropdown-active")) {
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

    /* Check for each element if it exists on the page and index them accordingly */
    for (let i = 0; i < semanticElements.length; i++) {
        semanticList = document.getElementsByTagName(semanticElements[i])
        for (let j = 0; j < semanticList.length; j++) {
            var newOption = document.createElement("option");
            newOption.value = semanticElements[i] + "-" + j;
            newOption.text = semanticElements[i].toLocaleLowerCase() + (semanticList.length > 1 ? "-" + j : "" );
            semanticPicker.add(newOption);

            /* Index elements in an optgroup if more than 1 exists on the page. Otherwise simply index them */
            if (semanticList.length > 1) {
                if (j == 0) {
                    var newOptgroup = document.createElement("OPTGROUP");
                    newOptgroup.label = semanticElements[i].toLocaleLowerCase();
                }
                newOptgroup.appendChild(newOption);
            }
        }
        if (semanticList.length > 1) {
            /* Index the opgroup of the current semantic element just before the index of the first element of the current semantic */
            semanticPicker.insertBefore(newOptgroup, semanticPicker.options[semanticPicker.length - semanticList.length - i]);
        }
    }

    console.log(semanticPicker);
}

// Function to process any style changes by the user
function processStyleModifications(event) {
    event.preventDefault();

    /* get the picked semantic element name and the actual element.
        The semantic name containes a tag name and it's quantity index, divided by a "-" */
    var pickedSemantic = document.getElementById("page-editor__semantic-selector").value.split("-");
    var pickedSemanticElement = document.getElementsByTagName(pickedSemantic[0])[pickedSemantic[1]];

    /* Get the selected style changes from the user and set the new styles*/
    var newBackgroundColor = document.forms["page-editor"]["page-editor__background-color-selector"].value;
    var newFontSize = document.forms["page-editor"]["page-editor__font-size-selector"].value;
    pickedSemanticElement.style.fontSize = newFontSize + "px";
    pickedSemanticElement.style.backgroundColor = newBackgroundColor;

}


// Function to register all events
function registerEvents() {

    window.addEventListener('load', fillModificationMenuSemanticPicker, false);

    document.forms["page-editor"].addEventListener('submit', processStyleModifications, false);

    var stylePickerDropdownButton = document.getElementById("page-editor__dropdown-button");
    stylePickerDropdownButton.addEventListener("click", function () { handleDropdownMenu("page-editor__menu"); }, true);

    var menubarDropdownButton = document.getElementById("header-bar__dropdown-menu-button");
    menubarDropdownButton.addEventListener("click", function () { handleDropdownMenu("header-bar__menu"); }, true);

}


registerEvents()


