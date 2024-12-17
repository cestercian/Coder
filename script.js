function addCodeTweet() {
    // Get the user's input
    const code = document.getElementById("codeInput").value;

    // Do not add empty tweets
    if (code.trim() === "") return;

    // Create a new tweet-like block
    const tweetBlock = document.createElement("div");
    tweetBlock.className = "tweet-like-block";
    tweetBlock.textContent = code;

    // Add copy functionality
    tweetBlock.onclick = function () {
        copyCodeToClipboard(tweetBlock);
    };

    // Add a tooltip
    const tooltip = document.createElement("span");
    tooltip.className = "copy-tooltip";
    tooltip.textContent = "Copied!";
    tweetBlock.appendChild(tooltip);

    // Append the new tweet to the container
    const container = document.getElementById("tweetsContainer");
    container.appendChild(tweetBlock);

    // Clear the input area
    document.getElementById("codeInput").value = "";
}

function copyCodeToClipboard(element) {
    // Copy the code content to the clipboard
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = element.textContent.replace("Copied!", ""); // Exclude tooltip text
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // Show the "Copied!" tooltip
    const tooltip = element.querySelector(".copy-tooltip");
    tooltip.style.display = "block";
    setTimeout(() => {
        tooltip.style.display = "none";
    }, 1500); // Hide after 1.5 seconds
}
