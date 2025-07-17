/**
 * API proxy handler for /api/ideas
 * Forwards query parameters to the backend API and returns the response
 * Sets Accept header to application/json as required by backend
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method ' + req.method + ' Not Allowed');
    return;
  }


  // Build query string from all query params and always append image fields
  const params = new URLSearchParams();
  for (const key in req.query) {
    const value = req.query[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.append(key, value as string);
    }
  }
  // Always append image fields if not present
  if (!params.has('append[]')) {
    params.append('append[]', 'small_image');
    params.append('append[]', 'medium_image');
  }
  if (!params.has('sort')) {
    params.append('sort', '-published_at');
  }
  if (!params.has('page[number]')) {
    params.append('page[number]', '1');
  }
  if (!params.has('page[size]')) {
    params.append('page[size]', '10');
  }
  const apiUrl = `https://suitmedia-backend.suitdev.com/api/ideas?${params.toString()}`;

  try {
    // Fetch data from backend API with Accept header for JSON
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch data from API' });
      return;
    }
    const data = await response.json();
    // Return data to client
    res.status(200).json(data);
  } catch  {
    res.status(500).json({ error: 'Internal server error' });
  }
}
