
//Couldn find a fix to overlay so this should repair it

let navbar = document.getElementById("idkfix");

let overlayfix = document.getElementById("idkfix2");


if(navbar && overlayfix){
    let height = navbar.clientHeight;
    
    overlayfix.style.marginTop = `${height}px`;

    console.log("It worked");
    
}else{
    console.log("Not Found");
}
















