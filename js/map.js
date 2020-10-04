const ICON_BUS = L.IconMaterial.icon({
    icon: 'directions_bus',
    iconColor: '#000',
    markerColor: '#fff',
    outlineColor: '#000',
    outlineWidth: 1,
    iconSize: [40, 40]
});

function showMap(trip_update_url, vehicle_position_url) {
    // モバイルデバイス向けの全画面表示対応
    $('#map').css('height', $(window).height());

    const map = L.map('map').setView([35.689487, 139.691706], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.zoomControl.setPosition('bottomright');

    L.control.locate({
        position: 'bottomright',
        icon: 'gps_fixed',
        iconLoading: 'gps_not_fixed',
        strings: {
            title: '現在地を表示'
        },
        locateOptions: {
            maxZoom: 16
        }
    }).addTo(map);

    // マーカーセット
    let markers = L.featureGroup();
    addMarker(true);

    // 20秒おきに最新のマーカーに更新
    const interval = setInterval(() => {
        clearMarker();
        addMarker();
    }, 20000);

    function addMarker(isFirst) {
        $.ajax({
            url: 'https://api.tera-chan.com/api/gtfs-rt_to_json/v1.php?source=' + trip_update_url,
            type: 'GET',
            dataType: 'json',
            cache: false
        }).done((data, textStatus, jqXHR) => {
            console.log(data);

            function getTripUpdate(tripid) {
                let t = 0;
                while (t < data.length) {
                    if (data[t]['tripUpdate']['trip']['tripId'] === tripid) {
                        return data[t]['tripUpdate'];
                    }
                    t = (t + 1) | 0;
                }
            }
            $.ajax({
                url: 'https://api.tera-chan.com/api/gtfs-rt_to_json/v1.php?source=' + vehicle_position_url,
                type: 'GET',
                dataType: 'json',
                cache: false
            }).done((data, textStatus, jqXHR) => {
                console.log(data);
                if(data.length===0){
                    alert("現在この路線には走行しているバスがありません。");
                    clearInterval(interval);
                    location.href="index.html"
                }
                let i = 0;
                while (i < data.length) {
                    const lat = data[i]['vehicle']['position']['latitude'];
                    const lon = data[i]['vehicle']['position']['longitude'];
                    const trip_id = data[i]['vehicle']['trip']['tripId'];
                    const trip_update = getTripUpdate(trip_id);
                    let popup = '';
                    if (trip_update) {
                        popup += '<div class="mdl-list">' +
                            '<div class="mdl-list__item">' +
                            '<span class="mdl-list__item-primary-content">' +
                            '<i class="material-icons mdl-list__item-icon">directions_bus</i>' +
                            trip_update['vehicle']['label'] + ' 行' +
                            '</span>' +
                            '</div>' +
                            '</div>';
                        const timeupdate = trip_update['stopTimeUpdate'];
                        if (timeupdate && timeupdate.length > 0) {
                            const sumstop = timeupdate[timeupdate.length - 1]['stopSequence'];
                            const nextstop = timeupdate[0]['stopSequence'];
                            const nextstoptime = new Date(timeupdate[0]['arrival']['time'] * 1000);
                            const laststoptime = new Date(timeupdate[timeupdate.length - 1]['arrival']['time'] * 1000);
                            popup += '終点まであと' + (sumstop - nextstop + 1) + '停留所／' + sumstop + '停留所<br>' +
                                '<div class="mdl-progress mdl-js-progress is-upgraded" data-upgraded=",MaterialProgress">' +
                                '<div class="progressbar bar bar1" style="width: ' + (((nextstop - 1) / sumstop) * 100) + '%;"></div>' +
                                '<div class="bufferbar bar bar2" style="width: 0%;"></div>' +
                                '<div class="auxbar bar bar3" style="width: 100%;"></div></div>' +

                                '<div class="mdl-list">' +
                                '<div class="mdl-list__item">' +
                                '<span class="mdl-list__item-primary-content">' +
                                '<i class="material-icons mdl-list__item-icon">radio_button_checked</i>' +
                                '<span>次点</span>' +
                                '</span>' +
                                '<span class="mdl-list__item-secondary-action">' +
                                ('00' + nextstoptime.getHours()).slice(-2) + ':' + ('00' + nextstoptime.getMinutes()).slice(-2) +
                                '</span>' +
                                '</div>' +
                                '<div class="mdl-list__item">' +
                                '<span class="mdl-list__item-primary-content">' +
                                '<i class="material-icons mdl-list__item-icon">stop</i>' +
                                '<span>終点</span>' +
                                '</span>' +
                                '<span class="mdl-list__item-secondary-action">' +
                                ('00' + laststoptime.getHours()).slice(-2) + ':' + ('00' + laststoptime.getMinutes()).slice(-2) +
                                '</span>' +
                                '</div>' +
                                '</div>';
                        } else {
                            popup += 'このバスの時刻表は提供されていません。';
                        }
                    } else {
                        popup += 'このバスの詳細データは提供されていません。';
                    }
                    popup += '<hr>' + new Date(data[i]['vehicle']['timestamp'] * 1000).toLocaleString() + ' 現在';
                    markers.addLayer(L.marker([lat, lon], {
                            icon: ICON_BUS
                        })
                        .bindPopup(popup));
                    i = (i + 1) | 0;
                }
                markers.addTo(map);
                if (isFirst) {
                    map.fitBounds(markers.getBounds());
                }
            }).fail((jqXHR, textStatus, error) => {
                console.log('vehicle_position_error', jqXHR, textStatus, error);
            });
        }).fail((jqXHR, textStatus, error) => {
            console.log('trip_update_error', jqXHR, textStatus, error);
        });
    }

    function clearMarker() {
        markers.clearLayers();
        markers = L.featureGroup();
    }
}