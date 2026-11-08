const PAGE_VIEWS_API = 'https://page-views-api.ratneshc.com/api/v1/';
const PUBLIC_HOST = 'thorvaldboe.github.io';
const APP_PATH = '/universe-explorer/';

type PageViewsResponse = { views?: unknown };

export async function initializePageCounter(output: HTMLElement | null) {
  if (!output) return;

  // Keep local previews and automated review runs out of the public visit total.
  if (window.location.hostname !== PUBLIC_HOST || window.location.pathname !== APP_PATH) {
    output.textContent = 'PREVIEW';
    return;
  }

  const query = new URLSearchParams({ site: PUBLIC_HOST, path: APP_PATH });

  try {
    try {
      await fetch(`${PAGE_VIEWS_API}track?${query}`, {
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
      });
    } catch {
      // Still show the existing total if the visit could not be recorded.
    }

    const response = await fetch(`${PAGE_VIEWS_API}views?${query}`, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Page counter unavailable');

    const data = await response.json() as PageViewsResponse;
    const views = Number(data.views);
    if (!Number.isFinite(views)) throw new Error('Page counter returned an invalid total');
    output.textContent = views.toLocaleString();
  } catch {
    output.textContent = 'UNAVAILABLE';
  }
}
