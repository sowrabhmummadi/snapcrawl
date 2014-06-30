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
fetchData()
function fetchData(){
        var avail='false';
        redisClient.llen('snapdealphonelinks',function(err,len)
        {
        	if(len==0)
        		{return 1;}
        console.log(len);
        redisClient.rpop('snapdealphonelinks',function(err,link){
               if(link)
               { 
                redisClient.rpop('availability',function(err,d)
                    {
                        if(d)
                         {avail=Boolean(d);}
                   
               			options.path="/"+link;
                		var id=parseInt(link.substring(link.lastIndexOf('/')+1));
                        var Data="";
                       request=http.get(options,function(res)
                           {	
                                res.on('data',function(data)
                                   {
                                       Data+=data;
                                   });
                                res.on('end',function()
                                    {
                                        var re1=/<\/html>/g;
                                        var re2=/<html>/g;
                                        var reviews=[];
                                                         Data=Data.substring(Data.search(re2),Data.search(re1)+7);
                                        Data=Data.replace(/\/r/g,'');
                                        Data=Data.replace(/\/t/g,'');
                                        var $=cheerio.load(Data);
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
                                        if(typeof reviews === 'undefined')
                                            {
                                               reviews="not Available"
 											};
                                        var rating=$("div[class='lfloat pdpRatingStars']").attr("ratings");
                                        if(typeof rating === 'undefined')
                                            {
                                               rating="not Available"
 											}
 										else
 										   rating.trim();
                                        var name=($("div.pdpName h1").text().trim());
                                        var price=parseInt($("span#selling-price-id").text().trim());
                                        console.log("insert data")
                                       insertData(id,name,price,rating,avail,features,rviews);
                                          console.log("record pushed");
                                          
                                           //callback(Data);
                                   });
                                res.on('error',function(err)
                                	{
                                        console.log("error"); 
                                        callback(null);
              						});   

                            });

                    });
                }
	            if(err)
	             console.log(err);
                    
        		});

   });
   } 
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
									type:" mobiles",
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
					   console.log("inside insertdata");
					   fetchData();
				   });
	
}
