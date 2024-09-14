console.log("JS WORKING das  ")
let songs;
let currFolder;
let currSong = new Audio(); // Initialize an Audio object
let play = document.querySelector(".play");
let playButton = document.querySelector(".play-button"); // Add play button selector
let playImg = document.getElementById("playimg"); // Updated to use correct ID
let trackInfo = document.querySelector(".track-info"); // Reference to track info area
let trackNameElement = document.querySelector(".track-name");
let trackArtistsElement = document.querySelector(".track-artists");
let albumArtElement = document.querySelector(".album-art");
let seekBar = document.querySelector(".progress-bar");
let finalDuration = document.querySelector(".finalDuration");
let opi = document.querySelector(".opi");
let volumeProgressBar = document.querySelector(".progress-bar-ops"); // Reference to volume bar
let volumeThumb = volumeProgressBar.querySelector(".progress-ops"); // Reference to volume progress
let volumeIcon = document.querySelector(".volume-icon img"); // Reference to volume icon
let isMuted = false; // Track mute state
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
let currentIndex = 0;
let albumCard = document.querySelector(".album-card");

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

const songImagesMap = {
  "Bekhayali": "Images/songs.jpeg",
  "Hasi - Female Version": "Images/songs2.jpeg",
  "Kahani Meri": "Images/songs3.jpeg",
  "Naina": "Images/songs4.jpeg",
  "Raabta": "Images/songs5.jpeg",
  "Tera Ban Jaunga": "Images/songs6.jpeg",
  "0 TO 100": "Images/songs7.jpeg",
  "410": "Images/songs11.jpeg",
  "East Side Flow": "Images/songs12.jpeg",
  "HAIL": "Images/songs13.jpeg",
  "NEVER FOLD": "Images/songs10.jpeg",
  "My Prime": "Images/songs14.jpeg",
  "Goin Off": "Images/songs9.jpeg",
  "Elevated - Shubh": "Images/songs15.jpeg",
  "Gangsta": "Images/songs16.jpeg",
  "Shubh - King Shit": "Images/songs17.jpeg",
  "Shubh - MVP": "Images/songs18.jpeg",
  "Winning Speech": "Images/songs19.jpeg",
  "Ae Dil Hai Mushkil (lyrics)": "Images/songs20.jpeg",
  "Baari": "Images/songs21.jpeg",
  "Duniyaa": "Images/songs22.jpeg",
  "Lambiyaan Si Judaiyaan": "Images/songs23.jpeg",
  "Malang": "Images/songs24.jpeg",
  "Siyah": "Images/songs25.jpeg",
  "Hasi Ban Gaye": "Images/songs26.jpeg",
  "Jhol": "Images/songs27.jpeg",
  "Mahiye Jinna Sohna": "Images/songs28.jpeg",
  "Sun Saathiya": "Images/songs29.jpeg",
  "Tune Jo Na Kaha Song": "Images/songs30.jpeg",
  "Ye Tune Kya Kiya": "Images/songs31.jpeg",
  "Humsafar": "Images/songs32.jpeg",
  "KAUN TUJHE": "Images/songs33.jpeg",
  "Lambiya Judaiyan": "Images/songs34.jpeg",
  "Saari Duniya Jala Denge": "Images/songs35.jpeg",
  "Samjhawan": "Images/songs36.jpeg",
  "Dekha tennu": "Images/songs37.jpeg",
  "Jeene Laga Hoon": "Images/songs38.jpeg",
  "Sooryavanshi": "Images/songs39.jpeg",
  "Tu Jo Mileya": "Images/songs41.jpeg",
  "Udh Di Phiran": "Images/songs42.jpeg",
  "295": "Images/songs48.jpeg",
  "Drippy": "Images/songs49.jpeg",
  "GAME": "Images/songs50.jpeg",
  "GOAT": "Images/songs51.jpeg",
  "KARAN Aujla Mega Mashup": "Images/songs52.jpeg",
  "Shubh - One Love": "Images/songs53.jpeg",
  "Bachke Bachke": "Images/songs54.jpeg",
  "Chitta": "Images/songs55.jpeg",
  "Diljit Dosanjh - G.O.A.T.": "Images/songs56.jpeg",
  "DROPTOP - AP Dhillon": "Images/songs57.jpeg",
  "Excuses": "Images/songs58.jpeg",
  "SOFTLY": "Images/songs59.jpeg",
  "Ishq": "Images/songs60.jpeg",
  "Janiye": "Images/songs61.jpeg",
  "Marham": "Images/songs62.jpeg",
  "Moon Rise": "Images/songs60.jpeg",
  "Tera Ban Jaunga": "Images/songs61.jpeg",
  "Ve Haaniyaan": "Images/songs62.jpeg",
  "Zindagi Kuch Toh Bata": "Images/zindagi.jpeg",
};



function getSongImage(songName) {
  return songImagesMap[songName] || "defaultImage.jpeg";
}



