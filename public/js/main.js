const serverUrl = 'http://localhost:3000/api/';
let user = localStorage.getItem('user');
user = JSON.parse(user);

window.onload = function () {
  if (user) {
    pageRefresh();
  } else {
    pageInit();
  }


  document.getElementById('bntLogin').onclick = (event) => {
    event.preventDefault();
    login(serverUrl);
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


}

const pageInit = () => {
  hideErrorMessage();
  showLoginModule();
  hideLogoutModule();
  displayWelcomeMessage();
  hideSongModule();
  hidePlaylist();
}

const pageRefresh = () => {
  hideErrorMessage();
  hideLoginModule();
  showLogoutModule();
  renderSongs();
  renderPlaylist();
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
  document.getElementById('logoutModule').style.display = 'none';
}

const showLoginModule = () => {
  document.getElementById('loginModule').style.display = 'block';
}

const showLogoutModule = () => {
  document.getElementById('logoutModule').style.display = 'block';
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
  }
}

const getFetch = async (path) => {


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
            <td><button onclick="addToPlaylist('${song.id}')">Add</button></td>
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
              <div>
                <button onclick="removeFromPlaylist('${song.songId}')">Add</button>
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