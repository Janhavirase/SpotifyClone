
let songs;
let currFolder;
let cardContainer=document.querySelector(".cardContainer")

let currentSong = new Audio(); // if not using HTML <audio>
let play = document.querySelector("#play");



function convertSecondsToMinSec(seconds) {
    if(isNaN(seconds)||seconds<0){
        return "00:00";
    }
    seconds = Math.round(seconds); // Round to nearest whole number
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}
const playMusic=(track)=>{
    // let audio=new Audio("/songs/-"+track)
    currentSong.src=`/${currFolder}/-`+track;
    currentSong.play();
    play.src="pause.svg";
    document.querySelector(".songinfo").innerHTML=decodeURI(track);
    document.querySelector(".songtime").innerHTML="";
    

   
   
}

async function displayAlbums(){
  let a=await fetch(`/songs/`)
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    
    let anchors=div.getElementsByTagName("a")

   let array= Array.from(anchors)
   for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
   if (e.href.includes("/songs/")) {
    // This safely extracts the subfolder (like 'album1')
    let folder = new URL(e.href).pathname.split("/").filter(Boolean)[1];

    if (folder && folder !== "songs") {
        // Now fetch info.json from that subfolder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);
    


           //get meta data of folder
    //        let a=await fetch(`/songs/${folder}/info.json`)
    // let response=await a.json();
    // console.log(response)
    cardContainer.innerHTML=cardContainer.innerHTML+` <div data-folder="${folder}" class="card ">
          <div class="play">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <!-- Green Circle Background -->
  <circle cx="15" cy="15" r="15" fill="green" />

  <!-- Black Play Button (Triangle) -->
  <polygon points="11,8 20,15 11,22" fill="black" />
</svg>

</div>
        <img src="/songs/${folder}/cover.jpg.jpeg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
        </div>`

        }
   }
   }

//load the folder when card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
        console.log("card clicked")
        console.log(item,item.currentTarget.dataset)
        songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
       
    })
})

}

async function getSongs(folder){
    currFolder=folder;
    let a=await fetch(`/${folder}/`)
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
     songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(decodeURIComponent(element.href.split("-")[1]))
        }
    }
    
let songURL=document.querySelector(".songList").getElementsByTagName("ul")[0]
songURL.innerHTML=""
for(const song of songs){
   
      //show all songs in playlist
 songURL.innerHTML=songURL.innerHTML+`<li>
 
                         <img class="invert" src="music.svg" alt="">
                  <div class="info">
                         <div> ${song.replaceAll("%2520"," ").replaceAll("%20"," ")}</div>
                     <div>Unknown</div>
             </div>
                   <div class="playNow">
                  <span>Play Now</span>
             <img class="invert" src="play.svg" alt="">
     </div>
    
   </li> `;

}
//attach event listner to each element  
Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
   e.addEventListener("click",element=>{
       let trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
       console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
       playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
   })
   
})


return songs; 

}



async function main(){
    //get list of all songs
   await getSongs("/songs/superhits")
   playMusic(songs[0],true)
   
//display all the albums on the songs
await displayAlbums();


//pre and next
// ✅ FIXED PREVIOUS BUTTON
document.getElementById("previous").addEventListener("click", () => {
    currentSong.pause();
    console.log("prev clicked");
    let current = decodeURIComponent(currentSong.src.split("-").slice(-1)[0]?.trim());
    let index = songs.findIndex(s => s.trim() === current);
    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

// ✅ FIXED NEXT BUTTON
document.getElementById("next").addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");
    let current = decodeURIComponent(currentSong.src.split("-").slice(-1)[0]?.trim());
    let index = songs.findIndex(s => s.trim() === current);
    if (index !== -1 && index + 1 < songs.length) {
        playMusic(songs[index + 1]);
    }
});

//attach event listener to play,prev,,next
play.addEventListener("click",()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src="pause.svg";
    }else{
        currentSong.pause();
        play.src="play.svg"
    }
})

//listen for time update
currentSong.addEventListener("timeupdate",()=>{
    //console.log(currentSong.currentTime,currentSong.duration);
    document.querySelector(".songtime").innerHTML=`${
        convertSecondsToMinSec(currentSong.currentTime)
    }/${
        convertSecondsToMinSec(currentSong.duration)
    }`
    document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%";
})

//add event listener to seek bar
document.querySelector(".seekbar").addEventListener("click",(e)=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
    document.querySelector(".circle").style.left=percent+"%";
    currentSong.currentTime=((currentSong.duration)*percent)/100
})
//add event listner for hamberger
document.querySelector(".hamberger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0"
})
//event listener for close
document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-110%"
})

//add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    currentSong.volume=parseInt(e.target.value)/100;
})








//add search bar when search si clicked
document.querySelector(".search").addEventListener("click",()=>{
    document.querySelector("#songSearch").style.display="block";
  
})
//filter songs on basis of input
document.getElementById("songSearch").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const songItems = document.querySelectorAll(".songList ul li");

    songItems.forEach(item => {
        // 👇 this will get the song title like 'Aaj ki Raat.mp3'
        const title = item.querySelector(".info div")?.innerText.toLowerCase() || "";

        if (title.includes(keyword)) {
            item.style.display = "flex"; // or "block", depending on your CSS
        } else {
            item.style.display = "none";
        }
    });
});














//add a click to volume to mute
document.querySelector(".volume>img").addEventListener("click",e=>{
   // console.log(e.target)
    if(e.target.src.includes("volume.svg")){
       e.target.src= e.target.src.replace("volume.svg","mute.svg")
       currentSong.volume=0; 
       document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }else{
        e.target.src= e.target.src.replace("mute.svg","volume.svg")
        currentSong.volume=.10;
         document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    }
})

}
main();

///songs/kartik%20aryan/-Duniyaa%20Song.mp3
//C:\Users\Vedika Rase\SpotifyClone\songs\kartik aryan\- Duniyaa Song.mp3