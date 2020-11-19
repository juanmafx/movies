export const getMovies = (abortController, callback) => {
  const myFetch = () => {
    fetch(`${process.env.REACT_APP_URL_API}/search/shows?q=girls`, {
      method: "GET",
      //   headers: new Headers({
      //     Accept: "Application/json",
      //     "Content-Type": "Application/json",
      //   }),
      signal: abortController.signal,
    })
      .then((d) => d.json())
      .then((j) => {
        callback(j);
      })
      .catch((e) => {
        if (e.name === "AbortError") abortController.abort();
        callback(e);
      });
  };
  myFetch();
};

export default {};
