const buildQuery = {
    'select':function(select_data,tbl_name,where_args,order_by="",limit=0){
        var where_condition = "";
        if(where_args!=""){
            Object.keys(where_args).forEach(function(key) {
                where_condition += buildQuery.build_where(key,where_args[key]);
            });
        }
        var query = 'select  '+select_data+' from '+tbl_name+' WHERE 1=1 '+where_condition;
        if(order_by!=""){
            query+=" ORDER BY "+order_by;
        }
        if(limit!=0){
            query+=" LIMIT "+limit;
        }
        console.log(query);
        return query;
    },
    'insert':function(tbl_name,option_args){
        var db_keys = "";
        var db_values = "";
        Object.keys(option_args).forEach(function(key) {
            if(db_keys==""){
                db_keys=key;

                if(option_args[key]==null){
                    db_values = option_args[key];
                }else{
                    db_values = '"'+option_args[key]+'"';
                }
            }else{
                db_keys+=','+key;
                if(option_args[key]==null){
                    db_values += ','+option_args[key];
                }else{
                    db_values += ',"'+option_args[key]+'"';  
                }
            }
        });
        
        var query = 'insert into '+tbl_name+' ('+db_keys+') values('+db_values+')';
        return query;
    },
    'update':function(tbl_name,option_args,where_args){
        var set_values = "";
        var where_condition = "";
        Object.keys(option_args).forEach(function(key) {
            if(set_values==""){
                set_values = key+'="'+option_args[key]+'"';
            }else{
                set_values += ','+key+'="'+option_args[key]+'"';
            }
        });

        Object.keys(where_args).forEach(function(key) {
            if(where_condition==""){
                where_condition = key+'="'+where_args[key]+'"';
            }else{
                where_condition += ' AND '+key+'="'+where_args[key]+'"';
            }
        });
        
        var query = 'update '+tbl_name+' set '+set_values+' where '+where_condition;
        console.log(query);
        return query;
    },
    'join':function(select_data,tbl_name,joins,where_args,order_by="",limit=0){
        var where_condition = "";
        if(where_args!=""){
            Object.keys(where_args).forEach(function(key) {
                where_condition += ' AND '+key+'="'+where_args[key]+'"';
            });
        }
        
        var join_data = "";
        if(joins.length > 0){
            joins.forEach(element => {
                join_data+=" "+element[2]+" join "+element[0]+" on "+element[1]+" ";
            });
        }
        var query = 'select  '+select_data+' from '+tbl_name+join_data+' WHERE 1=1 '+where_condition;
        if(order_by!=""){
            query+=" ORDER BY "+order_by;
        }
        if(limit!=0){
            query+=" LIMIT "+limit;
        }
        // console.log(query);
        return query;
    },
    'build_where' : function(key,value){
        if(key.includes('=') || key.includes('>') || key.includes('<')){
            if(value==""){
                return ' AND '+key;
            }else{
                return ' AND '+key+'"'+value+'"';    
            }
        }
        if(value==null){
            return ' AND '+key+' is '+value;
        }else{
            return ' AND '+key+'="'+value+'"';
        }
    }
}

module.exports = buildQuery;