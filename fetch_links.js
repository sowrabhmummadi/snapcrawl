var http=require("http");
var redis=require('redis');

var redisclient = redis.createClient();
var options ={
    host: "www.snapdeal.com",
    port: 80
    };
var count=0,total=0,j=0;
fetch(options);
function fetch(options)
    {   options.path="/acors/json/product/get/search/175/"+count+"/50?q=&sort=plrty&";
        var Data="";
        request=http.get(options,function(res)
         {
            res.on('data',function(data)
                   {
                   Data+=data;
                   });
            res.on('end',function()
                   {
                        
                     var jsonData;
                     jsonData=JSON.parse(Data);
                        if(total==0) 
                            {
                                total=jsonData.numberFound; 		 
                                console.log(total);
                            }
                                  
                            for(var i=0;i<50;i++)
                               {                                           redisclient.lpush('snapdealphonelinks',jsonData.productDtos[i].pageUrl+"");
                                redisclient.lpush('availability',!(jsonData.productDtos[i].soldOut)+"");
                                }
                       console.log('data insertd');  
                       count+=50;
                       if(count>total)
                            {console.log('done');
                                return;}
                        fetch(options);
                    });
                res.on('error',function(err)
                    {
                        console.log("error"); 
                        return;
                    });   

         });
    }
