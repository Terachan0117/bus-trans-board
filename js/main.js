// URLクエリの値が格納されるグローバル変数
const QUERY_GTFS = getUrlQuery("gtfs");
const QUERY_TRIP_UPDATE = getUrlQuery("update");
const QUERY_VEHICLE_POSITION = getUrlQuery("position");
//const QUERY_ALERT = getUrlQuery("alert");

// ページディスパッチャー
if (QUERY_GTFS && QUERY_TRIP_UPDATE && QUERY_VEHICLE_POSITION) {
    getGTFS(QUERY_GTFS);
} else if (QUERY_TRIP_UPDATE && QUERY_VEHICLE_POSITION) {
    showMap(QUERY_TRIP_UPDATE, QUERY_VEHICLE_POSITION);
} else if (QUERY_TRIP_UPDATE) {
    alert('Vehicle PositionのデータURLをクエリ"position"に指定してください。');
} else if (QUERY_VEHICLE_POSITION) {
    alert('Trip UpdateのデータURLをクエリ"update"に指定してください。');
} else {
    showMenu();
}

// 指定したURLクエリを返す関数
function getUrlQuery(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
}

// トップページのメニューを表示する関数
function showMenu() {
    $.ajax({
        url: 'data/line_list.json',
        type: 'GET',
        dataType: 'json',
        cache: false
    }).done((data, textStatus, jqXHR) => {
        let result = '<div class="mdl-grid"><div class="mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone"><div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__title"><h2 class="mdl-card__title-text">ようこそ</h2></div><div class="mdl-card__supporting-text">このウェブサイトでは、バスのリアルタイム位置情報を配信しています。</div></div></div><div class="mdl-cell mdl-cell--8-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone"><div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__title"><h2 class="mdl-card__title-text">路線を選択して閲覧</h2></div><div class="mdl-card__supporting-text"><div class="demo-list-icon mdl-list">';
        let i = 0;
        while (i < data.length) {
            result += ' <a class="mdl-list__item mdl-button mdl-js-button mdl-js-ripple-effect" href="' +
                '?gtfs=' + data[i]["gtfs-jp"] +
                '&update=' + data[i]["gtfs-rt"]["TripUpdate"] +
                '&position=' + data[i]["gtfs-rt"]["VehiclePosition"] +
                '&alert=' + data[i]["gtfs-rt"]["Alert"] +
                '">';
            result += '<span class="mdl-list__item-primary-content">';
            result += '<i class="material-icons mdl-list__item-icon">directions_bus</i>';
            result += data[i]["operator"] + ' ' + data[i]["title"];
            result += '</span>';
            result += '</a>';
            i = (i + 1) | 0;
        }
        result += '</div></div></div></div><div class="mdl-cell mdl-cell--4-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone"><div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__supporting-text mdl-typography--text-center"><!-- 300x250 --><ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"data-ad-client="ca-pub-7015411654892573" data-ad-slot="2712075084"></ins></div></div><div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__title"><h2 class="mdl-card__title-text">URLを指定して閲覧</h2></div><div class="mdl-card__supporting-text mdl-typography--text-center"><div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input" type="text" id="update"><label class="mdl-textfield__label" for="update">Trip Update URL</label></div><div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input" type="text" id="position"><label class="mdl-textfield__label" for="position">Vehicle Position URL</label></div><div><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored mdl-color-text--white" id="search-by-url">GO</button></div></div></div></div></div>';
        $("#map").html(result);
        $("#search-by-url").on('click', () => {
            location.href = '?update=' + $("#update").val() + '&position=' + $("#position").val();
        });
        (adsbygoogle = window.adsbygoogle || []).push({});
    }).fail((jqXHR, textStatus, error) => {
        console.log('menu_error', jqXHR, textStatus, error);
    });
}