//import G2 from '@antv/g2';
'use strict'
var G2 = require('../node_modules/@antv/g2');
var DataSet = require('../node_modules/@antv/data-set');
var $q = require('../node_modules/jquery');
var Slider = require('../node_modules/@antv/g2-plugin-slider');




$q('<div id="slider"></div>').insertAfter('#c1');

$q("#buttonLoadThreeMin").click(function(){
    $q('#c1').empty();
    $q('#slider').empty();

    $q.get("http://localhost:8082/future/getstrategythreeminfuture",function(candleData,status){
        //console.log(candleData);
        renderThreeMinKChart(candleData);
    });
});

$q("#buttonLoadFifteenMin").click(function(){
    $q('#c1').empty();
    $q('#slider').empty();

    $q.get("http://localhost:8082/future/getstrategyfifteenminfuture",function(candleData,status){
        //console.log(candleData);
        renderFifteenMinKChart(candleData);
    });
});

$q("#buttonLoadSixtyMin").click(function(){
    $q('#c1').empty();
    $q('#slider').empty();

    $q.get("http://localhost:8082/future/getstrategysixtyeminfuture",function(candleData,status){
        //console.log(candleData);
        renderSixtyMinKChart(candleData);
    });
});

$q("#buttonLoadStrategyThreeMin").click(function(){
    $q('#c1').empty();
    $q('#slider').empty();

    $q.get("http://localhost:8082/future/getrichstrategythreeminfuture",function(candleData,status){
        //console.log(candleData);
        renderThreeMinRichKChart(candleData,null,null);
    });
});

function getlongFromDateString(s){
    if(typeof(s)=='number'){
        return s
    }else{
        var bits = s.split(/\D/);
        var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);
        return date.getTime();
    }

}

function getMaxThreeMinBoundary(arr,start,end){

    if(typeof(start)=='number'&&typeof(end)=="number"){
        var newArr = [];
        if(start>end){
            arr.forEach(function( val, index ) {
                //console.log( val, index, this );
                if(val.time>=end && val.time<=start){
                    newArr.push(val);
                }
            });
        }else if(end>start){
            arr.forEach(function( val, index ) {
                //console.log( val, index, this );
                if(val.time>=start && val.time<=end){
                    newArr.push(val);
                }
            });
        }

        if(newArr.length>0){
            var maxminobject = {};
            newArr.sort(function(item1,item2){
                return item2.max-item1.max;
            })
            maxminobject.max = newArr[0].max;
            //newArr.sort(function(item1,item2){
            //    return item2.threeMinBollUpper-item1.threeMinBollUpper;
            //})
            //if(maxminobject.max<newArr[0].threeMinBollUpper){
            //    maxminobject.max = newArr[0].threeMinBollUpper;
            //}

            newArr.sort(function(item1,item2){
                return item1.min-item2.min
            })
            maxminobject.min=newArr[0].min;
            newArr.sort(function(item1,item2){
                return item1.threeMinBollLower-item2.threeMinBollLower;
            })
            if(maxminobject.min>newArr[0].threeMinBollLower){
                maxminobject.min = newArr[0].threeMinBollLower;
            }
            return maxminobject;
        }else{
            return null;
        }

    }else{
        var endFilter =getlongFromDateString(end);
        var startFilter =getlongFromDateString(start);
        return getMaxThreeMinBoundary(arr,startFilter,endFilter);
    }

}

function getMaxFifteenMinBoundary(arr){
    arr.sort(function(item1,item2){
        return item2.fifteenMinBollUpper-item1.fifteenMinBollUpper
    })
    var maxminobject = {};
    maxminobject.max = arr[0].fifteenMinBollUpper;
    arr.sort(function(item1,item2){
        return item1.fifteenMinBollLower-item2.fifteenMinBollLower
    })
    for(var i =0; i<arr.length-1; i++){
        if(arr[i].fifteenMinBollLower!=0){
            maxminobject.min = arr[i].fifteenMinBollLower;
            break;
        }
    }
    return maxminobject;
}

