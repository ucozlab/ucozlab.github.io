class UiCheckbox {
  constructor(color, checked, text, onChange, id) {
    this.buildCheckboxDom();
    this.checkBoxInput.id = id;
    this.checkBoxLabel.setAttribute("for", id);
    this.checkBoxInput.checked = checked;
    this.checkBoxLabel.appendChild(document.createTextNode(text));
    this.checkBoxMark.style.backgroundColor = color;
    this.checkBoxMark.style.border = "1px solid " + color;
    this.setCheckedClass();
    this.checkBoxInput.onclick = () => {
      this.setCheckedClass();
      onChange();
    };

    return this.checkBox
  }

  setCheckedClass() {
    this.checkBoxInput.checked
      ? this.checkBoxInput.classList.remove("ui-checkbox__input--unchecked")
      : this.checkBoxInput.classList.add("ui-checkbox__input--unchecked")
  }

  buildCheckboxDom() {
    this.checkBox = document.createElement("div");
    this.checkBox.classList.add("ui-checkbox");
    this.checkBoxInput = document.createElement("input");
    this.checkBoxInput.classList.add("ui-checkbox__input");
    this.checkBoxInput.type = "checkbox";
    this.checkBoxLabel = document.createElement("label");
    this.checkBoxLabel.classList.add("ui-checkbox__label");
    this.checkBoxMark = document.createElement("span");
    this.checkBoxMark.classList.add("ui-checkbox__mark");
    this.checkBoxLabel.appendChild(this.checkBoxMark);
    this.checkBox.appendChild(this.checkBoxInput);
    this.checkBox.appendChild(this.checkBoxLabel);
  }
}