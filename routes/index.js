const express = require('express');
const request = require('request');

const router = express.Router();

var client_id = process.env.NAVER_CLIENT_ID; //개발자센터에서 발급받은 Client ID
var client_secret = process.env.NAVER_CLIENT_SECRET; //개발자센터에서 발급받은 Client Secret
var query = encodeURI("https://developers.naver.com/docs/utils/shortenurl");

// router.get('/', async (req, res, next) => {
//     res.render('main_css');
// });


https://data.seoul.go.kr/dataList/OA-1200/S/1/datasetView.do 서울시 공공 데이터
router.get('/', async (req, res, next) => {
    try {
        var url = 'http://openAPI.seoul.go.kr:8088';
        url = url + '/' + process.env.data_seoul_go_kr_dataList; // 인증키
        url = url + '/json'; //요청파일타입
        url = url + '/ListAirQualityByDistrictService'; //서비스명
        url = url + '/0'; // 요청시작위치
        if(req.query.guId){
            url = url + '/1'; //요청종료위치
            url = url + `/${req.query.guId}`
        } else {
            url = url + '/100/'; //요청종료위치
        }

        const option = {
            url: url,
            method: 'GET'
        };

        request(option, (error, response, body) => {
            // console.log('Status', response.statusCode);
            // console.log('Headers', JSON.stringify(response.headers));
            jsonData = JSON.parse(body);
            //console.log(jsonData.ListAirQualityByDistrictService.row);
            if(jsonData.ListAirQualityByDistrictService.hasOwnProperty('row')) {
                const len = Object.keys(jsonData.ListAirQualityByDistrictService.row).length;
                if(len > 1){
                    const rows = jsonData.ListAirQualityByDistrictService.row;
                    let MSRDATE = rows[0].MSRDATE;
                    let MSRSTENAME = '서울시 통합 대기지수';
                    let MAXINDEX = 0;
                    let GRADE = '';
                    let NITROGEN = 0;
                    let OZONE = 0;
                    let PM10 = 0;
                    let PM25 = 0;

                    rows.forEach(row => {
                        MAXINDEX += Number(row.MAXINDEX);
                        NITROGEN += Number(row.NITROGEN);
                        OZONE += Number(row.OZONE);
                        PM10 += Number(row.PM10);
                        PM25 += Number(row.PM25);
                        // 미세먼지 NAN으로 나오는 버그 있음 ==> 점검중으로 들어오는 값이 있음
                        console.log(`PM10: ${PM10} ||  PM25: ${PM25}`);
                    });
                    MAXINDEX = Math.round(MAXINDEX/=len);
                    NITROGEN = (NITROGEN/=len).toFixed(3);
                    OZONE = (OZONE/=len).toFixed(3);
                    PM10 = Math.round(PM10/=len);;
                    PM25 = Math.round(PM25/=len);;
                    
                    res.render('main', {
                        MSRDATE,
                        MSRSTENAME,
                        MAXINDEX,
                        GRADE,
                        NITROGEN,
                        OZONE,
                        PM10,
                        PM25
                        });
                } else {
                    const row = jsonData.ListAirQualityByDistrictService.row[0];
                    res.render('main', {
                        MSRDATE : row.MSRDATE,
                        MSRSTENAME : row.MSRSTENAME,
                        MAXINDEX: row.MAXINDEX,
                        GRADE: row.GRADE,
                        NITROGEN: row.NITROGEN,
                        OZONE: row.OZONE,
                        PM10: row.PM10,
                        PM25: row.PM25
                        });
                }
            } else {
                res.render('main', { message : jsonData.ListAirQualityByDistrictService.RESULT.MESSAGE });    
            }

        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});



// router.get('/', (req, res) => {
//     var api_url = 'https://api.odcloud.kr/api/MinuDustFrcstDspthSvrc/v1/getMinuDustFrcstDspth50Over';
//     var api_url = api_url + '?numOfRows=20';
//     var api_url = api_url + '&returnType=json';
//     console.log(new Date.now());
//     var api_url = api_url + `&searchDate=${new Date.now()}`;
//     var options = {
//             url: api_url,
//             form: {'url':query},
//             headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
//         };
//         request.get('options', (error, response, body) => {
//             if (!error && response.statusCode == 200) {
//                 res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
//                 console.log(body);
//             } else {
//                 res.status(response.statusCode).end();
//                 console.log('error = ' + response.statusCode);
//                 res.render('layout');
//             }
//         });
//     });



module.exports = router;