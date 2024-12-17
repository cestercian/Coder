function displayCode() {
    // Get the user's input
    const code = document.getElementById("codeInput").value;

    // Set the input to the output div with safe HTML escaping
    const output = document.getElementById("output");
    output.textContent = code; // Using textContent to prevent XSS attacks
}

function copyCodeToClipboard(event) {
    const output = document.getElementById("output");
    const tooltip = document.getElementById("tooltip");

    // Create a temporary textarea to copy the code
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = output.textContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // Show the "Copied!" tooltip
    tooltip.style.display = "block";
    setTimeout(() => {
        tooltip.style.display = "none";
    }, 1500); // Hide after 1.5 seconds
}
