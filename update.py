import requests
import base64
import os

# GitHub Repo Details
GITHUB_TOKEN = os.getenv("ITHUB_TOKEN")
GITHUB_REPO = "markgithub29/MyCinema"
FILE_PATH = "general.m3u"
UPDATED_FILE_PATH = "updated.m3u"

# TMDb API Details
TMDB_API_KEY = "bf4119a66b1bf5c2fdb1140d5a36cbfe"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

# Fetch the M3U file from GitHub
response = requests.get(
    f"https://api.github.com/repos/{GITHUB_REPO}/contents/{FILE_PATH}",
    headers={"Authorization": f"token {GITHUB_TOKEN}"}
)
data = response.json()
content = base64.b64decode(data["content"]).decode()

updated_content = ["#EXTM3U"]
lines = content.splitlines()

for i in range(len(lines)):
    if lines[i].startswith("#EXTINF"):
        movie_name = lines[i].split(",", 1)[-1].strip()
        play_link = lines[i + 1]

        # Fetch movie details from TMDb
        tmdb_response = requests.get(f"{TMDB_API_KEY}/search/movie", params={"api_key": TMDB_API_KEY, "query": movie_name})
        tmdb_data = tmdb_response.json()

        if tmdb_data["results"]:
            poster_path = tmdb_data["results"][0]["poster_path"]
            poster_url = f"{IMAGE_BASE_URL}{poster_path}"
            updated_content.append(f'#EXTINF:-1 tvg-logo="{poster_url}",{movie_name}')
        else:
            updated_content.append(lines[i])

        updated_content.append(play_link)

# Update the file in GitHub
encoded_content = base64.b64encode("\n".join(updated_content).encode()).decode()

requests.put(
    f"https://api.github.com/repos/{GITHUB_REPO}/contents/{UPDATED_FILE_PATH}",
    headers={"Authorization": f"token {GITHUB_TOKEN}"},
    json={"message": "Update M3U file", "content": encoded_content, "sha": data["sha"]}
)

print("Updated M3U file saved!")