async function getSongs(folder) {
  currFolder = folder;

  // Fetch the song list from the server
  try {
    let songUrl = await fetch(
      `songs/${folder}`
    );
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
        let songPath = `songs/${folder}/${songName}`;
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

  // Update trackInfo album art image dynamically
  if (albumArtElement) {
    albumArtElement.src = albumImage; // Update the track info image dynamically
  }
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
    box.classList.remove("active");
    box.style.backgroundColor = "";
  });

  li.classList.add("active");
  li.style.backgroundColor = "#2f2f2f";

  // Update track info and album art in the player bar
  updateTrackInfo(trackName, artistName, albumImage);

  // Update the playlist box image dynamically
  const playlistImage = li.querySelector(".playlist-image img");
  if (playlistImage) {
    playlistImage.src = albumImage; // Update the playlist image dynamically
  }

  // Update play button image
  playImg.src = "working.svg";
}
async function run() {
  try {
    songs = await getSongs("sidhu");
    console.log(songs);

    if (!songs || songs.length === 0) {
      console.error("No songs were returned from the server.");
      return;
    }

    let songUl = document.querySelector(".songList");
    if (songUl) {
      songUl.innerHTML = "";

      songs.forEach((song, index) => {
        if (!song) {
          console.error(`Song at index ${index} is undefined.`);
          return;
        }

        let songName = song
          .split("/")
          .pop()
          .replaceAll("%20", " ")
          .replaceAll(".mp3", "");

        let imageSrc = getSongImage(songName); // Use the getSongImage function
        let artistName = "Artist " + (index + 1);

        let li = document.createElement("li");
        li.style.width = "370px";
        li.innerHTML = `
    
<div class="playlist-box">
                <div class="playlist-image">
                    <img src="${imageSrc}" alt="Playlist Cover">
                    <div class="play-button-talha">
                      <img class="play-talha"  src="lefticon.svg" alt="" srcset="">
                    </div>
                </div>
                <div class="playlist-info">
                    <h3 class="playlist-title">${songName}</h3>
                    <p class="playlist-details">Playlist • ${artistName}</p>
                </div>
                <div class="playlist-controls">
                 <img style=" font-weight: bold; width: 17px; margin-left: -24px;" src="mutegreen.svg" alt="" srcset="">
                </div>
            </div>`;

        li.querySelector(".playlist-box").addEventListener("click", () => {
          playMusic(
            song,
            li.querySelector(".playlist-box"),
            songName,
            artistName,
            imageSrc
          );
          playImg.src = "working.svg";
        });

        songUl.appendChild(li);
      });
    }
    loadSongInPlayerBar(0);
    playImg.src = "lefticon.svg";
  } catch (error) {
    console.error("Error running the song list:", error);
  }

  play.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      if (currSong.paused && currSong.src) {
        currSong.play();
        playImg.src = "working.svg";
      } else if (!currSong.src) {
        playSongByIndex(0);
      } else {
        currSong.pause();
        playImg.src = "pause.svg";
      }
    } else {
      console.warn("No songs available to play.");
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
  
      // Ensure currSong is updated with the new track URL
      playMusic(
        trackUrl,
        document.querySelectorAll(".playlist-box")[index], // Reference correct playlist item
        songName,
        artistName,
        albumImage
      );
      currentIndex = index; // Update the current index
    } else {
      console.error("Index out of bounds or songs array is empty.");
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
      playImg.src = "working.svg";
    } else {
      currentIndex = 0; // If at the last song, loop to the first song
    }
    playSongByIndex(currentIndex); // Play the new song
  });

  // LOAD THE PLAYLIST WHEN CLICK ON CARD
  document.querySelectorAll(".playlist-controls img").forEach((muteIcon, index) => {
    muteIcon.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevents the playlist box click event from triggering
  
      // If the song is already muted
      if (currSong.muted) {
        currSong.muted = false; // Unmute the song
        muteIcon.src = "mutegreen.svg"; // Change icon back to unmuted state
      } else {
        currSong.muted = true; // Mute the song
        muteIcon.src = "songmute.svg"; // Change icon to muted state
      }
    });
  });
  // Ensure the LOAD THE PLAYLIST WHEN CLICK ON CARD part is updated

  Array.from(document.getElementsByClassName("album-card")).forEach((element) => {
    element.addEventListener("click", async (event) => {
      const folder = event.currentTarget.dataset.folder;
      songs = await getSongs(folder);
  
      if (songs && songs.length > 0) {
        let songUl = document.querySelector(".songList");
        songUl.innerHTML = "";
  
        songs.forEach((song, index) => {
          let songName = song
            .split("/")
            .pop()
            .replaceAll("%20", " ")
            .replaceAll(".mp3", "");
  
          let imageSrc = getSongImage(songName); // Use the getSongImage function
          let artistName = "Artist " + (index + 1);
  
          let li = document.createElement("li");
          li.style.width = "370px";
          li.innerHTML = `
            <div class="playlist-box">
              <div class="playlist-image">
                <img src="${imageSrc}" alt="Playlist Cover">
                <div class="play-button-talha">
                  <img class="play-talha" src="lefticon.svg" alt="">
                </div>
              </div>
              <div class="playlist-info">
                <h3 class="playlist-title">${songName}</h3>
                <p class="playlist-details">Playlist • ${artistName}</p>
              </div>
            </div>`;
  
          li.querySelector(".playlist-box").addEventListener("click", () => {
            playMusic(
              song,
              li.querySelector(".playlist-box"),
              songName,
              artistName,
              imageSrc
            );
            playImg.src = "working.svg";
          });
  
          songUl.appendChild(li);
        });
  
        playSongByIndex(0); // Auto play the first song
      } else {
        console.warn("No songs found for this album.");
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
    volumeIcon.src = "mute.svg"; // Change the icon to indicate volume is up
    isMuted = false; // Update mute state
  } else {
    // Mute the audio and store the current volume before muting
    previousVolume = currSong.volume; // Save the current volume
    currSong.volume = 0; // Set volume to zero (mute)
    volumeThumb.style.width = "0%"; // Update volume progress bar to 0
    volumeIcon.src = "songmute.svg"; // Change the icon to indicate muted
    isMuted = true; // Update mute state
  }
}

// Add event listener to volume icon for muting/unmuting
volumeIcon.parentElement.addEventListener("click", toggleMute);

