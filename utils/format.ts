export function extractFileName(url) {
    const lastSlashIndex = url.lastIndexOf('/');
    const fullName = url.substring(lastSlashIndex + 1);
    
    const firstUnderscoreIndex = fullName.indexOf('_');
    const namePart = fullName.substring(firstUnderscoreIndex+1)

    return namePart
  }

  export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })}`;
  }
  