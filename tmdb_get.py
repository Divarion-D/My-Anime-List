from tmdbv3api import TMDb
from tmdbv3api import Movie, TV
import json
import time
import os
tmdb = TMDb()
tmdb.api_key = ''

tmdb.language = 'ru'

movie = Movie()
tv = TV()

while True:
    id = input('Введите id фильма или сериала: ')
    #movie or tv
    print("0: 'Фильм', 1: 'Сериал'")
    type = input('Введите тип: ')
    if type == '0':
        parse = movie.details(id)
    else:
        parse = tv.details(id)
        season = input('Введите сезон: ')

    for translate in parse.translations.translations:
        if translate.name == 'English':
            orig_name = translate.data.title if type == '0' else translate.data.name
            break
    if type == '0':
        ty_res = time.gmtime(parse.runtime*60)
        time_m = time.strftime("%H:%M:%S",ty_res)
        data = {
            "name": parse.title,
            "originalName": orig_name,
            "date": parse.release_date,
            "time": str(time_m),
            "movie": "1",
            "img": f'https://image.tmdb.org/t/p/w300{parse.poster_path}',
            "description": parse.overview,
        }

    else:
        for seasons in parse.seasons:
            if seasons.season_number == int(season):
                series = seasons.episode_count
                poster = seasons.poster_path
                date = seasons.air_date
                break

        data = {
            "name": parse.name,
            "originalName": orig_name,
            "date": date,
            "time": str(parse.episode_run_time[0]),
            "season": str(season),
            "series": str(series),
            "img": f'https://image.tmdb.org/t/p/w300{poster}',
            "description": parse.overview,
        }


    year = data['date'][:4]
    #check if file exists
    if os.path.exists(f'anime-data/anime{year}.json'):
        # create json array with data
        with open(f'anime-data/anime{year}.json', 'r') as f:
            data_json = json.load(f)
            data_json.append(data)
            f.close()
    else:
        # create json array with data
        data_json = [data]
        # write json array to file
    with open(f'anime-data/anime{year}.json', 'w') as f:
        json.dump(data_json, f, ensure_ascii = False, indent=4)
        f.close()







