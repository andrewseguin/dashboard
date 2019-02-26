

export function getLinkMap(headers: any) {
  const links = new Map<string, string>();
  const link = headers.get('link');

  if (link) {
    link.split(',').forEach(v => {
      const rawUrl = v.split(';')[0].replace('<', '').replace('>', '');
      const rawRel = v.split(';')[1].split('=')[1].replace('"', '').replace('"', '');
      links.set(rawRel, rawUrl);
    });
  }

  return links;
}
