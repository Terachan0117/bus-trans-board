// GTFSデータが格納されるグローバル変数
const GTFS = [];

// GTFSデータを取得する関数
function getGTFS(url) {
    // CORS制約無視
    url = 'https://api.tera-chan.com/api/ignore_cors/v1.php?resource=' + url;
    JSZipUtils.getBinaryContent(url, (err, data) => {
        if (err) {
            console.log("get gtfs_error", err);
            return;
        }
        try {
            let promises = [];
            JSZip.loadAsync(data)
                .then((zip) => {
                    // zip内のファイルを1つずつ処理
                    Object.keys(zip.files).forEach((fname) => {
                        promises.push(zip.file(fname).async("string")
                            .then(function success(fdata) {
                                setGTFS(fname, fdata)
                            }, function error(e) {
                                console.log("unzip_error", e);
                            }));
                    });
                    // 全ファイル処理完了後実行
                    $.when.apply($, promises).then(() => {
                        showMap(QUERY_TRIP_UPDATE, QUERY_VEHICLE_POSITION, true);
                    });
                });
        } catch (e) {
            console.log("set gtfs_error", e);
        }
    });
}

// GTFSデータを変数GTFSに格納する関数
function setGTFS(fname, fdata) {
    // グローバル変数GTFSに格納(keyはファイルネーム(拡張子は含まない)、valueはArrayに変換されたファイルデータ)
    GTFS[fname.substring(0, fname.indexOf("."))] = csvToArray(fdata);
}

// CSV(GTFS)をArrayに変換する関数
function csvToArray(csv) {
    let array = [];
    const record = csv.split(/\r\n|\r|\n/g);
    const column = record[0].replace(/ |\"|\”/g, '').split(',');
    let i = 1;
    while (i < record.length) {
        if (record[i] != '') {
            let data = {};
            const element = record[i].replace(/"|”/g, '').split(',');
            let j = 0;
            while (j < element.length) {
                data[column[j]] = element[j];
                j = (j + 1) | 0;
            }
            array.push(data);
        }
        i = (i + 1) | 0;
    }
    return array;
}