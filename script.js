const repo = "YOUR_GITHUB_USERNAME/YOUR_REPOSITORY";
const token = "YOUR_GITHUB_ACCESS_TOKEN"; // Store this in GitHub Secrets for security

// Fetch & display existing movies
async function loadMovies() {
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/main/general.m3u`);
    const text = await response.text();
    const lines = text.split("\n");
    
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = "";

    for (let i = 1; i < lines.length; i += 2) {
        if (lines[i]) {
            const movieName = lines[i].split(",")[1];
            const li = document.createElement("li");
            li.textContent = movieName;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteMovie(movieName);
            li.appendChild(deleteBtn);

            movieList.appendChild(li);
        }
    }
}

// Add new movie
async function addMovie() {
    const movieName = document.getElementById("movieName").value;
    const movieLink = document.getElementById("movieLink").value;
    if (!movieName || !movieLink) return alert("Enter both fields!");

    let response = await fetch(`https://raw.githubusercontent.com/${repo}/main/general.m3u`);
    let text = await response.text();
    text += `\n#EXTINF:-1, ${movieName}\n${movieLink}`;

    await fetch(`https://api.github.com/repos/${repo}/contents/general.m3u`, {
        method: "PUT",
        headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "Added new movie",
            content: btoa(text),
            sha: await getSHA("general.m3u")
        })
    });

    alert("Movie added!");
    loadMovies();
}

// Delete movie
async function deleteMovie(movieName) {
    let response = await fetch(`https://raw.githubusercontent.com/${repo}/main/general.m3u`);
    let text = await response.text();
    let lines = text.split("\n");

    let newText = lines.filter(line => !line.includes(movieName)).join("\n");

    await fetch(`https://api.github.com/repos/${repo}/contents/general.m3u`, {
        method: "PUT",
        headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "Deleted movie",
            content: btoa(newText),
            sha: await getSHA("general.m3u")
        })
    });

    alert("Movie deleted!");
    loadMovies();
}

// Get SHA for file update
async function getSHA(filename) {
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`);
    const data = await response.json();
    return data.sha;
}

// Load movies on startup
loadMovies();
