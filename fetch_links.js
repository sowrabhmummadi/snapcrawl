var http=require("http");
var elasticsearch = require('elasticsearch');

var options ={
    host: "www.snapdeal.com",
    port: 80
    };
var count=0,total=0;
var request;
var url="http://www.snapdeal.com/acors/json/product/get/search/175/20/20?q=&sort=plrty&keyword=&clickSrc=&viewType=Grid&lang=en";
var elsClient=new elasticsearch.Client({ host: 'localhost:9200' });

function esearch()
    {
       elsClient.exists(
            {
                index: "snapdeal",
                type: "mobiles",
                id:''
            },function(err,exist)
                {
                   if(err)
                    {console.log(err);}
                    if(!exist)
                        {
                      	   elsClient.indices.create(
                            {
                             	index:"snapdeal",
								type:"mobiles"
                            },function(err,res)
							  {
							  	if(err)
                    				{console.log(err);}
								console.log("index created :)");  
							  });
						  elsClient.indices.putMapping(
								{
								   index:"snapdeal",
									type:"mobiles",
									body:
									{
									   "mobiles":
										{
									   	  'properties':
											{
											  'name':{'type':'string'},
											  'price':{'type':'string'},
											   'availability':{'type':'boolean'},
											}
										}
									}
								},function(err,res)
								  {
									  if(err)
									  {console.log(err);}
									  console.log("mapping created");
								  });
                        }
                 } );
	}


function fetch(options,callback)
		{ var Data="";
            
                request=http.get(options,function(res){
                        res.on('data',function(data)
                               {
                                   Data+=data;
                               });
                        res.on('end',function()
                               {

                                   callback(Data);
                               });
                        res.on('error',function(err){
                            console.log("error"); 
                            callback(null);
                               });   

                        });
              	 
	     }
esearch();
var inId=setInterval(function(){ 
 options.path="/acors/json/product/get/search/175/"+count+"/50?q=&sort=plrty&";    
 
    fetch(options,function(data)
		{
            
            var jsonData;
            if(data)
               {

				   jsonData=JSON.parse(data);
                  if(total==0) 
                  total=jsonData.numberFound; 		  
                  
				   for(var i=0;i<50;i++)
                   insertData(jsonData.productDtos[i].id,jsonData.productDtos[i].name,jsonData.productDtos[i].displayPrice,true);
                }
            else
            {console.log("46");
                return 0;} 
			
		});
  count+=50;
	
    if(count>50)
     {clearInterval(inId);
      console.log('end');
	  request.end();}
   },1000);   


function insertData(id,name,price,avail)
{
   var details=
	{
	  index:"snapdeal",
	  type:"mobiles",
	  id:id,
		body:
			{
				name:name,
				price:price,
				availability:true
				
			}
	}
	elsClient.index(details,function(err,res)
				   {
				   		if(err)
						{console.log(err);}
					   console.log("record pushed");
				   });
	console.log("insertdata")
}
