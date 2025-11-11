/**
 * check_app_updates - Checks for updates, updated versions of this application
 *
 * @returns {Object} { code: 0|1, result: [success_bool], error: [] }
 *
 * ERROR CODES:
 * 49 - Network connection failed
 * 50 - Update check failed
 * 52 - Invalid download URL
 * 100 - Unknown error
 *
 * IMPLEMENTATION NOTES:
 * Checks GitHub releases for newer versions of DrawThings Companion.
 * - Make a HTTPS call equivalnt to `curl -s https://api.github.com/repos/${settings.GITHUB_OWNER}/${settings.GITHUB_REPO}/releases/latest | jq '.tag_name' -r`
 * - Compare current version (from package.json) with latest release
 * - Return update info: available (bool), latest_version, download_url, release_notes etc
 */
import { fetch } from '@tauri-apps/plugin-http';
import { appState } from '../../appState.svelte.js';

export async function check_app_updates() {
  console.log('[check_app_updates] Starting');

  try {
    const { GITHUB_OWNER, GITHUB_REPO } = appState.settings;

    if (!GITHUB_OWNER || !GITHUB_REPO) {
      console.error('[check_app_updates] GitHub settings not configured');
      return {
        code: 1,
        result: null,
        error: [{ code: 50, message: 'Update check failed', details: 'GitHub owner/repo not configured' }]
      };
    }

    // Fetch latest release from GitHub API
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
    console.log('[check_app_updates] Fetching from:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'DrawThings-Companion'
        }
      });

      if (!response.ok) {
        console.error('[check_app_updates] API request failed:', response.status);
        return {
          code: 1,
          result: null,
          error: [{ code: 50, message: 'Update check failed', details: `HTTP ${response.status}` }]
        };
      }

      const releaseData = await response.json();

      // Extract release info
      const latestVersion = releaseData.tag_name;
      const downloadUrl = releaseData.html_url;
      const releaseNotes = releaseData.body;

      console.log('[check_app_updates] Latest version:', latestVersion);

      // TODO: Compare with current version from package.json
      // For now, just return the latest release info

      return {
        code: 0,
        result: {
          available: true, // Would compare versions here
          latest_version: latestVersion,
          download_url: downloadUrl,
          release_notes: releaseNotes
        },
        error: []
      };

    } catch (fetchError) {
      console.error('[check_app_updates] Fetch error:', fetchError);
      return {
        code: 1,
        result: null,
        error: [{ code: 49, message: 'Network connection failed', details: fetchError.message }]
      };
    }

  } catch (error) {
    console.error('[check_app_updates] Unexpected error:', error);
    return {
      code: 1,
      result: null,
      error: [{ code: 100, message: 'Unknown error', details: error.message }]
    };
  }
}
