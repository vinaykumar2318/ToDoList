//jshint esversion:6

export default function getDate(){
    let today = new Date();
    
    let options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };

    return  today.toLocaleDateString("en-US",options);
}

export function getDay(){
    let today = new Date();
    
    let options = {
        weekday : "long",
    };

    return today.toLocaleDateString("en-US",options);
}