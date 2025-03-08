import json
import os
import re
import time
import glob
from collections import defaultdict

import requests

# Shikimori API
# https://shikimori.one/api/doc/1.0

USERNAME = "Divarion_D"
HEADER = {"X-User-Nickname": USERNAME, "User-Agent": USERNAME}


def ReadDB(file_path):
    """Читает JSON файл и возвращает данные. Возвращает пустой список при ошибках."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []  # Возвращаем пустой список если файла нет
    except json.JSONDecodeError:
        print(f"Ошибка чтения файла {file_path}. Файл будет пересоздан.")
        return []
    except Exception as e:
        print(f"Неизвестная ошибка при чтении {file_path}: {str(e)}")
        return []


def WriteDB(file_path, data):
    """Сохраняет данные в JSON файл с автоматическим созданием директорий."""
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Ошибка записи в файл {file_path}: {str(e)}")


def GetAnimeInfo(id):
    """Получает информацию об аниме по его ID."""
    headers = {
        "User-Agent": "MyApp/1.0 (contact@example.com)",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Connection": "keep-alive",
        "DNT": "1",
        "Origin": "https://shikimori.one",
    }

    # Исправленный GraphQL-запрос
    query = """
    {
    animes(ids: "$id", limit: 1) {
        id
        name
        russian
        kind
        rating
        score
        status
        episodes
        duration
        airedOn { year month day date }
        poster {originalUrl}

        videos {url name}
        screenshots {originalUrl x166Url x332Url}

        description
        descriptionHtml
    }
    }
    """.replace(
        "$id", str(id)
    )

    try:
        response = requests.post(
            "https://shikimori.one/api/graphql", json={"query": query}, headers=headers
        )
        response.raise_for_status()
        data = response.json()

        if data.get("data", {}).get("animes"):
            return data["data"]["animes"][0]

    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
    except KeyError as e:
        print(f"Data parsing error: {e}")


def download_image(url, save_path=None):
    """
    Скачивает изображение по URL
    :param url: Ссылка на изображение
    :param save_path: Путь для сохранения (если не указан - используется имя файла из URL)
    :return: Путь к сохраненному файлу
    """
    try:
        # Отправляем GET-запрос
        response = requests.get(url, headers=HEADER, stream=True)
        response.raise_for_status()

        # Определяем имя файла
        if not save_path:
            filename = os.path.basename(url)
            save_path = os.path.join(os.getcwd(), filename)

        # Сохраняем изображение
        with open(save_path, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)

        print(f"Изображение сохранено: {save_path}")
        return save_path

    except Exception as e:
        print(f"Ошибка загрузки: {str(e)}")
        return None


def WatchAnime(data):
    # Собираем все существующие ID из всех годовых файлов
    existing_ids = set()
    year_files = glob.glob("anime-data/anime*.json")

    for file_path in year_files:
        year_data = ReadDB(file_path)
        existing_ids.update({item["id"] for item in year_data})

    new_data = defaultdict(list)

    for item in data:
        anime_id = item.get("anime").get("id")

        # Пропускаем уже существующие аниме
        if anime_id in existing_ids:
            print(f"Anime with ID {anime_id} already exists. Skipping.")
            continue

        # Делаем запрос только для новых аниме
        anime = GetAnimeInfo(anime_id)

        year = anime["airedOn"]["year"]
        desc = "" if anime["description"] is None else anime["description"]
        desc = re.sub(r"\[.*?\]", "", desc)  # remove [*] from description

        while True:
            try:
                img = download_image(
                    anime["poster"]["originalUrl"], f"anime-data/img/{anime_id}.jpg"
                )
                break
            except Exception as e:
                print(f"Error downloading image for anime {anime_id}: {e}")
                time.sleep(5)  # wait 5 seconds before retrying

        # Формируем запись
        entry = {
            "id": anime_id,
            "name": anime["russian"],
            "originalName": anime["name"],
            "date": anime["airedOn"]["date"],
            "img": img,
            "description": desc,
        }

        # Добавляем специфичные поля
        if anime["kind"] == "movie":
            time_m = time.strftime("%H:%M:%S", time.gmtime(anime["duration"] * 60))
            entry.update({"time": time_m, "movie": "1"})
        else:
            entry.update({"time": str(anime["duration"]), "series": anime["episodes"]})

        new_data[year].append(entry)
        print(f"Added anime with ID {anime_id}")
        existing_ids.add(anime_id)  # Запоминаем обработанные ID

        # delete in shedschedule
        shed_data = ReadDB("anime-data/schedule.json")
        shed_data = [item for item in shed_data if item["id"] != anime_id]
        WriteDB("anime-data/schedule.json", shed_data)

    # Сохраняем новые данные по годам
    for year, entries in new_data.items():
        filename = f"anime-data/anime{year}.json"

        # Загружаем существующие данные для года
        if os.path.exists(filename):
            year_entries = ReadDB(filename)
            existing_ids_year = {item["id"] for item in year_entries}
        else:
            year_entries = []
            existing_ids_year = set()

        # Фильтруем уже существующие записи (на случай дубликатов в data)
        filtered_entries = [
            entry for entry in entries if entry["id"] not in existing_ids_year
        ]

        if filtered_entries:
            # Объединяем и сортируем
            combined = year_entries + filtered_entries
            combined.sort(key=lambda x: x.get("date") or "", reverse=True)

            # Сохраняем обновленные данные
            WriteDB(filename, combined)


def Schuduled(data):
    existing_data = ReadDB("anime-data/schedule.json")
    existing_ids = {item["id"] for item in existing_data}

    new_entries = []

    for item in data:
        anime_id = item.get("anime").get("id")

        # Skip if already exists
        if anime_id in existing_ids:
            print(f"Skipping duplicate anime ID: {anime_id}")
            continue

        anime = GetAnimeInfo(anime_id)

        desc = "" if anime["description"] is None else anime["description"]
        desc = re.sub(r"\[.*?\]", "", desc)  # remove [*] from description

        while True:
            try:
                img = download_image(
                    anime["poster"]["originalUrl"], f"anime-data/img/{anime_id}.jpg"
                )
                break
            except Exception as e:
                print(f"Error downloading image for anime {anime_id}: {e}")
                time.sleep(5)  # wait 5 seconds before retrying

        # Prepare data entry
        entry = {
            "id": anime_id,
            "name": anime["russian"],
            "originalName": anime["name"],
            "date": anime["airedOn"]["date"],
            "img": img,
            "description": desc,
        }

        # Add type-specific fields
        if anime["kind"] == "movie":
            time_m = time.strftime("%H:%M:%S", time.gmtime(anime["duration"] * 60))
            entry.update({"time": time_m, "movie": "1"})
        else:
            entry.update({"time": str(anime["duration"]), "series": anime["episodes"]})
        new_entries.append(entry)
        print(f"Added new anime entry: {anime_id}")
        existing_ids.add(anime_id)  # Prevent duplicates in current session

    # Merge and sort data
    if new_entries:
        combined_data = existing_data + new_entries
        # Sort by date in reverse chronological order
        combined_data.sort(key=lambda x: x["date"] or "", reverse=True)

        # Save updated data
        WriteDB("anime-data/schedule.json", combined_data)


if __name__ == "__main__":
    data = requests.get(
        f"https://shikimori.one/api/users/{USERNAME}/anime_rates?limit=1000000000&status=completed",
        headers=HEADER,
    )
    data = json.loads(data.text)
    WatchAnime(data)

    data = requests.get(
        f"https://shikimori.one/api/users/{USERNAME}/anime_rates?limit=1000000000&status=planned",
        headers=HEADER,
    )
    data = json.loads(data.text)
    Schuduled(data)
