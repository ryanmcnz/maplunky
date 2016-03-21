//This is a very basic function for performing a string search in a data buffer (eg. from a file).
//It includes searching at offsets as well as limiting quantity of searches performed.
function searchFileBuffer(buffer, query){
	//Search for unicode strings specifically
	query.encoding	= "utf16le";
	query.start		= query.start 	|| 0;
	query.end 		= query.end 	|| buffer.length;
	query.limit 	= (query.limit == undefined) ? 1 : query.limit;

	var result 		= {
		 query: 		query
		,found: 		[]
	};

	var queryStringEncoded = new Buffer(query.string, query.encoding);

	//Store length of our encoded search string
	query.stringEncodedLength = queryStringEncoded.length;

	//Perform the search
	for(var pos = query.start; pos < query.end; pos++){
		var found = undefined;

		for(var i = 0; i < queryStringEncoded.length; i++){
			var currentPosition = pos + i;
			if(queryStringEncoded[i] != buffer[currentPosition]){
				break;
			}

			if(i + 1 == queryStringEncoded.length){
				found = pos;
				result.found.push(found);
			}
		}

		//Return results early if we have a limit on how many searches should be performed
		if(found && query.limit && result.found.length >= query.limit){
			return result;
		}
	}
	return result;
}