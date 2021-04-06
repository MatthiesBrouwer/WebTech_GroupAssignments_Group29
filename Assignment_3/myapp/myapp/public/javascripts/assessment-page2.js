/*var req = new XMLHttpRequest();
window.onload = function()
{
req.onreadystatechange= function ()
{
    if (this.readyState == 4 && this.status == 200)
    {
        console.log(req.responseText)
    }

}
req.open("GET", "./testdata.json", true);
req.send();}*/

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

// this requests the file and executes a callback with the parsed result once
//   it is available
fetchJSONFile('testdata.json', function(data){
    // do something with your data
    console.log(data);
});