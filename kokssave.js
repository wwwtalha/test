console.log("JS WORKING");
let songs;
let currFolder
let currSong = new Audio(); // Initialize an Audio object
let play = document.querySelector(".play");
let playImg = document.getElementById("playimg"); // Updated to use correct ID
let trackInfo = document.querySelector(".track-info"); // Reference to track info area
let trackNameElement = document.querySelector(".track-name");
let trackArtistsElement = document.querySelector(".track-artists");
let albumArtElement = document.querySelector(".album-art");
let seekBar = document.querySelector(".progress-bar");
let finalDuration = document.querySelector(".finalDuration");
let opi = document.querySelector('.opi')
let volumeProgressBar = document.querySelector(".progress-bar-ops"); // Reference to volume bar
let volumeThumb = volumeProgressBar.querySelector(".progress-ops"); // Reference to volume progress
let volumeIcon = document.querySelector(".volume-icon img"); // Reference to volume icon
let isMuted = false; // Track mute state
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
let currentIndex = 0;
let albumCard = document.querySelector('.album-card')



function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "InValid Input";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

const songImages = [
  "/Spotify/Images/song1.jpeg",
  "/Spotify/Images/song2.jpeg",
  "/Spotify/Images/song3.jpeg",
  "/Spotify/Images/song4.jpeg",
  "/Spotify/Images/song5.jpeg",
];

