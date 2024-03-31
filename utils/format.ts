export function extractFileName({ url }: any) {
  if (!url) return null;
  const lastSlashIndex = url.lastIndexOf('/');
  const fullName = url.substring(lastSlashIndex + 1);

  const firstUnderscoreIndex = fullName.indexOf('_');
  const namePart = fullName.substring(firstUnderscoreIndex + 1);

  return namePart;
}

export function formatTimestamp({ timestamp }: any) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
}
