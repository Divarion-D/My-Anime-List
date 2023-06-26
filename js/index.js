const activeDrawerItemClassName = 'mdui-color-theme-50 mdui-text-color-theme';
const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const carrier = {
    "Comic": "Адаптации комиксов",
    "Game": "Адаптация игры",
    "Novel": "Адаптация романа",
    "Original": "Оригинальный сюжет",
}
const carrierIcon = {
    "Comic": "edit",
    "Game": "videogame_asset",
    "Novel": "book",
    "Original": "tv",
}
const indexData = {
    1988: "anime1988.json",
    1995: "anime1995.json",
    2001: "anime2001.json",
    2003: "anime2003.json",
    2004: "anime2004.json",
    2006: "anime2006.json",
    2008: "anime2008.json",
    2009: "anime2009.json",
    2010: "anime2010.json",
    2011: "anime2011.json",
    2012: "anime2012.json",
    2014: "anime2014.json",
    2015: "anime2015.json",
    2016: "anime2016.json",
    2017: "anime2017.json",
    2018: "anime2018.json",
    2019: "anime2019.json",
    2020: "anime2020.json",
    2021: "anime2021.json",
    2022: "anime2022.json",
    2023: "anime2023.json",
};
const bg = arrayShuffle([
    'https://cdn.discordapp.com/attachments/439314137584107532/728258277938561056/E382ADE383BCE38393E382B8E383A5E382A2E383AB.png',
    'https://cdn.discordapp.com/attachments/439314137584107532/732937057055539240/unknown.png',
    'https://cdn.discordapp.com/attachments/439314137584107532/860905520940187679/00000036.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860908283832827924/ogp_3.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860911055659073536/unknown.png',
    'https://cdn.discordapp.com/attachments/439314137584107532/860912162141372466/cut06.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860914231560765450/snapshot5.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860918794217455616/E4KgGp7VgAEuECb.webp',
    'https://cdn.discordapp.com/attachments/787359871682478153/856738206334451732/d92921dff9ce1efa796e5c45a0118a2c7647545ca3a098271a23565f1156f08b.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860929446281084928/img_ep01-1.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/860929867448451092/img_ep01-4.jpg',
    'https://cdn.discordapp.com/attachments/439314137584107532/961445202109804614/FKqIc_pVUAkuvh4.jpg'
])
// 路由
const router = new Navigo('./', { hash: true });
router
    .on({
        '/': ({ url }) => {
            // show the home page
            showHome(url)
        },
        '/schedule': () => {
            // create the path to the data file
            const jsPath = `./anime-data/schedule.json`;
            // load the data
            loadData({ js: jsPath, type: 'schedule', year: '0000' });
        },
        ':type/:year': ({ data }) => {
            // destructure the data object
            const { type, year } = data;
            // create the path to the data file
            const jsPath = `./anime-data/${indexData[year]}`;
            // load the data
            loadData({ js: jsPath, type, year });
        }
    })
    .resolve();
// set up the drawer
let drawer;
$(function () {
    // check if the browser is firefox
    if (typeof InstallTrigger !== 'undefined') $("body").addClass("firefox");
    // append the home link to the drawer
    $("#drawer>.mdui-list").append(
        `<li class="mdui-list-item mdui-ripple" href="/" data-navigo>
      <i class="mdui-list-item-icon mdui-icon eva eva-home-outline"></i>
      <div class="mdui-list-item-content">Главная</div>
    </li>
    <li class="mdui-list-item mdui-ripple" href="schedule" data-navigo>
      <i class="mdui-list-item-icon mdui-icon eva eva-home-outline"></i>
      <div class="mdui-list-item-content">Запланировано</div>
    </li>`
    );
    // loop through the index data and append it to the drawer
    Object.keys(indexData).reverse().forEach(year => {
        const html = $(
            `<li class="mdui-list-item mdui-ripple" href="info/${year}" al-month="${year}" data-navigo>
        <i class="mdui-list-item-icon mdui-icon eva eva-archive-outline"></i>
        <div class="mdui-list-item-content">${year}</div>
      </li>`
        );
        $("#drawer>.mdui-list").append(html);
    });
    // update the page links
    router.updatePageLinks();
    // set the background
    hwBackground(bg[0]);
});

function hwHeader(title, subtitle, phoneSubtitle) {
    $(`#hw-header .hw-title`).text(title)
    $(`#hw-header .hw-subtitle`).text(subtitle)
    if (phoneSubtitle)
        $(`#hw-header .hw-subtitle[hide-desktop]`).text(phoneSubtitle)
}

function hwBackground(url) {
    $(`#hw-bg`).attr('style', `background-image: url("${url}")`)
}

