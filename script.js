import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = 
{
  apiKey: "AIzaSyDaCViiww_eq9HewkSa5_Xx6DAl9N0c75c",
  authDomain: "code-copier.firebaseapp.com",
  databaseURL: "https://code-copier-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "code-copier",
  storageBucket: "code-copier.appspot.com",
  messagingSenderId: "626621100036",
  appId: "1:626621100036:web:710b29eeb150cab8280551"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let allTweets = [];

window.onload = () => 
{
  document.getElementById("code-tweet").addEventListener("click", addCodeTweet);
  document.getElementById("searchBar").addEventListener("input", searchTweets);
  fetchTweets();
};

function addCodeTweet() 
{
  const codeInput = document.getElementById("codeInput").value.trim();
  if (!codeInput) return;

  const newRef = push(ref(database, "tweets"));
  set(newRef, 
  {
    code: codeInput,
    timestamp: Date.now(),
  });

  document.getElementById("codeInput").value = "";
}

function fetchTweets() 
{
  const codeRef = ref(database, "tweets");
  onValue(codeRef, (snapshot) => 
  {
    allTweets = [];
    snapshot.forEach((childSnapshot) => 
    {
      const data = childSnapshot.val();
      data.key = childSnapshot.key;
      allTweets.push(data);
    });
    allTweets.sort((a, b) => b.timestamp - a.timestamp);
    displayTweets(allTweets);
  });
}

function displayTweets(tweets) 
{
  const container = document.getElementById("tweetsContainer");
  container.innerHTML = "";

  if (tweets.length === 0) 
  {
    container.innerHTML = "<p>No tweets found!</p>";
    return;
  }

  tweets.forEach(({ code, key }) => 
  {
    const tweetBlock = document.createElement("div");
    tweetBlock.className = "tweet-like-block";
    tweetBlock.textContent = code;
    tweetBlock.onclick = () => copyCodeToClipboard(code, tweetBlock);

    const tooltip = document.createElement("span");
    tooltip.className = "copy-tooltip";
    tooltip.textContent = "Copied!";
    tweetBlock.appendChild(tooltip);
    
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "dropdown-container";

    const dropdownToggle = document.createElement("button");
    dropdownToggle.className = "dropdown-toggle";
    dropdownToggle.textContent = "⋮";

    const dropdownContent = document.createElement("div");
    dropdownContent.className = "dropdown-content";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑 Delete";

    deleteBtn.onclick = (e) => 
    {
      e.stopPropagation();
      deleteTweet(key);
    };

    dropdownContent.appendChild(deleteBtn);
    dropdownContainer.appendChild(dropdownToggle);
    dropdownContainer.appendChild(dropdownContent);
    tweetBlock.appendChild(dropdownContainer);

    dropdownToggle.onclick = (e) => 
    {
      e.stopPropagation();
      const isOpen = dropdownContent.style.display === "block";
      document.querySelectorAll(".dropdown-content").forEach(el => el.style.display = "none");
      dropdownContent.style.display = isOpen ? "none" : "block";
    };

    container.appendChild(tweetBlock);
  });

  document.addEventListener("click", () => 
  {
    document.querySelectorAll(".dropdown-content").forEach(menu => menu.style.display = "none");
  });
}

function deleteTweet(key) 
{
  console.log("Deleting:", key);
  const tweetRef = ref(database, "tweets/" + key);
  remove(tweetRef);
}

function copyCodeToClipboard(code, element) 
{
  navigator.clipboard.writeText(code).then(() => 
  {
    const tooltip = element.querySelector(".copy-tooltip");
    tooltip.style.display = "block";
    setTimeout(() => 
    {
      tooltip.style.display = "none";
    }, 1500);
  });
}

function searchTweets(e) 
{
  const q = e.target.value.toLowerCase();
  const filtered = allTweets.filter(t => t.code.toLowerCase().includes(q));
  displayTweets(filtered);
}
