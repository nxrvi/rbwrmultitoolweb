
//Couldn find a fix to overlay so this should repair it

let navbar = document.getElementById("idkfix");

let overlayfix = document.getElementById("idkfix2");



function updateFix(){
    if(navbar && overlayfix){
        let height = navbar.clientHeight;
        
        overlayfix.style.marginTop = `${height}px`;
    
        
    }
}


window.addEventListener('resize', updateFix);


updateFix();


















