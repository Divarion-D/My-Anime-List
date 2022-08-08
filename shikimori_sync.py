from email import header
import requests
import json
import time
import os

# Shikimori API
# https://shikimori.one/api/doc/1.0

USERNAME = "Divarion_D"

header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
}

data = requests.get(f"https://shikimori.one/api/users/{USERNAME}/anime_rates?limit=1000000000&status=completed", headers=header)
data = json.loads(data.text)

for i in data:
    anime = requests.get(f"https://shikimori.one/api/animes/{i.get('anime').get('id')}", headers=header)
    anime = json.loads(anime.text)
    desc = '' if anime.get('description') is None else anime.get('description')

    if anime.get('kind') == 'movie':
        ty_res = time.gmtime(anime.get('duration')*60)
        time_m = time.strftime("%H:%M:%S",ty_res)
        data = {
            "id" :  anime.get('id'),
            "name": anime.get('russian'),
            "originalName": anime.get('name'),
            "date": anime.get('aired_on'),
            "time": str(time_m),
            "movie": "1",
            "img": f"https://shikimori.one{anime.get('image').get('original')}",
            "description": desc,
        }
    else:
        data = {
            "id" :  anime.get('id'),
            "name": anime.get('russian'),
            "originalName": anime.get('name'),
            "date": anime.get('aired_on'),
            "time": str(anime.get('duration')),
            "series": anime.get('episodes'),
            "img": f"https://shikimori.one{anime.get('image').get('original')}",
            "description": desc,
        }

    year = data['date'][:4]

    if os.path.exists(f'anime-data/anime{year}.json'): 
        with open(f'anime-data/anime{year}.json', 'r') as f:
            anime_data = json.load(f)

            # check if anime already exists
            if data.get('id') not in [i.get('id') for i in anime_data]:
                anime_data.append(data)
                # sort by date
                anime_data = sorted(anime_data, key=lambda k: k['date'], reverse=True)
                with open(f'anime-data/anime{year}.json', 'w') as f:
                    json.dump(anime_data, f, indent=4, ensure_ascii=False)
                    f.close()
    else:
        data_json = [data]
        with open(f'anime-data/anime{year}.json', 'w') as f:
            json.dump(data_json, f, indent=4, ensure_ascii=False)
            f.close()

    
    
        