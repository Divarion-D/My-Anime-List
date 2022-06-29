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
const router = new Navigo('/', { hash: true });
router
    .on({
        ':type/:year': ({ data }) => {
            loadData({
                js: "./anime-data/" + indexData[data.year],
                type: data.type,
                year: data.year
            })
        },
        '*' : showHome
    })
    .resolve()
let drawer;
$(function () {
    if (typeof InstallTrigger !== 'undefined') $("body").addClass("firefox")
    $("#drawer>.mdui-list").append(
        `<li class="mdui-list-item mdui-ripple" href="/" data-navigo>
            <i class="mdui-list-item-icon mdui-icon eva eva-home-outline"></i>
            <div class="mdui-list-item-content">Главная</div>
        </li>`
    )
    for (year of Object.keys(indexData).reverse()) {
        let html = $(
            `<li class="mdui-collapse-item" al-month="${year}">
                <div class="mdui-collapse-item-header mdui-list-item mdui-ripple">
                    <i class="mdui-list-item-icon mdui-icon eva eva-archive-outline"></i>
                    <div class="mdui-list-item-content">${year}</div>
                    <i class="mdui-collapse-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                </div>
                <ul class="mdui-collapse-item-body mdui-list mdui-list-dense">
                    <li class="mdui-list-item mdui-ripple" href="info/${year}" data-navigo>Иллюстрации</li>
                    <li class="mdui-list-item mdui-ripple" href="waterfall/${year}" data-navigo>Водопад</li>
                </ul>
            </li>`
        )
        $("#drawer>.mdui-list").append(html)
    }

    router.updatePageLinks()
    mdui.mutation(); //Необходимо инициализировать локальный MDUI
    // 手機自動收回 drawer
    $(`#drawer [href]`).click(function () {
        if ($(window).width() < 1024) {
            new mdui.Drawer("#drawer").close();
            $(".mdui-overlay").click()
        }
    });
    // p == null => На первой странице
    let p = ""
    let u = window.location.host;
    drawer = new mdui.Collapse("#drawer>.mdui-list", { accordion: true })
    drawer.open(p ? `[al-month="${p.year}"]` : 0); //Первым выскочил он
    $(p ? `[href="${u}"]` : `[href="home"][data-navigo]`).addClass(activeDrawerItemClassName)
    // 隨機背景圖
    hwBackground(bg[0])

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

function showHome() {
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
    hwHeader("Anime List")
    $("#content").html(
        `<div class="recent-update"></div>`
    )
    appendRecentUpdate()
}

async function loadData({
    js,
    type,
    year
}) {
    try {
        // 讓動畫按時間排序
        const sorted_anime = (await loadJson(js)).sort((a, b) => {
            //new Date(year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]);
            let aTime = new Date(
                year,
                a.date.split("/")[0], a.date.split("/")[1],
                a.time.split(":")[0] || "23", a.time.split(":")[1] || "59" // 如果只有日期，預設 23:59，讓他排在該日期的最後面
            );
            let bTime = new Date(
                year,
                b.date.split("/")[0], b.date.split("/")[1],
                b.time.split(":")[0] || "23", b.time.split(":")[1] || "59" // 如果只有日期，預設 23:59，讓他排在該日期的最後面
            );
            // 如果其中一個沒日期, aTime - bTime 會是 NaN
            if (isNaN(aTime - bTime)) {
                if (a.date == b.date) return 0; // aTime 跟 bTime 都是 invalid
                if (a.date == "") return 1; // aTime invalid, bTime valid, a 要在 b 後面
                if (b.date == "") return -1; // aTime valid, bTime invalid, a 要在 b 前面
            } else
                return aTime - bTime;
        });
        $("#content").attr('class', '').html('')
        let typeChinsese = {
            waterfall: "Водопад",
            info: "Иллюстрации",
        }
        hwHeader(`${year} Год выпуска`, typeChinsese[type])
        switch (type) {
            case "waterfall":
                return waterfall(sorted_anime, year)
            case "info":
                return info(sorted_anime, year)
        }
    } catch (err) {
        $("#content").attr('class', '').html(`<div class="mdui-typo">Отскок взорвался, пожалуйста, повторите попытку позже.<pre>Причина ошибки：\n${err}</pre></div>`)
    }
}

async function loadJson(js) {
    anime_data = await fetch(js).then(res => res.json())
    return anime_data
}

function waterfall(Anime, year) {
    let container = $('<div class="waterfall"></div>')
    for (let item of Anime) {
        $(container).append(
            $(`<div class="card">
                <div class="image mdui-ripple mdui-ripple-white">
                    <img src="${item.img}"/>
                </div>
                <div class="content">
                    <div class="name mdui-typo-title mdui-text-color-theme">${item.name}</div>
                    <div class="originalName">${item.originalName}</div>
                </div>
            </div>`).click(function () {
                showAnimeInfoDialog(item, year)
            })
        )
    }
    $("#content").append(container)
}

function info(Anime, year) {
    $(`#content`).append(
        `<div id="info" class="info"></div>`
    )
    $(`#content`).append(
        `<div id="unknown">
        <div class="mdui-typo-display-1 al-header" al-time-unknown>Время выхода в эфир неизвестно</div>
        <div class="info" al-time-unknown></div>
        </div>`
    )
    for (let item of Anime) {
        let setTime = new Date((item.year || year) + "/" + item.date)
        let animeDay = week[setTime.getDay()]; //星期
        let release = item.date
        if (item.date == "" || item.date.split("/")[1] == "") release = "Дата выхода неизвестна", animeDay = 'unknown'
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
        ).click(function () { showAnimeInfoDialog(item, year) }))
    }
    if ($("#unknown > .info > *").length == 0)
        $(`[al-time-unknown]`).remove()
}

