// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById("code-tweet").addEventListener('click', addCodeTweet)

// Function to Add Code Tweet
function addCodeTweet() {
    const codeInput = document.getElementById("codeInput").value;

    if (codeInput.trim() === "") return;

    const codeRef = ref(database, "tweets/");
    const newCodeRef = push(codeRef); // Generate unique ID
    set(newCodeRef, {
        code: codeInput,
        timestamp: Date.now()
    });

    document.getElementById("codeInput").value = "";
}

// Function to Fetch and Display Tweets
function displayTweets() {
    const tweetsContainer = document.getElementById("tweetsContainer");
    tweetsContainer.innerHTML = "<p>Loading...</p>";

    const codeRef = ref(database, "tweets/");
    onValue(codeRef, (snapshot) => {
        tweetsContainer.innerHTML = "";
        if (!snapshot.exists()) {
            tweetsContainer.innerHTML = "<p>No tweets found!</p>";
            return;
        }
        const tweets = [];
        snapshot.forEach((childSnapshot) => {
            const tweetData = childSnapshot.val();
            tweets.push(tweetData); // Push tweet data to array
        });

        // Sort tweets by timestamp in descending order (newest first)
        tweets.sort((a, b) => b.timestamp - a.timestamp);
        tweets.forEach((tweetData) => {
            //const tweetData = childSnapshot.val();
            const tweetBlock = document.createElement("div");
            tweetBlock.className = "tweet-like-block";
            tweetBlock.textContent = tweetData.code;

            tweetBlock.onclick = () => copyCodeToClipboard(tweetData.code, tweetBlock);

            const tooltip = document.createElement("span");
            tooltip.className = "copy-tooltip";
            tooltip.textContent = "Copied!";
            tweetBlock.appendChild(tooltip);

            tweetsContainer.appendChild(tweetBlock);
        });
    });
}

// Function to Copy Code
function copyCodeToClipboard(code, element) {
    navigator.clipboard.writeText(code).then(() => {
        const tooltip = element.querySelector(".copy-tooltip");
        tooltip.style.display = "block";
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 1500);
    });
}

// Fetch on Load
window.onload = displayTweets;