function getMaxSixtyMinBoundary(arr){
    arr.sort(function(item1,item2){
        return item2.sixtyMinBollUpper-item1.sixtyMinBollUpper
    })
    var maxminobject = {};
    maxminobject.max = arr[0].sixtyMinBollUpper;
    arr.sort(function(item1,item2){
        return item1.sixtyMinBollLower-item2.sixtyMinBollLower
    })
    for(var i =0; i<arr.length-1; i++){
        if(arr[i].sixtyMinBollLower!=0){
            maxminobject.min = arr[i].sixtyMinBollLower;
            break;
        }
    }
    return maxminobject;
}

function renderThreeMinKChart(dataCandleStick){
    var maxMinBoundry = getMaxThreeMinBoundary(dataCandleStick);
    var ds = new DataSet({
        state: {
            start: 1451833200000,
            end: 1451851020000
        }
    });
    var dv = ds.createView().source(dataCandleStick)
    dv.transform({
        type: 'filter',
        callback: function callback(obj) {
            var date = obj.time;
            if(typeof(ds.state.end)=='number'&&typeof(ds.state.start)=="number"){
                return date <= ds.state.end && date >= ds.state.start;
            }else{
                var endFilter =getlongFromDateString(ds.state.end);
                var startFilter =getlongFromDateString(ds.state.start);
                if(startFilter<endFilter){
                    return date <= endFilter && date >= startFilter;
                }else{
                    return date <= startFilter && date >= endFilter;
                }

            }

        }
    }).transform({
        type:'map',
        callback:function callback(obj) {
            obj.candleItem = [obj.start, obj.end, obj.max, obj.min];
            obj.trend = obj.start <= obj.end ? 'up' : 'down';
            return obj;
        }
    })


    var chart = new G2.Chart({
        id: 'c1',
        forceFit: true,
        height: window.innerHeight,
        animate: false,
        padding: [10, 40, 40, 40]

    });

    chart.source(dv, {
        'time': {
            type: 'timeCat',
            nice: false,
            mask: 'YYYY-MM-DD hh:mm'
        },
        trend: {
            values: ['up', 'down']
        },

        'volume': { alias: '成交量' },
        'start': { alias: '开盘价' },
        'end': { alias: '收盘价' },
        'max': { alias: '最高价' },
        'min': { alias: '最低价' },
        'threeMinBollLower': { alias: '布林轨下轨' },
        'threeMinBollMid': { alias: '布林轨中轨' },
        'threeMinBollUpper': { alias: '布林轨上轨' },
        'threeMinDEA': { alias: 'DEA' },
        'threeMinDIF': { alias: 'DIF' },
        'threeMinMACD': { alias: 'MACD' },
        'candleItem': {
            alias: '股票价格',
        }
    });

    var kView = chart.view({
        start: {
            x: 0.05,
            y: 0
        },
        end: {
            x: 1,
            y: 0.3
        }
    });
    kView.source(dv,
    {
        volume:{
            tickCount:10
        }
    });
    kView.schema().position('time*candleItem').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).shape('candle').tooltip('start*end*max*min*threeMinBollLower*threeMinBollMid*threeMinBollUpper*threeMinDEA*threeMinDIF*threeMinMACD');
    kView.axis('time', false);

    var lineView = chart.view({
        start: {
            x: 0.05,
            y: 0.35
        },
        end:{
            x:1,
            y:0.65
        }
    });

    var dvLine = dv.transform({
        type: 'fold',
        fields: ['threeMinBollLower', 'threeMinBollMid','threeMinBollUpper'], // 展开字段集
        key: 'boll', // key字段
        value: 'bollValue' // value字段
    });

    lineView.source(dvLine,{
        bollValue:{
            type:'linear',
            min:maxMinBoundry.min,
            minLimit:maxMinBoundry.min,
            max:maxMinBoundry.max,
            maxLimit:maxMinBoundry.max,
            nice:true
        },
        'threeMinBollLower': { alias: '布林轨下轨' },
        'threeMinBollMid': { alias: '布林轨中轨' },
        'threeMinBollUpper': { alias: '布林轨上轨' },
    });
    lineView.tooltip({
        crosshairs: {
            type: 'line'
        }
    });
    lineView.axis('bollValue');
    lineView.axis('time', false);
    lineView.line().position('time*bollValue').color('boll').shape('smooth');


    var barView = chart.view({
        start: {
            x: 0.05,
            y: 0.75
        },
        end: {
            x: 1,
            y: 1
        }
    });
    barView.source(dv,
        {
            volume:{
                tickCount:2
            }
        }
    );

    barView.axis('time', {
        tickLine: null,
        label: null
    });
    barView.axis('volume');
    barView.axis('time');
    barView.interval().position('time*volume').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).tooltip('time*volume', function (time, volume) {
        return {
            name: time,
            value: '<br/><span style="padding-left: 16px">成交量：' + volume + '</span><br/>'
        };
    });


    chart.render();




    var slider = new Slider({
        container: 'slider', // DOM id
        width: 'auto',
        height: 26,
        padding: [20, 40, 20, 40],
        start: ds.state.start, // 和状态量对应
        end: ds.state.end,
        data: dataCandleStick, // 源数据
        xAxis: 'time', // 背景图的横轴对应字段，同时为数据筛选的字段
        yAxis: 'volume', // 背景图的纵轴对应字段，同时为数据筛选的字段
        scales: {
            time: {
                type: 'timeCat',
                nice: false,
                mask: 'YYYY-MM-DD hh:mm'
            }
        },
        onChange: function onChange(_ref) {
            var startText = _ref.startText,
                endText = _ref.endText;

            ds.setState('start', startText);
            ds.setState('end', endText);
        }
    });
    slider.render();

}

