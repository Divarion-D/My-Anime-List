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
        anime = requests.get(
            f"https://shikimori.one/api/animes/{anime_id}",
            headers=HEADER,
        ).json()

        # Обработка описания
        desc = "" if anime.get("description") is None else anime.get("description")
        desc = re.sub(r"\[.*?\]", "", desc)  # remove [*] from description
        date = anime.get("aired_on", "")
        year = date[:4] if date else "unknown"

        # Формируем запись
        entry = {
            "id": anime_id,
            "name": anime.get("russian"),
            "originalName": anime.get("name"),
            "date": date,
            "img": f"https://shikimori.one{anime.get('image').get('original')}",
            "description": desc,
        }

        # Добавляем специфичные поля
        if anime.get("kind") == "movie":
            time_m = time.strftime(
                "%H:%M:%S", time.gmtime(anime.get("duration", 0) * 60)
            )
            entry.update({"time": time_m, "movie": "1"})
        else:
            entry.update(
                {"time": str(anime.get("duration")), "series": anime.get("episodes")}
            )

        new_data[year].append(entry)
        print(f"Added anime with ID {anime_id}")
        existing_ids.add(anime_id)  # Запоминаем обработанные ID

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

        # Fetch anime details
        anime_response = requests.get(
            f"https://shikimori.one/api/animes/{anime_id}",
            headers=HEADER,
        )
        anime = anime_response.json()

        # Process description
        desc = "" if anime.get("description") is None else anime.get("description")
        desc = re.sub(r"\[.*?\]", "", desc)  # remove [*] from description

        # Prepare data entry
        entry = {
            "id": anime_id,
            "name": anime.get("russian"),
            "originalName": anime.get("name"),
            "date": anime.get("aired_on"),
            "img": f"https://shikimori.one{anime.get('image').get('original')}",
            "description": desc,
        }

        # Add type-specific fields
        if anime.get("kind") == "movie":
            time_res = time.gmtime(anime.get("duration", 0) * 60)
            entry.update({"time": time.strftime("%H:%M:%S", time_res), "movie": "1"})
        else:
            entry.update(
                {"time": str(anime.get("duration")), "series": anime.get("episodes")}
            )

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
