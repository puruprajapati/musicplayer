const serverUrl = 'http://localhost:3000/api/';
let currentOrder = 0;
let offlinePlaylist = [];
let playShuffle = false;
let songRepeat = false;

window.onload = function () {
  let user = localStorage.getItem('user');
  user = JSON.parse(user);
  if (user) {
    pageRefresh();
  } else {
    pageInit();
  }


  document.getElementById('bntLogin').onclick = (event) => {
    event.preventDefault();
    login();
  }

  document.getElementById('btnLogout').onclick = (event) => {
    event.preventDefault();
    localStorage.clear();
    pageInit();
  }

  document.getElementById('btnSearchSong').onclick = (event) => {
    event.preventDefault();
    pageRefresh();
  }

  document.getElementById('next').onclick = (event) => {
    event.preventDefault();
    nextSong();

  }



  document.getElementById('previous').onclick = (event) => {
    event.preventDefault();
    previousSong();

  }

  document.getElementById('shuffle').onclick = (event) => {
    event.preventDefault();
    playShuffle = !playShuffle;

    let player = document.getElementById('shuffle');
    if (playShuffle) {
      player.setAttribute("class", "fa fa-random shuffle-active")
    } else {
      player.setAttribute("class", "fa fa-random")
    }
  }

  document.getElementById('repeat').onclick = (event) => {
    event.preventDefault();
    songRepeat = !songRepeat;

    let player = document.getElementById('repeat');
    if (songRepeat) {
      player.setAttribute("class", "fa fa-repeat shuffle-active")
    } else {
      player.setAttribute("class", "fa fa-repeat")
    }
  }


}

const pageInit = () => {
  hideErrorMessage();
  showLoginModule();
  hideLogoutModule();
  displayWelcomeMessage();
  hideSongModule();
  hidePlaylist();
  hideMusicPlayer();
}

const pageRefresh = () => {
  hideErrorMessage();
  hideLoginModule();
  showLogoutModule();
  renderSongs();
  renderPlaylist();
  displayMusicPlayer();
}

const displayMusicPlayer = () => {
  document.getElementById('music-player').style.display = 'block';
}

const hideMusicPlayer = () => {
  document.getElementById('music-player').style.display = 'none';
}

const displaySongModule = () => {
  document.getElementById('songsModule').style.display = 'block';
}

const hideSongModule = () => {
  document.getElementById('songsModule').style.display = 'none';
}

const displayPlaylist = () => {
  document.getElementById('playlistModule').style.display = 'block';
}

const hidePlaylist = () => {
  document.getElementById('playlistModule').style.display = 'none';
}
const displayWelcomeMessage = () => {
  document.getElementById('welcomeUser').style.display = 'block';
}

const hideWelcomeMessage = () => {
  document.getElementById('welcomeUser').style.display = 'none';
}

const displayErrorMessage = () => {
  document.getElementById('errroMessage').style.display = 'block';
}

const hideErrorMessage = () => {
  document.getElementById('errroMessage').style.display = 'none';
}

const hideLoginModule = () => {
  document.getElementById('loginModule').style.display = 'none';
}

const hideLogoutModule = () => {
  document.getElementById('logoutModule-1').style.display = 'none';
  document.getElementById('logoutModule-2').style.display = 'none';
}

const showLoginModule = () => {
  document.getElementById('loginModule').style.display = 'block';
}

const showLogoutModule = () => {
  document.getElementById('logoutModule-1').style.display = 'block';
  document.getElementById('logoutModule-2').style.display = 'block';
}

const login = async () => {
  let body = JSON.stringify({
    username: document.getElementById('inputUsername').value,
    password: document.getElementById('inputPassword').value
  });
  let result = await postFetch(`${serverUrl}auth/login`, body);

  if (result.status === 'error') {
    displayErrorMessage();
  } else {
    hideErrorMessage();
    hideLoginModule();
    showLogoutModule();

    localStorage.setItem('user', JSON.stringify(result));

    renderSongs();
    renderPlaylist();
    displayMusicPlayer();
  }
}

const getFetch = async (path) => {
  let user = localStorage.getItem('user');
  user = JSON.parse(user);

  return await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.accessToken}`
    },
    method: 'GET'
  }).then(response => response.json());
}

const postFetch = async (path, body) => {
  return await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }).then(res => res.json());
}

const postAuthFetch = async (path, body) => {
  let user = localStorage.getItem('user');
  user = JSON.parse(user);
  return await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.accessToken}`
    },
    body
  }).then(res => res.json());
}


const renderSongs = async () => {
  hideWelcomeMessage();
  displaySongModule();

  let searchText = document.getElementById('inputSearch').value;
  let url = new URL(`${serverUrl}music`);
  let params = { search: searchText };
  url.search = new URLSearchParams(params).toString();

  let songs = await getFetch(url);
  renderSongTable(songs);

}

const renderPlaylist = async () => {
  displayPlaylist();

  let playlist = await getFetch(`${serverUrl}playlist`);
  offlinePlaylist = playlist;
  renderPlaylistTable(playlist);
}