function renderFifteenMinKChart(dataCandleStick){
    var maxMinBoundry = getMaxThreeMinBoundary(dataCandleStick);
    var ds = new DataSet({
        state: {
            start: 1451833200000,
            end: 1451851020000
        }
    });
    var dv = ds.createView().source(dataCandleStick)
    dv.transform({
        type: 'filter',
        callback: function callback(obj) {
            var date = obj.time;
            if(typeof(ds.state.end)=='number'&&typeof(ds.state.start)=="number"){
                return date <= ds.state.end && date >= ds.state.start;
            }else{
                var endFilter =getlongFromDateString(ds.state.end);
                var startFilter =getlongFromDateString(ds.state.start);
                if(startFilter<endFilter){
                    return date <= endFilter && date >= startFilter;
                }else{
                    return date <= startFilter && date >= endFilter;
                }

            }

        }
    }).transform({
        type:'map',
        callback:function callback(obj) {
            obj.candleItem = [obj.start, obj.end, obj.max, obj.min];
            obj.trend = obj.start <= obj.end ? 'up' : 'down';
            return obj;
        }
    })


    var chart = new G2.Chart({
        id: 'c1',
        forceFit: true,
        height: window.innerHeight,
        animate: false,
        padding: [10, 40, 40, 40]

    });

    chart.source(dv, {
        'time': {
            type: 'timeCat',
            nice: false,
            mask: 'YYYY-MM-DD hh:mm'
        },
        trend: {
            values: ['up', 'down']
        },

        'volume': { alias: '成交量' },
        'start': { alias: '开盘价' },
        'end': { alias: '收盘价' },
        'max': { alias: '最高价' },
        'min': { alias: '最低价' },
        'fifteenMinBollLower': { alias: '布林轨下轨' },
        'fifteenMinBollMid': { alias: '布林轨中轨' },
        'fifteenMinBollUpper': { alias: '布林轨上轨' },
        'fifteenMinDEA': { alias: 'DEA' },
        'fifteenMinDIF': { alias: 'DIF' },
        'fifteenMinMACD': { alias: 'MACD' },
        'candleItem': {
            alias: '股票价格',
        }
    });

    var kView = chart.view({
        start: {
            x: 0.05,
            y: 0
        },
        end: {
            x: 1,
            y: 0.3
        }
    });
    kView.source(dv,
        {
            volume:{
                tickCount:10
            }
        });
    kView.schema().position('time*candleItem').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).shape('candle').tooltip('start*end*max*min*fifteenMinBollLower*fifteenMinBollMid*fifteenMinBollUpper*fifteenMinDEA*fifteenMinDIF*fifteenMinMACD');
    kView.axis('time', false);

    var lineView = chart.view({
        start: {
            x: 0.05,
            y: 0.35
        },
        end:{
            x:1,
            y:0.65
        }
    });

    var dvLine = dv.transform({
        type: 'fold',
        fields: ['fifteenMinBollLower', 'fifteenMinBollMid','fifteenMinBollUpper'], // 展开字段集
        key: 'boll', // key字段
        value: 'bollValue' // value字段
    });

    lineView.source(dvLine,{
        bollValue:{
            type:'linear',
            min:maxMinBoundry.min,
            minLimit:maxMinBoundry.min,
            max:maxMinBoundry.max,
            maxLimit:maxMinBoundry.max,
            nice:true
        },
        'fifteenMinBollLower': { alias: '布林轨下轨' },
        'fifteenMinBollMid': { alias: '布林轨中轨' },
        'fifteenMinBollUpper': { alias: '布林轨上轨' },
    });
    lineView.tooltip({
        crosshairs: {
            type: 'line'
        }
    });
    lineView.axis('bollValue');
    lineView.axis('time', false);
    lineView.line().position('time*bollValue').color('boll').shape('smooth');


    var barView = chart.view({
        start: {
            x: 0.05,
            y: 0.75
        },
        end: {
            x: 1,
            y: 1
        }
    });
    barView.source(dv,
        {
            volume:{
                tickCount:2
            }
        }
    );

    barView.axis('time', {
        tickLine: null,
        label: null
    });
    barView.axis('volume');
    barView.axis('time');
    barView.interval().position('time*volume').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).tooltip('time*volume', function (time, volume) {
        return {
            name: time,
            value: '<br/><span style="padding-left: 16px">成交量：' + volume + '</span><br/>'
        };
    });


    chart.render();




    var slider = new Slider({
        container: 'slider', // DOM id
        width: 'auto',
        height: 26,
        padding: [20, 40, 20, 40],
        start: ds.state.start, // 和状态量对应
        end: ds.state.end,
        data: dataCandleStick, // 源数据
        xAxis: 'time', // 背景图的横轴对应字段，同时为数据筛选的字段
        yAxis: 'volume', // 背景图的纵轴对应字段，同时为数据筛选的字段
        scales: {
            time: {
                type: 'timeCat',
                nice: false,
                mask: 'YYYY-MM-DD hh:mm'
            }
        },
        onChange: function onChange(_ref) {
            var startText = _ref.startText,
                endText = _ref.endText;

            ds.setState('start', startText);
            ds.setState('end', endText);
        }
    });
    slider.render();

}

