function getKeywords(query) {
  const text = String(query || '').toLowerCase();
  const words = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return ['blog'];
  return words.slice(0, 3);
}

export async function fetchTopicImages(query, apiKey, category) {
  if (!apiKey) return [];
  const keywords = getKeywords(query);
  let searchQuery = keywords.join(' ');
  if (!searchQuery) searchQuery = String(category || '').toLowerCase();

  try {
    let url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(searchQuery)}&per_page=5&orientation=horizontal&image_type=photo&safesearch=true`;
    let res = await fetch(url);
    if (!res.ok) return [];
    let data = await res.json();
    let hits = Array.isArray(data.hits) ? data.hits : [];
    if (hits.length === 0 && category) {
      let url2 = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(String(category).toLowerCase())}&per_page=5&orientation=horizontal&image_type=photo&safesearch=true`;
      let res2 = await fetch(url2);
      if (!res2.ok) return [];
      let data2 = await res2.json();
      hits = Array.isArray(data2.hits) ? data2.hits : [];
    }
    return hits.map((h) => ({ url: h.webformatURL || h.largeImageURL, page: h.pageURL, alt: h.tags || searchQuery })).filter((h) => h.url).slice(0, 2);
  } catch {
    return [];
  }
}