const renderSongTable = (songs) => {

  let tableData = '';
  songs.forEach((song, index) => {
    const sn = index + 1;
    tableData += `
    <tr>
            <th scope="row">${sn}</th>
            <td>${song.title}</td>
            <td>${song.releaseDate}</td>
            <td><i class="fa fa-plus" title="Add this song to playlist" onclick="addToPlaylist('${song.id}')"></i></td>
    `;
  });

  let template = `
  <h2>Song you may interest</h2>
  <table class="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Release Date</th>
            <th scope="col">Actions</th>\
          </tr>
        </thead>
        <tbody>
          ${tableData}
        </tbody>
      </table>
  `

  document.getElementById('songsModule').innerHTML = template;
}

const renderPlaylistTable = (playlist) => {

  let tableData = '';
  playlist.forEach((song) => {
    tableData += `
    <tr>
            <th scope="row">${song.orderId}</th>
            <td>${song.title}</td>
            <td>
              <div class="playlist-control">
              <i class='fa fa-remove' title="Remove song from playlist" onclick="removeFromPlaylist('${song.songId}')"></i>
              <i class='fa fa-play' title="Play this song" onclick="playSong('${song.orderId}', '${song.urlPath}', '${song.title}')"></i>
                
              </div>
            </td>
          </tr>
    `;
  });

  let template = `
  <h2>Your playlist</h2>
  <table class="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Title</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableData}
        </tbody>
      </table>
  `
  if (playlist.length === 0) {
    template = ` <h2>Your playlist</h2>
    <h3>No songs in your playlist.</h3>`
  }

  document.getElementById('playlistModule').innerHTML = template;
}

const removeFromPlaylist = async (songId) => {
  let body = JSON.stringify({
    songId
  });
  await postAuthFetch(`${serverUrl}playlist/remove`, body);
  pageRefresh();
}

const addToPlaylist = async (songId) => {
  let body = JSON.stringify({
    songId
  });
  await postAuthFetch(`${serverUrl}playlist/add`, body);
  pageRefresh();
}

const playSong = async (orderId, urlPath, songTitle) => {
  console.log('playsong', orderId, urlPath)
  currentOrder = parseInt(orderId);
  let container = document.getElementById('music-player');
  let player = document.getElementById('audio-player');

  player.remove()

  player = document.createElement('audio');
  player.setAttribute('id', 'audio-player');
  player.setAttribute("controls", "");
  player.setAttribute("class", "customize-player");
  player.addEventListener('ended', () => {
    console.log('playSong-repeat', songRepeat)
    if (songRepeat) {
      currentSong();
    } else {
      nextSong();
    }

  })
  let source = document.createElement('source');
  source.src = urlPath;
  source.type = 'audio/mp3';
  player.append(source);
  container.append(player);

  let songTitleDisplay = document.getElementById('now-playing');
  songTitleDisplay.innerHTML = `Now Playing........    ${songTitle}`
  player.play();

}

const currentSong = () => {
  console.log('currentSong-curerntOrder', currentOrder, offlinePlaylist)
  const nxtSong = offlinePlaylist.find(s => s.orderId == currentOrder);

  playSong(currentOrder, nxtSong.urlPath, nxtSong.title);
}

const nextSong = () => {
  if (offlinePlaylist.length == 1) {
    // replay the song
    const nxtSong = offlinePlaylist.find(s => s.orderId === currentOrder);
    console.log(nxtSong, currentOrder);
    playSong(currentOrder, nxtSong.urlPath, nxtSong.title);
  } else if (offlinePlaylist.length > 0) {
    let nextOrder = 0;
    if (playShuffle) {
      const validOrder = offlinePlaylist.filter(x => x.orderId != currentOrder).map(a => a.orderId);
      nextOrder = getRandomItem(validOrder);
      console.log('nextsong', validOrder, nextOrder, offlinePlaylist.length);
    } else {
      nextOrder = parseInt(currentOrder) + 1;
      if (nextOrder > offlinePlaylist.length) {
        nextOrder = 1;
      }
    }
    console.log('checknextsongcond', nextOrder, offlinePlaylist.length)
    if (nextOrder <= offlinePlaylist.length) {
      const nxtSong = offlinePlaylist.find(s => s.orderId === nextOrder);
      playSong(nextOrder, nxtSong.urlPath, nxtSong.title);
    }

  }
}

const previousSong = () => {
  if (offlinePlaylist.length == 1) {
    // replay the song
    const prevSong = offlinePlaylist.find(s => s.orderId === currentOrder);
    playSong(currentOrder, prevSong.urlPath, prevSong.title);
  } else if (offlinePlaylist.length > 0 && currentOrder > 0) {
    let previousOrder = 0;
    if (playShuffle) {
      const validOrder = offlinePlaylist.filter(x => x.orderId != currentOrder).map(a => a.orderId);

      previousOrder = getRandomItem(validOrder);
      console.log('previoussong', validOrder, previousOrder, offlinePlaylist.length);
    } else {
      previousOrder = parseInt(currentOrder) - 1;
      if (previousOrder == 0) {
        previousOrder = offlinePlaylist.length;
      }
    }
    const prevSong = offlinePlaylist.find(s => s.orderId === previousOrder);
    playSong(previousOrder, prevSong.urlPath, prevSong.title);
  }
}

const getRandomItem = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const item = arr[randomIndex];
  return item;
}