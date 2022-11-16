const gravitySlider = document.getElementById('gravity-slider');
const gravityLabel = document.getElementById('gravity-label');

function updateGravity() {
    gravityLabel.innerText = `Gravity (${gravitySlider.value}):`;
}

updateGravity();
gravitySlider.oninput = updateGravity;