// Function to load data based on the given parameters
async function loadData({ js, type, year }) {
    try {
        // Load JSON and sort it based on date and time
        const sorted_anime = (await loadJson(js)).sort((a, b) => {
            let aTime = new Date(
                year,
                a.date.split("/")[0], a.date.split("/")[1],
                a.time.split(":")[0] || "23", a.time.split(":")[1] || "59"
            );
            let bTime = new Date(
                year,
                b.date.split("/")[0], b.date.split("/")[1],
                b.time.split(":")[0] || "23", b.time.split(":")[1] || "59"
            );
            // Check if the difference between the two dates is valid
            if (isNaN(aTime - bTime)) {
                // If the dates are the same, return 0
                if (a.date == b.date) return 0;
                // If the first date is empty, return 1
                if (a.date == "") return 1;
                // If the second date is empty, return -1
                if (b.date == "") return -1;
            } else {
                // Return the difference between the two dates
                return aTime - bTime;
            }
        });
        // Reset the content and add the header
        $("#content").attr('class', '').html('')
        switch (type) {
            case "info":
                hwHeader(`${year} Год выпуска`)
                return info(sorted_anime, year)
            case "schedule":
                hwHeader("Запланировано")
                return schedule(sorted_anime)
        }

        // Return the info
        return info(sorted_anime, year)
    } catch (err) {
        // If an error occurs, display an error message
        $("#content").attr('class', '').html(`<div class="mdui-typo">Отскок взорвался, пожалуйста, повторите попытку позже.<pre>Причина ошибки：\n${err}</pre></div>`)
    }
}

// Async function to load JSON data from a given URL
async function loadJson(js) {
    let anime_data; // Variable to store the loaded JSON data
    // Fetch the data from the given URL and parse it as JSON
    await fetch(js).then(res => {
        anime_data = res.json();
    });
    // Return the parsed JSON data
    return anime_data;
}

function showHome(url) {
    $("#drawer>.mdui-list *").removeClass(activeDrawerItemClassName)
    $(`[href="${url}"]`).addClass(activeDrawerItemClassName)

    async function appendRecentUpdate() {
        let count = 0
        loop: for (year of Object.keys(indexData).reverse()) {
            const y = year;
            if (++count > 12) break loop;
            const bgImg = arrayShuffle((await loadJson("./anime-data/" + indexData[y])).map(i => i.img))[0]
            $('#content .recent-update').append(
                $(
                    `<a class="card" title="${y} Год" href="info/${y}" data-navigo>
                    <div class="image" style="background-image:url('${bgImg}')">
                        <div class="hover-icon hover-show">
                            <i class="mdui-icon eva eva-arrow-ios-forward-outline"></i>
                        </div>
                    </div>
                    <div class="content">
                        <div class="originalName">${y} Год</div>
                    </div>
                </a>`
                ).click(function () {
                    drawer.open(`[al-month="${y}"]`);
                })
            )
        }
        router.updatePageLinks()
    }
    hwHeader("Главная страница")
    $("#content").html(
        `<div class="recent-update"></div>`
    )
    appendRecentUpdate()
}

function schedule(Anime) {
    // Append the HTML elements to the #content div
    $(`#content`).append(
        `<div id="info" class="info"></div>`
    );
    $(`#content`).append(
        `<div id="unknown">
            <div class="mdui-typo-display-1 al-header" al-time-unknown>Нет запланированого</div>
            <div class="info" al-time-unknown></div>
        </div>`
    );

    // Iterate through the Anime array
    for (let item of Anime) {
        // Create a new Date object using the year and date from the item
        let setTime = new Date((item.year) + "/" + item.date);
        let animeDay = week[setTime.getDay()];
        let release = item.date;
        // If the date is empty or only contains the month, set the release to "Дата выхода неизвестна" and the animeDay to "unknown"
        if (item.date == "" || item.date.split("/")[1] == "") {
            release = "Дата выхода неизвестна";
            animeDay = 'unknown';
        }
        // Append the HTML element to the #info div and add a click event handler
        $(`#info`).append($(
            `<div class="card">
                <div class="image" style="background-image:url('${item.img}')">
                    <div class="hover-icon hover-show">
                        <i class="mdui-icon eva eva-info-outline"></i>
                    </div>
                </div>
                <div class="content">
                    <div class="name mdui-text-color-theme mdui-typo-title">${item.name}</div>
                    <div class="originalName">${item.originalName}</div>
                    <div class="time">${release}</div>
                    <div class="description">${trimText(item.description)}</div>
                </div>
            </div>`
        ).click(function () { showAnimeInfoDialog(item) }));
    }
    // If there are no elements in the #unknown > .info div, remove the al-time-unknown element
    if ($("#unknown > .info > *").length == 0) {
        $(`[al-time-unknown]`).remove();
    }
}

