var moment = require('moment');
var commonHelper = {
    'getDateTime':function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    'formatDate' : function(date) {
        if(date=="0000-00-00" || date==""){ return date; }
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if(year < 1950){
            return null;
        }
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    },
    'formatDateWithSpash' : function(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [day,month,year].join('/');
    },
    'getMonthName' : function(i){
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        // console.log("  i ",monthNames);
        return monthNames[i];
    },
    'getShortMonthName' : function(i){
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        // console.log("  i ",monthNames);
        return monthNames[i];
    },
    'customFormatDate' : function(date,format) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if(year < 1950){
            return null;
        }
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        
        if(format=="d, F Y"){
            return day+', '+commonHelper.getMonthName(d.getMonth())+' '+year;
        }

        if(format=="d/F/Y"){
            return day+'/'+month+'/'+year;
        }

        if(format=="d/m/Y H:i"){
            return day+'/'+month+'/'+year+' '+d.getHours()+':'+d.getMinutes();
        }

        if(format=="Y-m-d h:i:s"){
            return year+'-'+month+'-'+day+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
        }

        if(format=="YmdHis"){
            return year+month+day+d.getHours()+d.getMinutes()+d.getSeconds();
        }

        if(format=="d, M Y g:i a"){
            return moment(date).format("DD,MMM YYYY hh:mm A");
        }

        return [year, month, day].join('-');
    },
    "sort_by_key":function(array, key) {
        return array.sort(function(a, b)
        {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
}

module.exports = commonHelper;