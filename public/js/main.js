window.onload = function () {
  let user = localStorage.getItem('user');
  user = JSON.parse(user);

  const serverUrl = 'http://localhost:3000/api/'
  if (user) {
    hideErrorMessage();
    hideLoginModule();
    showLogoutModule();
    renderSongs(serverUrl);
  } else {
    pageInit();
  }


  document.getElementById('bntLogin').onclick = (event) => {
    event.preventDefault();
    login(serverUrl);
  }

  document.getElementById('btnLogout').onclick = () => {
    localStorage.clear();
    pageInit();
  }

}

const pageInit = () => {
  hideErrorMessage();
  showLoginModule();
  hideLogoutModule();
  displayWelcomeMessage();
  hideSongModule();
  // hidePlaylist();
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

const login = async (serverUrl) => {
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

    renderSongs(serverUrl);
    //renderPlaylist();
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


const renderSongs = async (serverUrl) => {
  hideWelcomeMessage();
  displaySongModule();

  let songs = await getFetch(`${serverUrl}music`);
  renderSongTable(songs);


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
            <td>RBD</td>
          </tr>
    `;
  });

  let template = `
  <table class="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Release Date</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableData}
        </tbody>
      </table>
  `

  document.getElementById('songsModule').innerHTML = template;
}