async function getSongs(folder) {
  currFolder = folder;

  // Fetch the song list from the server
  try {
    let songUrl = await fetch(`http://192.168.100.4:5500/Spotify/songs/${folder}`);
    let response = await songUrl.text(); // Fetches the response as a text (HTML structure)

    // Log the raw server response for debugging purposes
    console.log("Server response:", response);

    // Create a temporary DOM element to parse the HTML content
    let div = document.createElement("div");
    div.innerHTML = response;

    // Find all <a> tags inside the #files element
    let as = div.querySelectorAll("#files a");
    let songs = [];

    // Loop through all <a> elements to extract .mp3 files
    as.forEach((element, index) => {
      const href = element.getAttribute("href");
      if (href && href.endsWith(".mp3")) {
        let songName = href.split("/").pop();
        let songPath = `http://192.168.100.4:5500/Spotify/songs/${folder}/${songName}`;
        songs.push(songPath);
      }
      
    });

    // Log the extracted songs array for debugging purposes
    console.log("Extracted songs:", songs);

    if (songs.length === 0) {
      console.warn("No songs were returned from the server.");
    }

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

// Function to update the track info in the player bar
const updateTrackInfo = (trackName, artistName, albumImage) => {
  trackNameElement.textContent = trackName; // Update track name
  trackArtistsElement.textContent = artistName; // Update artist name
  albumArtElement.src = albumImage; // Update album cover image
  albumArtElement.alt = `${trackName} Album Art`; // Set alt attribute for better accessibility
};

// Function to play music and update track info dynamically
function playMusic(trackUrl, li, trackName, artistName, albumImage) {
  if (currSong.src !== trackUrl) {
    currSong.src = trackUrl; // Set the new track URL
    currSong.play(); // Play the audio
  } else {
    currSong.paused ? currSong.play() : currSong.pause(); // Toggle play/pause if the same song is clicked
  }

  // Highlight the currently playing song
  document.querySelectorAll(".playlist-box").forEach((box) => {
    box.classList.remove("active"); // Remove 'active' class from all
    box.style.backgroundColor = ""; // Reset the background color
  });

  // Set 'active' class and change background color for the clicked one
  li.classList.add("active");
  li.style.backgroundColor = "#2f2f2f"; // Example background color

  // Update track info and album art in the player bar
  updateTrackInfo(trackName, artistName, albumImage);

  // Update play button image
  playImg.src = "/Spotify/working.svg";
}
async function run() {
  try {
    songs = await getSongs("sidhu");
    console.log(songs);


    //// DISPLAY ALBUMS
  async  function displayAlbums(){

    
    let songUrl = await fetch(`http://192.168.100.4:5500/Spotify/songs/`);
    let response = await songUrl.text();
    console.log("Server response:", response);
     let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach( async e=>{
      if(e.href.includes("/song")){
      let folder =  (e.href.split("/").slice(-2)[0])
      let a = await fetch(`http://192.168.100.4:5500/Spotify/songs/${folder}/info.json`)
      let response = await a.json() ;
      console.log(response);
      albumCard.innerHTML = albumCard.innerHTML + `
      <div class="album-card" data-folder="sads">
                    <div class="play-button">
                        <div class="play-icon"></div>
                      </div>
                    <img src="/spotify/songs/${folder}cover.jpg" class="album-image">
                    <div class="album-info">
                        <h3 class="album-name">${response.title}</h3>
                        <p class="album-artist"><a href="#">${response.description}</a></p>
                    </div>
                </div>`
      }
    })
  }
  displayAlbums()
    //////////


    if (!songs || songs.length === 0) {
      console.error("No songs were returned from the server.");
      return;
    }

    let songUl = document.querySelector(".songList");

    if (songUl) {
      // Clear previous song list to prevent duplication
      songUl.innerHTML = "";

      // Loop through songs and dynamically display each song's album art and details
      songs.forEach((song, index) => {
        // Ensure song is defined before processing
        if (!song) {
          console.error(`Song at index ${index} is undefined.`);
          return;
        }

        // Extract song name and handle possible errors
        let songName;
        try {
          songName = song.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        } catch (error) {
          console.error(`Error processing song name for: ${song}`, error);
          return;
        }

        let imageSrc = songImages[index % songImages.length]; // Use default or dynamic image
        let artistName = "Artist " + (index + 1); // Placeholder artist name

        let li = document.createElement("li");
        li.style.width = "370px";
        li.innerHTML = `
          <div class="playlist-box">
            <div class="playlist-image">
              <img src="${imageSrc}" alt="Playlist Cover">
              <div class="play-button-talha">
                <img class="play-talha" src="/Spotify/lefticon.svg" alt="">
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">${songName}</h3>
              <p class="playlist-details">Playlist • ${artistName}</p>
            </div>
          </div>`;

        // Add click listener to play music and update track info
        li.querySelector(".playlist-box").addEventListener("click", () => {
          playMusic(
            song,
            li.querySelector(".playlist-box"),
            songName,
            artistName,
            imageSrc // Pass album art image source
          );
          playImg.src = "/Spotify/working.svg"; // Change play button to playing state
        });

        songUl.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error running the song list:", error);
  }

  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      playImg.src = "/Spotify/working.svg";
    
      

    } else {
      currSong.pause();
      playImg.src = "/Spotify/pause.svg";
    }
  });

  currSong.addEventListener("timeupdate", () => {
    let progressBar = document.querySelector(".progress");
    let percentage = (currSong.currentTime / currSong.duration) * 100;
    progressBar.style.width = `${percentage}%`; // Set the progress bar's width
    document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(
      currSong.currentTime
    )}`;

    if (currSong.duration) {
      finalDuration.innerHTML = `${secondsToMinutesSeconds(currSong.duration)}`;
    }
  });

  seekBar.addEventListener("click", (event) => {
    const seekBarWidth = seekBar.offsetWidth; // Total width of the progress bar
    const clickPosition = event.offsetX; // Position of the click within the bar
    const seekPercentage = clickPosition / seekBarWidth; // Calculate the seek percentage
    currSong.currentTime = seekPercentage * currSong.duration; // Update the current time of the song

    // Update the progress bar color
    document.querySelector(".progress").style.width = `${
      seekPercentage * 100
    }%`;
  });

  const progressThumb = document.querySelector(".progress-thumb");

  let isDragging = false;

  progressThumb.addEventListener("mousedown", () => {
    isDragging = true;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const seekBarWidth = seekBar.offsetWidth;
      let newProgress = event.offsetX / seekBarWidth;

      if (newProgress < 0) newProgress = 0;
      if (newProgress > 1) newProgress = 1;

      currSong.currentTime = newProgress * currSong.duration; // Update current song time
      document.querySelector(".progress").style.width = `${newProgress * 100}%`; // Update progress bar width
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  volumeProgressBar.addEventListener("click", (event) => {
    const volumeBarWidth = volumeProgressBar.offsetWidth;
    const clickPosition = event.offsetX;
    const volumePercentage = clickPosition / volumeBarWidth;
    currSong.volume = volumePercentage;
    volumeThumb.style.width = `${volumePercentage * 100}%`;
  });

  // Volume Drag Control
  let isDraggingVolume = false;

  volumeProgressBar.addEventListener("mousedown", () => {
    isDraggingVolume = true;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDraggingVolume) {
      const volumeBarWidth = volumeProgressBar.offsetWidth;
      let newVolume = event.offsetX / volumeBarWidth;

      if (newVolume < 0) newVolume = 0;
      if (newVolume > 1) newVolume = 1;

      currSong.volume = newVolume;
      volumeThumb.style.width = `${newVolume * 100}%`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDraggingVolume = false;
  });

  let currentIndex = 0; // Keep track of the current song index

  // Function to play song by index
  function playSongByIndex(index) {
    if (index >= 0 && index < songs.length) {
      let trackUrl = songs[index];
      let songName = trackUrl
        .split("/")
        .pop()
        .replaceAll("%20", " ")
        .replaceAll(".mp3", " ");
      let albumImage = songImages[index % songImages.length]; // Use image from array
      let artistName = "Artist " + (index + 1); // Placeholder artist name

      // Play the selected song
      playMusic(
        trackUrl,
        document.querySelector(".playlist-box"),
        songName,
        artistName,
        albumImage
      );
      currentIndex = index; // Update the current index
    }
  }

  let prev = document.querySelector(".prev");
  prev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--; // Move to the previous song
    } else {
      currentIndex = songs.length - 1; // If at the first song, loop to the last song
    }
    playSongByIndex(currentIndex); // Play the new song
  });

  // Next Button
  let next = document.querySelector(".next");
  next.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
      currentIndex++; // Move to the next song
      playImg.src = "/Spotify/working.svg";
      
    } else {
      currentIndex = 0; // If at the last song, loop to the first song
    }
    playSongByIndex(currentIndex); // Play the new song
  });


  // LOAD THE PLAYLIST WHEN CLICK ON CARD 
// Ensure the LOAD THE PLAYLIST WHEN CLICK ON CARD part is updated
Array.from(document.getElementsByClassName("album-card")).forEach(element => {
  element.addEventListener('click', async (event) => {
    const folder = event.currentTarget.dataset.folder; // Get the folder from the clicked album's data attribute
    songs = await getSongs(folder); // Fetch songs for the clicked album folder

    if (songs && songs.length > 0) {
      // Now you can clear the existing song list and display the new songs from the album
      let songUl = document.querySelector(".songList");
      songUl.innerHTML = ""; // Clear any existing songs

      // Loop through the new songs and display them
      songs.forEach((song, index) => {
        let songName = song.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        let imageSrc = songImages[index % songImages.length]; // Use default or dynamic image
        let artistName = "Artist " + (index + 1); // Placeholder artist name

        let li = document.createElement("li");
        li.style.width = "370px";
        li.innerHTML = `
          <div class="playlist-box">
            <div class="playlist-image">
              <img src="${imageSrc}" alt="Playlist Cover">
              <div class="play-button-talha">
                <img class="play-talha" src="/Spotify/lefticon.svg" alt="">
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">${songName}</h3>
              <p class="playlist-details">Playlist • ${artistName}</p>
            </div>
          </div>`;

        // Add click listener to play the song
        li.querySelector(".playlist-box").addEventListener("click", () => {
          playMusic(
            song,
            li.querySelector(".playlist-box"),
            songName,
            artistName,
            imageSrc
          );
          playImg.src = "/Spotify/working.svg"; // Change play button to playing state
        });

        songUl.appendChild(li);
      });
    }
  });
});


}

run();

const progressThumb = document.querySelector(".progress-thumb");
let isDragging = false;

progressThumb.addEventListener("mousedown", () => {
  isDragging = true;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const seekBarWidth = seekBar.offsetWidth;
    const boundingRect = seekBar.getBoundingClientRect();
    const newProgress = (event.clientX - boundingRect.left) / seekBarWidth;

    if (newProgress >= 0 && newProgress <= 1) {
      currSong.currentTime = newProgress * currSong.duration; // Update current song time
      document.querySelector(".progress").style.width = `${newProgress * 100}%`; // Update progress bar width
      progressThumb.style.left = `${newProgress * 100}%`; // Move the thumb
    }
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Ensure the thumb is updated with the progress bar during playback
currSong.addEventListener("timeupdate", () => {
  const percentage = (currSong.currentTime / currSong.duration) * 100;
  document.querySelector(".progress").style.width = `${percentage}%`; // Set progress bar width
  progressThumb.style.left = `${percentage}%`; // Set thumb position
});
let previousVolume = 1; // To store previous volume before muting

// Function to toggle mute/unmute and change the volume icon
function toggleMute() {
  if (isMuted) {
    // If muted, unmute and restore the previous volume
    currSong.volume = previousVolume; // Restore the previous volume
    volumeThumb.style.width = `${previousVolume * 100}%`; // Update volume progress bar
    volumeIcon.src = "/Spotify/mute.svg"; // Change the icon to indicate volume is up
    isMuted = false; // Update mute state
  } else {
    // Mute the audio and store the current volume before muting
    previousVolume = currSong.volume; // Save the current volume
    currSong.volume = 0; // Set volume to zero (mute)
    volumeThumb.style.width = "0%"; // Update volume progress bar to 0
    volumeIcon.src = "/Spotify/songmute.svg"; // Change the icon to indicate muted
    isMuted = true; // Update mute state
  }
}

// Add event listener to volume icon for muting/unmuting
volumeIcon.parentElement.addEventListener("click", toggleMute);













