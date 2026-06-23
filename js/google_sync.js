// ===========================================
//             Google login and Drive sync
// ===========================================

"use strict";

let tokenClient;
let isUserLoggedIn = false;

// Check if current origin is allowed for Google API usage and start auth process
function startAppAuth() {
    const currentHost = window.location.hostname;

    // Allowed domains that appear in Google Cloud Console -> Authorized JavaScript origins
    const allowedGoogleOrigins = ['freerss2.github.io'];

    // If current address is not listed there
    if (!allowedGoogleOrigins.includes(currentHost)) {
        console.log(`Vox Libera: Google Sync disabled for current origin (${currentHost}). Running in local-only mode.`);

        // Hide anything related to Google login
        setLoginDisplay(false);
        return;
    }

    // When address is supported - just proceed to authorization init
    console.log("Vox Libera: Valid origin detected. Activating Google API components...");
    initVoxLiberaAuth();
}

// Initialization on page load
function initVoxLiberaAuth() {
    if (typeof google === 'undefined') {
        console.warn("Vox Libera: Google API is not loaded. Starting in offline mode.");
        updateCloudStatus('offline');
        if (navigator.onLine) {
          console.warn("Vox Libera: Scheduling retry");
          setTimeout(initVoxLiberaAuth, 100);
        }
        return;
    }
    console.log("Vox Libera: Google API loaded.");

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '481193985537-mcqa1psand4n02ur1i78dmdu8nrn5ohn.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
        error_callback: (err) => {
            console.error("Auth error:", err);
            showLoginButton();
        }
    });

    // Auto-login if user already logged-in before
    if (localStorage.getItem('vox_libera_logged_in') === 'true' && navigator.onLine) {
        console.log("Vox Libera: Trying background login...");

        tokenClient.callback = async (response) => {
            if (response.error) {
                console.log("Vox Libera: Background login failed (" + response.error + "). Showing login button.");
                showLoginButton();
                return;
            }

            if (response.access_token) {
                await handleSuccessfulLogin(response.access_token);
                // Start checks and conflicts resolving
                await startInitialSync();
            }
        };

        const savedEmail = localStorage.getItem('vox_libera_user_email') || '';
        tokenClient.requestAccessToken({
          prompt: 'none',
          hint: savedEmail
        });
    } else {
        showLoginButton();
    }
}

// Show or hide login button and related UI elements
function setLoginDisplay(show) {
    const authContainers = document.getElementsByClassName('vox-auth-container');
    if (show) {
      [...authContainers].forEach( elm => elm.classList.remove('hidden') );
    } else {
      [...authContainers].forEach( elm => elm.classList.add('hidden') );
    }
}

// Show the button if background login failed or on initial load
function showLoginButton() {
    isUserLoggedIn = false;
    window.currentAccessToken = null;
    localStorage.removeItem('vox_libera_logged_in');
    setLoginDisplay(true);
    updateCloudStatus('disconnected');
}

// Handle manual click on login
function handleManualLoginClick() {
    if (!navigator.onLine) {
        alert("No internet connection!");
        return;
    }
    // Open standard popup for account selection
    tokenClient.callback = async (response) => {
        if (response.error) {
            console.log("Vox Libera: Manual login failed or cancelled by user: " + response.error);
            return;
        }

        if (response.access_token) {
            console.log("Vox Libera: Manual login successful!");
            await handleSuccessfulLogin(response.access_token);
            // Start checks and conflicts resolving
            await startInitialSync();
        }
    };

    tokenClient.requestAccessToken({
        hint: localStorage.getItem('vox_libera_user_email') || ''
    });
}

// Initial data sync on login
async function startInitialSync() {
    updateCloudStatus('loading');
    const cloudData = await syncManager.downloadProgress(window.currentAccessToken);
    const localData = packProgressData();

    if (cloudData) {
        resolveProgressConflict(cloudData, localData);
    } else {
        // When data is missing in cloud - push there the current progress
        syncManager.uploadProgress(window.currentAccessToken, localData);
    }
    updateCloudStatus('synced');
}

