const express = require('express');
const request = require('request');

const router = express.Router();

var client_id = process.env.NAVER_CLIENT_ID; //개발자센터에서 발급받은 Client ID
var client_secret = process.env.NAVER_CLIENT_SECRET; //개발자센터에서 발급받은 Client Secret
var query = encodeURI("https://developers.naver.com/docs/utils/shortenurl");

// router.get('/', async (req, res, next) => {
//     res.render('main_lay');
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
                    const msr = rows[0].MSRDATE;
                    const day = `${Number(msr.slice(4,6))}월${Number(msr.slice(6,8))}일`;
                    const time = `${Number(msr.slice(8,10))}:00`;
                    let MSRSTENAME = '서울시';
                    let MAXINDEX = 0;
                    let GRADE = '';
                    let NITROGEN = 0;
                    let OZONE = 0;
                    let PM10 = 0;
                    let PM25 = 0;
                    let cntMAXINDEX = 0;
                    let cntNITROGEN = 0;
                    let cntOZONE = 0;
                    let cnt10 = 0;
                    let cnt25 = 0;
                    rows.forEach(row => {
                        if(row.MAXINDEX !== '점검중'){
                            MAXINDEX += Number(row.MAXINDEX);
                            cntMAXINDEX += 1;
                        }
                        if(row.NITROGEN !== '점검중'){
                            NITROGEN += Number(row.NITROGEN);
                            cntNITROGEN += 1;
                        }
                        if(row.OZONE !== '점검중'){
                            OZONE += Number(row.OZONE);
                            cntOZONE += 1;
                        }
                        if(row.PM10 !== '점검중'){
                            PM10 += Number(row.PM10);
                            cnt10 += 1;
                        }
                        if(row.PM25 !== '점검중'){
                            PM25 += Number(row.PM25);
                            cnt25 += 1;
                        }
                        console.log(row.GRADE);
                    });
                    MAXINDEX = Math.round(MAXINDEX/=cntMAXINDEX);
                    NITROGEN = (NITROGEN/=cntNITROGEN).toFixed(3);
                    OZONE = (OZONE/=cntOZONE).toFixed(3);
                    PM10 = Math.round(PM10/=cnt10);
                    PM25 = Math.round(PM25/=cnt25);
                    if (MAXINDEX < 30) {
                        GRADE = '좋음';
                    } else if (MAXINDEX < 80){
                        GRADE = '보통';
                    } else{
                        GRADE = '나쁨';
                    }
                    res.render('main', {
                        day : day,
                        time : time,
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
                    const msr = row.MSRDATE;
                    const day = `${Number(msr.slice(4,6))}월${Number(msr.slice(6,8))}일`;
                    const time = `${Number(msr.slice(8,10))}:00`;
                    res.render('main', {
                        day : day,
                        time : time,
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