Azure Function proxy to handle the Oauth 2.0 exchange and  allow Power BI to get data from the Microsoft Graph API 


This piece of code implements a proxy that takes a client_id and client_secret and calls the Oauth 2.0 service to get a token 
and then uses that token to call the graph api to get the statistical information from the graph.api. The code is modified for the 
demon tennant contoso - you will have to modify the tenant name and the url's for your own token provider and B2C implementation.

The example gets stats from the B2C service but the code should be generic enough to be useful to use in other Oauth2.0 situations.

The script is implemented as an Azure Function written in NodeJS - call the Azure Function https endpoint from Power BI  which will call the 
graph api and return the statisitics on B2C usage. Beware that this is the first piece of NodeJS I've written so some caution may be warranted.

I wrote this to allow Power BI to query the graph api data - it can't easily query this as of Feb 2016 - this may change as there are requests on the 
Power BI product group to put this functionality in the data source routines.

David Burnham Feb 2017
