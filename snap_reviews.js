/*JSLint node=true*/
var http=require('http');
var cheerio=require('cheerio');
var elasticsearch = require('elasticsearch');
var redis=require('redis');

var redisClient=redis.createClient();
var elsClient=new elasticsearch.Client({ host: 'localhost:9200' });
var Data;
var options=
    {
       host:"www.snapdeal.com",
        port:80        
    };
var url="http://www.snapdeal.com/product/apple-iphone-5s-16-gb/347830397";

esearch(); 
setInterval(function(){
        var avail='false';
        redisClient.rpop('snapdealphonelinks',function(err,data){
               if(data)
               { 
                redisClient.rpop('availability',function(err,d)
                    {
                        if(d)
                         {avail=Boolean(d);}
                   
                options.path="/"+data;
                var id=parseInt(data.substring(data.lastIndexOf('/')+1));
            
                  fetch(options,function(data)
                        {
                            var re1=/<\/html>/g;
                            var re2=/<html>/g;
                            var reviews=[];
                            data=data.substring(data.search(re2),data.search(re1)+7);
                            data=data.replace(/\/r/g,'');
                            data.replace(/\/t/g,'');
                            var $=cheerio.load(data);
                            var features=$('div.details-content').text();
                             $( "p.pr-review-rating-headline" ).each(function( index ) 
                                {         
                                   reviews[index]=$(this).text().trim();
                                });    

                            $( "p.pr-comments" ).each(function( index ) 
                                {         
                                    reviews[index]+="!`!"+$(this).text().trim();
                                }); 
                            var rviews=reviews.join("##-##-##");
                            var rating=$("div[class='lfloat pdpRatingStars']").attr("ratings").trim();
                            var name=($("div.pdpName h1").text().trim());
                            var price=parseInt($("span#selling-price-id").text().trim());
                           insertData(id,name,price,rating,avail,features,rviews);
                        });
                         });
               }
               if(err)
                     console.log(err);
        });
   
   },3000); 
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
											   'name': {'type':'string'},
											   'price': {'type':'integer'},
                                               'rating': {'type':'string'},
                                                'availability': {'type':'boolean'},
                                               'features': {'type':'string'},
                                               'reviews': {'type':'string'}
											   
											}
										}
									}
								},function(err,res)
								  {
									  if(err)
									  {console.log(err);}
									  console.log("mapping created");
								  });
                             });      
                        }
                 } );
	}

function insertData(id,n,p,r,a,f,rv)
{
   var details=
	{
	  index:"snapdeal",
	  type:"mobiles",
	  id:id,
		body:
			{
				name: n,
                price: p,
                rating:r,
                availability:a,
                features:f,
                reviews:rv
     		}
	}
	elsClient.index(details,function(err,res)
				   {
				   		if(err)
						{console.log(err);}
					   console.log("record pushed");
				   });
	
}


function getData(options,callback)
   {
       http.get(options,function(res)
                {
                    res.on('data',function(data)
                           {Data+=data});
                     res.on('end',function()
                     {callback(Data);});
                });
             
   }


function fetch(option,callback)
		{ var Data="";
            
                request=http.get(option,function(res){
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
	     

       
  
