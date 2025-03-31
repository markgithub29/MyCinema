import requests

# TMDb API Details
API_KEY = "bf4119a66b1bf5c2fdb1140d5a36cbfe"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

# File Paths
GENERAL_M3U = "general.m3u"
UPDATED_M3U = "updated.m3u"

# Read M3U file
with open(GENERAL_M3U, "r") as file:
    lines = file.readlines()

updated_lines = ["#EXTM3U"]

for i in range(len(lines)):
    if lines[i].startswith("#EXTINF"):
        movie_name = lines[i].split(",", 1)[-1].strip()

        # Fetch movie details from TMDb
        tmdb_response = requests.get(f"{TMDB_BASE_URL}/search/movie", params={"api_key": API_KEY, "query": movie_name})
        tmdb_data = tmdb_response.json()

        if tmdb_data["results"]:
            poster_path = tmdb_data["results"][0]["poster_path"]
            poster_url = f"{IMAGE_BASE_URL}{poster_path}"
            updated_lines.append(f'#EXTINF:-1 tvg-logo="{poster_url}",{movie_name}')
        else:
            updated_lines.append(lines[i].strip())
    else:
        updated_lines.append(lines[i].strip())

# Save updated M3U file
with open(UPDATED_M3U, "w") as file:
    file.write("\n".join(updated_lines))

print(f"Updated M3U file saved as {UPDATED_M3U}")