// Manage cloud sync status in UI
function updateCloudStatus(status) {
    const el = document.getElementById('cloud-status');
    if (!el) return;

    el.className = 'cloud-' + status;

    switch(status) {
        case 'synced': el.innerText = '☁️ (ok)'; el.title = 'In sync with Google Drive'; break;
        case 'loading': el.innerText = '⏳ (running...)'; el.title = 'Communicating...'; break;
        case 'offline': el.innerText = '💾 (offline)'; el.title = 'Offline mode'; break;
        case 'disconnected': el.innerText = '❌ (disabled)'; el.title = 'Sync is disabled'; break;
    }

}

// Hook for rejected token, when server returned 491
window.onGoogleTokenExpired = function() {
    console.log("Vox Libera: Tocken is not valid. Trying to renew in background...");
    if (navigator.onLine) {

        tokenClient.callback = async (response) => {
          // If Google returned error
          if (response.error) {
              console.log("Vox Libera: Background login failed (" + response.error + "). Showing login button.");
              showLoginButton();
              return;
          }

          // If token received in background
          if (response.access_token) {
              console.log("Vox Libera: Background login successful!");
              handleSuccessfulLogin(response.access_token);
              // Just start sync (?)
              //    const localData = packProgressData();
              //    syncManager.uploadProgress(accessToken, localData);
          }
        };

        tokenClient.requestAccessToken({
          prompt: 'none',
          hint: localStorage.getItem('vox_libera_user_email') || ''
        });
    } else {
        showLoginButton();
    }
};

// Callback for successful login with accessToken
// @return: true on success
async function handleSuccessfulLogin(accessToken) {

    window.currentAccessToken = accessToken;
    isUserLoggedIn = true;
    localStorage.setItem('vox_libera_logged_in', 'true');
    setLoginDisplay(false);
    updateCloudStatus('synced');

    try {
      // query email
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        if (userInfo.email) {
          // store email in localStorage
          localStorage.setItem('vox_libera_user_email', userInfo.email);
          console.log("Vox Libera: Saved user email for background hints:", userInfo.email);
        }
        const avatarImg = document.getElementById('user-avatar');
        const nameSpan = document.getElementById('user-name');
        if (avatarImg && userInfo.picture) { avatarImg.src = userInfo.picture; }
        if (nameSpan && userInfo.name) { nameSpan.textContent = userInfo.name; }
        document.getElementById('user-profile-block').classList.remove('hidden');
      }
    } catch (err) {
      console.error("Vox Libera: Failed to fetch user email:", err);
    }

    return true;
}

// Compare cloud and local data and perform sync in right direction
async function resolveProgressConflict(cloudData, localData) {
    console.log("Vox Libera: Analyzing versions conflict...");
    let direction = '';

    if (!cloudData || !cloudData.courses) {
        console.warn("Vox Libera: Cloud data is empty or damaged.");
        direction = 'cloud';
    }

    if (! direction ) {
      const cloudAttempts = calculateTotalAttempts(cloudData);
      const localAttempts = calculateTotalAttempts(localData);
      if (localAttempts > cloudAttempts) {
        direction = 'cloud';
      }
      if (localAttempts < cloudAttempts) {
        direction = 'browser';
      }
    }

    if (! direction ) {
      const localTime = localData.updated_at || 0;
      const cloudTime = cloudData.updated_at || 0;

      if (cloudTime > localTime) {
        direction = 'browser';
      }
      else if (localTime > cloudTime) {
        direction = 'cloud';
      }
    }

    if (direction === 'browser' ) {
        console.log("🎯 Cloud wins.");
        unpackProgressData(cloudData);
    }
    else if (direction === 'cloud') {
        console.log("🚀 Local settings are newer.");
        if (window.currentAccessToken) {
            console.log("🚀 Uploading to cloud.");
            syncManager.uploadProgress(window.currentAccessToken, localData);
        }
    }
    else {
        console.log("🤝 Data is in sync.");
    }
}

// count attempts in progress data
function calculateTotalAttempts(data) {
    let totalAttempts = 0;

    // Safety for damaged input
    if (!data || !data.courses) {
        return totalAttempts;
    }

    // Iterate all cources
    for (const courseName in data.courses) {
        if (Object.hasOwn(data.courses, courseName)) {
            const course = data.courses[courseName];
            
            // Check if there is a success_stats inside
            if (course && course.success_stats) {
                const stats = course.success_stats;
                
                // Iterate over words
                for (const word in stats) {
                    if (Object.hasOwn(stats, word)) {
                        const wordData = stats[word];
                        
                        // When there is an attempts value - count it
                        if (wordData && typeof wordData.attempts === 'number') {
                            totalAttempts += wordData.attempts;
                        }
                    }
                }
            }
        }
    }

    return totalAttempts;
}

