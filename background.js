chrome.runtime.onMessage.addListener((message) => {
	if (message.action === 'download') {
		console.log('Downloading ' + message.urls.length + ' images...');
		const urls = message.urls;
		urls.forEach((url) => {
			chrome.downloads.download({url: url.src, filename: url.filename});
		});
	}
});
