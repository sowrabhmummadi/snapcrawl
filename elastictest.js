var elasticsearch=require('elasticsearch');
var async=require('async');
var elsClient=new elasticsearch.Client({ host: 'localhost:9200' });

function esearch()
    {
       
		elsClient.exists(
            {
                index: "snapdeal",
                type: "mobilles",
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
							  });,
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
		console.log("esearch");
		
    }
var details=
	{
	  index:"snapdeal",
	  type:"mobiles",
	  id:1,
		body:
			{
				name:'nexus 4',
				price:'24000',
				availability:true
				
			}
	}
function insertdata()
{
   elsClient.index(details,function(err,res)
				   {
				   		if(err)
						{console.log(err);}
					   console.log("record pushed");
				   });
	console.log("insertdata")
}
async.series([esearch(),insertdata()],function(err,res)
			 {if(err){console.log(err);}
			  console.log('done :)');});