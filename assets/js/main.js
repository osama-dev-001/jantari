$(document).ready(function () {
    var date = new Date;
    // $("#date").html(date);
    var date = new Date();
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    var month = { month: 'long' };
    // var date = { day: 'numeric' };
    // var hour = { hour: 'numeric' };
    // var min = { minute: 'numeric' };
    // $("#date").html(date.toLocaleString('en-US', month));

    $("#city").on("change", function () {
        let cityName = $(this).val();
        console.log('cityName: ', cityName);
        let filePath = `${cityName}/${cityName}_data/${cityName}_december.csv`;
        console.log('filePath: ', filePath);

        // Assuming the file is in the same directory as your HTML file
        let fileUrl = window.location.href + filePath;

        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${filePath}`);
                }
                console.log('response.text(): ', response.text());
                return response.text();
            })
            .then(data => {
                // Process your data here
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    });

})