interface TumblrAPITaggedResponse {
  meta: {
    status: number;
  };
  response: {
    body?: string;
    photos?: { original_size: { url: string }; }[];
  }[];
}

interface Options {
  apiKey: string;
  tag?: string;
  interval?: number;
  target?: HTMLElement;
}

export function doPartyHard({ tag = 'party hard gif', apiKey, interval = 10 * 1000, target = document.body }: Options): Promise<any> {
  return new Promise<string[]>((resolve, reject) => {
    const cb = `jsonp_doPartyHard_${Math.random().toString().substring(2)}`;
    (window as any)[cb] = (data: TumblrAPITaggedResponse) => {
      console.log(data);
      const imageURLs: string[] = [];
      for (let entry of data.response) {
        if (entry.photos && entry.photos.length) {
          for (let photo of entry.photos) {
            imageURLs.push(photo.original_size.url);
          }
        } else if (entry.body) {
          entry.body.replace(/<img [^>]*src="([^"<>]+)"/g, (_, $1): string => {
            const div = document.createElement('div');
            div.innerHTML = $1;
            imageURLs.push(div.textContent!);
            return _;
          });
        }
      }
      resolve(imageURLs);
    };

    const script = document.createElement('script');
    script.setAttribute('src', `http://api.tumblr.com/v2/tagged?tag=${encodeURIComponent(tag)}&api_key=${encodeURIComponent(apiKey)}&callback=${cb}`)
    script.onerror = function (ev) {
      reject(ev.message);
    };
    document.body.appendChild(script);
    console.log('added script');
  }).then((urls: string[]) => {
    const changeBackground = () => {
      target.style.backgroundImage = `url(${urls[Math.floor(Math.random() * urls.length)]})`;
      target.style.backgroundSize = 'contain';
    };
    changeBackground();
    return setInterval(changeBackground, interval);
  });
}