function renderSixtyMinKChart(dataCandleStick){
    var maxMinBoundry = getMaxThreeMinBoundary(dataCandleStick);
    var ds = new DataSet({
        state: {
            start: 1451833200000,
            end: 1451851020000
        }
    });
    var dv = ds.createView().source(dataCandleStick)
    dv.transform({
        type: 'filter',
        callback: function callback(obj) {
            var date = obj.time;
            if(typeof(ds.state.end)=='number'&&typeof(ds.state.start)=="number"){
                return date <= ds.state.end && date >= ds.state.start;
            }else{
                var endFilter =getlongFromDateString(ds.state.end);
                var startFilter =getlongFromDateString(ds.state.start);
                if(startFilter<endFilter){
                    return date <= endFilter && date >= startFilter;
                }else{
                    return date <= startFilter && date >= endFilter;
                }

            }

        }
    }).transform({
        type:'map',
        callback:function callback(obj) {
            obj.candleItem = [obj.start, obj.end, obj.max, obj.min];
            obj.trend = obj.start <= obj.end ? 'up' : 'down';
            return obj;
        }
    })


    var chart = new G2.Chart({
        id: 'c1',
        forceFit: true,
        height: window.innerHeight,
        animate: false,
        padding: [10, 40, 40, 40]

    });

    chart.source(dv, {
        'time': {
            type: 'timeCat',
            nice: false,
            mask: 'YYYY-MM-DD hh:mm'
        },
        trend: {
            values: ['up', 'down']
        },

        'volume': { alias: '成交量' },
        'start': { alias: '开盘价' },
        'end': { alias: '收盘价' },
        'max': { alias: '最高价' },
        'min': { alias: '最低价' },
        'sixtyMinBollLower': { alias: '布林轨下轨' },
        'sixtyMinBollMid': { alias: '布林轨中轨' },
        'sixtyMinBollUpper': { alias: '布林轨上轨' },
        'sixtyMinDEA': { alias: 'DEA' },
        'sixtyMinDIF': { alias: 'DIF' },
        'sixtyMinMACD': { alias: 'MACD' },
        'candleItem': {
            alias: '股票价格',
        }
    });

    var kView = chart.view({
        start: {
            x: 0.05,
            y: 0
        },
        end: {
            x: 1,
            y: 0.3
        }
    });
    kView.source(dv,
        {
            volume:{
                tickCount:10
            }
        });
    kView.schema().position('time*candleItem').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).shape('candle').tooltip('start*end*max*min*sixtyMinBollLower*sixtyMinBollMid*sixtyMinBollUpper*sixtyMinDEA*sixtyMinDIF*sixtyMinMACD');
    kView.axis('time', false);

    var lineView = chart.view({
        start: {
            x: 0.05,
            y: 0.35
        },
        end:{
            x:1,
            y:0.65
        }
    });

    var dvLine = dv.transform({
        type: 'fold',
        fields: ['sixtyMinBollLower', 'sixtyMinBollMid','sixtyMinBollUpper'], // 展开字段集
        key: 'boll', // key字段
        value: 'bollValue' // value字段
    });

    lineView.source(dvLine,{
        bollValue:{
            type:'linear',
            min:maxMinBoundry.min,
            minLimit:maxMinBoundry.min,
            max:maxMinBoundry.max,
            maxLimit:maxMinBoundry.max,
            nice:true
        },
        'sixtyMinBollLower': { alias: '布林轨下轨' },
        'sixtyMinBollMid': { alias: '布林轨中轨' },
        'sixtyMinBollUpper': { alias: '布林轨上轨' },
    });
    lineView.tooltip({
        crosshairs: {
            type: 'line'
        }
    });
    lineView.axis('bollValue');
    lineView.axis('time', false);
    lineView.line().position('time*bollValue').color('boll').shape('smooth');


    var barView = chart.view({
        start: {
            x: 0.05,
            y: 0.75
        },
        end: {
            x: 1,
            y: 1
        }
    });
    barView.source(dv,
        {
            volume:{
                tickCount:2
            }
        }
    );

    barView.axis('time', {
        tickLine: null,
        label: null
    });
    barView.axis('volume');
    barView.axis('time');
    barView.interval().position('time*volume').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).tooltip('time*volume', function (time, volume) {
        return {
            name: time,
            value: '<br/><span style="padding-left: 16px">成交量：' + volume + '</span><br/>'
        };
    });


    chart.render();




    var slider = new Slider({
        container: 'slider', // DOM id
        width: 'auto',
        height: 26,
        padding: [20, 40, 20, 40],
        start: ds.state.start, // 和状态量对应
        end: ds.state.end,
        data: dataCandleStick, // 源数据
        xAxis: 'time', // 背景图的横轴对应字段，同时为数据筛选的字段
        yAxis: 'volume', // 背景图的纵轴对应字段，同时为数据筛选的字段
        scales: {
            time: {
                type: 'timeCat',
                nice: false,
                mask: 'YYYY-MM-DD hh:mm'
            }
        },
        onChange: function onChange(_ref) {
            var startText = _ref.startText,
                endText = _ref.endText;

            ds.setState('start', startText);
            ds.setState('end', endText);
        }
    });
    slider.render();

}

