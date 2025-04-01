const API_URL = "https://api.github.com/repos/markgithub29/MyCinema/contents/general.m3u";

async function fetchMovies() {
    const response = await fetch(API_URL, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await response.json();
    const content = atob(data.content);

    let movieList = document.getElementById("movieList");
    movieList.innerHTML = "";

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTINF")) {
            let movieName = lines[i].split(",")[1].trim();
            let playLink = lines[i + 1];

            let listItem = document.createElement("li");
            listItem.innerHTML = `${movieName} - <a href="${playLink}">Play</a> 
                                  <button onclick="deleteMovie('${movieName}', '${playLink}')">Delete</button>`;
            movieList.appendChild(listItem);
        }
    }
}

async function addMovie() {
    let movieName = document.getElementById("movieName").value.trim();
    let playLink = document.getElementById("playLink").value.trim();

    const response = await fetch(API_URL, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await response.json();
    let content = atob(data.content);

    content += `\n#EXTINF:-1, ${movieName}\n${playLink}`;
    await updateM3UFile(content, data.sha);
}

document.addEventListener("DOMContentLoaded", fetchMovies);
