export const showPayload = {
  id: 7,
  name: "Example Show",
  summary: "<p>A <b>safe</b> summary.</p>",
  image: {
    medium: "https://static.tvmaze.com/medium.jpg",
    original: "https://static.tvmaze.com/original.jpg",
  },
  language: "English",
  genres: ["Drama", "Comedy"],
  premiered: "2012-04-15",
  rating: { average: 7.5 },
};

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
