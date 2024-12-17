// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaCViiww_eq9HewkSa5_Xx6DAl9N0c75c",
    authDomain: "code-copier.firebaseapp.com",
    databaseURL: "https://code-copier-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "code-copier",
    storageBucket: "code-copier.appspot.com",
    messagingSenderId: "626621100036",
    appId: "1:626621100036:web:710b29eeb150cab8280551"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to Add Code Tweet to Firebase
function addCodeTweet() {
    const codeInput = document.getElementById("codeInput").value;

    // Do not save empty input
    if (codeInput.trim() === "") return;

    // Save the code to Firebase Realtime Database
    const codeRef = database.ref("tweets/");
    const newCodeRef = codeRef.push(); // Generate a unique ID
    newCodeRef.set({
        code: codeInput,
        timestamp: Date.now()
    });

    // Clear the input
    document.getElementById("codeInput").value = "";
}

// Function to Fetch and Display Tweets
function displayTweets() {
    const tweetsContainer = document.getElementById("tweetsContainer");
    tweetsContainer.innerHTML = "<p>Loading...</p>"; // Show loader

    // Listen for changes in the database
    const codeRef = database.ref("tweets/");
    codeRef.on("value", (snapshot) => {
        tweetsContainer.innerHTML = ""; // Clear the loader
        if (!snapshot.exists()) {
            tweetsContainer.innerHTML = "<p>No tweets found!</p>";
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const tweetData = childSnapshot.val();
            const tweetBlock = document.createElement("div");
            tweetBlock.className = "tweet-like-block";
            tweetBlock.textContent = tweetData.code;

            // Add Copy Functionality
            tweetBlock.onclick = function () {
                copyCodeToClipboard(tweetData.code, tweetBlock);
            };

            // Tooltip for Copy Confirmation
            const tooltip = document.createElement("span");
            tooltip.className = "copy-tooltip";
            tooltip.textContent = "Copied!";
            tweetBlock.appendChild(tooltip);

            tweetsContainer.appendChild(tweetBlock);
        });
    });
}

// Function to Copy Code to Clipboard
function copyCodeToClipboard(code, element) {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = code;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // Show the "Copied!" tooltip
    const tooltip = element.querySelector(".copy-tooltip");
    tooltip.style.display = "block";
    setTimeout(() => {
        tooltip.style.display = "none";
    }, 1500);
}

// Fetch and display tweets on page load
window.onload = displayTweets;