function showAnimeInfoDialog(item, year) {
    let release = item.date
    if (item.season == "0") {
        season = "OVA"
    }else{
        season = item.season
    }
    if (item.date.trim() === "" || !item.date) release = "Дата выхода неизвестна"
    let displayItems = [] // Список данных о анимации
    displayItems.push({ icon: 'insert_invitation', title: 'Дата выхода', content: release})
    if (!item.movie){
        displayItems.push({ icon: 'access_time', title: 'Длительность серии', content: item.time + ' мин. ~ серия' })
        displayItems.push({ icon: 'label', title: 'Сезон', content: season + ' (' + item.series + ' Серий)' })
    }else{
        displayItems.push({ icon: 'access_time', title: 'Длительность', content: item.time + ' мин.' })
    }        
    if (item.carrier)
        displayItems.push({ icon: carrierIcon[item.carrier], title: 'Тип', content: carrier[item.carrier] })
    displayItems.push({ icon: 'info', title: 'Описание', content: item.description || 'Пока не представлено!' })
    let displayItemsResult = displayItems.map(({ href, title, content, icon }) =>
        `<a class="mdui-list-item mdui-ripple" ${href ? `href="${href}" target="_blank"` : ''}>
            <i class="mdui-list-item-icon mdui-icon material-icons mdui-text-color-indigo">${icon}</i>
            <div class="mdui-list-item-content">
                <div class="mdui-list-item-title">${title}</div>
                <div class="mdui-list-item-text">${content}</div>
            </div>
            ${href ? `<i class="mdui-list-item-icon mdui-icon material-icons">open_in_new</i>` : ''}
        </a>`
    ).join('')
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
    </div>`
    //router.pause()
    mdui.dialog({
        //title: animeName,
        content: animeDialogContent,
        history: navigator.userAgent.toLowerCase().indexOf('firefox') == -1, // not Firefox
        /* buttons: [{
             text: '關閉'
         }],*/
        //onClose: () => router.pause(false)
    });
    mdui.mutation()
}

// Text slicing up to 120 characters with an ending on the whole word
function trimText(text) {
    if (text.length > 120) {
        let textArr = text.split(" ")
        let result = ""
        for (let i = 0; i < textArr.length; i++) {
            if (result.length + textArr[i].length > 120) break
            result += textArr[i] + " "
        }
        return result + "..."
    }
    return text
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

    array = [...array];

    for (let index = array.length - 1; index > 0; index--) {
        const newIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[newIndex]] = [array[newIndex], array[index]];
    }

    return array;
};