window.addEventListener("load", function(){
    const form = document.getElementById("information-form");
    
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const fName = document.getElementById("first-name").value.trim().toLowerCase();
        const lName = document.getElementById("last-name").value.trim().toLowerCase();
        
        const correctFName = "jonas";
        const correctLName = "joe";
        
        if (fName === correctFName && lName === correctLName) {
            window.location.href = "endvideo.html";
        } else {
            alert("Incorrect. Try again.");
        }
    })
});