function info(Anime, year) {
    // Append the HTML elements to the #content div
    $(`#content`).append(
        `<div id="info" class="info"></div>`
    );
    $(`#content`).append(
        `<div id="unknown">
            <div class="mdui-typo-display-1 al-header" al-time-unknown>Время выхода в эфир неизвестно</div>
            <div class="info" al-time-unknown></div>
        </div>`
    );
    // Iterate through the Anime array
    for (let item of Anime) {
        // Create a new Date object using the year and date from the item
        let setTime = new Date((item.year || year) + "/" + item.date);
        let animeDay = week[setTime.getDay()];
        let release = item.date;
        // If the date is empty or only contains the month, set the release to "Дата выхода неизвестна" and the animeDay to "unknown"
        if (item.date == "" || item.date.split("/")[1] == "") {
            release = "Дата выхода неизвестна";
            animeDay = 'unknown';
        }
        // Append the HTML element to the #info div and add a click event handler
        $(`#info`).append($(
            `<div class="card">
                <div class="image" style="background-image:url('${item.img}')">
                    <div class="hover-icon hover-show">
                        <i class="mdui-icon eva eva-info-outline"></i>
                    </div>
                </div>
                <div class="content">
                    <div class="name mdui-text-color-theme mdui-typo-title">${item.name}</div>
                    <div class="originalName">${item.originalName}</div>
                    <div class="time">${release}</div>
                    <div class="description">${trimText(item.description)}</div>
                </div>
            </div>`
        ).click(function () { showAnimeInfoDialog(item) }));
    }
    // If there are no elements in the #unknown > .info div, remove the al-time-unknown element
    if ($("#unknown > .info > *").length == 0) {
        $(`[al-time-unknown]`).remove();
    }
}

function showAnimeInfoDialog(item) {
    let release = item.date;
    let season;
    switch (item.season) {
        case "0":
            season = "OVA";
            break;
        default:
            season = item.season;
    }
    if (item.date.trim() === "" || !item.date) release = "Дата выхода неизвестна";
    let displayItems = []; // Список данных о анимации
    displayItems.push({
        icon: 'insert_invitation',
        title: 'Дата выхода',
        content: release
    });
    if (!item.movie) {
        displayItems.push({
            icon: 'access_time',
            title: 'Длительность серии',
            content: `${item.time} мин. ~ серия`
        });
        displayItems.push({
            icon: 'label',
            title: 'Серий в сезоне',
            content: `${item.series} Серий`
        });
    } else {
        displayItems.push({
            icon: 'access_time',
            title: 'Длительность',
            content: `${item.time} мин.`
        });
    }
    if (item.carrier)
        displayItems.push({
            icon: carrierIcon[item.carrier],
            title: 'Тип',
            content: carrier[item.carrier]
        });
    displayItems.push({
        icon: 'info',
        title: 'Описание',
        content: item.description || 'Пока не представлено!'
    });
    let displayItemsResult = displayItems.map(({ href, title, content, icon }) =>
        `<a class="mdui-list-item mdui-ripple" ${href ? `href="${href}" target="_blank"` : ''}>
            <i class="mdui-list-item-icon mdui-icon material-icons mdui-text-color-indigo">${icon}</i>
            <div class="mdui-list-item-content">
                <div class="mdui-list-item-title">${title}</div>
                <div class="mdui-list-item-text">${content}</div>
            </div>
            ${href ? `<i class="mdui-list-item-icon mdui-icon material-icons">open_in_new</i>` : ''}
        </a>`
    ).join('');
    let animeDialogContent = `
    <div class="anime-container">
        <div class="anime-poster" style="background-image:url('${item.img}')"><img src="${item.img}"/></div>
        <div class="anime-info-container">
            <div class="mdui-tab mdui-tab-full-width" mdui-tab>
                <a href="#anime-tab-info" class="mdui-ripple">Введение</a>
            </div>
            <div id="anime-tab-info" class="mdui-p-a-2">
                <div class="anime-info">
                    <div class="mdui-typo-title mdui-text-color-theme">${item.name}</div>
                    <div class="mdui-typo-subheading-opacity">${item.originalName}</div>
                    <div class="mdui-list">
                        ${displayItemsResult}
                    </div>
                </div>
            </div>
            <div class="anime-actions" style="padding: 16px">
                <button class="mdui-btn mdui-btn-dense mdui-color-theme-accent mdui-ripple" mdui-dialog-close>Закрыть</button>
            </div>
        </div>
    </div>`;
    //router.pause()
    mdui.dialog({
        //title: animeName,
        content: animeDialogContent,
        history: navigator.userAgent.toLowerCase().indexOf('firefox') == -1,
    });
    mdui.mutation();
}

// Function to trim text to a maximum of 120 characters
function trimText(text) {
    // If the text is longer than 120 characters, split it into an array of words
    if (text.length > 120) {
        let textArr = text.split(" ");
        let result = "";
        // Iterate through the array of words and add them to the result string until the total length of the string exceeds 120 characters
        for (let i = 0; i < textArr.length; i++) {
            if (result.length + textArr[i].length > 120) break;
            result += textArr[i] + " ";
        }
        // Return the trimmed string with an ellipsis at the end
        return result + "...";
    }
    // If the text is shorter than 120 characters, return it as is
    return text;
}

/**
 * @template T
 * @param {Array<T>} array
 * @returns {Array<T>}
 *
 * @link https://github.com/sindresorhus/array-shuffle
 * @license
 * MIT License
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function arrayShuffle(array) {
    if (!Array.isArray(array)) {
        throw new TypeError(`Expected an array, got ${typeof array}`);
    }
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};