function renderThreeMinRichKChart(dataCandleStick, start, end){
    if(start==null || end==null){
        var stateInit = {
            start: 1451833200000,
            end: 1451851020000
        }
    }else{
        var stateInit = {
            start: start,
            end: end
        }
    }

    var ds = new DataSet({
        state: stateInit
    });

    var maxMinBoundry = getMaxThreeMinBoundary(dataCandleStick,stateInit.start,stateInit.end);
    var dv = ds.createView().source(dataCandleStick)
    dv.transform({
        type: 'filter',
        callback: function callback(obj) {
            var date = obj.time;
            if(typeof(ds.state.end)=='number'&&typeof(ds.state.start)=="number"){
                return date <= ds.state.end && date >= ds.state.start;
            }else{
                var endFilter =getlongFromDateString(ds.state.end);
                var startFilter =getlongFromDateString(ds.state.start);
                if(startFilter<endFilter){
                    return date <= endFilter && date >= startFilter;
                }else{
                    return date <= startFilter && date >= endFilter;
                }

            }

        }
    }).transform({
        type:'map',
        callback:function callback(obj) {
            obj.candleItem = [obj.start, obj.end, obj.max, obj.min];
            obj.trend = obj.start <= obj.end ? 'up' : 'down';
            if(obj.tradeType ==1){
                obj.ktrend = '买多';
            }
            if(obj.tradeType ==2){
                obj.ktrend = '买空';
            }
            if(obj.tradeType ==0){
                obj.ktrend = '卖平';
            }
            return obj;
        }
    })


    var chart = new G2.Chart({
        id: 'c1',
        forceFit: true,
        height: window.innerHeight,
        animate: false,
        padding: [10, 40, 40, 40]

    });

    chart.source(dv, {
        'time': {
            type: 'timeCat',
            nice: false,
            mask: 'YYYY-MM-DD hh:mm'
        },
        trend: {
            values: ['up', 'down']
        },

        'volume': { alias: '成交量' },
        'start': { alias: '开盘价' },
        'end': { alias: '收盘价' },
        'max': { alias: '最高价' },
        'min': { alias: '最低价' },
        'threeMinBollLower': { alias: '3分钟布林轨下轨' },
        'threeMinBollMid': { alias: '3分钟布林轨中轨' },
        'threeMinBollUpper': { alias: '3分钟布林轨上轨' },
        'threeMinDEA': { alias: '3分钟DEA' },
        'threeMinDIF': { alias: '3分钟DIF' },
        'threeMinMACD': { alias: '3分钟MACD' },
        'fifteenMinBollLower': { alias: '15分钟布林轨下轨' },
        'fifteenMinBollMid': { alias: '15分钟布林轨中轨' },
        'fifteenMinBollUpper': { alias: '15分钟布林轨上轨' },
        'fifteenMinDEA': { alias: '15分钟DEA' },
        'fifteenMinDIF': { alias: '15分钟DIF' },
        'fifteenMinMACD': { alias: '15分钟MACD' },
        'sixtyMinBollLower': { alias: '60分钟布林轨下轨' },
        'sixtyMinBollMid': { alias: '60分钟布林轨中轨' },
        'sixtyMinBollUpper': { alias: '60分钟布林轨上轨' },
        'sixtyMinDEA': { alias: '60分钟DEA' },
        'sixtyMinDIF': { alias: '60分钟DIF' },
        'sixtyMinMACD': { alias: '60分钟MACD' },
        'candleItem': {
            alias: '股票价格',
        }
    });

    var kView = chart.view({
        //start: {
        //    x: 0.05,
        //    y: 0
        //},
        //end: {
        //    x: 1,
        //    y: 0.3
        //}
        end: {
            x: 1,
            y: 0.3
        }
    });
    kView.source(dv,
        {
            candleItem:{
                min:maxMinBoundry.min,
                max:maxMinBoundry.max,
                maxLimit:maxMinBoundry.max,
                minLimit:maxMinBoundry.min,
                nice:false,
                tickInterval: 2
            },
            threeMinBollUpper:{
                maxLimit:maxMinBoundry.max,
                min:maxMinBoundry.min,
                minLimit:maxMinBoundry.min,
                max:maxMinBoundry.max,
                nice:false
            },
            threeMinBollMid:{
                maxLimit:maxMinBoundry.max,
                min:maxMinBoundry.min,
                minLimit:maxMinBoundry.min,
                max:maxMinBoundry.max,
            nice:false
            },
            threeMinBollLower:{
                maxLimit:maxMinBoundry.max,
                min:maxMinBoundry.min,
                minLimit:maxMinBoundry.min,
                max:maxMinBoundry.max,
                nice:false
            }
        });

    kView.axis('threeMinBollUpper',false);
    kView.axis('threeMinBollMid',false);
    kView.axis('threeMinBollLower',false);
    //was trend
    kView.schema().position('time*candleItem').color('ktrend', function (val) {
        //if (val === 'up') {
        //    return '#f04864';
        //}
        //
        //if (val === 'down') {
        //    return '#2fc25b';
        //}
        if (val ==='买多'){
            return '#FF0000';
        } else if (val ==='买空'){
            return '#008B00';
        } else if (val ==='卖平'){
            return '#CDAA00';
        }
    }).shape('candle').tooltip('start*end*max*min');

    kView.line().position('time*threeMinBollUpper').color('#68228B').shape('smooth');
    kView.line().position('time*threeMinBollMid').color('#EEEE00').shape('smooth');
    kView.line().position('time*threeMinBollLower').color('#00CD00').shape('smooth');

    chart.tooltip({
        crosshairs: {
            type: 'line'
        }
    });

    //var lineView = chart.view({
    //    start: {
    //        x: 0.05,
    //        y: 0.35
    //    },
    //    end:{
    //        x:1,
    //        y:0.65
    //    }
    //});

    //var dvLine = dv.transform({
    //    type: 'fold',
    //    fields: ['threeMinBollLower', 'threeMinBollMid','threeMinBollUpper'], // 展开字段集
    //    key: 'boll', // key字段
    //    value: 'bollValue' // value字段
    //});
    //
    //lineView.source(dv,{
    //    threeMinBollUpper:{
    //        type:'linear',
    //        min:maxMinBoundry.min,
    //        minLimit:maxMinBoundry.min,
    //        max:maxMinBoundry.max,
    //        maxLimit:maxMinBoundry.max,
    //        nice:true
    //    }
    //});
    //lineView.tooltip({
    //    crosshairs: {
    //        type: 'line'
    //    }
    //});
    //lineView.axis('threeMinBollUpper');
    //lineView.axis('threeMinBollMid',false);
    //lineView.axis('threeMinBollLower',false);
    //lineView.axis('time', false);
    //lineView.line().position('time*threeMinBollUpper').color('#68228B').shape('smooth');
    //lineView.line().position('time*threeMinBollMid').color('#EEEE00').shape('smooth');
    //lineView.line().position('time*threeMinBollLower').color('#00CD00').shape('smooth');

    var barView = chart.view({
        start: {
            x: 0,
            y: 0.4
        },
        end: {
            x: 1,
            y: 0.7
        }
    });
    barView.source(dv,
        {
            volume:{
                tickCount:2
            }
        }
    );

    barView.axis('time', {
        tickLine: null,
        label: null
    });
    barView.axis('volume');
    barView.axis('time');
    barView.interval().position('time*volume').color('trend', function (val) {
        if (val === 'up') {
            return '#f04864';
        }

        if (val === 'down') {
            return '#2fc25b';
        }
    }).tooltip('time*volume', function (time, volume) {
        return {
            name: time,
            value: '<br/><span style="padding-left: 16px">成交量：' + volume + '</span><br/>'
        };
    });


    chart.render();




    var slider = new Slider({
        container: 'slider', // DOM id
        width: 'auto',
        height: 26,
        padding: [20, 40, 20, 40],
        start: ds.state.start, // 和状态量对应
        end: ds.state.end,
        data: dataCandleStick, // 源数据
        xAxis: 'time', // 背景图的横轴对应字段，同时为数据筛选的字段
        yAxis: 'volume', // 背景图的纵轴对应字段，同时为数据筛选的字段
        scales: {
            time: {
                type: 'timeCat',
                nice: false,
                mask: 'YYYY-MM-DD hh:mm'
            }
        },
        onChange: function onChange(_ref) {
            var startText = _ref.startText,
                endText = _ref.endText;
            var currentEndFilter =getlongFromDateString(ds.state.end);
            var currentStartFilter =getlongFromDateString(ds.state.start);
            ds.setState('start', startText);
            ds.setState('end', endText);
            if(_ref.startValue<currentStartFilter||_ref.endValue>currentEndFilter){
                var boundaryNew = getMaxThreeMinBoundary(dataCandleStick,_ref.startValue,_ref.endValue);
                var boundaryOld = getMaxThreeMinBoundary(dataCandleStick,currentStartFilter,currentEndFilter);
                try{
                    if(boundaryNew.max > boundaryOld.max || boundaryNew.min < boundaryOld.min){
                        $q('#c1').empty();
                        $q('#slider').empty();
                        renderThreeMinRichKChart(dataCandleStick,_ref.startValue,_ref.endValue);

                    }
                }catch(e){
                    console.log(e);
                }

            }

        }
    });
    slider.render();

}