// Logout: clear local data and revoke Google session
function logoutGoogle() {
    // Get the saved email
    const userEmail = localStorage.getItem('vox_libera_user_email');

    // Clean all login information from localStorage
    localStorage.removeItem('vox_libera_logged_in');
    localStorage.removeItem('vox_libera_user_email');
    
    showLoginButton();
    document.getElementById('user-profile-block').classList.add('hidden');
    // Revoke authorization from Google
    if (userEmail) {
        google.accounts.oauth2.revoke(userEmail, (done) => {
            console.log("Vox Libera: Google session revoked successfully:", done.successful);
        });
    }
}

// Sync to cloud (with debounce)
class CloudSync {
    constructor() {
        this.fileName = "vox_libera_sync.json";
        this.debounceTimeout = null;
        this.debounceDelay = 30000; // 30 seconds for silence
    }

    // Universal fetch with handling of timed-out token (401)
    async safeFetch(url, options, accessToken) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${accessToken}`;

        try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                console.warn("Vox Libera: Token Google Drive is over.");
                if (typeof window.onGoogleTokenExpired === 'function') {
                    window.onGoogleTokenExpired();
                }
                return null;
            }
            return response;
        } catch (error) {
            console.error("Vox Libera: Network error in communication with Google Drive", error);
            return null;
        }
    }

    // Extract file from appDataFolder
    async findFile(accessToken) {
        const q = encodeURIComponent(`name='${this.fileName}' and trashed = false`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${q}`;

        const response = await this.safeFetch(url, { method: 'GET' }, accessToken);
        if (!response) return null;

        const data = await response.json();
        return data.files && data.files.length > 0 ? data.files[0].id : null;
    }

    // Download data from cloud
    async downloadProgress(accessToken) {
        const fileId = await this.findFile(accessToken);
        if (!fileId) {
            console.log("Vox Libera: Settings file is missing in cloud (initial run).");
            return null;
        }

        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&_cb=${Date.now()}`;
        const response = await this.safeFetch(url, { method: 'GET', cache: 'no-cache'}, accessToken);

        if (!response || !response.ok) return null;

        return await response.json();
    }

    // Lazy debounce: schedule sending to cloud
    queueUpload(accessToken) {
        if (!navigator.onLine || !accessToken) return;

        // When user still sending more updates - reset the timer to avoid UI slowness
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // The timer should end only after 30 seconds of "silence"
        this.debounceTimeout = setTimeout(() => {
            console.log("Vox Libera: In silent state. Collecting data for cloud...");

            // Calling packer function only when we are ready
            if (typeof packProgressData === 'function') {
                const freshSnapshot = packProgressData();
                if (freshSnapshot) {
                    freshSnapshot.updated_at = Date.now(); // Refreshing timestamp
                    this.uploadProgress(accessToken, freshSnapshot);
                }
            }
        }, this.debounceDelay);
    }

    // Sending file to cloud (Multipart PATCH/POST)
    async uploadProgress(accessToken, progressData) {
        if (typeof updateCloudStatus === 'function') updateCloudStatus('loading');

        const fileId = await this.findFile(accessToken);

        const boundary = 'vox_libera_boundary';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const metadata = {
            name: this.fileName
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(progressData) +
            closeDelim;

        let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        let method = 'POST';

        if (fileId) {
            url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
            method = 'PATCH';
        }

        const response = await this.safeFetch(url, {
            method: method,
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body: multipartRequestBody
        }, accessToken);

        if (response && response.ok) {
            console.log("Vox Libera: Cloud data is updated.");
            if (typeof updateCloudStatus === 'function') updateCloudStatus('synced');
        } else {
            if (typeof updateCloudStatus === 'function') updateCloudStatus('offline');
        }
    }
}

// Instantiate sync manager
const syncManager = new CloudSync();
